import { tour as cloud } from './tours/cloud';
import { tour as foundations } from './tours/foundations';
import { tour as logs } from './tours/logs';
import { tour as messaging } from './tours/messaging';
import { tour as network } from './tours/network';
import { tour as server } from './tours/server';

/**
 * 개요 글의 "화면으로 둘러봐요" 데모에 쓰는 예시 화면. 숫자는 모두 설명용 예시예요.
 * 설명(what·read·trap)은 링크한 글에 이미 있는 내용만 써요. 링크 제목은 글 제목과 같아야 해요(단위 테스트가 확인).
 */
export interface TourLink {
  slug: string;
  title: string;
}

interface TourWidgetBase {
  id: string;
  title: string;
  /** 2면 화면 한 줄을 다 써요. */
  span: 1 | 2;
  what: string;
  read: string;
  trap: string;
  links: TourLink[];
}

export type TourWidget =
  | (TourWidgetBase & { kind: 'stat'; value: string; unit?: string; note?: string; tone?: 'warn' })
  | (TourWidgetBase & { kind: 'line'; yMax: number; series: { label: string; values: number[]; tone?: 'warn' | 'sub'; value: string }[] })
  | (TourWidgetBase & { kind: 'bars'; rows: { label: string; value: number; text: string; tone?: 'warn' }[] })
  | (TourWidgetBase & {
      kind: 'table';
      head: string[];
      rows: { cells: string[]; tone?: 'warn' }[];
      /** 열 너비(grid-template-columns). 없으면 4열 기본값을 써요. */
      cols?: string;
    });

export interface Tour {
  title: string;
  widgets: TourWidget[];
}

