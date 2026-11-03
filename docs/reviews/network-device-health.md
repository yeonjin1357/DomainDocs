# 사실 확인: 장비 자체의 상태(CPU·온도·전원)

- 글: src/content/docs/network/device-health.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| entPhysicalClass 값 chassis(3), powerSupply(6), fan(7), sensor(8), module(9), port(10), cpu(12), 버전 4부터 IANA-ENTITY-MIB의 IANAPhysicalClass 권장 | https://www.rfc-editor.org/rfc/rfc6933.html (PhysicalClass, IANAPhysicalClass) |
| 센서 값은 종류·배율·자릿수와 함께 읽음, celsius(8), rpm(10), milli(8)=10^-3, units(9)=10^0 | https://www.rfc-editor.org/rfc/rfc3433.html (EntitySensorDataType, EntitySensorDataScale) |
| 자릿수 1~9는 소수 자릿수, -8~-1은 정확한 자릿수 개수, 0은 고정 소수점 아님 | 같은 문서 EntitySensorPrecision |
| 센서 상태 ok(1), unavailable(2), nonoperational(3) | 같은 문서 EntitySensorStatus |
| hrProcessorLoad는 지난 1분 동안 쉬지 않은 시간의 비율 | https://www.rfc-editor.org/rfc/rfc2790.html |
| CISCO-PROCESS-MIB의 cpmCPUTotal5secRev·1minRev·5minRev(OID .1.3.6.1.4.1.9.9.109.1.1.1.1.6~8) | https://www.cisco.com/c/en/us/support/docs/ip/simple-network-management-protocol-snmp/15215-collect-cpu-util-snmp.html |
| 스위치는 전달할 곳을 하드웨어에서 정하고 CPU를 쓰지 않음, 장비로 오는 패킷·STP 같은 제어 메시지·SNMP 같은 관리 트래픽·IP 옵션이나 TTL 만료 패킷은 소프트웨어(CPU), CPU 사용률은 하드웨어 전달 성능을 나타내지 않음 | https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6500-series-switches/63992-6k-high-cpu.html |

- 5초·5분 평균을 견준 그래프와 42.5℃·전원 1/2 같은 숫자는 설명용 예시예요.
- 함께 한 것: 용어 entity-mib를 올렸어요. 퀴즈 5문제를 썼어요.
