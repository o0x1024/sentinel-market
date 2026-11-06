# X 语料 · 回收的recon清单

来源：X 公开贴子。本轮抽检发现这些贴子被误判为「非技术」
实际含可执行清单（多条 dork 语法 / 多个请求头 / 多步 recon / 多工具链）。
回收后归入技术语料。仅纯文本，图片与外部媒体已被剥离。
作者自述，未经复现验证。
已剔除：学习/收入/日报类流水账、付费工具推广、纯转推、互相重复的「必学工具榜」、
以及步骤错误的子域接管帖（原文让读者在自己路由器上开 80 端口，与接管无关）。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-recon-1（253 条）、x-exp-recon（214 条）、x-residual-recon（43 条） · 本文 228 行

- Private program checklist:
  1. Explore the functionality of the application
  2. Browse each and every link manually
  3. Use Spider tool
  4. Always view source page
  5. Read JavaScript files
  6. Use dirsearch, wfuzz for directory fuzz
- Tips from Jhaddix:
  * Get acquisitions: https://crunchbase.com
  * Get ASN: https://bgp.he.net (tools: metabigor and asnlookup) + Amass
  * Reverse WHOIS: https://whoxy.com (tool: DOMLink)
  * Ad relationship (tool: BuiltWith extension)
- Hostile subdomain takeovers:
  - https://github.com/EdOverflow/can-i-take-over-xyz
  - https://exploit-db.com/docs/english/46415-the-ultimate-guide-for-subdomain-takeover-with-practical.pdf
  - https://labs.detectify.com/2014/10/21/hostile-subdomain-takeover-using-herokugithubdesk-more/
  - https://0xpatrik.com/takeover-proofs/
  CORS misconfigurations:
  - https://jianjunchen.com/papers/CORS-USESEC18.pdf
  - https://corben.io/advanced-cors-techniques/
- Accidental XSS find:
  1. Massive subdomain enum
  2. Identify weird-looking subdomain => check running service
  3. Look for exploit/vulnerability for that service
  4. XSS vulnerability was CVEd ~month ago
- Built an auto subdomain takeover script using amass+subfinder+subover+dnspython.
  70 domains list, 15h of scan -> found 2 NS domain takeover + 9 subdomain takeover.
- HowToHunt repo — subdomain takeover, application level DOS, sensitive info leaks, parameter pollution, plus a bunch of mind maps.
- Java RMI for Pentesters: what RMI interfaces are, how to build one from source, what info you can learn using an nmap scan, how to build an RMI client, typical issues / stack traces.
  https://medium.com/@afinepl/java-rmi-for-pentesters-structure-recon-and-communication-non-jmx-registries-a10d5c996a79
- How to start recon:
  1. Watch all of Jason Haddix's bug bounty methodology talks
  2. Watch Nahamsec's talks and recon streams
  3. Watch Tomnomnom's talks
  Then mix and match.
- Jupyter OSINT notebook — a modular notebook to automate/parse recon to excel: subdomain enumeration, cloud enumeration, GitHub enumeration, Shodan and probing.
- Referer based CSRF bypass techniques:
  - Do not send the referer header
  - Send as a subdomain: http://target.com.evil.com
  - Add http://target.com to the end of the URL: http://evil.com/poc.html?target.com
  - Chain with ;
  - Clickjacking / Subdomain takeover / XSS
- How I escalated Blind SSRF to RCE:
  - Found 'url=' param
  - Noticed it is vulnerable to Blind SSRF
  - Use SSRF to port scan 127.0.0.1 and find open port 6379 (Redis)
  - Use Gopherus to generate a gopher:// Redis payload https://github.com/tarunkant/Gopherus
- Script to extract all domains listed on Bugcrowd, Hackerone, Intigriti, Yeswehack, etc. It can also enumerate subdomains.
  https://github.com/mrjoker05/Dump_Programs
- Old trick to find a company's internal domain:
  • find lyncdiscover.* subdomain
  • navigate to the url referenced in the xml response
  • run nmap against the ntlm auth endpoint
  • search the net for references to the domain and find proprietary info
