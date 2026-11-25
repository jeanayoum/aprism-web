---
name: ds-check
description: aprism-web의 v7 이후(v7, v8 …) 화면 코드가 디자인 시스템 규칙(여백, 라운딩, 칩과 버튼의 높이, 패딩, 간격)과 브랜딩 · 시각 원칙(파랑 하나, 숫자 글꼴, 분광, 로봇 이름 등)을 지키는지 검사한다. 사용자가 /ds-check를 부르거나, 새 화면이나 칩, 버튼을 만들고 고친 뒤 규칙 검사를 요청할 때 쓴다.
---

# ds-check: v7 디자인 시스템 규칙 검사

규칙 값은 `tools/ds-check/ds-rules.json`에, 규칙표는 저장소 루트 `CLAUDE.md`에 있다. 검사는 코드를 고치지 않고 보고만 한다.

## 실행

저장소 루트에서:

1. CSS 검사 (몇 초): `node tools/ds-check/ds-check-css.cjs`
   - v7 이후 화면이 불러오는 CSS에서 토큰 없이 숫자로 적은 여백, 간격, 라운딩, 단계 밖 값, `--space-6`, `--space-10`, `--radius-6`, 칩과 버튼의 단계 밖 높이를 찾음
   - 전체 목록: `tools/ds-check/out/ds-check-css.md`
2. 브랜딩 검사 (몇 초): `node tools/ds-check/brand-check.cjs`
   - CLAUDE.md "브랜딩과 시각 원칙" 중 기계로 잡히는 것: 토큰 없는 파랑 hex, 글꼴 이름 직접 적기, 분광 색을 Delta · 오브 · 엣지 밖에서 씀, 화면 글의 대문자 ROBOT
   - 기계로 못 잡는 원칙(빛 기준, Delta 표식, 공통 부품 등)은 고친 코드를 읽고 CLAUDE.md 원칙과 대 보아 함께 보고함. 규칙에 없는 새 경우는 CLAUDE.md "시각 언어"(투과, 발광, 분광) 셋으로 판단
   - 전체 목록: `tools/ds-check/out/brand-check.md`
3. 화면 검사 (2~4분, 화면은 찍지 않음): `node tools/ds-check/ds-check-screens.cjs`
   - 처음이면 `tools/ds-check`에서 `npm install`을 먼저 함
   - 브라우저는 설치된 Edge 또는 Chrome을 씀. 못 찾으면 `BROWSER` 환경 변수에 경로를 넣음
   - v7 이후 화면 17개 상태(v7 11개, v8 시안 A, B 6개)를 띄워 칩과 버튼마다 높이, 패딩, 간격, 라운딩이 규칙 안인지 잼
   - 일부만: `ONLY="관제|알림센터" node tools/ds-check/ds-check-screens.cjs`
   - 다른 폴더(다른 worktree)를 검사할 때는 그 경로를 인자로 넘김
   - 전체 목록: `tools/ds-check/out/ds-check-screens.md`
4. 브랜딩 화면 검사 (2~3분, 화면은 찍지 않음): `node tools/ds-check/brand-check-screens.cjs`
   - 2번이 못 잡는 것: v7 전용이 아닌 예전 판 규칙(v6.css · v3.css · monitor.css 등)이 v7 화면(body 에 ver-6 도 붙음)의 실제 요소에서 이겨 토큰 밖 파랑을 칠하는 곳. 11/24 라이트 Delta 톤 사례
   - v7 화면 14개 상태(관제 Delta 보통 · 주의 단계 포함) × 다크 · 라이트를 띄워, 그 규칙이 실제로 이기는 요소가 있을 때만 보고
   - 준비는 3번과 같음(npm install, 브라우저). 일부만: `ONLY="관제" node tools/ds-check/brand-check-screens.cjs`
   - 전체 목록: `tools/ds-check/out/brand-check-screens.md`

## 보고

- 한국어로 짧게 보고함: 검사한 커밋, 걸린 수를 종류별로, 많이 걸린 파일과 화면, 대표 사례 몇 개
- 코드 이름(선택자) 대신 화면에서 부르는 이름으로 씀. 파일:줄은 필요할 때만
- 고치지 않음. 고칠지, 어떤 토큰으로 바꿀지는 사용자가 정함
- 규칙 자체를 바꾸기로 정하면 `ds-rules.json`과 `CLAUDE.md` 표를 같이 고침
