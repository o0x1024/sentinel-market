# X 经验语料 · tooling

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-tooling-1（208 条）、x-residual-tooling（6 条）、x-recovered-toolchain（11 条） · 本文 44 行

- Burp Collaborator fits the needs with least effort.
  Another tip is to set up own vhost proxy and dns server - pain in the ass but for those who want try
  https://blog.simonholywell.com/post/2010/11/team-development-server/
- A lot of time people forget to look at the response or intercept the response in burp.
  Always examine the response in details especially when logging in.
  I was able to go from regular user to Admin by manipulating the response
- Don't always start with burpsuite, first fuzz the URLs for sensitive path, param & information, It will help for injection based bugs. Then go for burpsuite and analyze the traffic by intercepting & play around it on sensitive page to get some logical bugs.
- You can test for IDORs:
  - in the developer console (js functions)
  - changing ids in URLs or post body
  - replacing auth header in repeater
  - replacing auth header with match and replace
  - by using authorise
  - by using autorepeater
  - changing method type
- Test every parameters including headers like cookie, user-agent, Referer, X-Forwarded-For with a single quote, double and blind payloads. These doesn't work? Fuzz it with Burpsuite Intruder and observe length and response.
- Not all tools parse a URL the same. curl and your browser will normalize a /.. while python will send it as is. Here is a python oneliner to test:
  python3 -c "import urllib.request as r; print(r.urlopen('URLGoesHere').read())"
- Exporter - Burp Suite Extension to export a request to a file or copy to the clipboard in multiple programming languages.
- For Burpsuite user
  Don't forget to check parameters in GET Request
  Sometimes it contains sensitive information.
- CVE-2022-36883 (Missing permission check in Jenkins Git Plugin 4.11.3 allows attackers to trigger builds of jobs configured to use an attacker Git repository)
- Analyze HTTP Responses w/ ChatGPT
  Prompt:
  "Analyze the HTTP Response for indications of vulnerabilities and suggest specific ways to test for them including PoCs when it makes sense:
  <insert HTTP Response from Burp>"
- You can paste a URL as an HTTP request in Burp, It made so many things easier.
- Remaking nuclei fuzzing templates to work with POST requests instead of GET could give pretty interesting results! Also try adding some extra parameters to the POST request body as an extra mile.
- https://github.com/Dheerajmadhukar/back-me-up
  A tool to automate a BugBounty process: Tool will execute multiple tools to collect URLs from internet archives then use some useful patterns/RegEx to look for Sensitive Data in the form of multiple juicy extensions.
- 1. Open burpsuite.
  2. Capture the website request and try unknown parameters.
  3. If you see server version is being shown.
  4. Find server version cve.
  5. Try to connect the server.