- MoneyScope — extract all domains and TLDs of public programs with paid bounties for wide scope recon (Chaos, HackerOne, YesWeHack, BugCrowd, Intigriti). 3196 domains / 1824 TLDs, runtime < 5 seconds, updated daily.
- When fuzzing for directories, follow these wordlists:
  1. dirsearch
  2. directory-list-2.3-medium
  3. httparchive_directories
  4. Raft
  5. RobotsDisallowed
  Then go for technology-specific ones — chances are high with these.
- Dynamic SSRF server creation with interactsh, soon in reconFTW:
  1. Start interactsh-client
  2. Get ssrf server
  3. Store pingback
  4. Just a curl test
- Find vulnerable disclosure pages with this dork set:
  1. security bug report site:target.com reward
  2. bug report site:target.com voucher
  3. security report site:target.nl "happy hacking"
  4. responsible disclosure site:target.com
- Search Engines: ZoomEye, FOFA, Shodan, ThreatCrowd, Censys, greynoise
- Subdomain Enum Wordlists: all.txt, commonspeak, seclists, shubs, assetnote wordlists
- A live playground to learn ffuf: content discovery, param mining, handling rate limiting.
  http://ffuf.me
- Find version-leaking subdomains — the version banner alone is a lead:
  1. Nginx [1.14.0]
  2. Microsoft [10.0]
  3. Apache [2.4.41]
- Endpoint: http://abc.om/ApiHeridas
  Started fuzzing in English — nothing found.
  heridas means wounds in English, so I fuzzed with a Spanish wordlist and found /usuarios that leaked internal employees information.
- Proxy everything, keep Burp Suite running:
  - Get all endpoints/js/params
  - Fun with bapps
  - Spam ctrl+r & fuzz
- Horizontal recon to find other domains owned by the company
  - Found interesting domain: http://stg-company.com
  - Github dorking: "http://stg-company.com env"
  - Leakage of credentials of a developer
  - Access to the production environment with creds
- Recon checklist:
  - [ ] Identify web server, technologies and database
  - [ ] Subsidiary and Acquisition Enumeration
  - [ ] Reverse Lookup
  - [ ] Reverse Whois
  - [ ] ASN & IP Space Enumeration
- A list of open source web security scanners: web scanners, infrastructure scanners, fuzzers / brute forcers, CMS scanners, API scanners, specialized (XSS, SQLi).
  https://github.com/psiinon/open-source-web-scanners
- assetfinder, httpx, waybackurls
  - brute-force for directory discovery
  - GitHub dorks for sensitive information
  - And finally, access to the database
- Sites usable with a wide scope target:
  - http://crt.sh
  - google dorking (Company Inc. subsidiaries)
  - shodan
  - http://crunchbase.com to find acquisitions
- Rhythm:
  1. use zaproxy with VPN
  2. manually crawl for subdomains
  3. spider these subdomains for directories
  4. brute force these directories for files containing PII
- Write a script in any of your fav languages
  - The script scrapes out new subdomains using other tools
  - If a new one is found, send it to a slack channel or discord server
  - If you have no VPS, schedule it with crontab on a preferably hourly basis
- Subdomain gave 404 status code
  - Wappalyzer showed the site uses php
  - ffuf with php files found accu.php, title "HBK Manager"
  - Arjun, Google search and Nuclei found this endpoint vulnerable to XSS: "accu.php/Payloadhere"
- GitHub Dorks for finding files:
  - "company name" filename:database
  - "company name" filename:secrets.yml
  - "company name" filename:passwd
  - "company name" filename:LocalSettings.php
  - "company name" filename:config.php
- Recon tools: Amass, Subfinder, Gau, Uncover, Nmap, Httpx, Ffuf, Aquatone, Hakrawler, Gotator
- AORT - Automated Recon: checks subdomains, ports, whois, emails, waybackmachine, DNS.
  https://github.com/D3Ext/AORT
- Blind XSS:
  • Extract subdomains of *.target.com
  • ffuf
  • http://xxx.target.com/admpanel
  • Random user and pass
  • Change the user-agent to the XSS payload (the admin panel saves IP and user-agent for security)
  • Payload executed
- Fully automated recon:
  1. Subdomain discovery from multiple sources
  2. Use dnsx to extract IPs
  3. Run port scan and httpx on IPs and subdomains
  4. Fuzz all results with a private wordlist (sensitive endpoints)
