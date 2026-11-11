# 사실 확인: 감사 로그, 누가 무엇을 바꿨나

- 글: src/content/docs/cloud/audit-logs.mdx
- 확인일: 2026-11-11

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 계정을 만들면 Event history를 바로 씀, 리전마다 최근 90일 관리 이벤트, 보는 데 요금 없음, trail은 S3로 내보내고 CloudWatch Logs·EventBridge로도, 콘솔에서 만든 trail은 모든 리전, 관리 이벤트 사본 하나는 무료(S3 저장 요금은 냄), 5분쯤마다 파일, 평균 5분쯤 전달(보장 아님), 서비스가 대신 부른 호출은 invokedBy, 조직 trail은 구성원 계정이 고치거나 지울 수 없음, Lake·Insights는 요금 | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/how-cloudtrail-works.html |
| 관리 이벤트 = 컨트롤 플레인(CreateSubnet 등), 데이터 이벤트 = 데이터 플레인(S3 GetObject·PutObject·DeleteObject, Lambda Invoke), 데이터 이벤트는 기본으로 안 남음, 기록 파일은 순서대로가 아님 | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html |
| eventTime은 요청이 끝난 시각(UTC), eventSource(CloudWatch는 monitoring.amazonaws.com), eventName, sourceIPAddress, errorCode는 실패 때만, readOnly true·false | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html |
| 데이터 이벤트 10만 건당 0.10달러, 관리 이벤트 첫 사본 무료 | https://aws.amazon.com/cloudtrail/pricing/ |
| Azure 활동 로그 = 관리(컨트롤 플레인) 작업, 기본 수집, 읽기는 대개 없음, 90일 무료 보관, 진단 설정으로 Log Analytics·스토리지에 더 오래, 3~20분 안에 검색 가능, 리소스 로그(데이터 플레인)는 진단 설정으로 켜야 함 | https://learn.microsoft.com/en-us/azure/azure-monitor/platform/activity-log |

- JSON 예시는 RDS ModifyDBInstance 호출을 줄여 쓴 예예요. 계정 ID와 IP는 문서용 값이에요.
- 그림(trail-overlay)의 에러율과 감사 로그 표는 예시예요. 사람 이름 대신 ops-user, deploy-bot을 썼어요.
- 함께 한 것: 용어 audit-log, management-event, data-event, trail, activity-log를 올렸어요. 퀴즈 5문제를 썼어요.
