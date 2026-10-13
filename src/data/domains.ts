import type { IconName } from './icons';

export const DOMAIN_IDS = ['foundations', 'apm', 'database', 'infra'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  icon: IconName;
}

export const DOMAINS: readonly Domain[] = [
  { id: 'foundations', name: '공통 기초', description: '지표, 시계열, 백분위수처럼 어느 모니터링 제품에서나 쓰는 개념이에요.', icon: 'sigma' },
  { id: 'apm', name: 'APM', description: '트랜잭션, 응답시간, 분산 트레이스로 애플리케이션 성능을 읽어요.', icon: 'activity' },
  { id: 'database', name: 'DB 모니터링', description: '세션, 대기 이벤트, 락, 실행 계획으로 데이터베이스를 읽어요.', icon: 'database' },
  { id: 'infra', name: '인프라·쿠버네티스', description: 'CPU, 메모리, 컨테이너, Pod 상태로 인프라를 읽어요.', icon: 'server' },
];

export function getDomain(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}
