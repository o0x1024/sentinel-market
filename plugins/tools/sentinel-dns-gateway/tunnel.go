package main

// TCP 多路复用隧道：把本机 UDP DNS 请求封装进单条长连接。
//
// 为什么需要它：不少云厂商安全组默认只放行 TCP，UDP 高位端口会被丢弃；
// 家庭宽带也常对 UDP 做限制。用单条 TCP 长连接承载全部 DNS 查询后，
// 家庭侧只有 1 条 NAT 会话、没有 UDP 风暴，路由器不会被 conntrack 打满。
//
// 帧格式（小端）: [type:1][id:2][len:2][payload:len bytes]
//   hello(1)  payload=token
//   query(2)  payload=原始 DNS 报文（UDP 语义）
//   answer(3) payload=原始 DNS 报文
//   ping(4) / pong(5)

import (
	"bufio"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/miekg/dns"
)

const (
	frameHello  byte = 1
	frameQuery  byte = 2
	frameAnswer byte = 3
	framePing   byte = 4
	framePong   byte = 5

	frameHeaderLen    = 5
	maxFramePayload   = 8192
	tunnelWriteBuffer = 65536
)

type frame struct {
	kind    byte
	id      uint16
	payload []byte
}

func encodeFrame(kind byte, id uint16, payload []byte) []byte {
	buffer := make([]byte, frameHeaderLen+len(payload))
	buffer[0] = kind
	binary.LittleEndian.PutUint16(buffer[1:3], id)
	binary.LittleEndian.PutUint16(buffer[3:5], uint16(len(payload)))
	copy(buffer[frameHeaderLen:], payload)
	return buffer
}

func readFrame(reader *bufio.Reader) (frame, error) {
	header := make([]byte, frameHeaderLen)
	if _, err := io.ReadFull(reader, header); err != nil {
		return frame{}, err
	}
	size := int(binary.LittleEndian.Uint16(header[3:5]))
	if size > maxFramePayload {
		return frame{}, fmt.Errorf("帧超出大小上限: %d", size)
	}
	payload := make([]byte, size)
	if size > 0 {
		if _, err := io.ReadFull(reader, payload); err != nil {
			return frame{}, err
		}
	}
	return frame{kind: header[0], id: binary.LittleEndian.Uint16(header[1:3]), payload: payload}, nil
}

// ---------------- 服务端 ----------------

type TunnelServer struct {
	forwarder *Forwarder
	metrics   *metrics
	listener  net.Listener
	accepting atomic.Bool
	active    atomic.Int64
	wg        sync.WaitGroup
}

func NewTunnelServer(forwarder *Forwarder, met *metrics) *TunnelServer {
	return &TunnelServer{forwarder: forwarder, metrics: met}
}

func (t *TunnelServer) Start(address string) error {
	listener, err := net.Listen("tcp", address)
	if err != nil {
		return err
	}
	t.listener = listener
	t.accepting.Store(true)
	t.wg.Add(1)
	go func() {
		defer t.wg.Done()
		for {
			conn, err := listener.Accept()
			if err != nil {
				if !t.accepting.Load() {
					return
				}
				continue
			}
			go t.handleConn(conn)
		}
	}()
	return nil
}

func (t *TunnelServer) Addr() string {
	if t.listener == nil {
		return ""
	}
	return t.listener.Addr().String()
}

func (t *TunnelServer) Stop() {
	t.accepting.Store(false)
	if t.listener != nil {
		_ = t.listener.Close()
	}
	t.wg.Wait()
}

