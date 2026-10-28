# 사실 확인: 클러스터 안의 DNS

- 글: src/content/docs/kubernetes/cluster-dns.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파드의 `/etc/resolv.conf`는 kubelet이 채우고, `search <ns>.svc.cluster.local svc.cluster.local cluster.local`, `options ndots:5` 꼴 | https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/ |
| 다른 네임스페이스의 서비스는 `data.prod`처럼 네임스페이스를 붙여 찾음 | 같은 문서 |
| dnsPolicy 4가지, 적지 않으면 ClusterFirst, "Default"는 기본값이 아님, hostNetwork 파드는 ClusterFirstWithHostNet을 적어야 함 | 같은 문서 |
| dnsConfig로 ndots 같은 옵션을 파드마다 바꿀 수 있음(예시 `ndots: "2"`) | 같은 문서 |
| ndots 기본값 1, 이름의 점이 n보다 적으면 검색 목록부터, 이름 끝의 점은 검색 목록을 붙이지 않음 | https://man7.org/linux/man-pages/man5/resolv.conf.5.html |
| CoreDNS 서비스의 이름은 `kube-dns` | https://kubernetes.io/docs/tasks/administer-cluster/coredns/ |
| 기본 Corefile의 `forward . /etc/resolv.conf`, `cache 30` | https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/ |
| `coredns_dns_requests_total`, `coredns_dns_responses_total{rcode}`, `coredns_dns_request_duration_seconds`, `coredns_cache_hits_total` | https://coredns.io/plugins/metrics/ , https://coredns.io/plugins/cache/ |
| Alpine 3.17 이하는 512바이트 넘는 응답의 TCP 재시도가 없어 DNS가 안 될 수 있음, 3.18 이상 권장 | https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/ |

- 재현: WSL Ubuntu에서 권한 없는 네임스페이스(`unshare -r -n -m`)를 만들고, 파드와 같은 resolv.conf(`search shop.svc.cluster.local svc.cluster.local cluster.local`, `ndots:5`)를 덮어 붙였어요. 받은 질의를 적는 가짜 DNS 서버(127.0.0.1:53)를 띄우고 glibc `getaddrinfo`로 이름을 찾았어요.
  - `pay`: `pay.shop.svc.cluster.local` A·AAAA 2번.
  - `api.example.com`: `…shop.svc.cluster.local`, `…svc.cluster.local`, `…cluster.local`, `api.example.com` 순서로 A·AAAA 8번. 6번이 NXDOMAIN.
  - `api.example.com.`(끝에 점): `api.example.com` A·AAAA 2번.
- 함께 한 것: 「서비스와 인그레스」에 이 글로 가는 줄을 더하고, 용어 coredns, ndots를 올리고 퀴즈 5문제를 썼어요.
