# X 语料 · 回收的dork清单

来源：X 公开贴子，含可直接套用的骨架（多条 dork 语法 / 多个请求头 / 多步 recon / 多工具链）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-recovered-testcase（68 条） · 本文 85 行

- Google dorks for gathering sensitive info:
  index of /wp-content/uploads/backupbuddy
  intext:"index of" "var/log/"
  intitle:"Dashboard [Jenkins]"
  intitle:"index of" "shell.php"
- Find POCs and reports of a given vulnerability:
  site: "website name" vulnerability name
  Example
  site: "hackerone" xss
  site: "medium" xss
- Bug hunting google dork
  1. site:*.*.nl intext:security report reward
  2. site:*.*.nl intext:responsible disclosure reward"
  3. security vulnerability" "report" 2021
- Useful Google Dorks For bugbounty
  site:http://tar.in ext:odt |ext:rtf |ext:sxw |ext:bkf |ext:bkp |ext:old |ext:backup |ext:psw |ext:bak |ext:log |ext:logs |ext:csv |ext:xls |ext:xlsx |ext:doc |ext:docx |ext:docs
- google dorks for finding private programs:-
  inurl:security-program intext:bug bounty
  intext:report a bug intext:reward
  intext:"our bug bounty program" "reward"
- site: http://blackhat.com intext:(name of the topic, e.g SQL Injection) filetype:pdf
  e.g. site http://blackhat.com intext: "SSRF" filetype:pdf
- Some useful recon dorks:
  site:http://trello.com "target"
  site:http://zoom.us inurl:"target"
  site:http://pastebin.com "target"
- Some google dorks for finding sensitive files:
  intitle:"index of" "WebServers.xml"
  filetype:xls inurl:"email.xls"
  intitle:"Index of" wp-admin
  intitle:"index of" "admin/sql/"
  intitle:"index of" "system/config"
- Google Dorks - Cloud Storage:
  site:http://s3.amazonaws.com "target[.]com"
  site:http://blob.core.windows.net "target[.]com"
  site:http://googleapis.com "target[.]com"
  site:http://drive.google.com "target[.]com"
  Find buckets and sensitive data
- Google Dorks - File Storage:
  site:http://dropbox.com/s
   "example[.]com"
  site:http://box.com/s
   "example[.]com"
  site:http://docs.google.com
   inurl:"/d/" "example[.]com"
  Find sensitive data and company accounts
- Google Dorks Open Redirect
  inurl:url=https
  inurl:url=http
  inurl:u=https
  inurl:u=http
  inurl:redirect?https
  inurl:redirect?http
  inurl:redirect=https
  inurl:redirect=http
  inurl:link=http
  inurl:link=https
  inurl:redirectUrl=http site:http://site.com
- Google Dork - SSRF Prone Parameters
  inurl:http | inurl:url= | inurl:path= | inurl:dest= | inurl:html= | inurl:data= | inurl:domain= | inurl:page= inurl:& site:example[.]com
  Find endpoints for SSRF testing
- Google Dork - SQLi prone parameters
  inurl:id= | inurl:pid= | inurl:category= | inurl:cat= | inurl:action= | inurl:sid= | inurl:dir= inurl:& site:example[.]com
  Find endpoints for SQLi testing
- Google Dork - RCE Prone Parameters
  inurl:cmd | inurl:exec= | inurl:query= | inurl:code= | inurl:do= | inurl:run= | inurl:read= | inurl:ping= inurl:& site:example[.]com
  Find endpoints for RCE testing
- Google Dork - File Upload
  (site:example[.]com | site:example[.]org) & intext:"choose file”
- Apache server-status can expose credentials for apps hosted on the web server.
  Google dork: inurl:"server-status" intitle:"Apache Status" intext:"Apache Server Status for"
- Tips for XSS Bypass:
  https://sub.target.com --> 403 (Forbidden)
  https://sub.target.com/%3f/ --> 200 (OK)
  dork for the vulnerable parameters
  `site:*.target.com inurl:"?name="` `site:*.target.com inurl:"?type="`
- Google Dork - Test Environments - Find forgotten endpoints
  site:example[.]com inurl:test | inurl:env | inurl:dev | inurl:staging | inurl:sandbox | inurl:debug | inurl:temp | inurl:internal | inurl:demo
