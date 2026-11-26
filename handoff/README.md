# APRISM 개발 인계판

**2026-11-24 기준 사본**이에요. 로봇 관제 플랫폼 APRISM의 화면 시안(HTML · CSS · JS) 가운데, 개발에 넘기는 화면과 그 화면이 실제로 쓰는 파일만 담았어요.

- **화면 규칙 · 동작 · 데이터의 기준은 Figma 화면 정의서예요.** UI_99 파일의 `00.룰` 페이지예요: <https://www.figma.com/design/E9YJZXGR2mf9nzcXL7PMRe/UI_99?node-id=2422-3668>
  - 먼저 볼 장: **공통-02 상태 정의 · 공통-03 데이터 · 갱신 · 공통-04 권한 · 기록 · 공통-05 오류 · 로딩 · 공통-06 동시성 · 보존 · 공통-07 표기 · 화면 크기 · 키보드 · 공통-08 확인 필요 모음**
  - 아직 정하지 않은 것은 정의서에 `(TBD)`로 표시되어 있고, 공통-08에 한 표로 모여 있어요.
- 이 폴더는 시안이에요. 그대로 제품 코드로 쓰는 게 아니라, **모습과 동작을 확인하는 기준**으로 써 주세요.
- 디자인은 계속 바뀌어요. 최신판은 저장소의 `screens/`에 있고, 이 폴더는 다시 뽑을 때만 바뀌어요(아래 "다시 뽑기").

## 여는 법

- 웹: <https://jeanayoum.github.io/aprism-web/handoff/>
- 로컬: 이 폴더에서 `python -m http.server 8000` → <http://localhost:8000/>
- 화면 크기 기준은 1920 × 1080이에요(공통-07).
- 인터넷 연결이 필요해요. 글꼴(SUIT)과 3D 지도의 three.js를 CDN에서 받아요.

## 화면과 정의서 장

| 화면 | 정의서 장 |
|---|---|
| `screens/splash-v2.html` | CM-01 스플래시 |
| `screens/login-v2.html` | CM-02 로그인 · CM-03 인증 실패 · CM-07 첫 화면 · CM-13 교대 |
| `screens/password-expired-v2.html` | CM-05 비밀번호 변경 강제 |
| `screens/control-v7.html` | 관제 껍데기(GNB 관제). 안에서 전체 미션과 미션 화면을 바꿔 보여 줘요 |
| `screens/building-v7.html` | 공통-01 전체 미션 · 관제화면-03 통합 순회 현황 |
| `screens/mission-setup-v7.html` | 관제화면-01 미션 설정 · CM-06 자동 로그아웃 |
| `screens/mission-precheck-v7.html` | 관제화면-02 사전 점검 |
| `screens/main-v7.html` | 관제화면-04 미션 관제 · 지도-01 · 로봇현황-01 · 로봇현황-02 · Delta-01 |
| `screens/main-v7-chat.html` | Delta-02 Delta 챗봇형(위젯형 Delta-01과 어느 쪽으로 갈지 TBD) |
| `screens/alert-center-v7.html` | 알림센터-01 |
| `screens/report-v7.html` | 보고서-01 (관제의 보고서 모달도 이 화면을 `?embed=modal`로 열어요) |
| `screens/safety-v7.html` | 안전진단 — 정의서 보류 |

## 시연 주소

정의서에서 해석이 갈리는 상태는 주소 뒤에 값을 붙여 볼 수 있어요. 시연용이라 개발에는 필요 없어요.

| 주소 | 보이는 것 |
|---|---|
| `login-v2.html?demo=fail` · `?demo=lock` | 인증 실패 · 계정 잠금 (CM-03) |
| `mission-setup-v7.html?idle=10` | 10초 뒤 자동 로그아웃 모달 (CM-06) |
| `?robots=0` | 수행 중인 로봇 없음 — 로그아웃 활성 (CM-13) |
| `building-v7.html?missions=30` · `?missions=0` | 미션 탭이 많을 때 [+N] · 미션이 없을 때 (공통-01) |
| `mission-precheck-v7.html?precheck=fail` | 사전 점검 실패 (관제화면-02) |
| `alert-center-v7.html?newrisk=1` · `?empty=1` | 필터 밖 새 위험 띠 · 빈 목록 (알림센터-01) |
| `main-v7.html?mission=정기 순회 점검` | 미션을 골라 관제 화면 열기 |

화면 아래의 시뮬레이션 막대로 로봇 상태(이동 · 측정 · 위험 감지 · 일시정지 · 긴급정지 · 자동복귀 · 통신 끊김 · 완료)를 바꿔 볼 수 있어요. 시연용이에요.

## 코드 읽는 법

- **파일 이름에 v3 · v5 · v6이 붙어 있어도 v7 화면이 쓰는 파일이에요.** 예: `map-v6.js`, `mission-tabs-v6.js`, `control-shell-v6.js`, `v3.css` ~ `v7.css`. 판마다 고치며 쌓아 온 시안이라, 공용 JS 안에 지난 판용 갈래가 남아 있어요. **`body.ver-7`이거나 `V7`인 갈래만 보면 돼요.**
- 화면 사이 주소는 공용 JS가 `*-v6.html`로 만들고, `v7.js`가 같은 이름의 v7 화면으로 바꿔 줘요.
- **주석은 뺐어요.** 원래 파일의 주석은 작업 기록이라 저장소 `screens/` · `assets/`에 그대로 있어요. JS는 terser로 주석만 빼고 줄을 다시 맞췄어요(압축 · 이름 바꾸기 없음).

