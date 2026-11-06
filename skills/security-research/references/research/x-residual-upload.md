# X 语料 · 残余回收（文件上传）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[文件上传](../by-type/file-upload.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-file-1（79 条）、x-exp-file（14 条）、x-residual-lfi_traversal（13 条） · 本文 9 行

- Find js file using httpx:
  echo http://target.com | gau | grep '\.js$' | httpx -status-code -mc 200 -content-type | grep 'application/javascript'
