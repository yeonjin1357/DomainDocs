# 사실 확인: 차트 고르기

- 글: src/content/docs/foundations/chart-types.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Grafana Time series의 Stack series는 Off·Normal·100%, 누적은 오해를 부를 수 있으니 조심하라고 적음 | https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/time-series/ |
| Grafana 히트맵은 시간에 따른 히스토그램(분포)을 보여 줌 | https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/heatmap/ |
| Cleveland & McGill(1984, JASA) Graphical Perception: 같은 축 위의 위치·길이 판단이 각도·넓이보다 정확함 | https://doi.org/10.1080/01621459.1984.10478080 (Crossref로 서지 확인), Wikipedia 'Pie chart' 문서의 정리와 인용 |
| 파이 차트는 조각끼리 크기를 견주기 어려워 막대를 대신 권함 | http://www.perceptualedge.com/articles/08-21-07.pdf (Wikipedia 'Pie chart'가 인용한 Stephen Few 글) |

- 그림의 숫자(요청 수, CPU 몫, A~E 값, 96%·98%, 히트맵 진하기, 에러율 2.1%)는 모두 설명용 예시예요.
- 누적 영역과 파이 그림은 이 글 전용 SVG예요(src/assets/figures/foundations/cpu-stacked.svg, pie-five.svg, scratchpad의 mksvg_chart.py로 만듦).
