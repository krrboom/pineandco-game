# Pine & Co 게임 로드맵

게임 목록의 단일 기준 문서. 게임을 추가/변경하면 이 파일도 같이 갱신한다.
(2026-08-20 기준)

---

## 1. PINE BAR PARTY 라이브 미니게임 (33종)

`bar_party.html` — https://pineandco-game.showjojo100.workers.dev/bar_party.html

| 카테고리 | 게임 | 비고 |
|---|---|---|
| 타이밍 (7) | JIGGER STOP · FLAIR CATCH · GARNISH LAND · **STIR STOP** ★ · TORCH BRÛLÉE · STRAIN POUR · DROP IN | ★ 실사 리뉴얼: 원형 드래그로 저어 온도를 영하 목표에 맞춰 SERVE |
| 홀드 (4) | **FREE POUR MASTER** ★ · **BLIND POUR** ★ · CITRUS SQUEEZE · BEER HEAD | ★ 실사 캔버스 엔진, 30→45→60ml 3연속 |
| 연타 (6) | SHAKE IT · ICE SMASH · **ICE CARVING** ★ · MUDDLE · CORK POP · BLEND | ★ 15초 볼 아이스 개수, 수직 스탭 타격 |
| 리듬 (2) | SHAKE RHYTHM · STIR RHYTHM | |
| 스페셜 (1) | **CHAMPAGNE LAUNCH** ★ | ★ 실사 러너 리뉴얼: 연타로 달리며 흔들고 끝에 닿기 전 발사(버틸수록 각도↑, 벽=CRASH), 비거리 승부 |
| 퀴즈 (7) | GUESS COCKTAIL · NAME SPIRIT · RECIPE MATCH · GARNISH MATCH · FIND INGREDIENT · ODD ONE OUT · **QUICK TAB** ★ | ★ 손님 7명 영수증 암산, 키패드 입력 |
| 기억 (2) | ORDER MEMORY · TAB ORDER | |
| 반응 (4) | **TIP CATCH** ★ · LAST CALL RUSH · SPILL WIPE · FLY SWAT | ★ 7지점 낙하+병 드래그, 빈병 -1 |

- 타이틀 전용 모드: **🥃 POUR CHALLENGE** (30/45/60ml 오차 합 순위, 로컬 베스트 저장)

## 2. 신규 후보 (난이도별)

### 하 — 기존 엔진 재활용

| # | 게임명 | 방식 | 한 줄 설명 | 상태 |
|---|---|---|---|---|
| 33 | ~~ICE CARVING~~ | 연타+절제 | 연타 게이지 + 완성 버튼 | ✅ 완료 |
| 44 | ~~TIP CATCH~~ | 캐치 | 팁 받기, 나쁜 것 -1 | ✅ 완료 |
| 35 | WHISKY QUIZ | 퀴즈 | 백과사전 연동 위스키 상식 | |
| 39 | CRICKET JUMP | 원버튼 | 귀뚜라미 플래피 점프 6초 (크리켓 바 연계) | |
| 40 | MYSTERY SHOT | 복불복 | 잔 4개 중 하나만 꽝, 운빨 파티 감초 | |
| 41 | DRUNK GUARD | 타이밍 | 취객이 잔에 손 뻗는 순간 치우기 | |
| 42 | BARREL STOP | 타이밍 | 굴러가는 배럴을 정지선에 멈추기 | |
| 45 | ~~QUICK TAB~~ | 암산 퀴즈 | 손님 7명 영수증($) 합계를 키패드 입력, 품목 4→10개, 속도 점수 | ✅ 완료 |
| 49 | STEP ORDER | 순서 퍼즐 | 칵테일 제조 단계 순서 탭 | |

### 중 — 엔진 변형 필요

| # | 게임명 | 방식 | 한 줄 설명 | 상태 |
|---|---|---|---|---|
| 51 | ~~SHAKE MASTER~~ | 폰 흔들기 | 가속도 센서로 13초 흔든 횟수 승부 (iOS 권한 팝업, PC 연타 폴백) | ✅ 완료 (스페셜 카테고리) |
| 32 | TRAY BALANCE | 밸런스 | 좌/우 탭으로 트레이 6초 버티기 | |
| 34 | ID CHECK | 판단 | 신분증 통과/거절 스피드 판정, 위조 찾기 | |
| 36 | PINECONE CATCH | 캐치 | 솔방울 받기, 벌 피하기 (Pine 브랜드) | |
| 38 | GLASS STACK | 타이밍 쌓기 | 움직이는 잔을 탭해서 높이 쌓기 | |
| 43 | SLIDE CATCH | 반응 | 슬라이딩되어 오는 잔을 끝에서 받기 | |
| 46 | SODA GUN | 연속 홀드 | 잔 3개 연달아 정확히 채우기 (프리푸어 엔진 재활용) | |
| 48 | LIME TOSS | 각도 타이밍 | 라임을 잔에 던져 넣기 | |
| 50 | CLOSING WIPE | 스와이프 연타 | 카운터 얼룩 문질러 지우기 | |

### 상 — 새 조작 체계 + 신규 에셋 필요

| # | 게임명 | 방식 | 한 줄 설명 | 상태 |
|---|---|---|---|---|
| 31 | GARNISH CUTTER | 스와이프 슬래시 | 과일 썰기, 얼음·유리 피하기 (프루트닌자식) | |
| 37 | BARBACK RUN | 원버튼 러너 | 박스·손님 점프 8초 생존 | |
| 47 | CITRUS PEEL | 나선 트레이싱 | 나선 따라 그어 필 깎기 | |

## 3. 스탠드얼론 게임 (7종 라이브)

| 게임 | 파일/폴더 | 장르 |
|---|---|---|
| 칵테일 디펜스 | index.html (+beta.html) | 타워 디펜스/뱀서라이크 |
| 칵테일 블리츠 | cocktail_blitz.html | 아케이드 |
| 미사일 피하기 | missile_dodge.html | 회피 액션 |
| 바 파티 | bar_party.html | 미니게임 모음 (위 1번) |
| 바텀즈업 (병돌리기) | bottomsup/ | 타이밍 |
| 악어 룰렛 | dentist/ | 복불복 |
| 크리켓 더비 | cricket/ | 레이싱 관전/베팅 |

## 4. 에셋 제작 규약

- 원본 이미지는 `Downloads/bar party/<게임명>/` 폴더에 게임별로 모은다
- AI 생성 시 Dewar's 병+손 이미지를 스타일 레퍼런스로 첨부 (픽셀 크기감·손 스타일 통일)
- 순수 흰 배경 (게임 로드 시 플러드필 키잉으로 제거, 내부 흰 하이라이트 보존)
- 광원 왼쪽 위 통일, 글자 들어가는 로고는 철자 틀리면 재생성
- repo에는 `assets/접두어_이름.png`로 복사 (fp_=프리푸어, ic_=아이스카빙, tc_=팁캐치, qt_=퀵탭)
- 지폐·동전·병·칵테일 아이콘 등은 기존 칵테일 디펜스 스프라이트 재활용 우선
