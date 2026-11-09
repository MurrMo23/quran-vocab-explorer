# IndexNow (Bing, Yandex, Seznam, Naver)

Key: `cb4d151325431a5da0a54f97f4456e31`, hosted at https://quranvocab.com/cb4d151325431a5da0a54f97f4456e31.txt
(file: `public/cb4d151325431a5da0a54f97f4456e31.txt`). Do not delete it.

After a publish, submit changed URLs (up to 10,000 per request):

```
POST https://api.indexnow.org/indexnow
Content-Type: application/json; charset=utf-8
{"host":"quranvocab.com","key":"cb4d151325431a5da0a54f97f4456e31",
 "keyLocation":"https://quranvocab.com/cb4d151325431a5da0a54f97f4456e31.txt","urlList":["https://quranvocab.com/..."]}
```

A 200 or 202 response means accepted. Bing also reads the sitemaps listed in robots.txt.
