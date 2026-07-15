/**
 * 🍎 APPLE — 파인앤코 광장 AI 바텐더 (Cloudflare Worker + Workers AI)
 * ─────────────────────────────────────────────────────────────────
 * 손님 질문을 받아 "쪽지"(Apple 규칙 + 진짜 메뉴 + 최근 대화)를 만들어 AI에 넘기고 답을 돌려준다.
 * · AI는 파인앤코를 모른다 → 메뉴를 매번 통째로 줘야 지어내지 않는다(grounding).
 * · 메뉴를 Worker(서버)에 두는 이유: 손님이 못 바꾸게. 게임 메뉴가 바뀌면 아래 MENU도 같이 고칠 것.
 */

/* 70B — 한국어·대화 품질이 8B보다 확실히 낫다. 대화당 ~65뉴런 → 하루 무료 10,000 = 약 150회.
   바 하나엔 하루 150회면 차고 넘침. 품질 > 횟수 라서 70B 기본값. */
const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

/* 파인앤코 시그니처 칵테일 — 기본가 ₩26,000 (p가 따로 있으면 그 가격) */
const MENU = `[시그니처 칵테일 · 기본 ₩26,000]
1 BINGSU (Twisted Frozen G&T) — shiso, gin, tonic water, mandarin sorbet, lime
2 NURUK (Twisted Whisky Highball) — whisky, nuruk, genmai tea, koji, toasted barley
3 PICNIC (Twisted Tom Collins) — boiled egg, vodka, lactose, yuzu, lemon, gimbap, umami rice
4 BULGOGI (Twisted Paloma & Batanga) — tequila, bulgogi, calamansi, grapefruit, cola syrup, tonic
5 HWACHAE (Twisted Punch) — soju, omija, watermelon, sparkling wine / ★가격 ₩120,000(LARGE 제철과일 펀치) 또는 ₩26,000(REGULAR 멜론빙수)
6 APEROL SLUSH (Twisted Aperol Spritz) [SEASONAL] — aperol, sparkling wine, campari, orange, lemon zest
7 KIWI COLADA (Twisted Piña Colada) — white rum, korean mint, pistachio, kiwi, almond, coconut, green tea
8 CORN (Twisted Margarita) — tequila, mezcal, young corn, corn silk, lime, distilled tabasco
9 BANANA (Twisted Daiquiri) [NEW] — rum, banana, lime, homemade black sesame meringue
10 YOGURT (Twisted Kaikan Fizz) — vodka, apricot, peach, homemade yogurt, lime, agave, lemongrass, kaffir lime
11 OLIVE (Twisted Basil Smash) — gin, olive, lemon, celery bitter, basil, yuzu, peperoncino bitter, kimchi, cheese, tomato
12 HOT BEER (Twisted Irish Coffee) — rye whisky, peanut butter, soboro powder, coffee, Guinness, mango butter
13 CACAO (Twisted Old Fashioned) — whisky, cacao bitters, lapsang souchong, port wine, chocolate, cacao nibs
14 COFFEE (Twisted Espresso Martini) — vodka, coffee, cacao nibs, amontillado, watermelon, cranberry, homemade biscoff
15 PASSIONFRUIT (Twisted Pornstar Martini) — gin, vodka, passionfruit, lemon, yakju, vanilla

[그 외 음료]
SPECIAL HIGHBALL — Clase Azul Reposado, orange soda ₩40,000
SOMAC (Peanut Soju & Beer) — peanut butter, soju, beer ₩8,000
NON-ALCOHOL — Mr. Tropical (제철과일, 차) ₩18,000

[파코 샵]
Gacha Cocktail ₩23,000 (못 고르겠으면 뽑기) · PACO T-Shirt ₩30,000 · Gift Voucher ₩45,000`;

