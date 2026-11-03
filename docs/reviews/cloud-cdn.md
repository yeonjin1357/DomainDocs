# 사실 확인: CDN(콘텐츠 전송 네트워크)

- 글: src/content/docs/cloud/cdn.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 실제 응답 헤더 `X-Cache: Hit from cloudfront`, `X-Amz-Cf-Pop: ICN80-P2`, `Age: 15492907`, `Cache-Control: max-age=31536000`, 같은 주소에 `?nocache=…`를 붙여도 Hit | 직접 확인: `curl -sI https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_stacked_REV_SQ.91cd4af4….png`(서울, 2026-11-03) |
| Cloudflare는 `CF-Cache-Status: HIT` | 직접 확인: `curl -sI https://www.cloudflare.com/favicon.ico` |
| x-edge-result-type: Hit, RefreshHit(만료돼 원본에 확인), Miss, LimitExceeded, CapacityExceeded(503), Error, Redirect | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/standard-logs-reference.html |
| 기본 지표: Requests, 내려받은·올린 바이트, 4xx·5xx·전체 에러율(1분), 추가 지표(배포마다 켜고 비용): Cache hit rate(캐시 가능한 요청만, POST·PUT·에러 제외), Origin latency. 지표는 US East (N. Virginia) | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/viewing-cloudfront-metrics.html |
| CachingOptimized: 최소 1초, 기본 86,400초(24시간), 최대 31,536,000초, 쿼리·쿠키·헤더는 캐시 키에 넣지 않음, 최소 TTL이 0보다 크면 no-cache·no-store·private가 있어도 그만큼 담음 | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html |
| 502: 원본과 TLS 협상 실패, 원본이 포트에서 응답 안 함, DNS 에러 / 504: 원본이 504를 주거나 제때 응답 안 함, 방화벽 차단 | CloudFront 문서 http-502-bad-gateway, http-504-gateway-timeout |
| private: 공유 캐시는 저장하면 안 됨, s-maxage는 공유 캐시용, Age 헤더 | https://www.rfc-editor.org/rfc/rfc9111 (5.2.2.7, 5.2.2.10, 5.1) |

- 계산: Age 15,492,907초 ÷ 86,400 ≈ 179일. 원본 요청 (1 − 적중률) × 1만: 100·500·2,000건. 96%→70%면 (0.30 ÷ 0.04) = 7.5배.
- 고친 것: CDN이 낸 에러의 원본 로그를 '대개 없어요'에서 '없거나 늦게 끝난 기록만'으로(504 시간 초과는 원본이 받은 기록이 남을 수 있음).
