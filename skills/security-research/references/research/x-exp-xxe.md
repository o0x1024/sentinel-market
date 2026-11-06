# X 经验语料 · xxe

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XXE](../by-type/xxe.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xxe-1（10 条） · 本文 19 行

- For a POST request sent as JSON, convert it to XML and test for XXE. The "Content Type Converter" extension for Burp Suite does this.
- XXE is not limited to XML: also try SVG, DOCX and XLSX.
- SOAP/XML APIs may be vulnerable to XXE, but DTD declarations are usually disallowed in user input.
  Also try CDATA tags to insert payloads, as long as the XML stays valid.
- Ways to test for XXE:
  1- Convert the content type from "application/json" / "application/x-www-form-urlencoded" to "application/xml".
  2- If SVG is allowed in an image upload, inject XML inside the SVG.
- Use http://grep.app to find applications using xml2js, a Node.js library that parses XML, then look for insecure usage of it.
- XXE through docx upload and rendering.
  Take an office file (docx, xlsx, pptx), rename the extension to .zip, and you will find many XML files inside.
  Insert an XXE payload in the XML that the server processes.
