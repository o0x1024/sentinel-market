# X 语料 · 回收的toolchain清单

来源：X 公开贴子，含可执行清单（多条 dork 语法 / 多个请求头 / 多步 recon / 多工具链）。
仅纯文本，图片与外部媒体已剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-tooling-1（208 条）、x-exp-tooling（16 条）、x-residual-tooling（6 条） · 本文 43 行

- Combined workflow:
  1)Amass-Httpx-Nuclei
  2)Dirsearch with specific wordlist
  3)Github search in Language bash and python
- XSS automation: nuclei | httpx | subfinder | Dalfox
- The methodology of collecting subdomains from tools like amass, subfinder, findomain and directly sending them to httpx/httprobe is absolutely wrong. Instead, you should DNS resolve them using tools like puredns or shuffledns.
- 1-Choose a wildscope and enumerate subs using subfinder + amass + assetfinder + knockpy
  2- Now run httpx and pic intresting subdomains only
  3- Specially php aspx html asp and old looking websites
  4- Now fuzz interesting subs with ffuf
- XSS (dalfox)
  Open redirect (Oralyzer)
  SSRF (headers interactsh, param values with ffuf)
  CRLF (crlfuzz)
  LFI (ffuf)
  SQLi (SQLMap, ghauri)
  SSTI (ffuf)
  SSL (testssl)
  Broken Links (katana)
  Prototype Pollution (ppfuzz)
  4XX Bypasser (byp4xx)
- Some ways I know It's basic but I use it in subdomains enumeration
  Tools:
  1- Subfinder + api keys
  2- Assetfinder
  3- amass
  4- shosubgo ( shodan subs )
  Websites:
  1- http://Crt.sh
  2- Security trials
  3- Shodan
  4- Google dorks
  Using subslists & ffuf
- Recon Automation using tools like Subfinder, Chaos, Nuclei, Httpx, Notify, and Anew to find bugs and vulnerabilities.
  https://dhiyaneshgeek.github.io/bug/bounty/2020/02/06/recon-with-me/
- Nmap = where recon actually begins. Pair it with Masscan + httpx-toolkit + ffuf for a lethal recon stack.