const SYSTEM = `너는 "Apple"이다. 파인앤코 서울(Pine & Co Seoul)의 바텐더다. 손님이 바에 앉아 말을 걸고 있다.

[너의 태도 — 제일 중요]
- 너는 안내데스크가 아니라 **바텐더**다. 손님이랑 **대화**를 해라.
- 손님이 막연하게 물으면 **되물어봐라.** ("단 거 좋아하세요, 아니면 센 거?", "오늘 뭐 하다 오셨어요?")
- 추천할 땐 **왜 그걸 고르는지** 한마디 붙여라. 그냥 이름만 던지지 마라.
- 술 얘기, 칵테일 역사, 맛 이야기, 가벼운 잡담 — **다 편하게 받아라.** 재밌게 얘기해라.
- 비유를 잘 쓴다. ("비유하자면 …") 산문처럼 자연스럽게 말한다.
- 2~4문장. 짧고 리듬 있게. 장황하게 늘어놓지 마라.

[말투]
- 인사말로 시작하지 마라. "안녕하세요", "좋은 질문이에요", "물론이죠!" 금지. 바로 본론부터.
- 이모지 쓰지 마라. 손님이 먼저 쓰면 그때만 가볍게.
- 반말도 과공대도 아닌, **5년차 바텐더 친구** 말투. 한국어.
- AI라고 티내지 마라. 그냥 바에 서 있는 바텐더처럼.

[사실 규칙 — 여기만 엄격하게]
아래 두 가지는 성격이 다르니 헷갈리지 마라.

1) **파인앤코 메뉴에 관한 것** (우리 칵테일 이름·가격·재료):
   - 반드시 아래 [메뉴] 데이터에만 근거해라.
   - 메뉴에 없는 칵테일을 우리 메뉴인 것처럼 말하지 마라.
   - 가격은 아래 적힌 것만. 절대 추측하거나 지어내지 마라. 이건 가게에 피해가 간다.
   - 우리 메뉴에 없는 걸 찾으면 "그건 저희 메뉴엔 없어요" 하고 비슷한 걸 권해라.

2) **그 외 전부** (일반 술 지식, 클래식 칵테일, 위스키, 잡담, 손님 취향 얘기):
   - **자유롭게 대화해라.** 여기서까지 "모르겠어요" 하지 마라.
   - 진짜로 확신이 없는 사실만 "그건 좀 애매한데요" 하고 정직하게 말해라.

${MENU}`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* 도배 방지: IP당 5초에 1번, 시간당 30번 (무료 할당량 보호) */
const seen = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const r = seen.get(ip) || { last: 0, count: 0, windowStart: now };
  if (now - r.windowStart > 3600_000) { r.count = 0; r.windowStart = now; }
  if (now - r.last < 5000) return '조금만 천천히요. 5초에 한 번만 물어봐 주세요.';
  if (r.count >= 30) return '오늘은 질문을 너무 많이 하셨어요. 조금 있다 다시 와주세요.';
  r.last = now; r.count++;
  seen.set(ip, r);
  if (seen.size > 5000) seen.clear();   // 메모리 폭주 방지
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: CORS });

    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'anon';
      const limitMsg = rateLimited(ip);
      if (limitMsg) return Response.json({ answer: limitMsg, limited: true }, { headers: CORS });

      const body = await request.json();
      const question = String(body.question || '').slice(0, 200).trim();   // 길이 제한 = 토큰 폭주 방지
      if (!question) return Response.json({ answer: '뭐 궁금하세요?' }, { headers: CORS });

      // 최근 대화 최대 6줄만 (그 이상은 잘라서 비용 억제)
      const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
      const msgs = [{ role: 'system', content: SYSTEM }];
      for (const h of history) {
        if (h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
          msgs.push({ role: h.role, content: h.content.slice(0, 300) });
      }
      msgs.push({ role: 'user', content: question });

      const r = await env.AI.run(MODEL, { messages: msgs, max_tokens: 220, temperature: 0.6 });
      const answer = (r.response || '').trim() || '음... 그건 잘 모르겠어요.';
      return Response.json({ answer }, { headers: CORS });

    } catch (e) {
      // 무료 한도 초과(하루 10,000 뉴런)도 여기로 온다 → 게임이 로컬 추천으로 폴백
      return Response.json({ answer: '', error: String(e && e.message || e) }, { status: 200, headers: CORS });
    }
  }
};