func (t *TunnelServer) handleConn(conn net.Conn) {
	defer conn.Close()
	clientIP := clientIPOf(conn.RemoteAddr())
	_ = conn.SetDeadline(time.Now().Add(10 * time.Second))

	reader := bufio.NewReaderSize(conn, 64*1024)
	hello, err := readFrame(reader)
	if err != nil || hello.kind != frameHello {
		return
	}
	expected := t.forwarder.Config().TunnelToken
	if expected == "" || string(hello.payload) != expected {
		_, _ = conn.Write(encodeFrame(framePong, 0, []byte("auth-failed")))
		return
	}
	if !t.forwarder.clientAllowed(clientIP) {
		_, _ = conn.Write(encodeFrame(framePong, 0, []byte("client-not-allowed")))
		return
	}
	_ = conn.SetDeadline(time.Time{})

	t.active.Add(1)
	defer t.active.Add(-1)
	t.metrics.c.tunnelConns.Add(1)
	slog.Info("隧道客户端已连接", "client", clientIP)

	var writeMu sync.Mutex
	write := func(kind byte, id uint16, payload []byte) error {
		writeMu.Lock()
		defer writeMu.Unlock()
		_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		_, err := conn.Write(encodeFrame(kind, id, payload))
		return err
	}

	sem := make(chan struct{}, 1024)
	var handlers sync.WaitGroup
	defer handlers.Wait()

	for {
		next, err := readFrame(reader)
		if err != nil {
			slog.Info("隧道客户端断开", "client", clientIP, "error", err)
			return
		}
		switch next.kind {
		case framePing:
			_ = write(framePong, next.id, nil)
		case frameQuery:
			if len(next.payload) < 12 {
				continue
			}
			payload := append([]byte{}, next.payload...)
			id := next.id
			select {
			case sem <- struct{}{}:
			default:
				t.metrics.c.tunnelDropped.Add(1)
				continue
			}
			handlers.Add(1)
			go func() {
				defer handlers.Done()
				defer func() { <-sem }()
				response := t.forwarder.ResolveForTunnel(payload, clientIP)
				t.metrics.c.tunnelQueries.Add(1)
				if response == nil {
					return
				}
				_ = write(frameAnswer, id, response)
			}()
		case framePong:
			// 忽略
		default:
			// 未知帧：忽略以保持向前兼容
		}
	}
}

// ---------------- 客户端（本机垫片） ----------------

type TunnelClient struct {
	server  string
	token   string
	local   string
	timeout time.Duration
	pending sync.Map // uint16 -> chan []byte
	nextID  atomic.Uint32
	sendCh  chan []byte
	conn    atomic.Pointer[net.Conn]
	met     *metrics
}

func NewTunnelClient(server, token, local string, timeout time.Duration) *TunnelClient {
	if timeout <= 0 {
		timeout = 6 * time.Second
	}
	return &TunnelClient{
		server: server, token: token, local: local, timeout: timeout,
		sendCh: make(chan []byte, tunnelWriteBuffer),
		met:    newMetrics(0),
	}
}

func (c *TunnelClient) Run(ctx context.Context) error {
	conn, err := net.ListenPacket("udp", c.local)
	if err != nil {
		return fmt.Errorf("本地 UDP 监听失败: %w", err)
	}
	defer conn.Close()
	slog.Info("本机 DNS 垫片已启动", "listen", c.local, "tunnel", c.server)

	go c.maintainConnection(ctx)
	go c.readLoop(ctx)

	buffer := make([]byte, 4096)
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
		}
		_ = conn.SetReadDeadline(time.Now().Add(500 * time.Millisecond))
		size, addr, err := conn.ReadFrom(buffer)
		if err != nil {
			if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
				continue
			}
			return err
		}
		if size < 12 {
			continue
		}
		query := append([]byte{}, buffer[:size]...)
		go c.forward(conn, addr, query)
	}
}

func (c *TunnelClient) forward(udp net.PacketConn, addr net.Addr, query []byte) {
	id, ok := c.allocateID()
	if !ok {
		return
	}
	waiter := make(chan []byte, 1)
	c.pending.Store(id, waiter)
	defer c.pending.Delete(id)

	select {
	case c.sendCh <- encodeFrame(frameQuery, id, query):
	default:
		// 发送队列已满：丢弃，客户端会自行重试
		return
	}

	select {
	case answer := <-waiter:
		_, _ = udp.WriteTo(answer, addr)
	case <-time.After(c.timeout):
		// 超时：不返回任何内容，交由上层 DNS 客户端重试
	}
}

func (c *TunnelClient) allocateID() (uint16, bool) {
	for i := 0; i < 65536; i++ {
		candidate := uint16(c.nextID.Add(1))
		if _, busy := c.pending.Load(candidate); !busy {
			return candidate, true
		}
	}
	return 0, false
}

