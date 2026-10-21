# 사실 확인: 데이터가 네트워크를 지나가는 길

- 글: src/content/docs/network/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| IP는 데이터그램을 주소로 가리킨 곳까지 보냄, 이름·주소·경로 구분 | https://www.rfc-editor.org/rfc/rfc791.html "A name indicates what we seek. An address indicates where it is. A route indicates how to get there." |
| 라우터는 네트워크를 잇고 경로 데이터베이스로 다음 장비를 고름 | https://www.rfc-editor.org/rfc/rfc1812.html |
| 스위치(브리지)는 보낸 쪽 주소로 배우고 전달에 씀 | https://www.rfc-editor.org/rfc/rfc4188.html |

- 메모: 방화벽·로드 밸런서는 한 줄 정의만 썼어요(장비별 동작은 다루지 않음).
