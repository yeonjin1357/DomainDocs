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
