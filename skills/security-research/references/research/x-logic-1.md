# X 语料 · 业务逻辑（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[业务逻辑](../by-type/business-logic.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-logic（9 条） · 本文 55 行

- Rare Payment Bypass Cases:
  Case 1: Submit=Payment
  ( Just Remove Payment & submit the request )
  Example : Submit =
  Case 2: Amount=100$
  ( Give space b/w = & 100$ and submit the request )
  Example : Amount= 100$
- Price Manipulation Method
  If the product price parameter cannot be changed, change the quantity of products.
  items[1][quantity]=1 --> 234 €
  items[1][quantity]=0.1 --> 23.4 €
- Find internal code or sample code of new features with: site:http://repl.it intext:<companydomain>. If you know the internal domain it is even better.
- [Amount Tempering]
  1. Application is validating product [$amount] parameter using random hash.
  2. Change the count of product from "1" to "2"
  3. 2 products will be ordered at the price of 1.
- Whenever testing for Payement Function:
  1. Proceed to the payment gateway.
  2. Click on cancel button and then intercept the request.
  3. From request replace "cancel" value to "success" and forward the request.
  4. Payment Successful.
- Amount Tampering Using Currency Change:
  1. Intercept the Payment Request. Amount is: 70 and Currency is: KWD
  2. Change the currency to: INR but not the amount.
  1 KWD = 250 INR
  3. Complete the payment and order will be booked in less than 1 KWD
- Race Condition :
  1. User can tip any content creator.
  2. Send multiple tip request with higher threads using Intruder.
  3. User's balance was 10$ but the tip received was 100$.
  Bonus: You can be a creator as well. Tip yourself and multiple your money.
- Race Condition test quickly with CURL;
  for i in {1..100}; do echo $i; done | xargs -P 25 -I{} curl -sLo /dev/null "http://..." -w "{}. %{http_code} - %{size_download}\n"
- If you are dealing with a website that is using "Coupons"
  Start grepping URLs from "waybackurls" and run:
  cat waybackrzlts.txt | grep "coupons"
  You can find there some discount codes published for public
- Sometimes when arjun does not work properly for parameter guessing, I use ffuf instead:
  ffuf -u "https://target\.com/payment.php?FUZZ=regular" -w ~/wordlists/SecLists/Discovery/Web-Content/raft-large-directories-lowercase.txt
- Public access GIT
  pvtkeys exposured
  PATHURL/.git/config
  Use a tool such as https://github.com/arthaud/git-dumper to dump the Git repository
  Checkout the latest commit to obtain a copy of the working tree
- if the target uses zendesk to handle support emails
  you could send an email with payload
  `{{ticket.ccs[0].name}}a{{ticket.ccs[0].phone}}` by adding `victim@gmail.com` in CC
  and extract victim info ranging from phone, address to payment info
