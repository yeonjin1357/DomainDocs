# 사실 확인: 로그의 민감 정보 가리기

- 글: src/content/docs/logs/sensitive-data.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 로그에 그대로 남기지 말 것: 세션 ID, 접근 토큰, 민감한 개인정보(건강, 정부 식별 번호), 비밀번호, DB 연결 문자열, 암호화 키, 계좌·카드 정보. 빼거나 가리거나 해시·암호화 | OWASP Logging Cheat Sheet(원문 CheatSheetSeries/cheatsheets/Logging_Cheat_Sheet.md 188~201행) |
| 이름·전화번호·이메일 같은 개인정보도 남기기 전에 따로 다루라고 해요 | 같은 문서 203~210행 |
| redaction 프로세서: 허용 키만 남기고 나머지 속성 삭제, `blocked_values` 정규식에 맞는 값은 별표로 가림, 허용 목록이 비면 모두 삭제(fail closed), 맵 형태 로그 본문도 보고 | opentelemetry-collector-contrib processor/redactionprocessor/README.md |
| `url.full`의 아이디·비밀번호는 `REDACTED`로, 쿼리의 `X-Amz-Signature`, `sig` 등은 기본으로 가려요 | OpenTelemetry semantic-conventions docs/registry/attributes/url.md |
| SHA-256 100만 개 0.59초, 1억 개는 약 1분(010 + 8자리 번호 맞춰 찾음) | 직접 잼: Windows 노트북 Python 3, hashlib, 한 줄기 |
| 무작위 16자리 숫자의 Luhn 통과 비율 0.0994(20만 개), 4111111111111111은 Luhn 통과 | 직접 계산 |

- 화면 예시 숫자(1분 40줄)는 설명용이에요.
