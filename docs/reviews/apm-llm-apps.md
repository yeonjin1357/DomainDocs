# 사실 확인: LLM 호출과 AI 에이전트 관측

- 글: src/content/docs/apm/llm-apps.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| span `gen_ai.client.inference`, 이름은 `{gen_ai.operation.name} {gen_ai.request.model}`, 속성 gen_ai.usage.input_tokens·output_tokens·response.finish_reasons·response.time_to_first_chunk, 본문(gen_ai.input.messages·output.messages·system_instructions)은 Opt-In, 상태는 Development, operation 값 chat·execute_tool·invoke_agent | https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/client-inference.md |
| 에이전트 span 이름 `invoke_agent {gen_ai.agent.name}`, `execute_tool {gen_ai.tool.name}` | https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md |
| 지표 gen_ai.invoke_agent.inference_calls·tool_calls, gen_ai.server.time_to_first_token | https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-metrics.md |
| GenAI 규약이 semantic-conventions 1.42.0에서 별도 저장소로 옮겨짐(저장소 생성 2026-05-05) | https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md |
| 한도는 RPM·ITPM·OTPM, 넘으면 429, 토큰 버킷, 60 RPM이 초당 1번처럼 재질 수 있음, 대부분 모델에서 cache_read_input_tokens는 ITPM에 안 셈 | https://platform.claude.com/docs/en/api/rate-limits |
| 429 `rate_limit_error`, 529 `overloaded_error` | https://platform.claude.com/docs/en/api/errors |
| 가격표의 모든 모델에서 출력 = 입력 × 5, 캐시 읽기는 0.1배(Opus 5.5·Sonnet 5.5는 0.05배, Fable 5.1·Mythos 5.1은 0.025배) | https://platform.claude.com/docs/en/about-claude/pricing |
| usage: input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens. stop_reason: end_turn, max_tokens, stop_sequence, tool_use, pause_turn, refusal. 스트림 message_start → content_block_delta → message_delta(stop_reason, output_tokens) → message_stop | Claude API 스킬 문서(shared/error-codes.md, curl/examples.md, typescript README)와 위 errors 페이지 |

직접 돌려 본 것(WSL Ubuntu 24.04, llama.cpp b12099 llama-server, Qwen2.5-0.5B-Instruct Q4_K_M, `-t 4`, temperature 0, OpenAI 호환 /v1/chat/completions 스트리밍):

- /tokenize: "The order was paid successfully." 6, "주문 결제가 정상적으로 끝났어요." 14, "Error rate is above the threshold." 7, "에러율이 기준을 넘었어요." 11.
- 캐시 끔(`cache_prompt: false`), 출력 32 상한: 입력 68토큰 TTFT 215ms·전체 579ms(finish length, 출력 32), 600토큰 1,503ms, 1,720토큰 4,418ms. 서버 timings로 입력 토큰당 약 2.7ms, 출력 토큰당 11~15ms.
- 출력 상한 16·64·256: 전체 246·718·2,910ms, 모두 finish_reason `length`.
- 캐시: 새 서버에서 1,160토큰 입력 TTFT 2,881ms(새로 읽음 1,136), 같은 입력 18ms(cached 1,159), 앞부분 같고 질문만 다름 70ms(cached 1,145).
- 동시 4개, 슬롯 1개(`-np 1`): TTFT 92·815·1,540·2,229ms, 끝 803·1,527·2,218·2,912ms. 슬롯 4개: TTFT 337~341ms, 넷 다 1,547~1,548ms에 끝.
- 에이전트(도구 get_order_status, 0.3초 sleep으로 흉내): 호출 1 0~774ms 입력 191·출력 27 finish tool_calls(`{"order_id": "A-1042"}`), 도구 774~1,074ms, 호출 2 1,075~1,590ms 입력 269(cached 217)·출력 30 finish stop.
- 비용 예시: 입력 460 × $2/1M + 출력 57 × $10/1M = $0.00149, 하루 10만 번 $149(캐시 할인 뺌).
