# 배지 TO-BE 미리보기

v7 화면 코드가 아직 예전 배지 클래스(.verdict-chip, .badge 등)를 쓰는 동안, 그 클래스에 공통 CSS(`assets/css/components-v7.css`)의 배지 TO-BE를 덮어 실제 화면에서 보는 도구다. 저장소 화면 파일은 바꾸지 않는다. 칩, 탭, 버튼은 화면 코드가 공통 CSS를 바로 써서(11/19) 미리보기 없이 실제 화면에서 본다.

## 띄우기

저장소 루트에서

```
node tools/ds-preview/serve.mjs
```

- 기본 포트 5321. 다른 포트는 `node tools/ds-preview/serve.mjs 5330`
- 다른 aprism-web 사본을 보려면 `node tools/ds-preview/serve.mjs 5321 <사본 폴더>`
- v7 화면을 열면 왼쪽 아래에 조작판이 붙는다
  - TO-BE: 켜면 새 모양, 끄면 지금 모양
  - 달라진 곳: 바뀐 요소 표시
  - 정보 보기: 마우스를 올린 요소의 크기, 여백

## 화면 주소

- 관제: http://localhost:5321/screens/main-v7.html?theme=light#critical
- 전체 미션: http://localhost:5321/screens/building-v7.html?theme=light
- 알림센터: http://localhost:5321/screens/alert-center-v7.html?theme=light
- 미션설정: http://localhost:5321/screens/mission-setup-v7.html?theme=light
- 사전 점검: http://localhost:5321/screens/mission-precheck-v7.html?theme=light
- 안전진단: http://localhost:5321/screens/safety-v7.html?theme=light (상세는 끝에 `#detail`)
- 보고서: http://localhost:5321/screens/report-v7.html?theme=light#day
- 다크는 `theme=dark`

## 디자인 값을 바꿀 때

- `assets/css/components-v7.css` 맨 위 "디자인 값" 블록(`--ds-*` 변수)만 고친다. 공통 CSS 규칙과 이 미리보기 CSS가 모두 이 변수를 본다
- `tools/ds-preview/ds-preview.css`에는 값을 적지 않는다(변수만 참조). 새로 고치면 바로 반영
- 색 변수는 주석으로 비워 둔 것이 기본(패널마다 다른 토큰을 그대로 따라감). 바꾸려면 주석을 풀고 토큰을 넣는다
- 값은 토큰만 쓴다(`assets/css/tokens.css`). 여백 단계 밖 값, `--radius-6`을 만들지 않는다
- 칩, 탭, 버튼 값은 미리보기 없이 실제 화면에 바로 걸린다
- 화면 캡처는 찍지 않는다. 값 확인은 브라우저 개발자 도구나 조작판 정보 보기로

## 한계

- CSS로 덮은 것이라, 화면 코드를 설명서로 바꾼 뒤의 결과와 조금 다를 수 있다
- 마크업을 바꿔야 하는 두 곳(알림센터 카드 머리 삼각형, 처리 완료 표 등급 + 시각)은 미리보기에 나오지 않는다
- 배지까지 화면 코드가 .ds-* 클래스를 쓰게 바뀌면 이 도구는 지운다
- 기준 문서: 배지, 칩, 탭 인계 https://claude.ai/artifact/P6i1TzG3SDpNn9gPTiF1mg
