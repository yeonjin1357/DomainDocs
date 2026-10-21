import type { IconName } from './icons';

export const DOMAIN_IDS = ['foundations', 'network', 'server', 'kubernetes', 'cloud', 'apm', 'database', 'messaging'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  icon: IconName;
}

export const DOMAINS: readonly Domain[] = [
  { id: 'foundations', name: '모니터링 기초', description: '백분위수, rate, 알림처럼 어느 영역에서나 쓰는 모니터링 개념이에요.', icon: 'sigma' },
  { id: 'network', name: '네트워크', description: '장비, 인터페이스, 스위치, SNMP처럼 네트워크가 이어지고 보이는 방식이에요.', icon: 'network' },
  { id: 'server', name: '서버·OS', description: 'CPU, 메모리, 디스크, 프로세스처럼 서버 한 대가 일하는 방식이에요.', icon: 'server' },
  { id: 'kubernetes', name: '컨테이너·쿠버네티스', description: '컨테이너, 파드, 노드, 워크로드로 앱을 띄우고 관리하는 방식이에요.', icon: 'container' },
  { id: 'cloud', name: '클라우드', description: 'AWS와 Azure의 주요 서비스와, 그 서비스를 재는 지표예요.', icon: 'cloud' },
  { id: 'apm', name: '애플리케이션', description: 'WAS, 트랜잭션, 응답시간, 트레이스로 앱이 요청을 처리하는 방식이에요.', icon: 'activity' },
  { id: 'database', name: '데이터베이스', description: '트랜잭션, 인덱스, 잠금, 세션으로 DB가 데이터를 다루는 방식이에요.', icon: 'database' },
  { id: 'messaging', name: '메시지 큐', description: 'Kafka의 토픽, 파티션, 컨슈머 그룹으로 메시지가 오가는 방식이에요.', icon: 'messages-square' },
];

export function getDomain(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}