export const TOURS = {
  apm: {
    title: '주문 서비스 · 최근 1시간',
    widgets: [
      {
        id: 'tps',
        kind: 'stat',
        title: '처리량',
        span: 1,
        value: '200',
        unit: '건/초',
        note: '어제 이 시각 210',
        what: '초당 끝낸 요청 수예요. TPS라고도 불러요.',
        read: '요청이 끝날 때 세는 값이라, 요청이 밀리면 들어온 수보다 끝낸 수가 먼저 줄어요.',
        trap: '줄었다고 손님이 줄었다고 보지 마세요. 응답시간과 활성 트랜잭션이 함께 늘었다면 처리할 힘이 모자란 거예요.',
        links: [{ slug: 'apm/throughput-and-concurrency', title: '처리량과 동시성' }],
      },
      {
        id: 'p99',
        kind: 'stat',
        title: '응답시간 p99',
        span: 1,
        value: '1.2',
        unit: '초',
        note: 'p50 0.18초',
        tone: 'warn',
        what: '요청 100건을 빠른 순으로 줄 세웠을 때 99번째 요청의 시간이에요.',
        read: '평균은 느린 요청을 숨겨요. 느린 쪽 사용자가 겪는 시간은 p99로 봐요.',
        trap: '서버마다 구한 p99를 평균 내면 틀려요. 요청을 모두 모아 다시 구해요.',
        links: [
          { slug: 'foundations/percentiles', title: '평균과 백분위수' },
          { slug: 'apm/transactions-and-response-time', title: '트랜잭션과 응답시간' },
        ],
      },
      {
        id: 'errors',
        kind: 'stat',
        title: '에러율',
        span: 1,
        value: '0.8',
        unit: '%',
        what: '실패한 요청의 비율이에요. 서버는 보통 5xx만 에러로 세요.',
        read: '비율이라서, 요청이 늘 때 에러 수가 함께 늘어도 비율이 그대로면 나빠진 게 아니에요.',
        trap: '예외 수나 에러 로그 줄 수로 그린 값은 에러율이 아니에요. 요청 하나가 여러 건으로 세질 수 있어요.',
        links: [{ slug: 'apm/errors-and-exceptions', title: '에러와 예외' }],
      },
      {
        id: 'apdex',
        kind: 'stat',
        title: 'Apdex',
        span: 1,
        value: '0.85',
        unit: '[0.5]',
        what: '요청을 만족·허용·불만으로 나눠 0~1 점수 하나로 만든 값이에요.',
        read: '목표 시간 T와 함께 읽어요. 0.85 [0.5]는 T를 0.5초로 둔 점수예요.',
        trap: '얼마나 느린지는 지워져요. 4T를 넘은 요청은 몇 초가 걸렸든 같은 불만이에요.',
        links: [{ slug: 'apm/apdex', title: 'Apdex 점수' }],
      },
      {
        id: 'active',
        kind: 'line',
        title: '활성 트랜잭션',
        span: 2,
        yMax: 250,
        series: [{ label: '처리 중', values: [100, 100, 105, 100, 150, 200, 200, 200, 200, 200, 200, 200], tone: 'warn', value: '200개' }],
        what: '지금 처리 중인 요청 수예요. 요청이 시작하면 1 늘고, 끝나면 1 줄어요.',
        read: '처리량 × 응답시간만큼 쌓여요. 그래서 응답이 느려지면 함께 늘어요.',
        trap: '일정한 값에 평평하게 붙으면 스레드 풀 상한을 의심해요. Tomcat은 따로 정하지 않으면 200개예요.',
        links: [
          { slug: 'apm/throughput-and-concurrency', title: '처리량과 동시성' },
          { slug: 'apm/thread-pools', title: '스레드 풀과 요청 처리' },
        ],
      },
      {
        id: 'latency',
        kind: 'line',
        title: '응답시간',
        span: 2,
        yMax: 1.5,
        series: [
          { label: 'p99', values: [0.4, 0.4, 0.45, 0.4, 0.8, 1.2, 1.2, 1.1, 1.2, 1.2, 1.2, 1.2], tone: 'warn', value: '1.2초' },
          { label: 'p50', values: [0.15, 0.15, 0.16, 0.15, 0.17, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18, 0.18], value: '0.18초' },
        ],
        what: 'p50은 보통 요청, p99는 느린 쪽 요청이 걸린 시간이에요.',
        read: 'p99만 크게 오르면 일부 요청만 느린 거예요. 분포도로 보면 느린 무리가 따로 보여요.',
        trap: '그래프 한 점이 몇 분을 묶은 값인지 봐요. 넓게 묶을수록 짧은 피크가 사라져요.',
        links: [
          { slug: 'apm/response-time-distribution', title: '응답시간 분포도 읽기' },
          { slug: 'foundations/aggregation-and-downsampling', title: '집계 구간과 다운샘플링' },
        ],
      },
      {
        id: 'slow',
        kind: 'bars',
        title: '느린 트랜잭션(p99)',
        span: 2,
        rows: [
          { label: 'POST /orders', value: 2.1, text: '2.1초', tone: 'warn' },
          { label: 'GET /orders/{id}', value: 0.9, text: '0.9초' },
          { label: 'GET /products', value: 0.3, text: '0.3초' },
        ],
        what: '트랜잭션(요청 하나를 처리한 단위)을 이름별로 묶어 느린 순으로 줄 세운 목록이에요.',
        read: '이름이 /orders/{id}처럼 경로 틀로 묶여야 같은 기능끼리 견줄 수 있어요.',
        trap: '이름에 /orders/1234처럼 실제 경로가 들어가면, 같은 기능이 주문 수만큼 갈라져요.',
        links: [
          { slug: 'apm/transactions-and-response-time', title: '트랜잭션과 응답시간' },
          { slug: 'apm/slow-response', title: '응답이 느려졌을 때 어디부터 볼까' },
        ],
      },
    ],
  },
  kubernetes: {
    title: 'shop 네임스페이스 · 지금',
    widgets: [
      {
        id: 'nodes',
        kind: 'stat',
        title: '노드',
        span: 1,
        value: '5/6',
        unit: 'Ready',
        note: 'NotReady 1',
        tone: 'warn',
        what: '파드를 올리는 서버(노드) 가운데 Ready인 수예요. 노드의 kubelet이 상태를 알려 와요.',
        read: 'Ready가 아니면 노드 조건으로 이유를 가려요. kubelet과 연락이 끊겼는지, 메모리·디스크 압박인지 봐요.',
        trap: 'NotReady 노드의 파드가 Running으로 보여도 안심하지 마세요. 마지막으로 들은 값일 수 있어요.',
        links: [{ slug: 'kubernetes/node-not-ready', title: '노드가 NotReady일 때' }],
      },
      {
        id: 'restarts',
        kind: 'stat',
        title: '최근 1시간 재시작',
        span: 1,
        value: '14',
        unit: '번',
        tone: 'warn',
        what: '컨테이너가 죽고 다시 시작된 횟수예요.',
        read: '계속 커지는 카운터라, increase로 구간 동안 늘어난 수를 봐요.',
        trap: '종료 이유가 OOMKilled면 메모리 한도나 누수를 의심해요. 다른 이유면 죽은 실행의 로그부터 봐요.',
        links: [
          { slug: 'kubernetes/pod-restarting', title: '파드가 계속 재시작될 때' },
          { slug: 'kubernetes/metrics-sources', title: '쿠버네티스 지표는 어디서 오나' },
        ],
      },
      {
        id: 'pods',
        kind: 'table',
        title: '파드',
        span: 2,
        head: ['이름', '상태', '준비', '재시작'],
        rows: [
          { cells: ['api-x2', 'Running', '1/1', '0'] },
          // \u200b는 좁은 화면에서 CrashLoop 뒤에서 줄을 바꾸게 하는 보이지 않는 자리예요.
          { cells: ['api-q8', 'CrashLoop\u200bBackOff', '0/1', '14'], tone: 'warn' },
          { cells: ['job-m1', 'Pending', '0/1', '0'], tone: 'warn' },
        ],
        what: '파드마다 상태, 준비된 컨테이너 수, 재시작 횟수를 보여 줘요.',
        read: 'Running이어도 준비가 0/1이면 요청을 받지 못해요. 재시작 횟수와 준비를 함께 봐요.',
        trap: 'CrashLoopBackOff는 죽고 다시 뜨기를 되풀이하며 기다리는 중이라는 표시예요. 그 자체가 원인은 아니에요.',
        links: [
          { slug: 'kubernetes/pod-status', title: '파드 상태와 재시작' },
          { slug: 'kubernetes/pod-pending', title: '파드가 Pending에 머물 때' },
        ],
      },
      {
        id: 'cpu',
        kind: 'bars',
        title: 'CPU(api 파드 하나)',
        span: 2,
        rows: [
          { label: '쓰는 양', value: 0.45, text: '0.45코어' },
          { label: '요청', value: 0.5, text: '0.5코어' },
          { label: '한도', value: 1, text: '1코어' },
        ],
        what: '쓰는 양을 요청·한도와 함께 그려요. 요청은 자리 예약, 한도는 넘지 못하는 선이에요.',
        read: 'HPA의 CPU 사용률은 요청 대비예요. 0.45 ÷ 0.5라서 90%예요.',
        trap: '평균이 한도보다 낮아도 잠깐씩 멈출 수 있어요. 100ms 주기 안에서 몫을 다 쓰면 스로틀링돼요.',
        links: [{ slug: 'kubernetes/requests-and-limits', title: '요청과 한도' }],
      },
      {
        id: 'memory',
        kind: 'stat',
        title: '메모리 working set',
        span: 1,
        value: '700',
        unit: 'Mi',
        note: '한도 1Gi',
        what: '컨테이너가 쓰는 메모리에서 비울 수 있는 파일 캐시를 뺀 몫이에요.',
        read: '메모리 한도와 견줘 봐요. 한도를 넘으면 컨테이너가 OOMKilled로 끝나요.',
        trap: 'container_memory_usage_bytes는 캐시까지 세서 늘 높게 나와요. working set으로 봐요.',
        links: [{ slug: 'kubernetes/metrics-sources', title: '쿠버네티스 지표는 어디서 오나' }],
      },
      {
        id: 'hpa',
        kind: 'stat',
        title: 'HPA(api)',
        span: 1,
        value: '4 → 6',
        unit: '파드',
        note: '목표 CPU 60%',
        what: '사용률을 보고 파드 수를 바꿔요. 원하는 수는 올림(지금 수 × 지금 값 ÷ 목표 값)이에요.',
        read: '늘릴 땐 바로 늘리고, 줄일 땐 5분 동안 지켜본 뒤에 줄여요.',
        trap: '파드 수가 최대값에 붙어 있으면 부하가 더 늘어도 늘지 않아요.',
        links: [
          { slug: 'kubernetes/autoscaling', title: '자동 확장' },
          { slug: 'kubernetes/hpa-not-scaling', title: 'HPA가 파드를 늘리지 않을 때' },
        ],
      },
      {
        id: 'rollout',
        kind: 'stat',
        title: 'Deployment api',
        span: 2,
        value: '3/4',
        unit: '준비됨',
        note: '새 버전으로 바꾸는 중',
        what: '원하는 파드 수 가운데 준비된 파드 수예요.',
        read: '바꿔 끼우는 동안 잠깐 많거나 적은 건 정상이에요.',
        trap: '새 파드가 준비되지 못하면 배포가 멈춰요. 쿠버네티스는 멈췄다고 표시만 하고 되돌리지 않아요.',
        links: [
          { slug: 'kubernetes/rollout-stuck', title: '배포가 끝나지 않을 때' },
          { slug: 'kubernetes/workloads', title: '워크로드' },
        ],
      },
    ],
  },
  database: {
    title: '주문 DB · 최근 1시간',
    widgets: [
      {
        id: 'sessions',
        kind: 'line',
        title: '액티브 세션',
        span: 2,
        yMax: 14,
        series: [
          { label: 'Lock 대기', values: [0, 0, 0, 0, 0, 2, 5, 7, 8, 9, 9, 9], tone: 'warn', value: '9' },
          { label: 'CPU', values: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], value: '2' },
          { label: 'IO 대기', values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], tone: 'sub', value: '1' },
        ],
        what: '일하거나 기다리는 세션 수를, 무엇을 기다리는지(대기 이벤트)로 나눠 그려요.',
        read: 'Lock 대기가 늘면 잠금을 쥔 세션이 뒤의 세션을 막고 있어요.',
        trap: '1분에 한 번 찍은 표본이면, 그 사이에 끝난 짧은 쿼리는 빠져요.',
        links: [
          { slug: 'database/active-sessions', title: '액티브 세션과 대기 이벤트' },
          { slug: 'database/locks-and-blocking', title: '잠금과 블로킹' },
        ],
      },
      {
        id: 'connections',
        kind: 'stat',
        title: '연결',
        span: 1,
        value: '96',
        unit: '/100',
        note: '액티브 12',
        tone: 'warn',
        what: '앱과 DB 사이에 열린 연결 수와 한도(max_connections)예요. 한도에 닿으면 새 연결이 실패해요.',
        read: '연결 수와 액티브 세션 수를 함께 봐요. 연결 대부분이 쉬고 있을 수 있어요.',
        trap: '한도부터 올리지 마세요. 쉬는 연결도 자리를 차지해요. 풀 크기와 쉬는 연결부터 봐요.',
        links: [
          { slug: 'database/connections-and-sessions', title: '연결과 세션' },
          { slug: 'database/too-many-connections', title: 'DB 연결이 한도에 닿았을 때 어디부터 볼까' },
        ],
      },
      {
        id: 'hit',
        kind: 'stat',
        title: '버퍼 캐시 적중률',
        span: 1,
        value: '99.2',
        unit: '%',
        what: '읽은 블록 가운데 메모리(버퍼 캐시)에서 찾은 비율이에요.',
        read: '비율은 일의 양을 지워요. SQL별로 읽은 블록 수와 실행 시간을 함께 봐요.',
        trap: '같은 블록을 몇 번이고 다시 읽는 나쁜 쿼리가 오히려 적중률을 올려요.',
        links: [{ slug: 'database/buffer-cache-hit-ratio', title: '버퍼 캐시 적중률의 함정' }],
      },
      {
        id: 'topsql',
        kind: 'bars',
        title: 'SQL별 부하(총 시간)',
        span: 2,
        rows: [
          { label: 'UPDATE stock …', value: 41, text: '41%', tone: 'warn' },
          { label: 'SELECT … FROM orders …', value: 23, text: '23%' },
          { label: 'SELECT … FROM products …', value: 9, text: '9%' },
        ],
        what: 'SQL마다 쓴 시간을 모아 줄 세운 목록이에요. 값만 다른 SQL은 하나로 묶어요.',
        read: '총 시간 순으로 봐요. 빠른 SQL도 많이 불리면 DB를 가장 많이 써요.',
        trap: '평균 시간 순이면 하루 한 번 도는 배치가 맨 위에 오고, 자주 도는 SQL이 묻혀요.',
        links: [{ slug: 'database/top-sql', title: 'SQL별 부하 순위(Top SQL)' }],
      },
      {
        id: 'blocking',
        kind: 'stat',
        title: '블로킹',
        span: 1,
        value: '1 → 8',
        unit: '세션',
        note: '맨 앞 세션 하나가 8개를 막음',
        tone: 'warn',
        what: '잠금을 기다리는 세션과, 그 잠금을 쥔 세션을 이어서 보여 줘요.',
        read: '막힌 세션 수십 개를 풀려면 사슬 맨 앞의 세션 하나를 봐요.',
        trap: '맨 앞 세션이 아무 일도 안 하는 idle in transaction일 수 있어요. 트랜잭션을 끝내지 않아 잠금을 쥐고 있어요.',
        links: [{ slug: 'database/locks-and-blocking', title: '잠금과 블로킹' }],
      },
      {
        id: 'lag',
        kind: 'stat',
        title: '복제 지연',
        span: 1,
        value: '0.4',
        unit: '초',
        what: '주 서버의 변경이 복제 서버에 닿기까지 걸리는 시간이에요.',
        read: '복제 서버에서 읽으면 방금 쓴 값이 아직 안 보일 수 있어요.',
        trap: '쓰기가 없는 새벽에는 시간 지연이 부풀어 거짓 알림이 울려요. WAL 바이트 차이와 함께 봐요.',
        links: [{ slug: 'database/replication-lag', title: '복제 지연' }],
      },
    ],
  },
  network,
  server,
  cloud,
  messaging,
  logs,
  foundations,
} satisfies Record<string, Tour>;

export type TourScreen = keyof typeof TOURS;
