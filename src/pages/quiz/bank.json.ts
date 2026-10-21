import type { APIRoute } from 'astro';
import { getQuizBank } from '../../lib/content';

/** 풀이 화면이 읽는 문제 은행. 빌드할 때 한 번 만든다. */
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await getQuizBank()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