- autoSSRF — smart fuzzing on relevant SSRF GET parameters and context-based dynamic payload generation.
  https://github.com/Th0h0/autossrf
- 1) Company and web application recon
  2) Find legacy subdomains
  3) Parameter fuzz with a private wordlist
  4) Check reflection and XSS
- Recon exercises:
  1. Check the SSL certificate for any type of information
  2. Check every response to the request
  3. Performing visual recon
  4. Subdomain brute-forcing
- 1. Recon through shodan and censys
  2. Visit all ips and fuzz them according to their running services
  3. wappalyzer showed php, so I used php.txt from https://github.com/orwagodfather/My-WordLISTs
  4. phpMyAdmin/setup was accessible
- Useful bash scripts by @gwen001:
  1. Get altnames from ssl certificates
  2. Create a wordlist from the target itself
  3. One-liner to extract endpoints from JS files of a given host
  4. One-liner to extract params from url
- Access Control issue:
  1. Using JSLinkfinder to get a list of links
  2. Sort the endpoints using unfurl
  3. Use FFUF to fuzz all the found endpoints
  4. Found a few unauthorized modules
- 1. Subdomain enumeration
  2. Got all IPs from shodan according to ssl certificate
  3. Used ffuf to find juicy endpoints
  4. Found env.json file containing a datadog api key
  5. Read the datadog documentation and showed the impact
- Discovered a SQL injection in a big program:
  1. Find subdomains with amass/subfinder
  2. Fuzz to find new/unknown endpoints
  3. Pick one endpoint to inspect further and fuzz POST requests
  4. Time-based blind SQLi
- Things you should get from recon: subdomains, IP, ports and services, technologies, files and directories, API, parameters, functionality, JavaScript code, screenshots.
- Skanuvaty — fast DNS/network/port scanner.
  https://github.com/Esc4iCEscEsc/skanuvaty
- How to find forms for Blind XSS attacks:
  1. Visit http://dorkking.blindf.com
  2. Submit the target domain without "https://"
  3. Click Next
  4. All 5 dorks are for finding forms
- Enter the domain and get quick links to collect information about it in 95 different services: ip history, whois history, web archives, backlinks, subdomains, site map, threat and spam checking.
  http://lopseg.com.br/osint
- 1. Identify a URL param allowing a potential LFI
  2. FUZZ the param value (GPT can help to create a custom list)
  3. Find a new file/page via LFI
  4. FUZZ looking for URL params reflected on this newly discovered file
- 1. Take all domains of a program
  2. Write a bash script to get subdomains of those domains every day
  3. Do it for a long time, like 6 months
  4. When new subdomains come out, check them manually
- X-Recon — a utility for detecting webpage inputs and conducting XSS scans: subdomain discovery, site-wide link discovery, form and input extraction, XSS scanning.
- Efficient additions to a recon toolchain: scanners (Shodan, Censys, hunter.how, fofa, Zoomeye), nuclee, dnsx, httpx, kiterunner.
- Mass information disclosure via an exposed i18n.json file on a payment service company. It leaked: full internal logic, verification & transaction flows, business rules, card-related flows.
- Debug endpoint exposure -> sensitive info leak
  1. Discovered /debug endpoint during recon
  2. Accessed it without authentication
  3. Server returned logs and environment variables
  4. Exposed API keys and internal paths
- Subdomain takeover via vulnerable Azure CNAMEs:
  *.azurewebsites.net
  *.trafficmanager.net
  - https://learn.microsoft.com/en-us/azure/security/fundamentals/subdomain-takeover
  - https://github.com/EdOverflow/can-i-take-over-xyz/issues/35
  - https://medium.com/@damaidec/subdomain-take-over-on-azurewebsite-7fd9481fa15e
  - https://hackerone.com/reports/1627980
  - https://hackerone.com/reports/665398
- Use Intruder for smart fuzzing:
  • Payload sets (XSS cheat sheet, SQL payloads)
  • Grep-Match for "error", "admin", "stack", "debug"
  • Analyze response length differences
  Don't brute-force blindly — fuzz only interesting parameters.