func (c *TunnelClient) maintainConnection(ctx context.Context) {
	backoff := time.Second
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}
		dialer := net.Dialer{Timeout: 8 * time.Second}
		conn, err := dialer.DialContext(ctx, "tcp", c.server)
		if err != nil {
			slog.Warn("隧道连接失败，稍后重试", "server", c.server, "error", err, "retry_in", backoff)
			select {
			case <-ctx.Done():
				return
			case <-time.After(backoff):
			}
			if backoff < 10*time.Second {
				backoff *= 2
			}
			continue
		}
		backoff = time.Second
		slog.Info("隧道已连接", "server", c.server)
		c.conn.Store(&conn)
		if _, err := conn.Write(encodeFrame(frameHello, 0, []byte(c.token))); err != nil {
			_ = conn.Close()
			continue
		}
		c.pumpWriter(ctx, conn)
		c.conn.Store(nil)
		_ = conn.Close()
		slog.Warn("隧道连接已断开，准备重连", "server", c.server)
	}
}

func (c *TunnelClient) pumpWriter(ctx context.Context, conn net.Conn) {
	keepalive := time.NewTicker(20 * time.Second)
	defer keepalive.Stop()
	// 批量写入：一次系统调用发送尽可能多的小帧，显著降低高频查询的延迟与 syscall 开销。
	writer := bufio.NewWriterSize(conn, 64*1024)
	flush := func() bool {
		_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		if err := writer.Flush(); err != nil {
			return false
		}
		return true
	}
	for {
		select {
		case <-ctx.Done():
			return
		case frameBytes := <-c.sendCh:
			if _, err := writer.Write(frameBytes); err != nil {
				return
			}
		drain:
			for i := 0; i < 510; i++ {
				select {
				case more := <-c.sendCh:
					if _, err := writer.Write(more); err != nil {
						return
					}
				default:
					break drain
				}
			}
			if !flush() {
				return
			}
		case <-keepalive.C:
			if _, err := writer.Write(encodeFrame(framePing, 0, nil)); err != nil {
				return
			}
			if !flush() {
				return
			}
		}
	}
}

func (c *TunnelClient) readLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}
		pointer := c.conn.Load()
		if pointer == nil {
			time.Sleep(100 * time.Millisecond)
			continue
		}
		conn := *pointer
		reader := bufio.NewReaderSize(conn, 64*1024)
		for {
			next, err := readFrame(reader)
			if err != nil {
				if !errors.Is(err, io.EOF) && !errors.Is(err, net.ErrClosed) {
					slog.Warn("隧道读取结束", "error", err)
				}
				break
			}
			switch next.kind {
			case frameAnswer:
				if value, ok := c.pending.Load(next.id); ok {
					select {
					case value.(chan []byte) <- next.payload:
					default:
					}
				}
			case framePong:
				if string(next.payload) != "" {
					slog.Error("隧道鉴权失败", "reason", string(next.payload))
				}
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

// ResolveForTunnel 以与服务端 UDP 路径一致的策略（ACL/限速/缓存/合并）处理隧道查询。
func (f *Forwarder) ResolveForTunnel(raw []byte, clientIP string) []byte {
	request := new(dns.Msg)
	if err := request.Unpack(raw); err != nil || len(request.Question) != 1 {
		return nil
	}
	question := request.Question[0]
	reply := new(dns.Msg)
	if !f.clientAllowed(clientIP) || !f.domainAllowed(strings.TrimSuffix(question.Name, ".")) {
		reply.SetRcode(request, dns.RcodeRefused)
		return packResponse(reply)
	}
	if f.rt.Load().raw.RefuseANY && question.Qtype == dns.TypeANY {
		reply.SetRcode(request, dns.RcodeRefused)
		return packResponse(reply)
	}
	if !f.clientRL.allow(clientIP) {
		f.metrics.c.refusedRate.Add(1)
		reply.SetRcode(request, dns.RcodeRefused)
		return packResponse(reply)
	}

	key := cacheKey(request)
	if cached, ok := f.cache.get(key); ok {
		f.metrics.c.cacheHits.Add(1)
		cached.Id = request.Id
		return packResponse(cached)
	}
	response, _, err, _ := f.coalesce(key, request)
	if err != nil {
		reply.SetRcode(request, dns.RcodeServerFailure)
		return packResponse(reply)
	}
	response.Id = request.Id
	response.Truncate(maxFramePayload)
	return packResponse(response)
}

func packResponse(msg *dns.Msg) []byte {
	msg.Response = true
	packed, err := msg.Pack()
	if err != nil {
		return nil
	}
	return packed
}
