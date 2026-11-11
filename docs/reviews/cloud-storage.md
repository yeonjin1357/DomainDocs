# 사실 확인: 블록·파일·오브젝트 저장소

- 글: src/content/docs/cloud/storage.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| EBS = 블록 장치, 붙이면 물리 하드처럼, 같은 AZ여야 함, Multi-Attach, 운영 중 크기·IOPS·종류 변경 | https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html |
| gp3 기본 3,000 IOPS가 요금에 포함, 추가는 별도 요금 | https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html |
| EFS = 용량을 관리하지 않는 탄력적 파일 저장소, NFSv4 | https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html |
| S3 = 버킷에 객체 저장, 객체 = 파일+메타데이터, 키 = 버킷 안 고유 이름, 강한 read-after-write 일관성 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html |
| S3는 평평한 구조, 콘솔의 폴더는 공통 접두사 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html |
| 1년 동안 99.999999999% 내구성 설계 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html |
| Azure Blobs(오브젝트), Files(관리형 파일 공유), managed disks(블록) | https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction |

- 메모: 다른 AZ로 옮길 때 스냅숏에서 새 볼륨을 만드는 것과 Multi-Attach 때 쓰기 조율은 일반 설명이에요. gp3 최대 IOPS는 문서 페이지마다 값이 달라 적지 않았어요.

## 2026-11-11 보강: 저장 등급과 수명 주기, S3 지표

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 등급 목록, 기본은 S3 Standard, 등급별 꺼내는 시간·최소 보관(IA 30일, Glacier IR·Flexible 90일, Deep Archive 180일)·최소 과금 크기 128KB(IA·One Zone-IA·Glacier IR), 일찍 지우면 30일 치, One Zone-IA는 AZ 하나, Glacier Flexible·Deep Archive는 복원 필요, Intelligent-Tiering은 꺼내기 요금 없음·30일/90일 이동·128KB 미만은 감시 안 함 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html |
| 수명 주기 규칙 = 옮기기·지우기, 이미 있는 객체에도 적용, 옮길 때 요청 요금(30일 뒤 IA·1년 뒤 Glacier 예시) | https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html |
| 2024년 9월 이후 만들거나 고친 규칙은 128KB 미만 객체를 기본으로 안 옮김, Glacier 쪽 이동은 비동기이고 규칙을 채운 날부터 새 등급 요금 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html |
| 버킷 크기·객체 수 지표는 하루 한 번, 추가 요금 없음, 요청 지표는 켜야 오고 1분 단위·사용자 지정 지표 요금 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudwatch-monitoring.html |
| BucketSizeBytes는 StorageType 차원으로 등급마다 나뉨 | https://docs.aws.amazon.com/AmazonS3/latest/userguide/metrics-dimensions.html |

- "3년 뒤 지움" 규칙과 버킷 크기 값(1.21~1.39TB)은 예시예요.
- 함께 한 것: 용어 storage-class, lifecycle-rule를 올렸어요. 퀴즈 3문제를 더했어요. 그림 2개(s3-lifecycle, s3-daily).
