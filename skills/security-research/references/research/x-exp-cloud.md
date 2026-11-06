# X 经验语料 · cloud

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[云安全](../cloud/cloud-security.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-cloud-1（26 条） · 本文 46 行

- S3 bucket with write access: overwriting one of the images on it allowed displaying an arbitrarily chosen image on all the newly created accounts of the in-scope domain.
- if a company is using s3 bucket to store data but bucket is secure check the request/response or uploaded file url for AWSAccessKeyId and then search that id on Github you might end up with AWSAccessKeyId & AWSAccessKeySecret
- Bucket Flaws (S3 Bucket Mass Scanner)
  https://github.com/nikhil1232/Bucket-Flaws
  Have a long list of S3 Buckets or just a single bucket? Bucket Flaws can check for common S3 Bucket Misconfigurations in both.
- Is cloudflare blocking your xhr requests? Try sending your xhr with a referrer header that includes the target domain as part of the path:
  fetch('https://targetdomain/vulnerable/end/point', { "referrer":"https://yourdomain/.targetdomain"})
- Some companies rely on cloud services specially in that period for remote work, so when you look for credentials on github and similar services remember that
  examples:
  "centrify. com" password
  "service-now. com" password
  You can try send_keys keyword also.
- Compromising AWS with an HTTP header! Don't forget to look for DNS rebinding in Referer headers
- Always checkout bucket content whether it's sensitive OR not; because (js/css/png/..) stored buckets meant to be public so might closed as informative
- Aws s3 bucket exploits
  Permission-
  1.Check >
  $ aws s3 ls s3://bucket
  2.write(upload) >
  $ aws s3 cp filename.txt s3://bucket
  3. Try to download uploaded files >
  $ aws s3 cp s3://bucket/file filename
- Got a S3 bucket but don't know who is the owner ?? Use the below command to check the bucket owner
  aws s3api get-bucket-acl --bucket bucket-name
- If you have found a s3 bucket, try to fuzz it with this payload. It may leads to access sensitive information due to server misconfiguration
  https://github.com/gwen001/wordlists/blob/master/s3-buckets.txt
- aws s3 ls s3://bucket-name ---> Acess denied.
  aws s3 cp test.html s3://bucket-name ---> uploaded
  Takeaway: use every possible methods
- Testing for open S3 buckets
  - make sure that bucket includes sensitive/important files to be marked as valid finding
  - ensure that it belongs to the target you're testing
- Bug: S3 bucket takeover
  Tip: Try to dig as deep in js files you may found unclaimed buckets over there.
- AWS Bucket Takeover Check
  aws s3 ls s3://bucket-name --no-sign-request
  If accessible without creds — test write access. Upload crossdomain.xml or index.html to confirm takeover
- Tip: Input bxss payload inside the comment and check for iframe injection to aws access
