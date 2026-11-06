# X 经验语料 · file

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[文件上传](../by-type/file-upload.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-file-1（79 条）、x-residual-upload（1 条）、x-residual-lfi_traversal（13 条） · 本文 29 行

- Against an HTML-to-PDF or image generator: if you cannot load a file directly in an iframe to reach LFI, try a 302 redirection instead.
- On an upload page (images/files), name the uploaded file "../.png" and read the response — it may execute path traversal.
- File upload restriction bypass checklist:
  1- Try various file extensions — different versions of the same extension, e.g. php3, .php4, .php5, phtml for PHP scripts, asp, aspx
- File upload bypasses and test cases, briefly:
  - Upload php
  - Upload different versions: .php2, .php3
  - Upload html file
  - Upload .phP
  - Upload .PHP
  - Upload .svg
  - Remove cookies from the upload request
  - Change the content-type of the request
  - Change the magic byte of the file
- With a file read / LFI in an app you suspect is Java based, try reading a directory (e.g. /home): Java tends to return a directory listing instead of an error when a file read hits a directory.
- With a non-relative LFI (full paths required) where you need files in the app's current directory, on Linux try /proc/self/cwd/<file> — /proc/self/cwd always points to the cwd of the current process.
- Carnage — file upload (extension bypass). The tool tries various techniques to bypass upload restrictions.
  Repo: https://github.com/sAjibuu/upload_bypass
- Always test every file-related parameter for LFI.
- Testing LFI with no PoC visible in the browser and no interceptor set up: use curl.
- File upload bypass: PHP extensions are blacklisted and the filename must end in jpeg/png/jpg. Uploading a .htaccess file with a null byte at the end bypasses this, so any extension executes as PHP.