### 가져다 쓸 것

- `assets/css/tokens.css` — 색 · 글자 · 간격 토큰. Figma 변수와 같은 값이에요.
- `assets/css/components-v7.css` — 버튼 · 칩 · 탭 · 모달 같은 공통 부품 규격.
- `assets/css/icons-outline.css` · `assets/img/` — 아이콘과 그림.
- 문구 — 화면의 글은 정의서와 맞춰 둔 최종 문구예요(해요체 · 명사형 규칙은 공통-07).

### 참고만 할 것

- **시연 데이터** — `assets/js/alert-data-v7.js`(알림 12건 · 조치 제안 표 · 조치 요청 기록), `building.js` · `monitor.js` 안의 로봇 · 미션 값. 같은 값을 정의서 꼴로 꺼낸 것이 아래 `data/`예요. 실제 값은 서버에서 받아요.
- **시뮬레이션** — `route-sim.js`(로봇이 경로를 도는 흉내), 시뮬레이션 막대.
- **저장** — 조치 요청 기록 · 로그인 · 화면 설정은 브라우저 저장소(localStorage · sessionStorage)에 흉내만 내요. 실제 저장 · 동시성 · 보존 규칙은 공통-03 · 공통-06이 기준이에요.
- **로그인** — `auth.js`는 시연용이에요. 계정 확인 · 잠금 · 만료는 서버 몫이에요(CM-02 · CM-03 · CM-05).
- **3D 지도** — `map-v6.js` + `map-model.js`(지도 모델 glb를 base64로 담음) + three.js 0.160(CDN). 모델과 렌더링 방식은 개발 환경에 맞게 다시 정해 주세요. 지도 규칙은 지도-01 · 로봇현황-02가 기준이에요.

## 견본 데이터 (`data/`)

화면을 채운 시연 값을 **정의서 공통-03(데이터 · 갱신)의 필드 꼴**로 꺼낸 JSON이에요. "서버는 이런 꼴로 보내 주세요"를 보여 주는 견본이에요. 화면은 이 파일을 읽지 않아요(화면은 JS 안의 같은 값을 써요).

| 파일 | 내용 | 정의서 |
|---|---|---|
| `data/alerts.json` | 알림 12건 | 공통-03 알림 · 공통-02 알림 단계 |
| `data/suggestions.json` | 조치 제안 — 감지 종류별 기본(`missionId: "*"`) + 미션이 따로 정한 것 | 공통-03 조치 제안 |
| `data/action-requests.json` | 조치 요청 1건(꼴만 보여 줌) | 공통-03 조치 요청 · 공통-02 알림 처리 상태 |
| `data/robots.json` | 로봇 12대 | 공통-03 로봇 · 공통-02 로봇 가용 상태 |
| `data/missions.json` | 미션 8개, `정기 순회 점검`에는 지점 20개 | 공통-03 미션 |

**정의서 낱말 ↔ JSON 이름**

| 정의서 | JSON |
|---|---|
| 단계 (위험 · 주의) | `level`: `critical` · `warning` |
| 처리 상태 (조치 필요) | `status`: `action_needed` |
| 진행 단계 (현장 응답 대기 · 현장 조치 중 · 조치 완료) | `stage`: `wait` · `work` · `done` |
| 로봇 가용 상태 (수행 중 · 대기 · 충전 중 · 완료 · 끊김) | `availability`: `running` · `idle` · `charging` · `done` · `lost` |
| 미션 상태 (수행 중 · 대기 · 완료) | `status`: `running` · `waiting` · `done` |
| 층 · 지점 | `floor`, `waypoint.id` · `waypoint.no` |
| 설비 · 감지 종류 | `equipment`, `detectType` |
| 측정 (항목 · 값 · 단위 · 기준) | `measure.item` · `value` · `unit` · `limit` |
| 시각 | `occurredAt` · `requestedAt` — ISO 8601 (저장은 UTC, 화면은 현지 시각) |
| AI 추천 · 받는 곳 | `aiRecommended`, `recipient.team` · `recipient.contact` |
| 머무는 시간 | `dwellSec` (초) |

- 영문 이름과 코드 값은 시안이 정한 임시 이름이에요. 서버 · 로봇 쪽 이름에 맞춰 바꿔도 돼요(정의서 공통-02).
- 로봇 위치 좌표, 로봇 동작 상태(이동 · 측정 · 위험 감지 등), 신호 세기 기준처럼 시안에 실제 값이 없는 것은 넣지 않았어요. 공통-02 · 공통-03 · 공통-08을 봐 주세요.

## 다시 뽑기 (디자인 쪽)

저장소 맨 위에서:

```
npm i --no-save --no-package-lock terser   # 처음 한 번
node tools/build-handoff.mjs               # handoff/ 를 지우고 다시 만듦(README 는 남김)
node tools/export-handoff-data.mjs         # data/*.json 견본 다시 뽑기 (Chrome 필요)
python tools/stamp-assets.py               # ?v= 캐시 꼬리표 맞추기
```

- 화면이 글자를 이어 붙여 부르는 파일은 자동으로 못 찾아요. 만든 뒤 화면을 열어 빠진 파일이 없는지 확인하고, 있으면 `tools/build-handoff.mjs`의 `EXTRA_RAW`에 넣어요.
- 다시 뽑으면 이 README의 기준 날짜도 고쳐 주세요.
