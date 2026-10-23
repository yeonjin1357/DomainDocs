# 사실 확인: TLS 인증서와 만료

- 글: src/content/docs/network/tls-certificates.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 공개 서버 인증서 최대 유효 기간: 2026-03-15 전 398일, 이후 200일(SHOULD 199), 2027-03-15부터 100일, 2029-03-15부터 47일 | https://github.com/cabforum/servercert/blob/main/docs/BR.md |
| Let's Encrypt 기본 90일, 60일마다 갱신 권장, 6일짜리 선택 가능(3일마다 갱신 권장) | https://letsencrypt.org/docs/faq/ |
| 서버는 자기 인증서와 중간 인증서를 보내야 함, 빠지면 다른 브라우저는 그때 받아 오고 Firefox는 미리 받아 둠 | https://wiki.mozilla.org/Security/CryptoEngineering/Intermediate_Preloading |
| 서비스 확인에 Common Name을 쓰지 않음(SAN 사용) | https://www.rfc-editor.org/rfc/rfc9525 |
| 인증서 유효 기간 notBefore·notAfter | https://www.rfc-editor.org/rfc/rfc5280 |
| `probe_ssl_earliest_cert_expiry`는 서버가 보낸 인증서 중 가장 이른 NotAfter(유닉스 초), `probe_ssl_last_chain_expiry_timestamp_seconds`는 검증 체인 기준 | https://github.com/prometheus/blackbox_exporter/blob/master/prober/tls.go |

- 명령 확인: WSL Ubuntu 24.04(OpenSSL 3.0.13, curl 8.5.0)에서 루트·중간·서버 인증서를 만들고 `openssl s_server`로 띄워 시험했어요.
  - 본문의 `s_client | x509 -enddate` 명령이 `notAfter=...`를 보여 줬어요.
  - `-checkend 1209600`은 만료가 멀 때 "will not expire"와 종료 코드 0을 냈어요.
  - 중간 인증서를 빼면 s_client는 코드 21(unable to verify the first certificate), curl은 (60) unable to get local issuer certificate였어요.
  - 이름이 다르면 curl은 no alternative certificate subject name matches로 실패했어요.
- 고친 것: 처음에 curl 오류 문구를 s_client의 것으로 적었다가, 시험 결과대로 바로잡았어요.
- 메모: 화면 그림(남은 12일, 90일짜리)과 알림 기준 20일은 예시예요.
- 함께 한 것: 용어 `network/tls`, `network/certificate`, `network/certificate-chain`을 더했고, 퀴즈 5문제를 썼어요.
