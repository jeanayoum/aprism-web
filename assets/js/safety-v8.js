/*
 * [11/24 v8] 안전진단 시안 A · B — 아티팩트(시안 A U3SPY5oSjy6bn12JUR9zQk, 시안 B W2gX6YVe2NG2Aa9a4Lg46R) 화면을 v7 공통 CSS(components-v7.css) 위로 옮김
 *   화면: screens/safety-v8-a.html, safety-v8-b.html (body data-sv8 = A | B). 세 화면 한 벌 = 전체 미션(#all), 미션별, 상세(#detail)
 *   판정 배지 .ds-badge, 버튼 .btn, 감지 탭 .ds-tab-chip, 지점 줄 .ds-tab-line, 기간 .ds-seg, DELTA .ds-delta-card + .ds-acts + .ds-memo, 요청 뒤 .mwp-steps
 *   화면 고유 틀(지도, 카드 그래프, 표)은 safety-v8.css. 값은 시안용 예시
 */
(function(){
  'use strict';
  /* 상태바 계정 · 통신 드롭다운 — app-shell.css 의 .status-menu 짜임(safety.js 와 같다) */
  (function statusMenus(){
    const menus = Array.from(document.querySelectorAll('[data-status-menu]'));
    const close = except => menus.forEach(m => { if(m === except) return; m.querySelector('[data-menu-trigger]').setAttribute('aria-expanded', 'false'); m.querySelector('.dropdown-menu').hidden = true; });
    menus.forEach(m => { const t = m.querySelector('[data-menu-trigger]'), d = m.querySelector('.dropdown-menu');
      t.addEventListener('click', e => { e.stopPropagation(); const open = t.getAttribute('aria-expanded') === 'true'; close(m); t.setAttribute('aria-expanded', open ? 'false' : 'true'); d.hidden = open; }); });
    document.addEventListener('click', () => close());
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  })();
  /* [v8] 사진은 저장소 assets/img/safety(감지별 위험 · 주의 · 정상 18장 + 대표 지점 사진 v8-*), 지도 평면은 mini-plan.js(APRISM_MINI) + mini-routes.js */
  const SV = document.body.dataset.sv8 === 'B' ? 'B' : 'A';   // 시안 A(위 지도, 아래 감지 6종과 로봇) / B(왼쪽 목록, 오른쪽 본문)
  const IMGP = '../assets/img/safety/';
  const IMG = new Proxy({}, { get: (o, k) => typeof k === 'string' && /\.(jpg|png)$/.test(k) ? IMGP + k : undefined });
  const DOG = "<svg width=\"95\" height=\"90\" viewBox=\"0 0 95 90\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" > <g id=\"dog\"> <g id=\"back-leg 2\"> <circle id=\"part3\" cx=\"72.7598\" cy=\"77.5\" r=\"2.5\" fill=\"#373F4E\"></circle> <path id=\"part2\" d=\"M90.7052 56.0649H93.2568C93.8091 56.0649 94.2568 56.5127 94.2568 57.0649V58.9526C94.2568 59.2744 94.102 59.5765 93.8408 59.7644L74.1992 73.1995C73.9245 73.3873 73.7613 73.6995 73.7637 74.0323L73.7745 75.4665L71.7598 75.5V72.9847C71.7598 72.6786 71.9 72.3894 72.1403 72.1997L89.3343 58.6319C89.5689 58.442 89.7052 58.1563 89.7052 57.8545V57.0649C89.7052 56.5127 90.1529 56.0649 90.7052 56.0649Z\" fill=\"#373F4E\"></path> <path id=\"part1\" d=\"M71.9192 34.7663C70.9546 35.6401 70.5599 37.5448 70.4232 38.4396C70.3767 38.7434 70.4914 39.0453 70.715 39.2561L88.2286 55.7689C88.429 55.9579 88.5426 56.2211 88.5426 56.4965V57.143C88.5426 57.6952 88.9903 58.143 89.5426 58.143H93.7764C94.3287 58.143 94.7764 57.6952 94.7764 57.143V56.4205C94.7764 56.1905 94.6971 55.9676 94.5519 55.7892L76.8696 34.0653C76.6942 33.8498 76.4377 33.7167 76.1599 33.7138C75.2198 33.7041 72.9958 33.7913 71.9192 34.7663Z\" fill=\"#C8F031\"></path> </g> <g id=\"back-leg 1\"> <circle id=\"part3_2\" cx=\"12.5\" cy=\"76.5\" r=\"2.5\" fill=\"#373F4E\"></circle> <path id=\"part2_2\" d=\"M30.4454 55.0649H32.9971C33.5494 55.0649 33.9971 55.5127 33.9971 56.0649V57.9526C33.9971 58.2744 33.8422 58.5765 33.581 58.7644L13.9394 72.1995C13.6647 72.3873 13.5015 72.6995 13.504 73.0323L13.5147 74.4665L11.5 74.5V71.9847C11.5 71.6786 11.6402 71.3894 11.8805 71.1997L29.0745 57.6319C29.3091 57.442 29.4454 57.1563 29.4454 56.8545V56.0649C29.4454 55.5127 29.8932 55.0649 30.4454 55.0649Z\" fill=\"#373F4E\"></path> <path id=\"part1_2\" d=\"M11.6595 33.7663C10.6948 34.6401 10.3002 36.5448 10.1634 37.4396C10.117 37.7434 10.2316 38.0453 10.4552 38.2561L27.9689 54.7689C28.1692 54.9579 28.2828 55.2211 28.2828 55.4965V56.143C28.2828 56.6952 28.7306 57.143 29.2828 57.143H33.5166C34.0689 57.143 34.5166 56.6952 34.5166 56.143V55.4205C34.5166 55.1905 34.4373 54.9676 34.2922 54.7892L16.6099 33.0653C16.4344 32.8498 16.178 32.7167 15.9001 32.7138C14.96 32.7041 12.736 32.7913 11.6595 33.7663Z\" fill=\"#C8F031\"></path> </g> <g id=\"light\" filter=\"url(#filter0_f_558_16386)\"> <path d=\"M34.3333 48H58.6667L83 80H10L34.3333 48Z\" fill=\"url(#paint0_radial_558_16386)\"></path> </g> <g id=\"Body\"> <g id=\"body\"> <path id=\"Rectangle 162\" d=\"M3.00015 31H81.9702C83.6271 31 84.9702 32.3431 84.9702 34V39.1417C84.9702 39.3797 84.9419 39.6169 84.8858 39.8482L83.4661 45.7066C83.14 47.0523 81.9352 48 80.5505 48H5.99968C4.85002 48 3.80148 47.343 3.30006 46.3084L0.300529 40.1197C0.102852 39.7119 0.000152588 39.2645 0.000152588 38.8113V34C0.000152588 32.3431 1.3433 31 3.00015 31Z\" fill=\"url(#paint1_linear_558_16386)\"></path> <path id=\"Union\" d=\"M20 32C21.1046 32 22 32.8954 22 34V35H57.417L62.625 33H69.2695C69.6155 32.4027 70.2601 32 71 32H82C83.1046 32 84 32.8954 84 34V40.7969C84 41.2178 83.8668 41.6277 83.6201 41.9688L80.5791 46.1719C80.203 46.6917 79.6006 47 78.959 47H71C69.8954 47 69 46.1046 69 45V36H62.625L57.417 38H22V45C22 46.1046 21.1046 47 20 47H12.041C11.3994 47 10.797 46.6917 10.4209 46.1719L7.37988 41.9688C7.13319 41.6277 7.00001 41.2178 7 40.7969V34C7 32.8954 7.89543 32 9 32H20Z\" fill=\"#070A10\"></path> </g> <g id=\"Head\"> <rect id=\"Rectangle 168\" width=\"6\" height=\"5\" transform=\"matrix(-1 0 0 1 69 18)\" fill=\"#3B79D5\"></rect> <path id=\"Rectangle 170\" d=\"M52 24C52 22.8954 51.1046 22 50 22H41C39.8954 22 39 22.8954 39 24V31H52V24Z\" fill=\"#373F4E\"></path> <path id=\"Union_2\" d=\"M72 9C72.5523 9 73 9.44772 73 10V12C73.5523 12 74 12.4477 74 13V16C74 16.5523 73.5523 17 73 17H72V24C73.1046 24 74 24.8954 74 26V31H58V26C58 24.8954 58.8954 24 60 24V17H59C58.4477 17 58 16.5523 58 16V13C58 12.4823 58.3933 12.0562 58.8975 12.0049L59 12V10C59 9.44772 59.4477 9 60 9H72ZM63 24H69V17H63V24Z\" fill=\"#373F4E\"></path> <path id=\"Union_3\" d=\"M19 27H33C34.1046 27 35 27.8954 35 29V31H4V29C4 27.8954 4.89543 27 6 27H7V16H2.00391C1.44961 15.9996 1 15.5684 1 15.0371V11.4287C1.00015 5.11695 6.37288 0.000103929 13 0C19.6272 4.75791e-08 24.9999 5.11689 25 11.4287V15.0371C25 15.5686 24.5506 15.9998 23.9961 16H19V27ZM13 2.28613C7.69842 2.28625 3.60963 6.95069 3.60938 12H7.2627V10C7.26283 7.23863 9.59814 5 12.4795 5H13.5225C16.4038 5.00007 18.7391 7.23867 18.7393 10V12H22.3906C22.3904 6.95062 18.3017 2.28613 13 2.28613Z\" fill=\"#373F4E\"></path> </g> </g> <g id=\"front-leg 2\"> <circle id=\"part3_3\" cx=\"72.7598\" cy=\"77.5\" r=\"2.5\" fill=\"#373F4E\"></circle> <path id=\"part2_3\" d=\"M90.7052 56.0649H93.2568C93.8091 56.0649 94.2568 56.5127 94.2568 57.0649V58.9526C94.2568 59.2744 94.102 59.5765 93.8408 59.7644L74.1992 73.1995C73.9245 73.3873 73.7613 73.6995 73.7637 74.0323L73.7745 75.4665L71.7598 75.5V72.9847C71.7598 72.6786 71.9 72.3894 72.1403 72.1997L89.3343 58.6319C89.5689 58.442 89.7052 58.1563 89.7052 57.8545V57.0649C89.7052 56.5127 90.1529 56.0649 90.7052 56.0649Z\" fill=\"#373F4E\"></path> <path id=\"part1_3\" d=\"M71.9192 34.7663C70.9546 35.6401 70.5599 37.5448 70.4232 38.4396C70.3767 38.7434 70.4914 39.0453 70.715 39.2561L88.2286 55.7689C88.429 55.9579 88.5426 56.2211 88.5426 56.4965V57.143C88.5426 57.6952 88.9903 58.143 89.5426 58.143H93.7764C94.3287 58.143 94.7764 57.6952 94.7764 57.143V56.4205C94.7764 56.1905 94.6971 55.9676 94.5519 55.7892L76.8696 34.0653C76.6942 33.8498 76.4377 33.7167 76.1599 33.7138C75.2198 33.7041 72.9958 33.7913 71.9192 34.7663Z\" fill=\"#C8F031\"></path> </g> <g id=\"front-leg 1\"> <circle id=\"part3_4\" cx=\"12.5\" cy=\"76.5\" r=\"2.5\" fill=\"#373F4E\"></circle> <path id=\"part2_4\" d=\"M30.4454 55.0649H32.9971C33.5494 55.0649 33.9971 55.5127 33.9971 56.0649V57.9526C33.9971 58.2744 33.8422 58.5765 33.581 58.7644L13.9394 72.1995C13.6647 72.3873 13.5015 72.6995 13.504 73.0323L13.5147 74.4665L11.5 74.5V71.9847C11.5 71.6786 11.6402 71.3894 11.8805 71.1997L29.0745 57.6319C29.3091 57.442 29.4454 57.1563 29.4454 56.8545V56.0649C29.4454 55.5127 29.8932 55.0649 30.4454 55.0649Z\" fill=\"#373F4E\"></path> <path id=\"part1_4\" d=\"M11.6595 33.7663C10.6948 34.6401 10.3002 36.5448 10.1634 37.4396C10.117 37.7434 10.2316 38.0453 10.4552 38.2561L27.9689 54.7689C28.1692 54.9579 28.2828 55.2211 28.2828 55.4965V56.143C28.2828 56.6952 28.7306 57.143 29.2828 57.143H33.5166C34.0689 57.143 34.5166 56.6952 34.5166 56.143V55.4205C34.5166 55.1905 34.4373 54.9676 34.2922 54.7892L16.6099 33.0653C16.4344 32.8498 16.178 32.7167 15.9001 32.7138C14.96 32.7041 12.736 32.7913 11.6595 33.7663Z\" fill=\"#C8F031\"></path> </g> </g> <defs> <filter id=\"filter0_f_558_16386\" x=\"0\" y=\"38\" width=\"93\" height=\"52\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\"> <feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"></feFlood> <feBlend mode=\"normal\" in=\"SourceGraphic\" in2=\"BackgroundImageFix\" result=\"shape\"></feBlend> <feGaussianBlur stdDeviation=\"5\" result=\"effect1_foregroundBlur_558_16386\"></feGaussianBlur> </filter> <radialGradient id=\"paint0_radial_558_16386\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(46.5 48) rotate(90) scale(32 73)\"> <stop stop-color=\"white\"></stop> <stop offset=\"0.4\" stop-color=\"white\" stop-opacity=\"0.5\"></stop> <stop offset=\"1\" stop-color=\"white\" stop-opacity=\"0\"></stop> </radialGradient> <linearGradient id=\"paint1_linear_558_16386\" x1=\"43\" y1=\"31\" x2=\"43\" y2=\"48\" gradientUnits=\"userSpaceOnUse\"> <stop stop-color=\"#C8F031\"></stop> <stop offset=\"1\" stop-color=\"#9BC400\"></stop> </linearGradient> </defs> </svg>";
  const REFMAP = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1804\" height=\"480\" viewBox=\"0 0 1804 480\" fill=\"none\" overflow=\"visible\"><rect x=\"-600\" width=\"3004\" height=\"480\" fill=\"#26282c\"/><line x1=\"-112\" y1=\"0\" x2=\"-112\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-184\" y1=\"0\" x2=\"-184\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-256\" y1=\"0\" x2=\"-256\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-328\" y1=\"0\" x2=\"-328\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-400\" y1=\"0\" x2=\"-400\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-472\" y1=\"0\" x2=\"-472\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-544\" y1=\"0\" x2=\"-544\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1832\" y1=\"0\" x2=\"1832\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1904\" y1=\"0\" x2=\"1904\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1976\" y1=\"0\" x2=\"1976\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"2048\" y1=\"0\" x2=\"2048\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"2120\" y1=\"0\" x2=\"2120\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"2192\" y1=\"0\" x2=\"2192\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"2264\" y1=\"0\" x2=\"2264\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"2336\" y1=\"0\" x2=\"2336\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-40\" y1=\"0\" x2=\"-40\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"32\" y1=\"0\" x2=\"32\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"104\" y1=\"0\" x2=\"104\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"176\" y1=\"0\" x2=\"176\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"248\" y1=\"0\" x2=\"248\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"320\" y1=\"0\" x2=\"320\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"392\" y1=\"0\" x2=\"392\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"464\" y1=\"0\" x2=\"464\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"536\" y1=\"0\" x2=\"536\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"608\" y1=\"0\" x2=\"608\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"680\" y1=\"0\" x2=\"680\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"752\" y1=\"0\" x2=\"752\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"824\" y1=\"0\" x2=\"824\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"896\" y1=\"0\" x2=\"896\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"968\" y1=\"0\" x2=\"968\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1040\" y1=\"0\" x2=\"1040\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1112\" y1=\"0\" x2=\"1112\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1184\" y1=\"0\" x2=\"1184\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1256\" y1=\"0\" x2=\"1256\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1328\" y1=\"0\" x2=\"1328\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1400\" y1=\"0\" x2=\"1400\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1472\" y1=\"0\" x2=\"1472\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1544\" y1=\"0\" x2=\"1544\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1616\" y1=\"0\" x2=\"1616\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1688\" y1=\"0\" x2=\"1688\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"1760\" y1=\"0\" x2=\"1760\" y2=\"480\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"30\" x2=\"2404\" y2=\"30\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"94\" x2=\"2404\" y2=\"94\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"158\" x2=\"2404\" y2=\"158\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"222\" x2=\"2404\" y2=\"222\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"286\" x2=\"2404\" y2=\"286\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"350\" x2=\"2404\" y2=\"350\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"414\" x2=\"2404\" y2=\"414\" stroke=\"#303338\" stroke-width=\"5\"/><line x1=\"-600\" y1=\"478\" x2=\"2404\" y2=\"478\" stroke=\"#303338\" stroke-width=\"5\"/><rect x=\"339.2\" y=\"-231.7\" width=\"1133.8\" height=\"695.2\" rx=\"6\" fill=\"#1d1f22\"/><polyline points=\"1095.1,52.8 1095.1,383.2 1090.4,387.9 1132.9,430.4 1312.4,430.4 1147.0,430.4 1109.3,392.6 986.4,392.6 915.6,321.8 915.6,147.1 877.8,185.0 877.8,303.0 821.1,359.6 518.7,359.6 462.1,303.0 462.1,85.8 462.1,303.0 523.5,364.3 1095.1,364.3 1095.1,52.8\" stroke=\"#34373d\" stroke-width=\"22\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"825.9\" y=\"-29.0\" width=\"217.7\" height=\"128.3\" rx=\"4\" fill=\"#373f51\"/><rect x=\"511.4\" y=\"109.2\" width=\"120.0\" height=\"209.4\" rx=\"4\" fill=\"#373f51\"/><rect x=\"1166.8\" y=\"165.5\" width=\"277.2\" height=\"62.1\" rx=\"4\" fill=\"#373f51\"/><rect x=\"1224.8\" y=\"324.4\" width=\"213.5\" height=\"72.8\" rx=\"4\" fill=\"#373f51\"/><rect x=\"945.9\" y=\"148.1\" width=\"74.5\" height=\"188.7\" rx=\"4\" fill=\"#373f51\"/><rect x=\"355.8\" y=\"245.8\" width=\"49.7\" height=\"198.6\" rx=\"4\" fill=\"#373f51\"/><rect x=\"1133.7\" y=\"324.4\" width=\"91.0\" height=\"45.5\" rx=\"4\" fill=\"#373f51\"/><rect x=\"583.4\" y=\"-67.0\" width=\"52.1\" height=\"68.7\" rx=\"4\" fill=\"#4cd27a\"/><rect x=\"871.4\" y=\"417.1\" width=\"95.2\" height=\"23.2\" rx=\"4\" fill=\"#373f51\"/><rect x=\"1026.1\" y=\"400.6\" width=\"49.7\" height=\"43.9\" rx=\"4\" fill=\"#373f51\"/><rect x=\"1468.9\" y=\"142.3\" width=\"4.1\" height=\"321.1\" fill=\"#4a4e55\"/><rect x=\"339.2\" y=\"-219.3\" width=\"4.1\" height=\"682.8\" fill=\"#4a4e55\"/><rect x=\"1086.6\" y=\"-74.5\" width=\"223.4\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1179.2\" y=\"4.1\" width=\"130.8\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1376.2\" y=\"-143.2\" width=\"4.1\" height=\"289.7\" fill=\"#4a4e55\"/><rect x=\"1307.5\" y=\"-231.7\" width=\"4.1\" height=\"161.4\" fill=\"#4a4e55\"/><rect x=\"504.8\" y=\"106.8\" width=\"4.1\" height=\"213.5\" fill=\"#4a4e55\"/><rect x=\"633.0\" y=\"197.8\" width=\"4.1\" height=\"64.6\" fill=\"#4a4e55\"/><rect x=\"1082.4\" y=\"-75.3\" width=\"4.1\" height=\"428.7\" fill=\"#4a4e55\"/><rect x=\"628.9\" y=\"-74.5\" width=\"453.5\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"341.7\" y=\"-74.5\" width=\"221.8\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1148.6\" y=\"142.3\" width=\"325.2\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1179.2\" y=\"65.4\" width=\"4.1\" height=\"77.0\" fill=\"#4a4e55\"/><rect x=\"714.1\" y=\"103.4\" width=\"37.2\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"739.0\" y=\"106.8\" width=\"4.1\" height=\"213.5\" fill=\"#4a4e55\"/><rect x=\"504.8\" y=\"320.3\" width=\"331.0\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"633.0\" y=\"291.3\" width=\"4.1\" height=\"29.0\" fill=\"#4a4e55\"/><rect x=\"504.8\" y=\"103.4\" width=\"157.2\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"633.0\" y=\"106.8\" width=\"4.1\" height=\"64.6\" fill=\"#4a4e55\"/><rect x=\"831.7\" y=\"102.6\" width=\"4.1\" height=\"217.7\" fill=\"#4a4e55\"/><rect x=\"780.3\" y=\"103.4\" width=\"52.1\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"339.2\" y=\"-231.7\" width=\"972.4\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"503.1\" y=\"-228.4\" width=\"4.1\" height=\"81.1\" fill=\"#4a4e55\"/><rect x=\"339.2\" y=\"459.3\" width=\"1133.8\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1082.4\" y=\"411.3\" width=\"4.1\" height=\"48.0\" fill=\"#4a4e55\"/><rect x=\"1324.1\" y=\"-231.7\" width=\"149.0\" height=\"4.1\" fill=\"#4a4e55\"/><rect x=\"1376.2\" y=\"-227.6\" width=\"4.1\" height=\"33.1\" fill=\"#4a4e55\"/><polyline points=\"1095.1,52.8 1095.1,383.2 1090.4,387.9 1132.9,430.4 1312.4,430.4 1147.0,430.4 1109.3,392.6 986.4,392.6 915.6,321.8 915.6,147.1 877.8,185.0 877.8,303.0 821.1,359.6 518.7,359.6 462.1,303.0 462.1,85.8 462.1,303.0 523.5,364.3 1095.1,364.3 1095.1,52.8\" stroke=\"#ffffff\" stroke-opacity=\".35\" stroke-width=\"3\" stroke-dasharray=\"2 8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><polyline points=\"1095.1,52.8 1095.1,383.2 1090.4,387.9 1132.9,430.4 1312.4,430.4 1147.0,430.4 1109.3,392.6 986.4,392.6 915.6,321.8 915.6,147.1 915.6,147.1\" stroke=\"#ffffff\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
  // 정기 순회 점검(Robot 01, 지하 4층) — safety-v7 과 같은 판정 여섯. 지점별 값 · 지난 순회 · 예정 지점은 시안용 예시
  const D = [
    {k:'장비착용', ic:'cone', st:'crit', wp:'WP-07', at:(window.APRISM_PLACE ? APRISM_PLACE('pl05') : '고소 작업 발판'), t:'10:16', img:'safety_crit.jpg', val:'1명', head:'안전벨트 미착용 1명', gap:'기준 위반', sub:'안전벨트 미착용', lim:'미착용 0명', g:'count',
      sp:[['WP-01',0,2],['WP-03',0,1],['WP-07',1,2]], plan:['WP-12','WP-15','WP-18'],
      hist:[['10/31 09:00','미착용 0명','ok'],['10/31 14:00','미착용 0명','ok'],['11/01 09:00','미착용 0명','ok']],
      sug:['작업자에게 즉시 착용을 안내하고 고소 작업을 멈춰야 함',[['작업자 즉시 착용 안내',1,'현장 작업자, 무전 2채널'],['고소 작업 일시 중지',1,'작업 감독자, 내선 2214'],['안전관리팀 전달',0,'안전관리팀, 업무 메신저']]]},
    {k:'계기인식', ic:'gauge', st:'crit', wp:'WP-04', at:(window.APRISM_PLACE ? APRISM_PLACE('pl01') : 'N₂ 배관 압력계'), t:'10:12', img:'gauge_crit.jpg', val:'0.86', unit:' MPa', head:'압력 0.86 MPa', gap:'기준 초과 +0.06 MPa', sub:'기준 0.60 ~ 0.80', lim:'0.60 ~ 0.80 MPa', g:'dial', v:.86, range:[.6,.8], c:.85, axis:[.4,1.0],
      sp:[['WP-02',.71],['WP-04',.86]], plan:['WP-11','WP-15','WP-19'],
      hist:[['10/31 09:00','0.74 MPa','ok'],['10/31 14:00','0.77 MPa','ok'],['11/01 09:00','0.79 MPa','ok']],
      sug:['현장 점검을 요청해야 함',[['로봇 정지, 현장 점검 요청',1,'설비팀, 내선 2310'],['현장 무전 연락, 작업 중지 요청',1,'현장 작업자, 무전 2채널'],['재측정 후 판단',0,'순회 근무자, 무전 1채널']]]},
    {k:'누출감지', ic:'drop', st:'warn', wp:'WP-03', at:(window.APRISM_PLACE ? APRISM_PLACE('pl03') : '냉각수 배관 밸브'), t:'10:11', img:'leak_warn.jpg', val:'62%', head:'누출 의심도 62%', gap:'기준 초과 +7%p', sub:'기준 55% 미만', lim:'55% 미만', g:'ring', v:62, w:55, c:70, axis:[0,100], u:'%',
      sp:[['WP-01',8],['WP-03',62],['WP-05',21]], plan:['WP-10','WP-14','WP-17'],
      hist:[['10/31 09:00','47%','ok'],['10/31 14:00','44%','ok'],['11/01 09:00','59%','warn','09:14 구역 출입 통제 요청']],
      sug:['구역 출입을 통제하고 설비팀에 밸브 확인을 요청해야 함',[['구역 출입 통제',1,'현장 작업자, 무전 2채널'],['설비팀 밸브 확인 요청',1,'설비팀, 내선 2310'],['현장 확인',0,'순회 근무자, 무전 1채널']]]},
    {k:'온도감지', ic:'thermometer', st:'warn', wp:'WP-05', at:(window.APRISM_PLACE ? APRISM_PLACE('pl02') : '냉각 펌프 P-2'), t:'10:14', img:'temp_warn.jpg', val:'48.6 ℃', head:'최고 온도 48.6 ℃', gap:'기준 초과 +8.6 ℃', sub:'기준 40 ℃ 미만', lim:'40 ℃ 미만', g:'thermo', v:48.6, w:40, c:70, axis:[18,90], u:' ℃',
      sp:[['WP-02',27.4],['WP-05',48.6],['WP-06',35.1]], plan:['WP-08','WP-13','WP-16','WP-20'],
      hist:[['10/31 09:00','38.2 ℃','ok'],['10/31 14:00','39.5 ℃','ok'],['11/01 09:00','42.1 ℃','warn']],
      sug:['부하를 줄이고 점검을 요청해야 함',[['부하 감소 요청',1,'운전원, 내선 2201'],['설비 점검 요청',1,'설비팀, 내선 2310'],['현장 확인',0,'순회 근무자, 무전 1채널']]]},
    {k:'이상음향', ic:'sound', st:'ok', wp:'WP-05', at:(window.APRISM_PLACE ? APRISM_PLACE('pl02') : '냉각 펌프 P-2'), t:'10:13', img:'sound_ok.jpg', val:'14.2', head:'이상 점수 14.2', gap:'기준보다 4.8 낮음', sub:'기준 19.0 미만', lim:'19.0 미만', g:'semi', v:14.2, w:19, c:22.8, axis:[0,30], u:'',
      sp:[['WP-02',9.8],['WP-05',14.2]], plan:['WP-08','WP-12','WP-16','WP-19'],
      hist:[['10/31 09:00','15.1','ok'],['10/31 14:00','16.8','ok'],['11/01 09:00','17.9','ok']],
      sug:['진동 정밀 측정을 요청해야 함',[['진동 정밀 측정 요청',1,'설비팀, 내선 2310'],['설비 정지 검토 요청',0,'운전원, 내선 2201']]]},
    {k:'부분방전', ic:'bolt', st:'ok', wp:'WP-06', at:(window.APRISM_PLACE ? APRISM_PLACE('pl04') : '수배전반 MCC-1'), t:'10:15', img:'pd_ok.png', val:'6.42', head:'이상 점수 6.42', gap:'기준보다 2.18 낮음', sub:'기준 8.60 미만', lim:'8.60 미만', g:'semi', v:6.42, w:8.6, c:9.6, axis:[0,12], u:'',
      sp:[['WP-06',6.42]], plan:['WP-11','WP-15','WP-18'],
      hist:[['10/31 09:00','7.9','ok'],['10/31 14:00','8.2','ok'],['11/01 09:00','8.4','ok']],
      sug:['절연 진단을 요청하고 전기팀에 알려야 함',[['절연 진단 요청',1,'전기팀, 내선 2405'],['감시 강화',1,'전기팀, 업무 메신저']]]}
  ];
  const KD = {}; D.forEach(x => { KD[x.k] = x; });
  const WORD = {crit:'위험', warn:'주의', ok:'정상'};
  // [v8] 그래프 색 = 토큰(tokens.css, 다크). SVG 안이라 계산된 값을 읽어 씀
  const tok = n => getComputedStyle(document.body).getPropertyValue(n).trim();
  const COL = {crit:tok('--status-critical-icon-subtle'), warn:tok('--status-warning-icon'), ok:tok('--text-tertiary'), t1:tok('--text-primary'), t2:tok('--text-secondary'), t3:tok('--text-tertiary'), track:tok('--bg-selected'), band:tok('--color-gray-500')};
  const TXT = {crit:tok('--status-critical-text'), warn:tok('--status-warning-text'), ok:tok('--text-primary')};
  const RQ = {}, RQA = {}, RQW = {wait:'현장 응답 대기', work:'현장 조치 중', done:'조치 완료'};
  let S = {s:SV, g:'A', d:'A'}, view = null, tT;
  
  const ico = (n, c) => `<span class="i ${c || 'i-16'}" style="--i:var(--ic-${n})" aria-hidden="true"></span>`;
  // [v8] 판정 = 공통 배지(.ds-badge, 위험 주의 삼각형 · 정상 큰 점은 저절로), 조치 진행 = ds.statusCls 면 있는 배지
  const chip = (s, k) => { const r = k && RQ[k]; return r ? `<span class="${ds.statusCls(r, {face:true})}">${RQW[r]}</span>` : `<span class="ds-badge is-${s}">${WORD[s]}</span>`; };
  const fix = s => s;
  const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const arc = (cx, cy, r, a0, a1) => { const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${Math.abs(a0 - a1) > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const tx = (x, y, s, f, str, o = {}) => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${s}"${o.w ? ` font-weight="${o.w}"` : ''}${o.a ? ` text-anchor="${o.a}"` : ''} fill="${f}" font-family="SUIT Variable, SUIT, sans-serif">${str}</text>`;
  const ln = (x1, y1, x2, y2, c, w) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  /* ---------- 그래프 A: Figma 그래프 A(게이지 · 고리 · 다이얼 · 온도계). inVal = 값 글자를 그림 안에 ---------- */
  function graphA0(x, W, H, inVal){
    let w0, h0, b;
    if(x.g === 'count'){ w0 = 260; h0 = 140; const rows = [['안전모',2],['안전벨트',1],['안전화',2]];
      if(inVal) b = tx(130, 76, 64, TXT.crit, '1명', {a:'middle', w:600}) + tx(130, 112, 18, COL.t3, '안전벨트 미착용', {a:'middle'});
      else b = rows.map(([l, n], i) => { const y = 14 + i * 32; return tx(0, y + 12, 15, COL.t2, l) + `<rect x="78" y="${y}" width="130" height="12" rx="2" fill="${COL.track}"/><rect x="78" y="${y}" width="${65 * n}" height="12" rx="2" fill="${n === 2 ? COL.ok : COL.crit}"/>` + tx(260, y + 13, 15, n === 2 ? COL.t1 : TXT.crit, n + '/2', {a:'end', w:600}); }).join(''); }
    else if(x.g === 'dial'){ w0 = 240; h0 = 200; const cx = 120, cy = 112, r = 96, a = t => Math.PI * 1.25 - Math.PI * 1.5 * t / 1.6;
      b = `<path d="${arc(cx, cy, r + 9, a(.6), a(.8))}" fill="none" stroke="${COL.band}" stroke-width="10"/><path d="${arc(cx, cy, r + 9, a(.85), a(1.6))}" fill="none" stroke="${COL.crit}" stroke-opacity=".5" stroke-width="10"/>`;
      for(let i = 0; i <= 16; i++){ const t = i / 10, big = i % 2 === 0, [x0, y0] = pt(cx, cy, r, a(t)), [x1, y1] = pt(cx, cy, r - (big ? 13 : 7), a(t)); b += ln(x0, y0, x1, y1, COL.t2, big ? 2.5 : 1.5); if(big && i % 4 === 0){ const [lx, ly] = pt(cx, cy, r - 34, a(t)); b += tx(lx, ly + 6, 17, COL.t3, t.toFixed(1), {a:'middle'}); } }
      const [nx, ny] = pt(cx, cy, r - 18, a(x.v)); b += ln(cx, cy, nx, ny, COL.crit, 5) + `<circle cx="${cx}" cy="${cy}" r="10" fill="${COL.crit}"/>`; if(inVal) b += tx(cx, cy + 74, 30, TXT.crit, '0.86 MPa', {a:'middle', w:600}); if(inVal) h0 = 200; }
    else if(x.g === 'ring'){ w0 = 200; h0 = 200; const cx = 100, cy = 92, r = 72, a = p => Math.PI / 2 - 2 * Math.PI * p / 100, [m0x, m0y] = pt(cx, cy, r - 14, a(x.w)), [m1x, m1y] = pt(cx, cy, r + 14, a(x.w)), [lx, ly] = pt(cx, cy, r + 30, a(x.w));
      b = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COL.track}" stroke-width="13"/><path d="${arc(cx, cy, r, a(0), a(x.v))}" fill="none" stroke="${COL[x.st]}" stroke-width="13" stroke-linecap="round"/>${ln(m0x, m0y, m1x, m1y, COL.t1, 3)}` + tx(lx, ly + 6, 16, COL.t3, x.w + '%', {a:'middle'}) + (inVal ? tx(cx, cy + 15, 42, TXT[x.st], x.val, {a:'middle', w:600}) : tx(cx, cy + 6, 16, COL.t3, '의심도', {a:'middle'})); }
    else if(x.g === 'thermo'){ w0 = inVal ? 300 : 200; h0 = 170; const lo = 18, hi = 90, y0 = 160, y1 = 10, s = t => y0 - (y0 - y1) * (t - lo) / (hi - lo), bx = 96;
      b = `<rect x="${bx}" y="${y1}" width="22" height="${y0 - y1}" rx="2" fill="${COL.track}"/><rect x="${bx}" y="${s(x.v)}" width="22" height="${y0 - s(x.v)}" rx="2" fill="${COL[x.st]}"/>` +
        [[40,'주의 40'],[70,'위험 70']].map(([t, l]) => ln(bx - 12, s(t), bx + 34, s(t), COL.t1, 3) + tx(bx - 18, s(t) + 6, 16, COL.t3, l, {a:'end'})).join('') +
        (inVal ? tx(142, s(x.v) + 16, 46, TXT[x.st], x.val, {w:600}) + tx(144, s(x.v) + 42, 16, COL.t3, '평균 31.2 ℃') : tx(bx + 34, s(x.v) + 30, 16, COL.t3, '평균 31.2')); }
    else { w0 = 300; h0 = 170; const cx = 150, cy = 150, r = 112, [lo, hi] = x.axis, a = t => Math.PI * (1 - (t - lo) / (hi - lo));
      const marks = x.k === '이상음향' ? [[19,'19'],[22.8,'22.8']] : [[8.6,'8.6']];
      b = `<path d="${arc(cx, cy, r, Math.PI, 0)}" fill="none" stroke="${COL.track}" stroke-width="9" stroke-linecap="round"/><path d="${arc(cx, cy, r, Math.PI, a(x.v))}" fill="none" stroke="${COL[x.st]}" stroke-width="9" stroke-linecap="round"/>` +
        marks.map(([v, l]) => { const [x0, y0] = pt(cx, cy, r - 13, a(v)), [x1, y1] = pt(cx, cy, r + 13, a(v)), [lx, ly] = pt(cx, cy, r + 30, a(v)); return ln(x0, y0, x1, y1, COL.t1, 3) + tx(lx, ly + 6, 16, COL.t3, l, {a:'middle'}); }).join('') +
        (inVal ? tx(cx, cy - 12, 54, TXT[x.st], x.val, {a:'middle', w:600}) : ''); }
    const sc = Math.min(W / w0, H / h0);
    return `<svg class="sv" width="${(w0 * sc).toFixed(0)}" height="${(h0 * sc).toFixed(0)}" viewBox="${x.g === 'semi' ? '0 -24' : x.g === 'ring' ? '0 0' : '0 0'} ${w0} ${h0}" role="img" aria-label="${x.k} ${x.head}">${b}</svg>`;
  }
  /* ---------- 감지 항목(구조별 꼴) ---------- */
  function det0(x, box, mode){
    const [l, t, w, h] = box, cls = ['det', x.st, mode === 'flat' ? 'flat' : '', mode === 'A' ? 'tint' : ''].join(' ');
    const head = `<span class="k-h">${ico(x.ic)}${x.k}${mode === 'A' ? seqOf(x) : ''}</span><span class="k-wp">${x.wp} ${x.at}</span>`;
    let body;
    if(mode === 'A') body = `<span class="gx"><span class="vb"><span class="k-val" style="color:${TXT[x.st]}">${x.val}${x.unit || ''}</span><span class="k-sub">${x.sub}</span></span>${graphA(x, w * .5, h - 96, false)}</span>`;
    else if(mode === 'list') body = `<span class="gx">${graphA(x, 190, h - 28, true)}</span><span style="grid-column:1;align-self:end">${chip(x.st, x.k)}</span>`;
    else body = `<span class="gx center">${graphA(x, w - 40, h - 104, true)}</span>`;
    return `<button type="button" class="${cls}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px" data-k="${x.k}" aria-label="${x.k} ${WORD[x.st]} ${x.head}, 상세 보기">${head}${body}</button>`;
  }
  /* ---------- 지도 ---------- */
  const L = () => APRISM_MINI.routeL((window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검'), 'B4', 20);
  function wpPos(n){ const R = L(); const s = R.sAt[n - 1]; let i = 1; while(i < R.pts.length - 1 && R.cum[i] < s) i++;
    const a = R.pts[i-1], b = R.pts[i], f = (s - R.cum[i-1]) / ((R.cum[i] - R.cum[i-1]) || 1), xx = a[0] + (b[0] - a[0]) * f, yy = a[1] + (b[1] - a[1]) * f; return {u:(yy - 90) / 1150 * 100, v:(530 - xx) / 520 * 100}; }
  const marksAll = () => { const m = {}; D.forEach(x => x.sp.forEach(s => { const over = x.g === 'count' ? s[1] > 0 : x.range ? (s[1] > x.range[1]) : s[1] >= x.w; if(over){ const n = +s[0].slice(3) - 1; if(m[n] !== 'crit') m[n] = x.st; } })); return m; };
  const plan = (w, marks, robot) => fix(APRISM_MINI.svg({floor:'B4', n:20, done:7, robot: robot !== false, marks, land:true, mission:(window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검'), w})).replace('viewBox="-24 -864 1418 888"', 'viewBox="90 -530 1150 520"');
  function mapRef(box){ // 구조 A — 레퍼런스 꼴 지도
    const [l, t, w, h] = box, k = w / 1804, pins = {'WP-03':[1237,430,'warn'],'WP-04':[1312,430,'crit'],'WP-05':[1147,430,'warn'],'WP-06':[991,393,'warn'],'WP-07':[916,298,'crit']};
    return `<div class="abs" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;border-radius:4px;overflow:hidden;background:#26282c">${REFMAP.replace('<svg ', '<svg style="position:absolute;left:0;top:0;width:100%;height:auto" ')}
      ${pinsHtml(pins, k)}
      <span class="abs" style="left:${916 * k - 32}px;top:${147 * k - 32}px;width:64px;height:64px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center"><img src="${IMG['robot-top-spot.png']}" alt=(window.APRISM_ROBOT ? APRISM_ROBOT("r01") : "Robot 01") width="44" height="44"></span>
      <span class="abs ds-mapbar" style="left:24px;top:24px"><span class="ds-badge is-plain is-crit">위험 2건</span><span class="ds-badge is-plain is-warn">주의 2건</span><span class="ds-badge is-plain is-neutral ds-i-none">남은 지점 12곳</span></span>
      <span class="abs ds-maptools sv8-zoom" style="right:24px;bottom:24px"><button type="button" class="icon-button" aria-label="지도 확대">${ico('zoom-in', 'i-20')}</button><button type="button" class="icon-button" aria-label="지도 축소">${ico('zoom-out', 'i-20')}</button></span></div>`;
  }
  const dogSvg = w => DOG.replace('<svg ', `<svg style="width:${w}px;height:auto;display:block" aria-label=(window.APRISM_ROBOT ? APRISM_ROBOT("r01") : "Robot 01") role="img" `).replace(/fill="#373F4E"/g, 'fill="#9EA8BB"');

  /* ---------- 상세 조각 ---------- */
  function track(x){ return `<div class="ds-sec"><div class="ds-sec-head">기준 비교<span>기준 ${x.lim}</span>${S.s === 'B' ? `<span style="color:${TXT[x.st]};font-weight:600">${x.gap}</span>` : ''}</div>${track0(x)}</div>`; }
  function track0(x){
    if(x.g === 'count') return `<div class="ds-limit"><div style="display:flex;align-items:center;gap:8px"><svg width="15" height="36" viewBox="0 0 30 73" aria-hidden="true" style="display:block;flex:none"><g fill="#FF6B72"><path d="M9.20018 14.9976C9.44815 14.9682 9.79545 14.9643 10.0505 14.964C13.0675 14.9599 16.0847 14.9611 19.1016 14.959C20.0124 14.9583 20.9752 14.9998 21.8617 15.2155C26.4975 16.3438 29.4357 20.2625 29.4746 24.9862L29.4858 38.2888L29.4891 42.1378C29.4895 42.8604 29.5532 43.8261 29.4212 44.5201C28.9669 47.1665 25.2823 47.4545 24.3944 45.0367C24.0661 44.1422 24.2112 41.3281 24.2122 40.2548L24.2112 30.3876L24.2183 27.27C24.2192 26.7762 24.3288 25.3361 23.9977 25.0167C23.8633 24.8881 23.6835 24.8185 23.4975 24.8235C23.2255 24.8305 23.0676 24.9997 22.9852 25.2437C22.8288 25.7087 22.9211 31.5609 22.9211 32.4071L22.9262 57.5737L22.9328 64.9228C22.9332 65.8571 22.9843 67.9336 22.8724 68.7971C22.7759 69.6036 22.4186 70.3566 21.8547 70.9415C21.1738 71.6402 20.2428 72.0397 19.2673 72.0519C18.2736 72.0603 17.3182 71.6702 16.6148 70.9682C15.2699 69.6279 15.5157 67.9626 15.5167 66.2163L15.5204 61.9772L15.5199 46.613C15.5171 45.8679 15.6309 42.5546 15.3738 42.1472C15.2656 41.973 15.09 41.8517 14.8887 41.8119C14.6854 41.7688 14.4733 41.8119 14.3023 41.9309C13.7914 42.2938 13.9633 43.9418 13.9633 44.5843L13.9642 48.9447L13.9652 63.2337V66.6425C13.9652 68.4899 14.1614 70.0808 12.4807 71.3143C11.6877 71.9081 10.689 72.1568 9.71017 72.0051C8.32716 71.7868 7.18604 70.8062 6.76241 69.4715C6.46841 68.5391 6.56207 65.8782 6.56254 64.7397L6.56511 59.5233L6.56085 36.8905L6.56212 29.4358C6.56244 28.1378 6.57031 26.8298 6.55364 25.5322C6.54329 25.3533 6.55064 25.2398 6.44682 25.0858C6.15174 24.6483 5.43457 24.7415 5.33473 25.2926C5.25582 25.7281 5.27881 26.1924 5.28181 26.6495L5.28879 38.5005L5.29164 42.1819C5.29239 42.7986 5.32124 43.7952 5.25212 44.3773C5.20028 44.8526 5.01797 45.3036 4.72537 45.6815C4.28221 46.2454 3.63304 46.6092 2.92112 46.6935C2.2358 46.7788 1.54585 46.576 1.01535 46.1339C-0.137904 45.1715 0.00792682 43.9038 0.0040867 42.5617C0.00263495 42.0475 0.0082997 41.5328 0.00989194 41.0186L0.0182297 35.3277L0.0142023 28.0679C0.0127037 26.5954 -0.0655507 24.2824 0.209954 22.8812C0.534725 21.2578 1.25896 19.7409 2.31715 18.4677C4.0932 16.348 6.47384 15.2278 9.20018 14.9976Z"/><path d="M14.4937 0.00469347C18.213 -0.132755 21.3417 2.7655 21.4883 6.48414C21.6354 10.2028 18.7454 13.339 15.0271 13.4956C11.2952 13.6527 8.14512 10.7497 7.99756 7.0175C7.85004 3.28528 10.7612 0.14261 14.4937 0.00469347Z"/></g></svg><svg width="15" height="36" viewBox="0 0 30 73" aria-hidden="true" style="display:block;flex:none"><g fill="#AFB7C8"><path d="M9.20018 14.9976C9.44815 14.9682 9.79545 14.9643 10.0505 14.964C13.0675 14.9599 16.0847 14.9611 19.1016 14.959C20.0124 14.9583 20.9752 14.9998 21.8617 15.2155C26.4975 16.3438 29.4357 20.2625 29.4746 24.9862L29.4858 38.2888L29.4891 42.1378C29.4895 42.8604 29.5532 43.8261 29.4212 44.5201C28.9669 47.1665 25.2823 47.4545 24.3944 45.0367C24.0661 44.1422 24.2112 41.3281 24.2122 40.2548L24.2112 30.3876L24.2183 27.27C24.2192 26.7762 24.3288 25.3361 23.9977 25.0167C23.8633 24.8881 23.6835 24.8185 23.4975 24.8235C23.2255 24.8305 23.0676 24.9997 22.9852 25.2437C22.8288 25.7087 22.9211 31.5609 22.9211 32.4071L22.9262 57.5737L22.9328 64.9228C22.9332 65.8571 22.9843 67.9336 22.8724 68.7971C22.7759 69.6036 22.4186 70.3566 21.8547 70.9415C21.1738 71.6402 20.2428 72.0397 19.2673 72.0519C18.2736 72.0603 17.3182 71.6702 16.6148 70.9682C15.2699 69.6279 15.5157 67.9626 15.5167 66.2163L15.5204 61.9772L15.5199 46.613C15.5171 45.8679 15.6309 42.5546 15.3738 42.1472C15.2656 41.973 15.09 41.8517 14.8887 41.8119C14.6854 41.7688 14.4733 41.8119 14.3023 41.9309C13.7914 42.2938 13.9633 43.9418 13.9633 44.5843L13.9642 48.9447L13.9652 63.2337V66.6425C13.9652 68.4899 14.1614 70.0808 12.4807 71.3143C11.6877 71.9081 10.689 72.1568 9.71017 72.0051C8.32716 71.7868 7.18604 70.8062 6.76241 69.4715C6.46841 68.5391 6.56207 65.8782 6.56254 64.7397L6.56511 59.5233L6.56085 36.8905L6.56212 29.4358C6.56244 28.1378 6.57031 26.8298 6.55364 25.5322C6.54329 25.3533 6.55064 25.2398 6.44682 25.0858C6.15174 24.6483 5.43457 24.7415 5.33473 25.2926C5.25582 25.7281 5.27881 26.1924 5.28181 26.6495L5.28879 38.5005L5.29164 42.1819C5.29239 42.7986 5.32124 43.7952 5.25212 44.3773C5.20028 44.8526 5.01797 45.3036 4.72537 45.6815C4.28221 46.2454 3.63304 46.6092 2.92112 46.6935C2.2358 46.7788 1.54585 46.576 1.01535 46.1339C-0.137904 45.1715 0.00792682 43.9038 0.0040867 42.5617C0.00263495 42.0475 0.0082997 41.5328 0.00989194 41.0186L0.0182297 35.3277L0.0142023 28.0679C0.0127037 26.5954 -0.0655507 24.2824 0.209954 22.8812C0.534725 21.2578 1.25896 19.7409 2.31715 18.4677C4.0932 16.348 6.47384 15.2278 9.20018 14.9976Z"/><path d="M14.4937 0.00469347C18.213 -0.132755 21.3417 2.7655 21.4883 6.48414C21.6354 10.2028 18.7454 13.339 15.0271 13.4956C11.2952 13.6527 8.14512 10.7497 7.99756 7.0175C7.85004 3.28528 10.7612 0.14261 14.4937 0.00469347Z"/></g></svg><span style="margin-left:8px;color:var(--t2)">작업자 2명 중 1명 미착용</span></div><small>기준 미착용 0명, 1명 이상이면 위험</small></div>`;
    const [lo, hi] = x.axis, q = v => Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
    const marks = x.range ? [[x.range[0], x.range[0].toFixed(2)], [x.range[1], x.range[1].toFixed(2)]] : [[x.w, '주의 ' + x.w], [x.c, '위험 ' + x.c]];
    return `<div class="ds-limit" role="img" aria-label="${x.head}, ${x.lim}"><div class="ds-limit-bar">${x.range ? `<span class="band" style="left:${q(x.range[0])}%;width:${q(x.range[1]) - q(x.range[0])}%"></span>` : `<span class="f" style="width:${q(x.v)}%;background:${COL[x.st]}"></span>`}
      ${x.range ? '' : `<span class="m" style="left:${q(x.w)}%"></span>`}<span class="m c" style="left:${q(x.c)}%"></span><span class="pt" style="left:${q(x.v)}%;background:${COL[x.st]}"><b style="color:${TXT[x.st]}">${x.range ? x.v.toFixed(2) : x.v}</b></span></div>
      <div class="ds-limit-axis">${marks.map(([v, l]) => `<span style="left:${q(v)}%">${l}</span>`).join('')}</div><small>기준 ${x.lim}${x.range ? ', 0.85 MPa 넘으면 위험' : ''}</small></div>`;
  }
  /*
   * 측정 이력 보기 전환 — 표 / 그래프(A안 · 가로 B안 상세 공통). 그래프는 레퍼런스(기간 버튼 + 부드러운 선 + 선 위에서 고르기)를 따르고 축은 그대로.
   *   기간: 5D · 14D · 1M = 하루 점 하나(그날 가장 나쁜 값), 6M = 한 주 점 하나(그 주 가장 나쁜 값)
   *   가장 나쁜 값 = 위쪽 기준은 최고값, 계기인식은 허용 범위 가운데에서 가장 먼 값
   *   같은 지점(WP)의 측정값끼리만 잇는다. 선은 점 사이를 넘치지 않게(단조 보간) 둥글게만 한다
   *   10/31 ~ 오늘은 표의 값, 그 앞은 시안용 예시(날짜마다 고정)
   *   선 위에서 마우스를 움직이거나 누르면 가장 가까운 측정점이 골라지고 위에 말풍선(날짜, 값, 판정). 처음엔 오늘
   *   주의 · 위험 점만 작은 신호색 점으로 남긴다
   * 2026-11-19 표는 뺌(사용자 결정, 그래프 하나로). 표가 하던 '그때 어떤 조치를 했나'는 주의 · 위험 점 말풍선 둘째 줄로
   */
  let hv = 'graph', hp = '14D';
  const HP = {'5D':['최근 5일 하루 최고값', 5], '14D':['최근 14일 하루 최고값', 14], '1M':['최근 30일 하루 최고값', 30], '6M':['최근 6개월 주 최고값', 26]};
  function histSeries(x, per){
    const num = s => { const m = String(s).match(/-?[\d.]+/); return m ? +m[0] : 0; };
    const cnt = x.g === 'count', rg = x.range, d = rg ? 2 : cnt ? 0 : (String(x.v).split('.')[1] || '').length;
    const today = cnt ? (x.st === 'ok' ? 0 : 1) : x.v, hs = x.hist.map(h => num(h[1]));
    const mid = rg ? (rg[0] + rg[1]) / 2 : 0, worse = (a, b) => rg ? (Math.abs(a - mid) >= Math.abs(b - mid) ? a : b) : Math.max(a, b);
    const okH = x.hist.filter(h => h[2] === 'ok').map(h => num(h[1])), base = okH.length ? okH.reduce((a, b) => a + b, 0) / okH.length : today * .8;
    const md = dt => (dt.getMonth() + 1) + '/' + String(dt.getDate()).padStart(2, '0');
    /*
     * 2026-11-19 지난 기준 초과와 그때 조치 샘플(감지 6종, 대표 지점만, 시안용). 값 q = 'w' 주의 구간 가운데, 'c' 위험 기준 조금 위
     *   조치 끝맺음은 로봇 재측정이나 관제사 통화 기록 두 길만(현장 완료 신호 없음)
     */
    const rep = D.some(q => q.k === x.k && q.wp === x.wp);
    const PAST = !rep ? {} : ({
      '장비착용':{'10/27':['c', '10:18', '10:20 작업자 무전 착용 안내 → 10:26 관제사 통화로 착용 확인']},
      '계기인식':{'10/24':['w', '11:02', '11:05 설비팀 압력 점검 요청 → 14:00 재측정 0.74 MPa 정상'], '10/29':['c', '09:38', '09:40 로봇 정지, 현장 점검 요청 → 밸브 조정 뒤 재측정 0.76 MPa']},
      '누출감지':{'10/26':['w', '13:08', '13:10 구역 출입 통제 → 15:00 재측정 21% 정상']},
      '온도감지':{'10/23':['w', '10:12', '10:15 부하 감소 요청 → 14:00 재측정 37.2 ℃ 정상'], '11/01':['h', '09:00', '09:20 설비 점검 요청 → 관제사 통화로 냉각수 보충 확인']},
      '이상음향':{'10/25':['w', '10:13', '10:20 진동 정밀 측정 요청 → 베어링 그리스 보충, 재측정 15.2']},
      '부분방전':{'10/28':['w', '10:15', '10:18 절연 진단 요청 → 전기팀 통화로 감시 강화 결정']}
    })[x.k] || {};
    const pastV = q => cnt ? 1 : rg ? (q === 'c' ? x.c + .02 : (rg[1] + x.c) / 2) : q === 'c' ? x.c * 1.04 : (x.w + x.c) / 2;
    const dayVal = dt => { const lb = md(dt);
      if(PAST[lb] && PAST[lb][0] !== 'h' && dt.getFullYear() === 2026) return +pastV(PAST[lb][0]).toFixed(d);
      if(lb === '10/31' && dt.getFullYear() === 2026) return worse(hs[0], hs[1]);
      if(lb === '11/01' && dt.getFullYear() === 2026) return hs[2];
      if(lb === '11/02' && dt.getFullYear() === 2026) return today;
      if(cnt) return 0;
      let sd = 0; for(const ch of x.k + x.wp + dt.toDateString()) sd = (sd * 31 + ch.charCodeAt(0)) >>> 0;
      for(let i = 0; i < 3; i++) sd = (sd * 1664525 + 1013904223) >>> 0;
      const r = sd / 4294967296;
      if(rg) return +Math.max(rg[0] + .01, Math.min(rg[1] - .01, base + (r - .5) * (rg[1] - rg[0]) * .5)).toFixed(d);
      return +Math.min(x.w * .97, base * (.86 + .16 * r)).toFixed(d); };
    // 조치 기록: 지난 순회 중 주의 · 위험이었던 회차(표에 있던 '조치' 칸)와 오늘. 날짜(월/일)로 찾는다
    const ACT = {};
    x.hist.forEach(hh => { if(hh[2] !== 'ok'){ const dl = hh[0].split(' ')[0]; ACT[dl] = {t:hh[0], a:hh[3] || '조치 없음'}; } });
    Object.entries(PAST).forEach(([dl, [, tm, a]]) => { ACT[dl] = {t:dl + ' ' + tm, a}; });
    if(x.st !== 'ok') ACT['11/02'] = {t:'오늘 ' + x.t, a:RQ[x.k] ? RQW[RQ[x.k]] : '요청 전', today:1};
    const end = new Date(2026, 10, 2), pts = [], [, N] = HP[per];
    if(per === '6M'){
      for(let k = N - 1; k >= 0; k--){ let v = null, ac = null; const e = new Date(end); e.setDate(e.getDate() - 7 * k); const s = new Date(e); s.setDate(s.getDate() - 6);
        for(let j = 0; j < 7; j++){ const dt = new Date(s); dt.setDate(s.getDate() + j); const q = dayVal(dt); v = v === null ? q : worse(v, q); if(ACT[md(dt)]) ac = ACT[md(dt)]; }
        pts.push([md(e), v, md(s) + '~' + md(e), ac]); }
    } else {
      for(let k = N - 1; k >= 0; k--){ const dt = new Date(end); dt.setDate(dt.getDate() - k); pts.push([md(dt), dayVal(dt), md(dt), ACT[md(dt)] || null]); }
    }
    return {pts, k:x.k, at:x.at, cnt, range:rg || null, w:x.w, c:cnt ? 1 : x.c, d, u:cnt ? '명' : rg ? ' MPa' : (x.u || '')};
  }
  function hist(x){
    const h = hist0(x);   // 표 / 그래프 전환 없음(그래프 하나)
    if(hv === 'table') return h;
    const ser = histSeries(x, hp);
    const bar = `<div class="ds-seg ds-history-range" role="group" aria-label="기간">${Object.keys(HP).map(p => `<button type="button" data-hpp="${p}" class="ds-tab${hp === p ? ' on' : ''}" aria-pressed="${hp === p}">${p}</button>`).join('')}</div>`;
    return h.replace(/측정 이력<span>[^<]*<\/span>/, `측정 이력<span>${HP[hp][0]}</span>`)
      .replace(/<div class="ds-history">[^]*$/, `<div class="ds-history">${bar}<div class="ds-history-graph" data-hg="${encodeURIComponent(JSON.stringify(ser))}"></div></div></div>`);
  }
  const MW = document.createElement('canvas').getContext('2d'), mw = (t, font) => { MW.font = font; return MW.measureText(t).width; };
  function drawHG(){
    st.querySelectorAll('.ds-history-graph[data-hg]').forEach(el => {
      const o = JSON.parse(decodeURIComponent(el.dataset.hg)), W = el.clientWidth, H = el.clientHeight; if(!W || !H) return;
      const L = 44, R = 64, T = 30, B = 24, n = o.pts.length, LINE = tok('--comp-chart-series-1');
      const lims = o.cnt ? [1] : o.range ? [o.range[0], o.range[1], o.c] : [o.w, o.c];
      const vs = o.pts.map(p => p[1]).concat(lims), mn = Math.min(...vs), mx = Math.max(...vs), pd = (mx - mn) * .15 || 1;
      const lo = o.cnt ? 0 : Math.max(0, mn - pd), hi = o.cnt ? 2 : mx + pd;
      const X = i => L + (W - L - R) * (n === 1 ? .5 : i / (n - 1)), Y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
      const f = v => o.cnt ? v + '명' : v.toFixed(o.d) + o.u;
      const stOf = v => o.cnt ? (v >= 1 ? 'crit' : 'ok') : o.range ? (v > o.c || v < o.range[0] - .05 ? 'crit' : v > o.range[1] || v < o.range[0] ? 'warn' : 'ok') : v >= o.c ? 'crit' : v >= o.w ? 'warn' : 'ok';
      // 축(그대로): 세로 눈금 숫자, 옅은 가로줄, 주의 · 위험 점선, 허용 범위 띠, 아래 날짜
      const raw = (hi - lo) / 4, p10 = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p10, sp = o.cnt ? 1 : (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p10;
      const tk = []; for(let t = Math.ceil(lo / sp - 1e-9) * sp; t <= hi + 1e-9; t += sp) tk.push(+t.toFixed(6));
      const ft = t => sp < .1 ? t.toFixed(2) : sp < 1 ? t.toFixed(1) : String(Math.round(t));
      let s = tk.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="rgb(238 240 243 / 8%)"/>` + tx(L - 8, Y(t) + 4, 12, COL.t3, ft(t), {a:'end'})).join('');
      const dash = (v, col, lb) => `<line x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${col}" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="4 4"/>` + tx(W - R + 8, Y(v) + 4, 12, COL.t3, lb);
      if(o.range) s += `<rect x="${L}" y="${Y(o.range[1]).toFixed(1)}" width="${W - L - R}" height="${(Y(o.range[0]) - Y(o.range[1])).toFixed(1)}" fill="rgb(255 255 255 / 6%)"/>` + tx(W - R + 8, (Y(o.range[0]) + Y(o.range[1])) / 2 + 4, 12, COL.t3, '허용 범위');
      if(!o.cnt && !o.range) s += dash(o.w, COL.warn, '주의 ' + o.w);
      s += dash(o.c, COL.crit, '위험 ' + (o.cnt ? '1명' : o.c));
      const every = n <= 7 ? 1 : n <= 14 ? 2 : n <= 26 ? 4 : 5;
      o.pts.forEach((q, i) => { const last = i === n - 1; if(last || (n - 1 - i) % every === 0) s += tx(X(i), H - 6, 12, last ? COL.t1 : COL.t3, q[0], {a:'middle', w:last ? 700 : 0}); });
      // 선: 단조 보간(Fritsch-Carlson) — 점 사이에서 값이 넘치거나 없는 봉우리가 생기지 않는다
      const P = o.pts.map((q, i) => [X(i), Y(q[1])]);
      let path = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
      if(n > 1){ const dx = [], sl = [], tg = [];
        for(let i = 0; i < n - 1; i++){ dx[i] = P[i + 1][0] - P[i][0]; sl[i] = (P[i + 1][1] - P[i][1]) / dx[i]; }
        tg[0] = sl[0]; tg[n - 1] = sl[n - 2];
        for(let i = 1; i < n - 1; i++) tg[i] = sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2;
        for(let i = 0; i < n - 1; i++){ if(sl[i] === 0){ tg[i] = 0; tg[i + 1] = 0; continue; } const a = tg[i] / sl[i], b = tg[i + 1] / sl[i], h2 = a * a + b * b; if(h2 > 9){ const t3 = 3 / Math.sqrt(h2); tg[i] = t3 * a * sl[i]; tg[i + 1] = t3 * b * sl[i]; } }
        for(let i = 0; i < n - 1; i++){ const h3 = dx[i] / 3; path += ` C${(P[i][0] + h3).toFixed(1)} ${(P[i][1] + tg[i] * h3).toFixed(1)} ${(P[i + 1][0] - h3).toFixed(1)} ${(P[i + 1][1] - tg[i + 1] * h3).toFixed(1)} ${P[i + 1][0].toFixed(1)} ${P[i + 1][1].toFixed(1)}`; } }
      s += `<path d="${path}" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      o.pts.forEach((q, i) => { const k = stOf(q[1]); if(k !== 'ok') s += `<circle cx="${P[i][0].toFixed(1)}" cy="${P[i][1].toFixed(1)}" r="3.5" fill="${COL[k]}" stroke="#2c3443" stroke-width="1.5"/>`; });
      s += `<rect class="hit" x="${L - 8}" y="0" width="${W - L - R + 16}" height="${H}" fill="transparent"/><g class="ov"></g>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="측정값 ${o.pts.map(q => q[2] + ' ' + f(q[1])).join(', ')}">${s}</svg>`;
      const svg = el.firstChild, ov = svg.querySelector('.ov');
      const pick = i => { i = Math.max(0, Math.min(n - 1, i)); el.dataset.sel = i; const [px, py] = P[i], q = o.pts[i], k = stOf(q[1]);
        // 말풍선 폭은 글자 폭을 재서 맞춘다. 1줄 = 날짜와 값, 판정 점과 판정 / 2줄(조치 기록이 있을 때) = 그때 조치, 지난 기록은 '눌러서 그때 영상'
        const ac = q[3], lab = q[2] + '  ' + f(q[1]), jl = k === 'ok' ? '정상' : WORD[k], tw = mw(lab, '600 14px "SUIT Variable", SUIT, sans-serif'), jw = mw(jl, '500 13px "SUIT Variable", SUIT, sans-serif');
        // 조치 기록이 있으면 2줄 = 그때 조치, 지난 기록이면 3줄 = '눌러서 그때 영상'(글자 폭 재기가 글꼴에 따라 어긋나 같은 줄에 두지 않음)
        /* 2026-11-19 '눌러서 그때 영상' 글자 삭제(사용자 지시), 누르면 그때 영상은 그대로 */ const l2 = ac ? ac.a : '', l3 = '', w2 = ac ? mw(l2, '500 13px "SUIT Variable", SUIT, sans-serif') + 16 : 0;
        const w = Math.ceil(Math.max(12 + tw + 12 + 8 + 4 + jw + 12, 12 + w2 + 12)), bh = ac ? (l3 ? 66 : 48) : 28, bx = Math.max(L - 8, Math.min(W - R + 8 - w, px - w / 2)), by = Math.max(2, py - bh - 16), dx0 = bx + 12 + tw + 12;
        ov.innerHTML = `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${w}" height="${bh}" rx="4" fill="#F7F8FA"/>` + tx(bx + 12, by + 19, 14, '#3A4150', lab, {w:600})
          + `<circle cx="${(dx0 + 4).toFixed(1)}" cy="${(by + 14).toFixed(1)}" r="4" fill="${k === 'ok' ? '#8F97A5' : COL[k]}"/>` + tx(dx0 + 12, by + 19, 13, '#3A4150', jl, {w:500})
          + (ac ? tx(bx + 12, by + 39, 13, '#5A6376', l2, {w:500}) + (l3 ? tx(bx + 12, by + 57, 13, '#2F6FD0', l3, {w:600}) : '') : '')
          + `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="${LINE}" stroke="#F7F8FA" stroke-width="2.5"/>`;
        svg.style.cursor = 'default'; };
      const near = e => { const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width; let b = 0; P.forEach((p, i) => { if(Math.abs(p[0] - sx) < Math.abs(P[b][0] - sx)) b = i; }); return b; };
      svg.addEventListener('pointermove', e => pick(near(e)));
      // 2026-11-19 사용자: 그래프는 호버만, 클릭(그때 영상 창)과 포커스(흰 테) 없음. past()는 쓰지 않음
      svg.addEventListener('click', e => e.stopPropagation());
      // 2026-11-19 사용자: 처음엔 말풍선 없이 오늘 점만 조금 크게, 호버 때만 말풍선, 그래프 밖으로 나가면 처음 모습
      const rest = () => { delete el.dataset.sel; const [px, py] = P[n - 1]; ov.innerHTML = `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5.5" fill="${LINE}" stroke="#F7F8FA" stroke-width="2"/>`; };
      svg.addEventListener('pointerleave', rest);
      rest();
    });
  }
  function hist0(x){ const r = RQ[x.k], rep = x.hist.some(h => h[2] !== 'ok');
    return `<div class="ds-sec"><div class="ds-sec-head">측정 이력<span></span><span class="sp"></span></div><div class="ds-history">${x.hist.concat([['오늘 ' + x.t, x.head.replace(/^[^\d]+/, ''), x.st, r ? RQW[r] : '요청 전']]).map((h, i) => `<div class="hr ${i === 3 ? 'now' : ''}"><span class="t">${h[0]}</span><span class="v">${h[1]}</span>${chip(h[2])}<span class="a">${h[3] || (h[2] === 'ok' ? '' : '조치 없음')}</span></div>`).join('')}</div></div>`; }
  // [v8] 대표 지점(넘은 곳)의 근거 사진 — 계기인식, 누출감지, 온도감지, 이상음향은 새 사진(영상 대신, 11/24 사용자 지정), 나머지는 판정에 맞는 사진
  const PMAP = {'계기인식':'v8-gauge.jpg', '누출감지':'v8-leak.jpg', '온도감지':'v8-temp.jpg', '이상음향':'v8-sound.jpg'};
  const photoOf = x => PMAP[x.k] && D.some(d => d.k === x.k && d.wp === x.wp) ? IMG[PMAP[x.k]] : (x.img ? IMG[x.img] : null);
  function photoOrNum(x){
    return `<div class="ds-sec is-fill"><div class="ds-sec-head">근거 사진<span></span></div><div class="ds-photo"><img src="${photoOf(x)}" alt="${x.k} 근거 사진, ${x.wp} ${x.at}"></div></div>`;
  }
  const dHead = () => `<div class="ds-delta-head"><span class="ds-delta-mark">${ico('delta')}DELTA 조치 제안</span></div>`;
  // [v8] DELTA 조치 제안 = 공통 사례 .ds-delta-card(조치 목록 .ds-acts + AI 추천 배지 + 메모 .ds-memo). 요청 뒤에는 처리 단계(.mwp-steps)
  function delta(x, box){ const r = RQ[x.k], pos = `left:${box[0]}px;top:${box[1]}px;width:${box[2]}px`;
    if(x.st === 'ok') return `<div class="dl" style="${pos}"><div class="dl-c ds-delta-card">${dHead()}<div class="ds-delta-lead">조치 필요 없음</div><span class="memo">정상, 다음 순회에서 다시 측정</span></div></div>`;
    if(r) return `<div class="dl" style="${pos}"><div class="dl-c ds-delta-card">${dHead()}<div class="ds-delta-lead">${x.sug[0]}</div>
      <ol class="mwp-steps is-${r}"><li class="is-past"><i aria-hidden="true"></i><div><span class="ms-l">현장 조치 요청</span><ul class="ms-acts">${(RQA[x.k] || []).map(a => `<li>${a}</li>`).join('')}</ul></div></li><li class="is-now" aria-current="step"><i aria-hidden="true"></i><div><span class="ms-l">${RQW[r]}</span></div></li></ol></div></div>`;
    return `<div class="dl" style="${pos}"><div class="dl-c ds-delta-card">${dHead()}<div class="ds-delta-lead">${x.sug[0]}</div>
      <div class="cks ds-acts" role="group" aria-label="조치">${x.sug[1].map((c, i) => `<label class="ds-act"><input type="checkbox" class="ds-act-box" id="ck${i}" ${c[1] ? 'checked' : ''}><span class="ds-act-text"><b>${c[0]}</b><small>${c[2]}</small></span>${c[1] ? '<span class="ds-badge is-neutral ds-i-delta">AI 추천</span>' : ''}</label>`).join('')}</div>
      <label class="memo" for="memo">메모 (선택)</label><textarea id="memo" class="ds-memo" placeholder="현장에 전달할 내용"></textarea></div>
      <button type="button" class="btn btn-accent is-md rqb" data-req="${x.k}">현장 조치 요청</button></div>`; }
  const metaRow = x => `<div class="ds-meta"><div><span>발생 위치</span><b>${x.at || x.wp}</b></div><div><span>측정 시각</span><b>${x.t}</b></div><div><span>조치 상태</span><b>${RQ[x.k] ? RQW[RQ[x.k]] : x.st === 'ok' ? '조치 필요 없음' : '요청 전'}</b></div><div><span>다음 측정</span><b>오늘 14:00</b></div></div>`;
  const pinsHtml = (pins, k) => Object.entries(pins).map(([wp, [x, y]]) => { const ds = D.filter(d => d.wp === wp);
    return `<span class="ds-detect-pin" style="left:${x * k}px;top:${y * k}px" role="img" aria-label="${wp} ${ds.map(d => d.k + ' ' + WORD[d.st]).join(', ')}">${ds.map(d => `<span class="ds-detect-mark is-${d.st}${scr === 'd' && d.k === view ? ' is-sel' : ''}" data-k="${d.k}">${ico(d.ic)}</span>`).join('')}</span>`; }).join('');
  const seqOf = x => { const n = x.sp.length + (x.k === '온도감지' ? 1 : 0), t = x.sp.length + x.plan.length; return `<span class="k-seq" aria-label="이 미션에서 ${t}회 중 ${n}번째">${n}/${t}</span>`; };

  /* ================= 가로형 시안 ================= */
  S = {s:SV, g:'A', d:'A'}; view = '계기인식';
  const K6 = ['장비착용','계기인식','누출감지','온도감지','이상음향','부분방전'];
  const isOver = (x, s) => x.g === 'count' ? s[1] > 0 : x.range ? s[1] > x.range[1] : s[1] >= x.w;
  // 미션 여덟(상단 탭 M1~M8). M1 은 safety-v7 값, 나머지 판정과 진행은 시안용 예시
  const MISS = [
    {id:'M1', n:(window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01'), fl:'B4', tot:20, done:7, mn:20, md:7, c:['crit','crit','warn','warn','ok','ok']},
    {id:'M2', n:(window.APRISM_MISSION ? APRISM_MISSION('m7') : '공조 설비 순회'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r02') : 'Robot 02'), fl:'B3', tot:20, done:11, mn:20, md:11, c:['ok','ok','ok','warn','ok','ok'], marks:{5:'warn'}, v:{'온도감지':'43.2 ℃'}},
    {id:'M3', n:(window.APRISM_MISSION ? APRISM_MISSION('m2') : '발전기실 설비 점검'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r03') : 'Robot 03'), fl:'B4', tot:20, done:15, mn:8, md:3, c:['ok','ok','ok','ok','ok','crit'], marks:{1:'crit'}, v:{'부분방전':'9.82'}},
    {id:'M4', n:(window.APRISM_MISSION ? APRISM_MISSION('m8') : '유틸리티 순회'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r04') : 'Robot 04'), fl:'B4', tot:20, done:4, mn:20, md:4, c:['ok','ok','ok','ok','ok','ok']},
    {id:'M5', n:(window.APRISM_MISSION ? APRISM_MISSION('m3') : '전기실 열화상 점검'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r05') : 'Robot 05'), fl:'B3', tot:20, done:17, mn:20, md:17, c:['ok','ok','ok','ok','ok','ok']},
    {id:'M6', n:'주간 순회 점검', r:(window.APRISM_ROBOT ? APRISM_ROBOT('r02') : 'Robot 02'), at:'14:00', fl:'B3', tot:20, done:0, mn:20, md:0},
    {id:'M7', n:(window.APRISM_MISSION ? APRISM_MISSION('m4') : '소방 설비 점검'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r04') : 'Robot 04'), at:'16:00', fl:'B4', tot:20, done:0, mn:20, md:0},
    {id:'M8', n:(window.APRISM_MISSION ? APRISM_MISSION('m6') : '야간 순회 점검'), r:(window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01'), at:'22:00', fl:'B4', tot:20, done:0, mn:20, md:0}
  ];
  let mc = 8, dlOpen = false, dlMode = 'drawer';
  const dlOk = () => S.s === 'A' && scr === 'd' && KD[view] && KD[view].st === 'ok', dlClosed = () => S.s === 'A' && scr === 'd' && !!KD[view] && (dlMode === 'float' || (KD[view].st === 'ok' && !dlOpen));
  const MV = () => mc === 4 ? MISS.slice(0, 4) : MISS;
  const OKV = {'장비착용':0, '계기인식':.72, '누출감지':18, '온도감지':31.4, '이상음향':12.6, '부분방전':6.2};
  function mxX(d, s, m){
    const n = +m.id.slice(1), num = t => +String(t).match(/-?[\d.]+/)[0];
    let v = s === 'ok' ? OKV[d.k] * (1 + (n - 3) * .05) : num(m.v[d.k]);
    v = d.range ? +v.toFixed(2) : d.k === '누출감지' ? Math.round(v) : d.k === '부분방전' ? +v.toFixed(2) : +v.toFixed(1);
    const val = d.k === '누출감지' ? v + '%' : d.k === '온도감지' ? v.toFixed(1) + ' ℃' : d.k === '부분방전' ? v.toFixed(2) : d.k === '이상음향' ? v.toFixed(1) : String(v);
    return Object.assign({}, d, {st:s, v, val});
  }
  function pinTiles(){
    if(!(S.s === 'A' && scr === 'all')) return;
    const sc = 1;
    st.querySelectorAll('.tile[data-m]').forEach(tile => {
      const m = MISS.find(q => q.id === tile.dataset.m), box = tile.querySelector(':scope > span:last-child'); if(!m || !box) return;
      const at = {};   // 지점 순번 → [{k, ic, st}]
      if(m.id === 'M1') D.forEach(x => x.sp.forEach(s => { if(isOver(x, s)) (at[+s[0].slice(3) - 1] = at[+s[0].slice(3) - 1] || []).push({k:x.k, ic:x.ic, st:x.st}); }));
      else Object.entries(m.marks || {}).forEach(([j, s]) => { const i = m.c.indexOf(s); if(i >= 0){ const d = KD[K6[i]]; at[j] = [{k:d.k, ic:d.ic, st:s}]; } });
      const br = box.getBoundingClientRect();
      box.querySelectorAll('[data-j]').forEach(p => { const list = at[p.dataset.j]; if(!list) return; const r = p.getBoundingClientRect();
        const el = document.createElement('span'); el.className = 'ds-detect-pin is-s'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', list.map(o => o.k + ' ' + WORD[o.st]).join(', '));
        el.style.left = ((r.left + r.width / 2 - br.left) / sc).toFixed(1) + 'px'; el.style.top = ((r.top + r.height / 2 - br.top) / sc).toFixed(1) + 'px';
        el.innerHTML = list.sort((a, b) => (a.st === 'crit' ? 0 : 1) - (b.st === 'crit' ? 0 : 1)).map(o => `<span class="ds-detect-mark is-${o.st}">${ico(o.ic)}</span>`).join('');
        box.appendChild(el); });
    });
  }
  const cnt = (m, s) => m.c ? m.c.filter(v => v === s).length : 0;
  const planOf = (m, w) => fix(APRISM_MINI.svg({floor:m.fl, n:m.mn, done:m.md, robot:!!m.c, marks:m.id === 'M1' ? marksAll() : (m.marks || {}), land:true, mission:m.n, w, label:m.n + ' 지도'}));
  const prog = m => `<span class="pg"><i><u style="width:${m.done / m.tot * 100}%"></u></i><span>${m.done}/${m.tot}곳</span></span>`;

  /* ---------- 시안 A: 왼쪽 지도, 오른쪽 목록 ---------- */
  function allA(){
    const run = MV().filter(m => m.c), sch = MV().filter(m => !m.c);
    let h = `<div class="abs ds-title-row" style="left:24px;top:20px;width:1100px;height:36px"><b class="ds-title-name">미션별 지도</b><span class="ds-title-count">진행 ${run.length}건, 예정 ${sch.length}건</span></div>`;
    ['B3', 'B4'].filter(f => MV().some(m => m.fl === f)).forEach(f => { const ms = MV().filter(m => m.fl === f), r = ms.filter(m => m.c).length;
    h += `<div class="abs flh" role="heading" aria-level="3"><b>${f}</b><span>진행 ${r}건${ms.length > r ? ', 예정 ' + (ms.length - r) + '건' : ''}</span></div>`;
    ms.forEach((m, i) => { h += m.c ? `<button type="button" class="tile" data-m="${m.id}" style="left:${24 + (i % 2) * 558}px;top:${72 + Math.floor(i / 2) * 313}px;width:542px;height:297px" aria-label="${m.id} ${m.n} 열기">
      <span class="ti"><span class="id">${m.id}</span><span class="nm">${m.n}</span><span class="rb">${m.r}</span>${prog(m)}</span>`
      : `<div class="tile pl" style="left:0;top:0;width:542px;height:297px" aria-disabled="true" aria-label="${m.id} ${m.n}, ${m.at} 시작 예정">
      <span class="ti"><span class="id">${m.id}</span><span class="nm">${m.n}</span><span class="rb">${m.r}</span><span class="wait">${m.at} 시작 예정</span></span>`;
      h += `
      <span>${planOf(m, 318)}</span>${m.c ? '</button>' : '</div>'}`; }); });
    return h;
  }
  // [11/24] 로봇 카드 = 공통 .ds-robot-card: 이름 + 기존 로봇 그림(robot-2d.js APRISM_ROBOT2D, 관제 로봇 카드와 같은 그림) + 관제 로봇 현황 줄(운영 상태 태그, 배터리 .ds-battery, 측정 진행 .ds-progress)
  const robotFig = () => `<span class="robot-thumb ds-robot-card-fig" data-r2="walk">${window.APRISM_ROBOT2D ? window.APRISM_ROBOT2D.svg('dog') : dogSvg(110)}</span>`;
  const robotRows = () => `<div class="ds-robot-card-rows">
      <span class="ds-robot-card-row"><span>상태</span><span class="${ds.statusCls('run')}">WP-08 온도감지 측정 중</span></span>
      <span class="ds-robot-card-row"><span>다음</span><span class="${ds.statusCls('wait')}">이상음향 대기</span></span>
      <span class="ds-robot-card-row"><span>배터리</span>${ds.battery(82)}</span>
      <span class="ds-robot-card-row"><span>측정</span><span class="ds-robot-card-prog"><span class="progress-track ds-progress" style="--progress:35%"><span class="progress-fill ds-progress-fill"></span><span class="progress-knob ds-progress-cursor"><span class="i i-16 ds-progress-icon" style="--i:var(--ic-way)" aria-hidden="true"></span></span></span><span class="num">7/20곳</span></span></span></div>`;
  const robotCard = box => `<div class="abs ds-robot-card" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><b class="ds-robot-card-name">Robot 01</b>${robotFig()}${robotRows()}</div>`;
  const liveBox = (box, big) => `<div class="abs live" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><img src="${IMG['leak_ok.jpg']}" alt=((window.APRISM_ROBOT ? APRISM_ROBOT("r01") : "Robot 01") + " 전방 카메라 라이브")><span class="ds-badge is-onmap is-strong ds-i-dot is-live" style="left:16px;top:16px">라이브 전방 카메라 Robot 01</span></div>`;
  /* ---------- 시안 B: 왼쪽 목록, 오른쪽 본문 ---------- */
  function allB(){
    const LOC = {'장비착용':['작업 구역 출입구',(window.APRISM_PLACE ? APRISM_PLACE('pl05') : '고소 작업 발판'),'설비 통로'], '계기인식':[(window.APRISM_PLACE ? APRISM_PLACE('pl01') : 'N₂ 배관 압력계'),(window.APRISM_PLACE ? APRISM_PLACE('pl08') : '공기 압축기 C-1'),(window.APRISM_PLACE ? APRISM_PLACE('pl06') : 'HEPA Filter 차압계')], '누출감지':[(window.APRISM_PLACE ? APRISM_PLACE('pl03') : '냉각수 배관 밸브'),'배관 이음부','펌프 하부'],
      '온도감지':[(window.APRISM_PLACE ? APRISM_PLACE('pl02') : '냉각 펌프 P-2'),'펌프 모터',(window.APRISM_PLACE ? APRISM_PLACE('pl07') : '발전기 베어링')], '이상음향':[(window.APRISM_PLACE ? APRISM_PLACE('pl02') : '냉각 펌프 P-2'),'펌프 베어링',((window.APRISM_PLACE_S ? APRISM_PLACE_S('pl02') : '냉각 펌프') + ' P-3')], '부분방전':[(window.APRISM_PLACE ? APRISM_PLACE('pl04') : '수배전반 MCC-1'),(window.APRISM_PLACE_S ? APRISM_PLACE_S('pl04') : '수배전반'),'발전기 제어반 GCP-1']};
    const HEAD = {'장비착용':v => '안전벨트 미착용 ' + v, '계기인식':v => '압력 ' + v, '누출감지':v => '누출 의심도 ' + v, '온도감지':v => '최고 온도 ' + v, '이상음향':v => '이상 점수 ' + v, '부분방전':v => '이상 점수 ' + v};
    const run = MV().filter(m => m.c), worst = m => m.c.includes('crit') ? 'crit' : m.c.includes('warn') ? 'warn' : 'ok';
    const cnt = s => run.filter(m => worst(m) === s).length, pend = run.reduce((a, m) => a + m.c.filter(s => s !== 'ok').length, 0);
    const card = (m, s, i) => { const k = K6[i], d = KD[k], n = +m.id.slice(1);
      const x = m.id === 'M1' ? d : mxX(d, s, m), v = x.g === 'count' ? (s === 'ok' ? '0명' : '1명') : x.range ? x.v.toFixed(2) + ' MPa' : x.val;
      const wp = m.id === 'M1' ? x.wp + ' ' + x.at : 'WP-' + String((n * 3 + i * 2) % 20 + 1).padStart(2, '0') + ' ' + LOC[k][(n + i) % 3];
      const t = m.id === 'M1' ? x.t : String(9 + (n + i) % 2).padStart(2, '0') + ':' + String((n * 7 + i * 11) % 60).padStart(2, '0');
      const ttl = s === 'ok' ? '정상' : m.id === 'M1' ? x.head : HEAD[k](v);
      const g = graphA(x, 240, 128, true).replace(/<text [^>]*font-size="48"[^>]*>[^<]*<\/text>/g, '');
      const at = m.id === 'M1' ? `data-k="${k}"` : `data-m="${m.id}"`;
      return `<button type="button" class="v7c ${s}" ${at} aria-label="${m.n} ${k} ${WORD[s]} ${v}, ${wp}, ${t}"><span class="gr">${g}</span><span class="tx"><span class="tl">${s !== 'ok' ? `<span class="vc ds-badge is-${s}">${WORD[s]}</span>` : ''}<b style="color:${s === 'crit' ? TXT.crit : 'var(--t1)'}">${ttl}</b></span><span>${wp}</span><small>${t}</small></span></button>`; };
    const sec = m => m.c
      ? `<button type="button" class="v7h" data-m="${m.id}">${m.n}${ico('chevron-right')}</button><div class="v7g">${m.c.map((s, i) => card(m, s, i)).join('')}</div>`
      : `<div class="v7h pl" aria-disabled="true">${m.n}<span class="wait">${m.at} 시작 예정</span></div><div class="v7g">${K6.map(k => `<div class="v7c dis" aria-label="${m.n} ${k} 측정 전"><span class="gr">측정 전</span><span class="tx"><b style="color:var(--t3)">–</b><span>${k}</span><small>${m.at} 시작</small></span></div>`).join('')}</div>`;
    return `<div class="abs v7a" style="left:24px;top:20px;width:1788px;height:976px">
      <div class="v7l"><div class="t0">안전진단</div><div class="t1"><b>전체 미션</b><span>미션 ${run.length}개, 측정 ${run.reduce((a, m) => a + m.done, 0)}/${run.reduce((a, m) => a + m.tot, 0)}곳, 요청 전 ${pend}건</span></div>
        <div class="rows"><div class="row"><span class="ds-badge is-plain is-crit">위험</span><span class="n"><b>${cnt('crit')}</b><span>개 미션</span></span></div><div class="row"><span class="ds-badge is-plain is-warn">주의</span><span class="n"><b>${cnt('warn')}</b><span>개 미션</span></span></div><div class="row"><span class="ds-badge is-plain is-ok">정상</span><span class="n"><b>${cnt('ok')}</b><span>개 미션</span></span></div></div></div>
      <div class="v7r"><div class="v7cr">${K6.map(k => `<span><b>${k}</b>${KD[k].lim}</span>`).join('')}</div><div class="v7s">${MV().map(sec).join('')}</div></div></div>`;
  }
  const headB = back => `<div class="abs" style="left:24px;top:20px;width:520px;height:52px;display:flex;align-items:center;gap:12px"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:20px;line-height:26px">정기 순회 점검</b><span style="color:var(--t2)">Robot 01, 7/20곳 측정</span></div>${back ? `<button type="button" class="btn btn-secondary back" data-back>${ico('chevron-left')}돌아가기</button>` : ''}</div>`;
  const listB = sel => `<div class="lst" style="left:24px;top:88px;width:520px;height:908px">${K6.map(k => det(KD[k], [0, 0, 520, 151], 'list').replace('style="left:0px;top:0px;width:520px;height:151px"', k === sel ? 'aria-current="true"' : '').replace('class="det ', 'class="det ' + (k === sel ? 'sel ' : ''))).join('')}</div>`;
  function spotTable(box){
    const wpN = n => 'WP-' + String(n).padStart(2, '0');
    const U = {'계기인식':'MPa', '누출감지':'%', '온도감지':'℃'}, fmt = (x, v) => (x.g === 'count' ? v : x.range ? v.toFixed(2) : String(v)) + (x.g === 'count' ? '<small>명</small>' : U[x.k] ? '<small>' + U[x.k] + '</small>' : '');
    let h = `<div class="sx" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><div class="ds-title-row" style="height:28px;margin-bottom:8px"><b class="ds-title-name">진단표</b><span class="sp"></span>
      <span class="lg"><span>숫자 측정값</span><span><span class="sx-p on" style="animation:none"></span>측정 중</span><span><span class="sx-p"></span>예정</span></span></div>
      <div class="sx-r h"><span style="text-align:left">감지</span>${Array.from({length:20}, (_, i) => `<span class="${i === 7 ? 'now' : ''}">${String(i + 1).padStart(2, '0')}</span>`).join('')}</div>`;
    K6.forEach(k => { const x = KD[k]; h += `<div class="sx-r"><button type="button" class="sx-k" data-k="${k}">${ico(x.ic)}${k}</button>`;
      for(let n = 1; n <= 20; n++){ const w = wpN(n), s = x.sp.find(q => q[0] === w);
        if(s) h += isOver(x, s) ? `<button type="button" class="sx-v o ${x.st} sxc" data-sk="${k}" data-cw="${w}" data-cs="${x.st}" aria-label="${k} ${w} ${WORD[x.st]} ${fmt(x, s[1]).replace(/<[^>]+>/g, '')}, 상세 보기">${fmt(x, s[1])}</button>` : `<button type="button" class="sx-v sxc" data-sk="${k}" data-cw="${w}" data-cs="done" aria-label="${k} ${w} ${fmt(x, s[1]).replace(/<[^>]+>/g, '')}, 상세 보기">${fmt(x, s[1])}</button>`;
        else if(x.plan.includes(w)) h += `<span class="sx-p sxc ${n === 8 && k === '온도감지' ? 'on' : ''}" data-sk="${k}" data-cw="${w}" data-cs="plan" role="button" tabindex="0" aria-label="${k} ${w} ${n === 8 && k === '온도감지' ? '측정 중' : '예정'}, 상세 보기"></span>`;
        else h += '<span></span>'; }
      h += '</div>'; });
    return h + '</div>';
  }
  const miniMap = (box, marks) => `<div class="abs ds-map-panel is-head" style="left:${box[0]}px;top:${box[1]}px;width:${box[2]}px;height:${box[3]}px"><div class="ds-map-panel-head"><b>지도</b><span class="lg is-tight"><span class="ds-badge is-plain is-crit">위험</span><span class="ds-badge is-plain is-warn">주의</span></span></div><div class="mp-box">${plan(376, marks)}</div></div>`;
  function missionB(){
    return headB(false) + listB(null) + liveBox([568, 20, 820, 500], true) + miniMap([1404, 20, 408, 236], marksAll()) + robotCard([1404, 272, 408, 248]) + spotTable([568, 536, 1244, 460]);
  }
  function detailWideB(){ const x = KD[view];
    let h = headB(true) + listB(view);
    h += `<div class="ds-detail" style="left:568px;top:20px;width:812px;height:976px;gap:20px">
      <div class="ds-verdict"><span class="ds-verdict-val">${x.head.replace(/[\d.]+.*$/, '')}<span style="color:${TXT[x.st]}">${x.head.match(/[\d.]+.*$/)[0]}</span></span></div>
      ${metaRow(x)}${track(x)}<div class="ds-detail-cols" style="grid-template-columns:1fr">${photoOrNum(x)}</div>${hist(x)}</div>`;
    h += miniMap([1404, 20, 408, 236], Object.fromEntries(x.sp.filter(s => isOver(x, s)).map(s => [+s[0].slice(3) - 1, x.st])));
    return h + delta(x, [1404, 272, 408]);
  }

  /*
   * 감지 6종 도식 — 데이터 성격에 맞춰 정한다(같은 성격은 같은 꼴).
   *   장비착용  사람 수(셀 수 있는 값)            → 보호구 항목마다 작업자 칸. 막대는 연속량처럼 읽혀 쓰지 않는다
   *   계기인식  허용 범위(아래 · 위 기준 둘)       → 범위 띠 위의 값 표식. 다이얼은 계기 종류마다 달라 근거 사진과 겹친다
   *   누출감지  비율 0 ~ 100%                      → 고리 + 주의 · 위험 눈금
   *   온도감지  물리량, 위쪽 기준 하나              → 온도계 기둥 + 주의 · 위험 선(그대로)
   *   이상음향 · 부분방전  점수, 위쪽 기준 하나     → 반원 게이지 + 주의 · 위험 눈금(둘이 같은 꼴)
   * 고리 · 온도계 · 반원은 원래 그림(graphA0)에 빠진 위험 눈금만 더한다.
   */
  /*
   * 카드 그래프 한 틀 — 여섯 감지가 같은 그림판(300×170)에 같은 자리 · 같은 크기(48)로 값을 적는다. 위는 감지마다 다른 그림, 아래 가운데는 값.
   * 예전에는 감지마다 그림판 크기와 글자 크기가 달라(56 · 30 · 46 · 54) 카드에 맞춰 줄이면 값 크기가 제각각이었다.
   */
  let MAID = 0;
  function meterArc(x, CX, HALF, SAG, TOPY){
    const SC = {ok:'#6AA7E7', warn:'#FFCC00', crit:'#E55548'}, col = SC[x.st] || SC.ok, SW = 4, tickGray = '#5E687C', id = 'ma' + (MAID++);
    const R = (HALF * HALF + SAG * SAG) / (2 * SAG), CY = TOPY + R, A = Math.asin(HALF / R), [lo, hi] = x.axis;
    const f = t => (Math.max(lo, Math.min(hi, t)) - lo) / (hi - lo), th = p => -A + 2 * A * p, pt = (p, r) => [CX + r * Math.sin(th(p)), CY - r * Math.cos(th(p))];
    const arc = (p0, p1, c) => { if(p1 <= p0) return ''; const a = pt(p0, R), b = pt(p1, R); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}A${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${c}" stroke-width="${SW}" fill="none"/>`; };
    const tick = (p, r0, r1, c, w) => { const a = pt(p, r0), b = pt(p, r1); return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}"/>`; };
    const zones = [[0, f(x.range[0]), 'warn'], [f(x.range[0]), f(x.range[1]), 'ok'], [f(x.range[1]), f(x.c), 'warn'], [f(x.c), 1, 'crit']], g = .004, pv = f(x.v);
    let s = `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${CX - HALF}" x2="${CX + HALF}" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".07" stop-color="#fff"/><stop offset=".93" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`
      + `<mask id="${id}m" maskUnits="userSpaceOnUse" x="${CX - HALF - 20}" y="0" width="${HALF * 2 + 40}" height="${TOPY + SAG + 30}"><rect x="${CX - HALF - 20}" y="0" width="${HALF * 2 + 40}" height="${TOPY + SAG + 30}" fill="url(#${id}g)"/></mask></defs><g mask="url(#${id}m)">`;
    for(let i = 0; i <= 40; i++) s += tick(i / 40, R + 8, R + 12, tickGray, 1);
    zones.forEach(([a, b, k], i) => { s += arc(a + (i ? g : 0), b - (i < zones.length - 1 ? g : 0), SC[k]); });
    zones.slice(1).forEach(([a]) => { s += tick(a, R - 5, R + 14, '#FFFFFF', 1.5); });
    s += '</g>' + tick(pv, R + 6, R + 16, col, 1.5);
    const [kx, ky] = pt(pv, R);
    return s + `<circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="4.5" fill="#FFFFFF" stroke="${col}" stroke-width="2"/>`;
  }
  function uni(x, W, H){
    const c = COL[x.st] || COL.ok, T = TXT[x.st], F = 48, VY = 138, val = s => tx(150, VY, F, T, s, {a:'middle', w:600});
    let b;
    if(x.g === 'count'){
      // 사람 아이콘(머리, 몸, 팔, 다리)과 착용 칸 셋. 칸 순서 = 안전모, 안전벨트, 안전화
      // 사람 아이콘 = Figma UI_99 2474:74622(30×72 벡터) 그대로, 1.3배
      const man = (cx, c) => `<g transform="translate(${(cx - 19.2).toFixed(1)},6) scale(1.3)" fill="${c}"><path d="M9.20018 14.9976C9.44815 14.9682 9.79545 14.9643 10.0505 14.964C13.0675 14.9599 16.0847 14.9611 19.1016 14.959C20.0124 14.9583 20.9752 14.9998 21.8617 15.2155C26.4975 16.3438 29.4357 20.2625 29.4746 24.9862L29.4858 38.2888L29.4891 42.1378C29.4895 42.8604 29.5532 43.8261 29.4212 44.5201C28.9669 47.1665 25.2823 47.4545 24.3944 45.0367C24.0661 44.1422 24.2112 41.3281 24.2122 40.2548L24.2112 30.3876L24.2183 27.27C24.2192 26.7762 24.3288 25.3361 23.9977 25.0167C23.8633 24.8881 23.6835 24.8185 23.4975 24.8235C23.2255 24.8305 23.0676 24.9997 22.9852 25.2437C22.8288 25.7087 22.9211 31.5609 22.9211 32.4071L22.9262 57.5737L22.9328 64.9228C22.9332 65.8571 22.9843 67.9336 22.8724 68.7971C22.7759 69.6036 22.4186 70.3566 21.8547 70.9415C21.1738 71.6402 20.2428 72.0397 19.2673 72.0519C18.2736 72.0603 17.3182 71.6702 16.6148 70.9682C15.2699 69.6279 15.5157 67.9626 15.5167 66.2163L15.5204 61.9772L15.5199 46.613C15.5171 45.8679 15.6309 42.5546 15.3738 42.1472C15.2656 41.973 15.09 41.8517 14.8887 41.8119C14.6854 41.7688 14.4733 41.8119 14.3023 41.9309C13.7914 42.2938 13.9633 43.9418 13.9633 44.5843L13.9642 48.9447L13.9652 63.2337V66.6425C13.9652 68.4899 14.1614 70.0808 12.4807 71.3143C11.6877 71.9081 10.689 72.1568 9.71017 72.0051C8.32716 71.7868 7.18604 70.8062 6.76241 69.4715C6.46841 68.5391 6.56207 65.8782 6.56254 64.7397L6.56511 59.5233L6.56085 36.8905L6.56212 29.4358C6.56244 28.1378 6.57031 26.8298 6.55364 25.5322C6.54329 25.3533 6.55064 25.2398 6.44682 25.0858C6.15174 24.6483 5.43457 24.7415 5.33473 25.2926C5.25582 25.7281 5.27881 26.1924 5.28181 26.6495L5.28879 38.5005L5.29164 42.1819C5.29239 42.7986 5.32124 43.7952 5.25212 44.3773C5.20028 44.8526 5.01797 45.3036 4.72537 45.6815C4.28221 46.2454 3.63304 46.6092 2.92112 46.6935C2.2358 46.7788 1.54585 46.576 1.01535 46.1339C-0.137904 45.1715 0.00792682 43.9038 0.0040867 42.5617C0.00263495 42.0475 0.0082997 41.5328 0.00989194 41.0186L0.0182297 35.3277L0.0142023 28.0679C0.0127037 26.5954 -0.0655507 24.2824 0.209954 22.8812C0.534725 21.2578 1.25896 19.7409 2.31715 18.4677C4.0932 16.348 6.47384 15.2278 9.20018 14.9976Z"/><path d="M14.4937 0.00469347C18.213 -0.132755 21.3417 2.7655 21.4883 6.48414C21.6354 10.2028 18.7454 13.339 15.0271 13.4956C11.2952 13.6527 8.14512 10.7497 7.99756 7.0175C7.85004 3.28528 10.7612 0.14261 14.4937 0.00469347Z"/></g>`;
      const slots = (sx, cols) => cols.map((c, k) => `<rect x="${sx}" y="${30 + k * 26}" width="36" height="20" rx="4" fill="${c}"/>`).join('');
      const bad = x.st !== 'ok';
      // 2026-11-19 착용 칸 셋은 뺌, 사람 아이콘만(상세 기준 비교와 같게, 사용자 지시): 미착용자 위험색, 착용자 회색
      b = '<g transform="translate(0,-24)">' + man(116, bad ? '#FF6B72' : '#AFB7C8') + man(184, '#AFB7C8') + '</g>'   // 값 글자(아래)와 겹치지 않게 위로
        + `<title>작업자 2명 중 ${bad ? '1명 안전벨트 미착용' : '모두 착용'}</title>` + val(x.st === 'ok' ? '0명' : '1명'); }
    else if(x.g === 'dial'){ const [lo, hi] = x.axis, X = v => 30 + 240 * (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo), y = 46;
      b = `<rect x="30" y="${y}" width="240" height="14" rx="2" fill="${COL.track}"/><rect x="${X(x.range[0])}" y="${y}" width="${X(x.range[1]) - X(x.range[0])}" height="14" fill="#AFB7C8"/><rect x="${X(x.c)}" y="${y}" width="${X(hi) - X(x.c)}" height="14" rx="2" fill="${COL.crit}" fill-opacity=".5"/>`
        + ln(X(x.v), y - 10, X(x.v), y + 24, c, 4) + `<circle cx="${X(x.v)}" cy="${y + 7}" r="9" fill="${c}" stroke="#373F4E" stroke-width="2"/>` + val(x.v.toFixed(2) + ' MPa'); }
    else if(x.g === 'thermo'){ const lo = 18, hi = 90, X = t => 30 + 240 * (Math.max(lo, Math.min(hi, t)) - lo) / (hi - lo), y = 46;
      b = `<rect x="30" y="${y}" width="240" height="14" rx="2" fill="${COL.track}"/><rect x="30" y="${y}" width="${X(x.v) - 30}" height="14" rx="2" fill="${c}"/>`
        + [x.w, x.c].map(t => ln(X(t), y - 8, X(t), y + 22, COL.t1, 3)).join('') + `<circle cx="${X(x.v)}" cy="${y + 7}" r="9" fill="${c}" stroke="#373F4E" stroke-width="2"/>` + val(x.val); }
    else { const cx = 150, cy = 150, r = 112, [lo, hi] = x.axis, a = t => Math.PI * (1 - (t - lo) / (hi - lo));
      b = `<path d="${arc(cx, cy, r, Math.PI, 0)}" fill="none" stroke="${COL.track}" stroke-width="9" stroke-linecap="round"/><path d="${arc(cx, cy, r, Math.PI, a(x.v))}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`
        + [x.w, x.c].map(v => { const [x0, y0] = pt(cx, cy, r - 13, a(v)), [x1, y1] = pt(cx, cy, r + 13, a(v)); return ln(x0, y0, x1, y1, COL.t1, 3); }).join('') + val(x.g === 'ring' ? x.v + '%' : x.val); }
    const sc = Math.min(W / 300, H / 170);
    return `<svg class="sv" width="${(300 * sc).toFixed(0)}" height="${(170 * sc).toFixed(0)}" viewBox="0 -24 300 170" role="img" aria-label="${x.k} ${x.head}">${b}</svg>`;
  }
  function graphA1(x, W, H, inVal){
    if(inVal) return uni(x, W, H);
    const fit = (w0, h0, b) => { const sc = Math.min(W / w0, H / h0); return `<svg class="sv" width="${(w0 * sc).toFixed(0)}" height="${(h0 * sc).toFixed(0)}" viewBox="0 0 ${w0} ${h0}" role="img" aria-label="${x.k} ${x.head}">${b}</svg>`; };
    if(x.g === 'count'){
      const N = 2, rows = [['안전모', 2], ['안전벨트', x.st === 'ok' ? 2 : 1], ['안전화', 2]];
      const row = (l, n, y) => tx(0, y + 14, 15, COL.t2, l) + Array.from({length:N}, (_, i) => `<rect x="${92 + i * 38}" y="${y}" width="32" height="18" rx="2" fill="${i < n ? COL.ok : COL.crit}"/>`).join('') + tx(260, y + 14, 15, n === N ? COL.t1 : TXT.crit, n + '/' + N, {a:'end', w:600});
      if(inVal) return fit(260, 140, tx(130, 62, 56, TXT[x.st], x.st === 'ok' ? '0명' : '1명', {a:'middle', w:600}) + row('안전벨트', rows[1][1], 100));
      return fit(260, 140, rows.map(([l, n], i) => row(l, n, 10 + i * 32)).join(''));
    }
    if(x.g === 'dial'){
      const [lo, hi] = x.axis, X = v => 10 + 240 * (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo), y = inVal ? 64 : 26, c = COL[x.st] || COL.ok;
      let b = `<rect x="10" y="${y}" width="240" height="12" rx="2" fill="${COL.track}"/><rect x="${X(x.range[0])}" y="${y}" width="${X(x.range[1]) - X(x.range[0])}" height="12" fill="#AFB7C8"/><rect x="${X(x.c)}" y="${y}" width="${X(hi) - X(x.c)}" height="12" rx="2" fill="${COL.crit}" fill-opacity=".5"/>`
        + ln(X(x.v), y - 8, X(x.v), y + 20, c, 4) + `<circle cx="${X(x.v)}" cy="${y + 6}" r="8" fill="${c}" stroke="#373F4E" stroke-width="2"/>`
        + tx(X(x.range[0]), y + 40, 16, COL.t3, x.range[0].toFixed(2), {a:'middle'}) + tx(X(x.range[1]), y + 40, 16, COL.t3, x.range[1].toFixed(2), {a:'middle'});
      if(inVal) b += tx(Math.max(80, Math.min(180, X(x.v))), 40, 30, TXT[x.st], x.v.toFixed(2) + ' MPa', {a:'middle', w:600});
      return fit(260, inVal ? 116 : 76, b);
    }
    // 누출감지도 이상음향 · 부분방전과 같은 반원 게이지(사용자 지정, A안 · 가로 B안 공통). 축 0 ~ 100%, 주의 · 위험 눈금
    if(x.g === 'ring'){ const cx = 150, cy = 150, r = 112, [lo, hi] = x.axis, a = t => Math.PI * (1 - (t - lo) / (hi - lo)), c = COL[x.st] || COL.ok;
      let b = `<path d="${arc(cx, cy, r, Math.PI, 0)}" fill="none" stroke="${COL.track}" stroke-width="9" stroke-linecap="round"/><path d="${arc(cx, cy, r, Math.PI, a(x.v))}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`
        + [x.w, x.c].map(v => { const [x0, y0] = pt(cx, cy, r - 13, a(v)), [x1, y1] = pt(cx, cy, r + 13, a(v)), [lx, ly] = pt(cx, cy, r + 30, a(v)); return ln(x0, y0, x1, y1, COL.t1, 3) + tx(lx, ly + 6, 16, COL.t3, String(v), {a:'middle'}); }).join('');
      if(inVal) b += tx(cx, cy - 12, 54, TXT[x.st], x.v + '%', {a:'middle', w:600});
      const sc = Math.min(W / 300, H / 170);
      return `<svg class="sv" width="${(300 * sc).toFixed(0)}" height="${(170 * sc).toFixed(0)}" viewBox="0 -24 300 170" role="img" aria-label="${x.k} ${x.head}">${b}</svg>`; }
    let add = '';
    if(x.g === 'ring'){ const cx = 100, cy = 92, r = 72, a = p => Math.PI / 2 - 2 * Math.PI * p / 100, [x0, y0] = pt(cx, cy, r - 14, a(x.c)), [x1, y1] = pt(cx, cy, r + 14, a(x.c)), [lx, ly] = pt(cx, cy, r + 30, a(x.c));
      add = ln(x0, y0, x1, y1, COL.crit, 3) + tx(lx, ly + 6, 16, COL.t3, x.c + '%', {a:'middle'}); }
    if(x.k === '부분방전'){ const cx = 150, cy = 150, r = 112, [lo, hi] = x.axis, a = t => Math.PI * (1 - (t - lo) / (hi - lo)), [x0, y0] = pt(cx, cy, r - 13, a(x.c)), [x1, y1] = pt(cx, cy, r + 13, a(x.c)), [lx, ly] = pt(cx, cy, r + 30, a(x.c));
      add = ln(x0, y0, x1, y1, COL.t1, 3) + tx(lx, ly + 6, 16, COL.t3, String(x.c), {a:'middle'}); }
    return graphA0(x, W, H, inVal).replace('</svg>', add + '</svg>');
  }
  /*
   * 감지 카드 짜임 — 왼쪽 위에서 오른쪽 아래로 읽힌다: 감지 이름 → 지점 → 핵심 수치(와 기준) → 그래프.
   * 수치는 왼쪽 위 묶음에 글자로, 그래프는 오른쪽 아래에 그림만(값 글자를 그림 안에 겹쳐 넣지 않는다).
   * 안쪽 여백은 사방 16, 묶음 사이 4 · 12 단. A안 미션별 카드와 가로 B안 왼쪽 목록이 같은 짜임을 쓴다.
   */
  /*
   * A안 미션별 감지 카드 새 그림(Figma UI_99 2454:73328 참고). 값은 오른쪽 위에 판정 색으로 크게, 그림은 오른쪽 아래.
   *   누출감지 = 반원 게이지(값은 원 안, 주의 · 위험 눈금), 아래는 카드 끝에서 잘림
   *   온도감지 = 색 띠 막대(정상 파랑 → 주의 노랑 → 위험 빨강, 기준에서 끊김) + 이번 값 표시
   *   계기인식 = 같은 띠 막대, 허용 범위만 파랑
   *   이상음향 = 이번 측정 소리의 주파수별 세기 막대(시간축 아님)
   *   부분방전 = 정상 범위 띠(0 ~ 기준) + 이번 측정의 위상별 방전 크기(시간축 아님), 가장 큰 점에 동그라미
   *   장비착용 = 안전벨트 칸 두 개
   */
  let cv = 'new';
  function lcCard(x, box){
    const [l, t, w, h] = box, c = COL[x.st] || COL.ok, T = TXT[x.st];
    const bar = (lo, hi, segs, v, grad) => { const W = 200, X = s => 4 + (W - 8) * (Math.max(lo, Math.min(hi, s)) - lo) / (hi - lo), y = 12, bh = 12, g = 1.5;
      let b = segs.map(([a, z, fill], i) => `<rect x="${(X(a) + (i ? g : 0)).toFixed(1)}" y="${y}" width="${(X(z) - X(a) - (i ? g : 0) - (i < segs.length - 1 ? g : 0)).toFixed(1)}" height="${bh}" rx="${Math.min(5, (X(z) - X(a)) / 4).toFixed(1)}" fill="${fill}"/>`).join('');
      const mx = X(v);
      b += `<path d="M${(mx - 5).toFixed(1)} 1 L${(mx + 5).toFixed(1)} 1 L${mx.toFixed(1)} 8 Z" fill="#0A0E15"/><rect x="${(mx - 1.5).toFixed(1)}" y="7" width="3" height="22" rx="1" fill="#F7F8FA" stroke="#0A0E15" stroke-width="1"/>`;
      const defs = grad ? `<defs><linearGradient id="lcg-${x.ic}" gradientUnits="userSpaceOnUse" x1="4" x2="${W - 4}" y1="0" y2="0">${grad.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient></defs>` : '';
      return `<svg class="lcg" style="bottom:14px" width="${W}" height="30" viewBox="0 0 ${W} 30" aria-hidden="true">${defs}${b}</svg>`; };
    let g = '', vb = 50, val = x.val + (x.unit || '');
    /*
     * 구간 띠(온도감지 시안 C 와 같은 꼴, 카드 폭 368×74, 바닥에서 6) — 띠를 판정 구간으로 끊고 측정값이 있는 구간만 판정색, 나머지 회색. 측정값 자리 끊김 + 흰 선 + 세모
     * 2026-11-19 누출감지, 계기인식도 같은 그래프 영역으로(사용자 지시 '다른 영역과 같게, 임의로')
     */
    // 2026-11-20 띠 아래 축 글자(양 끝 값). 단위는 감지마다
    const AXU = {'누출감지':'%', '온도감지':' ℃', '계기인식':' MPa'}, axn = t => x.range ? t.toFixed(1) : String(t);
    const axLab = (lo, hi, a, b) => `<g fill="#7C8597" font-size="10.5" font-family="SUIT Variable, SUIT, sans-serif"><text x="${a}" y="70">${axn(lo)}${AXU[x.k] || ''}</text><text x="${b}" y="70" text-anchor="end">${axn(hi)}${AXU[x.k] || ''}</text></g>`;
    const band = (lo, hi, segs, v) => { const W = 368, HH = 74, BX0 = 0, BX1 = 364, BY = 30, BH = 15, r = BH / 2, bx = t => BX0 + (Math.max(lo, Math.min(hi, t)) - lo) / (hi - lo) * (BX1 - BX0);
      const SC = {ok:'#6AA7E7', warn:'#FFCC00', crit:'#E55548'}, gray = '#3A4356', cardBg = x.st === 'crit' ? '#4c3946' : '#353e4f', mxp = bx(v), n = segs.length;
      const on = segs.findIndex(([a, b], i) => v >= a && (v < b || (i === n - 1 && v <= b)));
      let s = segs.map(([a, b, k], i) => { const xx = bx(a) + (i ? 2 : 0), ww = bx(b) - bx(a) - (i ? 2 : 0) - (i < n - 1 ? 2 : 0); return `<rect x="${xx.toFixed(1)}" y="${BY}" width="${ww.toFixed(1)}" height="${BH}" rx="${Math.min(r, ww / 2).toFixed(1)}" fill="${i === on ? SC[k] : gray}"/>`; }).join('');
      s += `<rect x="${(mxp - 3).toFixed(1)}" y="${BY - 1}" width="6" height="${BH + 2}" fill="${cardBg}"/><line x1="${mxp.toFixed(1)}" x2="${mxp.toFixed(1)}" y1="${BY - 2}" y2="${BY + BH + 3}" stroke="#FFFFFF" stroke-width="1.5"/><path d="M${(mxp - 6).toFixed(1)} ${BY - 10}h12l-6 7z" fill="#D3D7DE"/>`;
      s += axLab(lo, hi, BX0, BX1);
      return `<svg class="lcg" style="bottom:6px" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" aria-hidden="true">${s}</svg>`; };
    /*
     * 2026-11-19 온도감지 시안 B 와 같은 띠(사용자 지시: 계기인식, 누출감지도 온도감지 스타일). 띠는 회색, 처음부터 측정값까지만 구간 색(경계에서 부드럽게 바뀜)으로 채움,
     * 구간 경계마다 홈, 측정값 자리 끊김 + 흰 선 + 세모. segs = [[시작, 끝, 판정], ...]
     */
    const bandB = (lo, hi, segs, v) => { const W = 368, HH = 74, BX0 = 0, BX1 = 364, BY = 38, BH = 15, r = BH / 2, f = t => (Math.max(lo, Math.min(hi, t)) - lo) / (hi - lo), bx = t => BX0 + f(t) * (BX1 - BX0);
      const SC = {ok:'#6AA7E7', warn:'#FFCC00', crit:'#E55548'}, cardBg = x.st === 'crit' ? '#4c3946' : '#353e4f', mxp = bx(v), tg = 'lcb-' + x.ic, d = .04;
      let st = `<stop offset="0" stop-color="${SC[segs[0][2]]}"/>`;
      segs.forEach(([a, b, k], i) => { if(i){ st += `<stop offset="${Math.max(0, f(a) - d).toFixed(3)}" stop-color="${SC[segs[i - 1][2]]}"/><stop offset="${Math.min(1, f(a) + d).toFixed(3)}" stop-color="${SC[k]}"/>`; } });
      st += `<stop offset="1" stop-color="${SC[segs[segs.length - 1][2]]}"/>`;
      let s = `<defs><linearGradient id="${tg}" gradientUnits="userSpaceOnUse" x1="${BX0}" x2="${BX1}" y1="0" y2="0">${st}</linearGradient></defs>`;
      s += `<rect x="${BX0}" y="${BY}" width="${BX1 - BX0}" height="${BH}" rx="${r}" fill="#3A4356"/><rect x="${BX0}" y="${BY}" width="${Math.max(BH, mxp - BX0).toFixed(1)}" height="${BH}" rx="${r}" fill="url(#${tg})"/>`;
      segs.slice(1).forEach(([a]) => { const q = bx(a).toFixed(1); s += `<circle cx="${q}" cy="${BY - 1}" r="3.5" fill="${cardBg}"/><circle cx="${q}" cy="${BY + BH + 1}" r="3.5" fill="${cardBg}"/>`; });
      s += `<rect x="${(mxp - 3).toFixed(1)}" y="${BY - 1}" width="6" height="${BH + 2}" fill="${cardBg}"/><line x1="${mxp.toFixed(1)}" x2="${mxp.toFixed(1)}" y1="${BY - 2}" y2="${BY + BH + 3}" stroke="#FFFFFF" stroke-width="1.5"/><path d="M${(mxp - 6).toFixed(1)} ${BY - 10}h12l-6 7z" fill="#D3D7DE"/>`;
      return `<svg class="lcg" style="bottom:6px" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" aria-hidden="true">${s}</svg>`; };
    if(x.g === 'ring'){
      // 누출감지(%) = 정상 ~ 주의 기준, 주의 ~ 위험 기준, 위험 ~ 100. 2026-11-19 온도감지 스타일(bandB)
      g = band(0, 100, [[0, x.w, 'ok'], [x.w, x.c, 'warn'], [x.c, 100, 'crit']], x.v); vb = 84;   // 2026-11-19 bandB(온도 스타일) 롤백(사용자 지시)
    } else if(x.g === 'thermo'){
      // 2026-11-19 온도감지 시안 B('감지 카드 그래프' 아티팩트, 사용자 지시): 띠는 회색, 처음부터 측정값까지만 색 띠(파랑 → 노랑 → 빨강)로 채움, 주의 시작과 위험 기준에 홈, 측정값 자리 끊김 + 흰 선 + 세모. 띠 양 끝 10 ~ 80 ℃
      const W = 368, HH = 74, BX0 = 0, BX1 = 364, BY = 30, BH = 15, r = BH / 2, lo = 10, hi = 80, f = t => (Math.max(lo, Math.min(hi, t)) - lo) / (hi - lo), bx = t => BX0 + f(t) * (BX1 - BX0);
      const cardBg = x.st === 'crit' ? '#4c3946' : '#353e4f', fw = f(x.w), fc = f(x.c), mxp = bx(x.v), tg = 'lct-' + x.ic;
      let s = `<defs><linearGradient id="${tg}" gradientUnits="userSpaceOnUse" x1="${BX0}" x2="${BX1}" y1="0" y2="0"><stop offset="0" stop-color="#6AA7E7"/><stop offset="${Math.max(0, fw - .09).toFixed(3)}" stop-color="#6AA7E7"/><stop offset="${(fw + .12).toFixed(3)}" stop-color="#FFCC00"/><stop offset="${(fc - .05).toFixed(3)}" stop-color="#FFCC00"/><stop offset="${Math.min(1, fc + .14).toFixed(3)}" stop-color="#E55548"/><stop offset="1" stop-color="#E55548"/></linearGradient></defs>`;
      s += `<rect x="${BX0}" y="${BY}" width="${BX1 - BX0}" height="${BH}" rx="${r}" fill="#3A4356"/><rect x="${BX0}" y="${BY}" width="${Math.max(BH, mxp - BX0).toFixed(1)}" height="${BH}" rx="${r}" fill="url(#${tg})"/>`;
      [x.w, x.c].forEach(t => { const q = bx(t).toFixed(1); s += `<circle cx="${q}" cy="${BY - 1}" r="3.5" fill="${cardBg}"/><circle cx="${q}" cy="${BY + BH + 1}" r="3.5" fill="${cardBg}"/>`; });
      s += `<rect x="${(mxp - 3).toFixed(1)}" y="${BY - 1}" width="6" height="${BH + 2}" fill="${cardBg}"/><line x1="${mxp.toFixed(1)}" x2="${mxp.toFixed(1)}" y1="${BY - 2}" y2="${BY + BH + 3}" stroke="#FFFFFF" stroke-width="1.5"/><path d="M${(mxp - 6).toFixed(1)} ${BY - 10}h12l-6 7z" fill="#D3D7DE"/>` + axLab(lo, hi, BX0, BX1);
      g = `<svg class="lcg" style="bottom:6px" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" aria-hidden="true">${s}</svg>`; vb = 84;
    } else if(x.g === 'dial'){
      // 계기인식(MPa) = 낮음 주의 ~ 허용 아래, 허용 범위 정상, 높음 주의 ~ 위험 기준, 위험
      const [lo, hi] = x.axis;
      g = `<svg class="lcg" style="bottom:6px" width="368" height="74" viewBox="0 0 368 74" aria-hidden="true">${meterArc(x, 184, 172, 20, 32)}${axLab(lo, hi, 0, 368)}</svg>`; vb = 84;   // 2026-11-20 계기판 B   // 2026-11-19 bandB(온도 스타일) 롤백(사용자 지시)
    } else if(x.k === '이상음향' || x.k === '부분방전'){
      /*
       * 2026-11-19 '감지 카드 그래프' 아티팩트(SjJZKFirUHjuaQ9uprKrcR) 추천안 적용. 카드 폭 그래프(368×74), 아래 축 글자, 한 번 잰 결과(시간축 없음)
       *   이상음향 A = 주파수 막대 38개, 막대 끝 색 띠(파랑 → 노랑 → 빨강), 주의 · 위험 점선, 가장 높은 막대 위 세모. 축 20 Hz, 1 kHz, 20 kHz
       *   부분방전 B = 면을 정상 · 주의 · 위험 세 구간으로, 위상(0° ~ 360°)별 가장 큰 방전 꺾은선, 가장 큰 방전에 흰 동그라미. 축 0°, 180°, 360°
       *   기준값은 우리 데이터(이상음향 주의 19 위험 22.8, 부분방전 주의 8.6 위험 9.6), 모양(평평, 봉우리, 뾰족)은 판정에 맞춤
       */
      const W = 368, HH = 74, X0 = 0, X1 = W, frac = q => q - Math.floor(q), rr = (k, j, s) => frac(Math.sin(k * 12.9898 + j * 78.233 + s * 3.71) * 43758.5453);
      const shape = x.st === 'crit' ? 'spike' : x.st === 'warn' ? 'hump' : 'flat', v = x.v, wv = x.w, cv = x.c, mx = x.axis[1];
      const AX = (list) => `<g fill="#7C8597" font-size="10.5" font-family="SUIT Variable, SUIT, sans-serif">${list.map(([t, xx, a]) => `<text x="${xx.toFixed(1)}" y="70" text-anchor="${a}">${t}</text>`).join('')}</g>`;
      let s = '';
      if(x.k === '이상음향'){
        const N = 38, BOT = 54, H = 46, step = (X1 - X0 - 2.4) / (N - 1), yOf = q => BOT - (q / mx) * H, o = q => Math.max(0, Math.min(1, q / mx)).toFixed(3), gid = 'lcs-' + x.ic;
        const base = Array.from({length:N}, (_, i) => (6 + 4.5 * rr(i, 1, 1) + 3 * (1 - i / (N - 1))) * mx / 30);
        let vals, peak;
        if(shape === 'flat'){ const m = Math.max(...base); vals = base.map(b => b * (v / m)); peak = vals.indexOf(Math.max(...vals)); }
        else { const c = shape === 'hump' ? 19 : 22, wd = shape === 'spike' ? 1.0 : 2.6, floor = Math.min(1, (v * .6) / Math.max(...base));
          vals = base.map((b, i) => { let q = v * Math.exp(-Math.pow((i - c) / wd, 2)); if(shape === 'spike') q = Math.max(q, .62 * v * Math.exp(-Math.pow((i - c - 7) / .9, 2))); return Math.min(Math.max(b * floor, q), v - .4); });
          vals[c] = v; peak = c; }
        // 2026-11-19 시안 B(사용자 지시, 이전 C): 모든 막대를 판정색 하나로, 위험 점선만, 세모와 주파수 글자 없음
        const SC = {ok:'#6AA7E7', warn:'#FFCC00', crit:'#E55548'}, pc = SC[x.st] || SC.ok;
        s += `<line x1="${X0}" x2="${X1}" y1="${yOf(cv).toFixed(1)}" y2="${yOf(cv).toFixed(1)}" stroke="#FFFFFF" stroke-opacity=".26" stroke-dasharray="2 3"/>`;
        vals.forEach((q, i) => { const xx = X0 + i * step, hh = Math.max(3, (q / mx) * H); s += `<rect x="${xx.toFixed(2)}" y="${(BOT - hh).toFixed(2)}" width="2.4" height="${hh.toFixed(2)}" rx="1.2" fill="${pc}"/>`; });
        s += AX([['20 Hz', X0, 'start'], ['1 kHz', X0 + (Math.log(50) / Math.log(1000)) * (N - 1) * step, 'middle'], ['20 kHz', X1, 'end']]);
      } else {
        const PH = Array.from({length:19}, (_, i) => i * 20), phX = ph => X0 + (ph / 360) * (X1 - X0), TOP = 12, BOT = 58, PH_H = BOT - TOP, MIN = wv * .5;
        const py_ = q => BOT - ((Math.max(MIN, Math.min(q, mx)) - MIN) / (mx - MIN)) * PH_H, yW = py_(wv), yC = py_(cv);
        const pdBase = PH.map((_, i) => MIN + (wv - MIN) * (.25 + .4 * rr(i, 2, 5)));
        let vals, peak;
        if(shape === 'flat'){ const m = Math.max(...pdBase); vals = pdBase.map(b => b * (v / m)); peak = vals.indexOf(Math.max(...vals)); }
        else { const t = shape === 'hump' ? .6 : 1, wd = 42 - 20 * t, floor = Math.min(1, (v * .55) / Math.max(...pdBase));
          vals = PH.map((ph, i) => Math.min(Math.max(pdBase[i] * floor, Math.max(v * Math.exp(-Math.pow((ph - 80) / wd, 2)), .84 * v * Math.exp(-Math.pow((ph - 260) / wd, 2)))), v - (mx - MIN) * .02));
          vals[4] = v; peak = 4; }
        const pts = vals.map((q, i) => [phX(PH[i]), py_(q)]), line = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
        // 2026-11-19 시안 A(사용자 지정): 면 전체를 판정색 하나로, 위험 선과 바닥 선, 판정색 꺾은선, 흰 동그라미
        const PDC = {ok:{fill:'#A8CBF3', guide:'#6AA7E7', ink:'#2F78D6'}, warn:{fill:'#FFE88A', guide:'#E1AB13', ink:'#A07800'}, crit:{fill:'#F5B7B0', guide:'#E55548', ink:'#C2362A'}}, P = PDC[x.st] || PDC.ok, yFloor = BOT - 5;
        s += `<rect x="${X0}" y="${TOP}" width="${W}" height="${BOT - TOP}" fill="${P.fill}"/>`;
        s += `<line x1="${X0}" x2="${X1}" y1="${yC.toFixed(1)}" y2="${yC.toFixed(1)}" stroke="${P.guide}" stroke-width="2"/><line x1="${X0}" x2="${X1}" y1="${yFloor}" y2="${yFloor}" stroke="${P.guide}" stroke-width="2"/>`;
        s += `<path d="${line}" fill="none" stroke="${P.ink}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${pts[peak][0].toFixed(1)}" cy="${pts[peak][1].toFixed(1)}" r="4.5" fill="#FFFFFF" stroke="${P.ink}" stroke-width="2"/>`;
        s += AX([['0°', X0, 'start'], ['180°', (X0 + X1) / 2, 'middle'], ['360°', X1, 'end']]);
      }
      g = `<svg class="lcg" style="bottom:6px" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" aria-hidden="true">${s}</svg>`;
      vb = 84;
    } else if(x.g === 'count'){
      // 2026-11-19 다른 카드와 같은 그래프 영역(368×74, 바닥에서 6): Figma 사람 아이콘 2명 + 착용 칸 셋(안전모, 안전벨트, 안전화). 미착용자 밝게, 안 맨 칸 판정색
      const bad = x.st !== 'ok', W = 368, HH = 74, S = .76;
      const man = (px, col) => `<g transform="translate(${px},${74 - 6 - 72 * S}) scale(${S})" fill="${col}"><path d="M9.20018 14.9976C9.44815 14.9682 9.79545 14.9643 10.0505 14.964C13.0675 14.9599 16.0847 14.9611 19.1016 14.959C20.0124 14.9583 20.9752 14.9998 21.8617 15.2155C26.4975 16.3438 29.4357 20.2625 29.4746 24.9862L29.4858 38.2888L29.4891 42.1378C29.4895 42.8604 29.5532 43.8261 29.4212 44.5201C28.9669 47.1665 25.2823 47.4545 24.3944 45.0367C24.0661 44.1422 24.2112 41.3281 24.2122 40.2548L24.2112 30.3876L24.2183 27.27C24.2192 26.7762 24.3288 25.3361 23.9977 25.0167C23.8633 24.8881 23.6835 24.8185 23.4975 24.8235C23.2255 24.8305 23.0676 24.9997 22.9852 25.2437C22.8288 25.7087 22.9211 31.5609 22.9211 32.4071L22.9262 57.5737L22.9328 64.9228C22.9332 65.8571 22.9843 67.9336 22.8724 68.7971C22.7759 69.6036 22.4186 70.3566 21.8547 70.9415C21.1738 71.6402 20.2428 72.0397 19.2673 72.0519C18.2736 72.0603 17.3182 71.6702 16.6148 70.9682C15.2699 69.6279 15.5157 67.9626 15.5167 66.2163L15.5204 61.9772L15.5199 46.613C15.5171 45.8679 15.6309 42.5546 15.3738 42.1472C15.2656 41.973 15.09 41.8517 14.8887 41.8119C14.6854 41.7688 14.4733 41.8119 14.3023 41.9309C13.7914 42.2938 13.9633 43.9418 13.9633 44.5843L13.9642 48.9447L13.9652 63.2337V66.6425C13.9652 68.4899 14.1614 70.0808 12.4807 71.3143C11.6877 71.9081 10.689 72.1568 9.71017 72.0051C8.32716 71.7868 7.18604 70.8062 6.76241 69.4715C6.46841 68.5391 6.56207 65.8782 6.56254 64.7397L6.56511 59.5233L6.56085 36.8905L6.56212 29.4358C6.56244 28.1378 6.57031 26.8298 6.55364 25.5322C6.54329 25.3533 6.55064 25.2398 6.44682 25.0858C6.15174 24.6483 5.43457 24.7415 5.33473 25.2926C5.25582 25.7281 5.27881 26.1924 5.28181 26.6495L5.28879 38.5005L5.29164 42.1819C5.29239 42.7986 5.32124 43.7952 5.25212 44.3773C5.20028 44.8526 5.01797 45.3036 4.72537 45.6815C4.28221 46.2454 3.63304 46.6092 2.92112 46.6935C2.2358 46.7788 1.54585 46.576 1.01535 46.1339C-0.137904 45.1715 0.00792682 43.9038 0.0040867 42.5617C0.00263495 42.0475 0.0082997 41.5328 0.00989194 41.0186L0.0182297 35.3277L0.0142023 28.0679C0.0127037 26.5954 -0.0655507 24.2824 0.209954 22.8812C0.534725 21.2578 1.25896 19.7409 2.31715 18.4677C4.0932 16.348 6.47384 15.2278 9.20018 14.9976Z"/><path d="M14.4937 0.00469347C18.213 -0.132755 21.3417 2.7655 21.4883 6.48414C21.6354 10.2028 18.7454 13.339 15.0271 13.4956C11.2952 13.6527 8.14512 10.7497 7.99756 7.0175C7.85004 3.28528 10.7612 0.14261 14.4937 0.00469347Z"/></g>`;
      const slots = (sx, cols) => cols.map((col, k) => `<rect x="${sx}" y="${22 + k * 16}" width="30" height="12" rx="3" fill="${col}"/>`).join('');
      const g2 = '#3F485C';
      let s = man(0, bad ? '#D4D7DD' : '#5F687B') + slots(30, bad ? ['#5F687B', '#E55548', '#5F687B'] : [g2, g2, g2]) + man(84, '#5F687B') + slots(114, [g2, g2, g2]);
      s += `<g fill="#7C8597" font-size="10.5" font-family="SUIT Variable, SUIT, sans-serif">${['안전모', '안전벨트', '안전화'].map((t, k) => `<text x="152" y="${31 + k * 16}">${t}</text>`).join('')}</g>`;
      g = `<svg class="lcg" style="bottom:6px" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" aria-hidden="true">${s}</svg>`;
      val = x.st === 'ok' ? '0명' : '1명'; vb = 84;
    }
    return `<button type="button" class="det lc ${x.st} tint" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px" data-k="${x.k}" aria-label="${x.k} ${WORD[x.st]} ${x.wp} ${x.head}, 상세 보기"><span class="k-h">${ico(x.ic)}${x.k}${seqOf(x)}</span><span class="k-wp">${x.wp} ${x.at}</span>${val ? `<span class="lv" style="color:${T};bottom:${vb}px">${val}</span>` : ''}${g}</button>`;
  }
  const AOK = {'이상음향':{st:'ok', v:14.2, val:'14.2', head:'이상 점수 14.2'}, '부분방전':{st:'ok', v:6.42, val:'6.42', head:'이상 점수 6.42'}};
  function det(x, box, mode){
    if(mode === 'A') return lcCard(AOK[x.k] ? Object.assign({}, x, AOK[x.k]) : x, box);
    if(AOK[x.k]) x = Object.assign({}, x, AOK[x.k]);   // B안 목록 카드도 같게(사용자 지시)
    // 가로 B안 목록: 수치가 그래프 안에 들어간다(사용자 지정). 판정 배지만 감지 이름 옆으로 옮긴다
    let c = ''; const h0 = det0(x, box, mode).replace(/<span style="grid-column:1;align-self:end">(<span class="ds-badge[^>]*>[^<]*<\/span>)<\/span>/, (m, a) => { c = a; return ''; });
    return h0.replace(x.k + '</span><span class="k-wp">', x.k + seqOf(x) + c + '</span><span class="k-wp">');
  }
  /*
   * 간격 위계 — 디자인시스템 간격 토큰(space/4 · 8 · 12 · 16 · 20 · 24)만 쓴다.
   *   판 바깥 여백 12  ·  구역 사이 24(지도 | 카드 묶음, 목록 | 본문)  ·  같은 구역 안 칸 사이 12
   *   큰 판 안 여백 24, 작은 카드 안 여백 16  ·  묶음 사이 16 ~ 20  ·  항목 사이 8  ·  붙는 짝 4
   * 화면마다 칸 자리를 이 규칙으로 직접 놓는다(예전에는 1788×976 자리를 비율로 늘려 간격이 24.3 같은 값이 됐다).
   */
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try { inset2(); } catch(e) {} });   // 글꼴이 늦게 실리면 알약 폭이 달라진다
  function inset2(){
    // 가로 B안 왼쪽 머리의 미션 이름도 뺀다(상단 탭과 반복). 미션별은 머리 줄이 통째로 없어지고, 상세는 돌아가기만 남는다
    if(S.s === 'B' && scr !== 'all'){ const hb = st.querySelector('main.body > .abs'), t = hb && [...hb.querySelectorAll('b')].find(b => b.textContent === (window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검')); if(t){ t.parentElement.remove(); if(scr === 'm') hb.remove(); } }
    const P = 12, {W, H} = BOX(), m1 = MH(false), m2 = MH(true), kids = [...st.querySelectorAll('main.body > *')], B = (l, t, w, h) => ({l, t, w, h});
    const mw = W - 424, lw = mw - 408 - 12;
    const L = {
      'A-all': () => { const tw = (W - 24) / 3, o = [B(0, 0, W, 36)], rest = kids.slice(1), isH = k => k.classList.contains('flh');
        // 층마다 줄 수 세기
        let rows = 0, nf = 0, cnt = 0; rest.forEach(k => { if(isH(k)){ nf++; rows += Math.ceil(cnt / 3); cnt = 0; } else cnt++; }); rows += Math.ceil(cnt / 3);
        const th = mc === 4 ? (H - 48 - nf * 44 - (nf - 1) * 24 - (rows - nf) * 12) / rows : Math.round(466 * W / 1812);   // 타일 높이는 폭을 따라(지도 그림 비율 유지)
        let y = 48, col = 0, open = false;
        rest.forEach(k => { if(isH(k)){ if(open) y += th + 24; o.push(B(0, y, W, 32)); y += 44; col = 0; open = false; }
          else { if(col === 3){ y += th + 12; col = 0; } o.push(B(col * (tw + 12), y, tw, th)); col++; open = true; } });
        return o; },
      'A-m': () => { const mh = m1, cy = mh + 24, cw = (W - 560 - 12 - 24) / 3, ch = (H - cy - 12) / 2, o = [B(0, 0, W, mh)];
        for(let i = 0; i < 6; i++) o.push(B((i % 3) * (cw + 12), cy + Math.floor(i / 3) * (ch + 12), cw, ch));
        return o.concat([B(W - 560, cy, 560, H - cy)]); },
      'A-d': () => dlMode === 'float' && !dlOk() ? [B(0, 0, W, m2), B(0, m2 + 24, W, 44), B(0, m2 + 80, W, H - m2 - 80), B(W - 24 - 400, m2 + 80, 400, null), B(W - 24 - 56, 24, 56, 56)] : dlOk() && dlMode === 'float' ? [B(0, 0, W, m2), B(0, m2 + 24, W, 44), B(0, m2 + 80, W, H - m2 - 80), B(W - 24 - 56, 24, 56, 56)].concat(dlOpen ? [B(W - 24 - 400, H - 24 - 56 - 16 - 100, 400, null)] : []) : dlClosed() ? [B(0, 0, W, m2), B(0, m2 + 24, W - 212, 44), B(0, m2 + 80, W, H - m2 - 80), B(W - 200, m2 + 30, 200, 32)] : [B(0, 0, W - 420 - 12, m2), B(0, m2 + 24, W - 420 - 12, 44), B(0, m2 + 80, W - 420 - 12, H - m2 - 80), B(W - 420, 0, 420, H)],
      'B-all': () => [B(0, 0, W, H)],
      'B-m': () => { const lh = Math.round(lw * 9 / 16); return [B(0, 0, 400, H), B(424, 0, lw, lh), B(W - 408, 0, 408, 270), B(W - 408, 282, 408, lh - 282), B(424, lh + 12, mw, H - lh - 12)]; },   // 라이브 16:9
      'B-d': () => [B(0, 0, 400, 36), B(0, 48, 400, H - 48), B(424, 0, lw, H), B(W - 408, 0, 408, 236), B(W - 408, 248, 408, null)]
    }[S.s + '-' + scr]();
    // 가로 B안 왼쪽 머리의 'Robot 01, 7/20곳 측정' 줄은 뺀다(로봇 칸이 같은 말을 한다)
    const sub = [...st.querySelectorAll('main.body span')].find(s => s.textContent === ((window.APRISM_ROBOT ? APRISM_ROBOT('r01') : 'Robot 01') + ', 7/20곳 측정')); if(sub) sub.remove();
    if(L.length !== kids.length) return inset();
    st.querySelectorAll('.v7c .gr svg').forEach(svg => { try { const b = svg.getBBox(); if(b.width && b.height){ svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.width} ${b.height}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.removeAttribute('width'); svg.removeAttribute('height'); } } catch(e) {} });
    const innA = S.s === 'A' && scr === 'd' && st.querySelector('.amap-in'); if(innA) innA.style.transform = mapT(true);
    kids.forEach((el, i) => { const b = L[i], s = el.style; s.left = (P + b.l).toFixed(1) + 'px'; s.top = (P + b.t).toFixed(1) + 'px'; s.right = ''; s.width = b.w.toFixed(1) + 'px'; s.height = b.h === null ? '' : b.h.toFixed(1) + 'px'; });
  }
  // 카드 그래프의 임계치 숫자(주의 40, 위험 70, 19, 22.8, 0.60 …)는 빼고 선만 남긴다(사용자 지정). '평균' 같은 값 설명은 그대로
  function graphA(x, W, H, inVal){
    return graphA1(x, W, H, inVal).replace(new RegExp('<text [^>]*fill="' + COL.t3 + '"[^>]*>(?!평균)[^<]*</text>', 'g'), '');
  }
  /* ---------- A안: 원래 구조 A(위 지도, 아래 감지 6종과 로봇) + 상세 A(지도와 탭) ---------- */
  // 본문 안 여백 12 에 맞춘 배율(화면들은 1788×976 기준으로 짜여 있다)
  const PAD = 12, FXc = (1836 - PAD * 2) / 1788, FYc = (1016 - PAD * 2) / 976, EASE = 'cubic-bezier(.2,.7,.2,1)';
  // [11/24 v8] 본문은 창 크기를 따라감(최소 1836 x 1016, safety-v8.css). 칸 자리와 지도 배율은 지금 본문 안쪽 크기(1920 x 1080 화면에서 1812 x 992)에서 셈
  function BOX(){ const b = st.querySelector('main.body'); return b ? {W:b.clientWidth - PAD * 2, H:b.clientHeight - PAD * 2} : {W:1812, H:992}; }
  const KM = () => { const {W, H} = BOX(); return Math.max(1, Math.min(W / 1812, H / 992)); };   // A안 지도 판 배율(1920 x 1080 = 1)
  const MH = small => Math.round((small ? 344 : 472) * KM());                                     // A안 지도 판 높이(미션별 472, 상세 344)
  /*
   * A안 지도 — 미션별과 상세가 같은 지도 하나를 쓴다. 상세에서는 판 높이만 476 → 340 으로 줄고 지도 그림이 그만큼 작아진다.
   * 화면을 갈아 끼우지 않고 지도가 줄어드는 것처럼 보이게, 넘어갈 때 앞 화면의 크기에서 시작해 새 크기로 옮긴다(morph).
   */
  const mapT = small => { const {W} = BOX(), s = FXc * KM() * (small ? 340 / 476 : 1), bw = small && !dlClosed() ? W - 432 : W; return `translateX(${((bw - 1788 * s) / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
  /*
   * 상세 지도 = 고른 감지의 지점만 — 위험 · 주의(넘은 곳), 완료(재고 정상 범위), 예정(아직 안 잰 곳). 다른 감지의 표시는 뺀다.
   * A안 지도(REFMAP)에는 지점 자리가 다섯 곳만 적혀 있어, 순회 길 위 자리(mini-routes)를 WP-07 · WP-04 두 점에 맞춰 옮겨 쓴다.
   */
  function refPos(n){
    const R = L(), at = s => { let i = 1; while(i < R.pts.length - 1 && R.cum[i] < s) i++;
      const a = R.pts[i - 1], b = R.pts[i], f = (s - R.cum[i - 1]) / ((R.cum[i] - R.cum[i - 1]) || 1); return [a[1] + (b[1] - a[1]) * f, -(a[0] + (b[0] - a[0]) * f)]; };
    const p7 = at(R.sAt[6]), p4 = at(R.sAt[3]), p = at(R.sAt[n - 1]), kk = (1312 - 916) / (p4[0] - p7[0]);
    return [916 + (p[0] - p7[0]) * kk, 298 + (p[1] - p7[1]) * kk];
  }
  // 표시마다 그 감지의 아이콘을 넣는다 — 어느 감지의 지점인지 표시만 보고 알게. 상태는 면으로: 위험 빨강, 주의 노랑, 완료 회색, 예정은 테만
  const mkIn = (x, c) => { const [st0, sz] = c.split(' '); return `<span class="ds-detect-mark is-${st0}${sz ? ' is-s' : ''}">${ico(x.ic)}</span>`; };
  const lg4 = x => [['crit','위험'],['warn','주의'],['done','완료'],['plan','예정']].map(([c, l]) => `<span class="ds-badge is-plain is-neutral ds-i-none is-mark">${mkIn(x, c + ' lgm')}${l}</span>`).join('');
  function detPins(){
    const x = KD[view], k = 1788 / 1804;
    const selW = wpData().w;
    const mk = (wp, cls, inner, label) => { const [px, py] = refPos(+wp.slice(3)); return `<span class="${cls}${wp === selW ? ' is-sel' : ''}" data-w="${wp}" style="left:${(px * k).toFixed(1)}px;top:${(py * k).toFixed(1)}px" role="button" tabindex="0" aria-label="${wp} ${label}, 이 지점 보기">${inner}</span>`; };
    return x.plan.map(w => mk(w, 'ds-detect-at', mkIn(x, 'plan'), x.k + ' 예정')).join('') + x.sp.filter(s => !isOver(x, s)).map(s => mk(s[0], 'ds-detect-at', mkIn(x, 'done'), x.k + ' 완료')).join('')
      + x.sp.filter(s => isOver(x, s)).map(s => mk(s[0], 'ds-detect-pin', `<span class="ds-detect-mark is-${x.st}">${ico(x.ic)}</span>`, WORD[x.st])).join('');
  }
  function mapA(small){
    let s = mapRef([24, 20, 1788, small ? 340 : 476]);
    if(small){ const x = KD[view];
      s = s.replace(/<span class="ds-detect-pin"[^>]*>(?:<span class="ds-detect-mark[^>]*><span class="i[^>]*><\/span><\/span>)*<\/span>/g, '').replace('<span class="abs ds-mapbar"', detPins() + '<span class="abs ds-mapbar"')
        .replace(/(<span class="abs ds-mapbar" style="left:24px;top:24px">)[^]*?<\/span><\/span>/, `$1<b>${view}</b><span class="ds-badge is-plain is-neutral ds-i-none">측정 ${x.sp.length}곳</span><span class="ds-badge is-plain is-neutral ds-i-none">예정 ${x.plan.length}곳</span></span><span class="abs ds-mapbar sv8-maplg">${lg4(x)}</span>`); }
    const open = s.indexOf('>') + 1, cut = s.indexOf('<span class="abs ds-mapbar"');
    return s.slice(0, open).replace('class="abs"', 'class="abs amap"') + `<div class="amap-in" style="transform:${mapT(small)}">` + s.slice(open, cut) + '</div>' + s.slice(cut);
  }
  function morph(from){
    const el = st.querySelector('.amap'), inn = el && el.querySelector('.amap-in'); if(!el) return;
    const was = from === 'd', hNow = el.style.height, wNow = el.style.width, tNow = inn.style.transform;
    el.style.height = MH(was) + 'px'; el.style.width = (was && !dlClosed() ? BOX().W - 432 : BOX().W) + 'px'; inn.style.transform = mapT(was);
    el.getBoundingClientRect();
    el.style.transition = 'height 420ms ' + EASE + ', width 420ms ' + EASE; inn.style.transition = 'transform 420ms ' + EASE;
    el.style.height = hNow; el.style.width = wNow; inn.style.transform = tNow;
    st.querySelectorAll('main.body > :not(.amap)').forEach(n => n.animate([{opacity:0, transform:`translateY(${was ? -56 : 56}px)`}, {opacity:1, transform:'none'}], {duration:420, easing:EASE}));
  }
  function missionOrigA(){
    let h = mapA(false);
    ['장비착용','누출감지','이상음향','온도감지','계기인식','부분방전'].forEach((k, i) => { h += det(KD[k], [24 + (i % 3) * 409, 520 + Math.floor(i / 3) * 241, 399, 231], 'A'); });
    h += `<div class="abs ds-robot-card" style="left:1252px;top:520px;width:560px;height:472px"><b class="ds-robot-card-name">Robot 01</b>
      <div class="ds-robot-card-top">${robotRows()}${robotFig()}</div>
      <div class="live ds-robot-card-live"><img src="${IMG['leak_ok.jpg']}" alt=((window.APRISM_ROBOT ? APRISM_ROBOT("r01") : "Robot 01") + " 전방 카메라 라이브")><span class="ds-badge is-onmap is-strong ds-i-dot is-live" style="left:12px;top:12px">라이브 전방 카메라</span></div></div>`;
    return h;
  }
  function detailOrigA(){ const x = KD[view];
    let h = mapA(true);
    h += `<div class="abs tabsx" style="left:24px;top:376px;right:24px"><button type="button" class="btn btn-secondary back" data-back>${ico('chevron-left')}돌아가기</button><span class="ds-tab-chip" role="tablist" aria-label="감지">${D.map(d => { const s = RQ[d.k] ? 'info' : d.st; return `<button type="button" class="ds-tab${d.k === view ? ' on' : ''}" role="tab" aria-selected="${d.k === view}" data-k="${d.k}">${ico(d.ic)}${d.k}${s !== 'ok' ? `<span class="ds-dot is-${s}" aria-hidden="true"></span>` : ''}</button>`; }).join('')}</span>
      <span style="flex:1"></span></div>`;
    h += `<div class="ds-detail" style="left:24px;top:440px;width:1348px;height:556px"><div class="ds-verdict">${chip(x.st, x.k)}<span class="ds-verdict-val">${x.head}</span><span class="ds-verdict-gap" style="color:${TXT[x.st]}">${x.gap}</span></div>${metaRow(x).replace('<span>발생 위치</span>', `<span>발생 위치<span class="qtip"><button type="button" class="icon-button is-xs" aria-label="기준 비교 보기" aria-describedby="qtip-b"><span class="i i-16" style="--i:var(--ic-info)" aria-hidden="true"></span></button><span class="qtip-b ds-pop" id="qtip-b" role="tooltip">${track(x)}</span></span></span>`)}
      <div class="ds-detail-cols" style="grid-template-columns:1.1fr 1fr">${photoOrNum(x)}<div class="ds-sec" style="gap:20px">${hist(x)}</div></div></div>`;
    if(x.st !== 'ok') return h + delta(x, [1392, 440, 420]);
    if(dlOpen) return h + delta(x, [1392, 440, 420]).replace('DELTA 조치 제안</span></div>', `DELTA 조치 제안</span><button type="button" class="icon-button is-xs dlx" data-dlc aria-label="DELTA 닫기">${ico('chevron-right')}</button></div>`);
    return h + `<button type="button" class="abs btn btn-secondary dlh" data-dlo aria-label="DELTA 열기, 조치 필요 없음">${ico('chevron-left')}${ico('delta')}DELTA<span class="dlh-sub">조치 필요 없음</span></button>`;
  }
  // 가로 B안 상세 — 작은 지도도 고른 감지의 지점만(넘은 곳 세모는 지도 그림이, 완료 · 예정 점은 위에 얹는다)
  function detailB2(){ const x = KD[view];
    const selW = wpData().w;
    const dot = (w, c, l) => { const q = wpPos(+w.slice(3)); return `<span class="ds-detect-at${w === selW ? ' is-sel' : ''}" data-w="${w}" style="left:${q.u}%;top:${q.v}%" role="button" tabindex="0" aria-label="${w} ${x.k} ${l}, 이 지점 보기">${mkIn(x, c + ' sm')}</span>`; };
    const dots = x.plan.map(w => dot(w, 'plan', '예정')).join('') + x.sp.filter(s => !isOver(x, s)).map(s => dot(s[0], 'done', '완료')).join('')
      + x.sp.filter(s => isOver(x, s)).map(s => dot(s[0], x.st, WORD[x.st])).join('');
    return detailWideB().replace('<div class="mp-box">', '<div class="mp-box only">' + dots)
      .replace('<div class="ds-map-panel-head"><b>지도</b>', `<div class="ds-map-panel-head"><b>${view} 지점</b>`)
      .replace(/<span class="lg is-tight"><span class="ds-badge is-plain is-crit">위험<\/span><span class="ds-badge is-plain is-warn">주의<\/span><\/span>/, `<span class="lg is-tight">${lg4(x)}</span>`);
  }
  /*
   * 상세의 지점 고르기 — 한 감지는 한 미션에서 여러 지점을 잰다(미션별 카드의 3/6). 처음에는 대표 지점(넘은 곳)을 열고,
   * 판 위 지점 줄이나 지도 표시를 누르면 그 지점의 값 · 사진 · 이력으로 바뀐다. 예정 지점은 '아직 측정 전'.
   * 대표가 아닌 지점의 시각은 safety-v7 순회 시각, 지난 순회 값은 시안용 예시.
   */
  let wpSel = null;
  const WPT = {'WP-01':'09:31','WP-02':'09:52','WP-03':'10:11','WP-04':'10:12','WP-05':'10:14','WP-06':'10:15','WP-07':'10:16'};
  const wpVal = (x, s) => x.g === 'count' ? s[1] + '명' : x.range ? s[1].toFixed(2) + ' MPa' : s[1] + (x.u || '');
  function wpData(){
    const x = D.find(d => d.k === view), w = wpSel && (x.sp.some(s => s[0] === wpSel) || x.plan.includes(wpSel)) ? wpSel : x.wp;
    if(w === x.wp) return {w, kind:'rep', x};
    if(x.plan.includes(w)) return {w, kind:'plan', x};
    const s = x.sp.find(q => q[0] === w), v = s[1], vs = wpVal(x, s);
    const near = f => x.g === 'count' ? '미착용 0명' : x.range ? (v * f).toFixed(2) + ' MPa' : (Math.round(v * f * 10) / 10) + (x.u || '');
    return {w, kind:'ok', s, x:Object.assign({}, x, {wp:w, at:'', t:WPT[w] || '', st:'ok', v, head:x.head.replace(/[\d.]+.*$/, '') + vs, gap:'기준 이내', img:x.k === '누출감지' ? 'leak_ok.jpg' : null,
      hist:[['10/31 09:00', near(.96), 'ok'], ['10/31 14:00', near(1.03), 'ok'], ['11/01 09:00', near(.99), 'ok']]})};
  }
  function wpRow(sel){
    const x = D.find(d => d.k === view), all = x.sp.map(s => ({w:s[0], s})).concat(x.plan.map(w => ({w}))).sort((a, b) => a.w < b.w ? -1 : 1);
    return `<div class="ds-tab-line ds-detail-tabs" role="tablist" aria-label="${x.k} 지점">${all.map(o => { const c = !o.s ? 'plan' : isOver(x, o.s) ? x.st : 'done';
      return `<button type="button" role="tab" aria-selected="${o.w === sel}" class="ds-tab wpc${o.w === sel ? ' on' : ''}${c === 'plan' ? ' is-plan' : ''}" data-w="${o.w}" aria-label="${o.w} ${o.s ? wpVal(x, o.s) : '예정'}">${c === 'plan' ? '' : c === 'done' ? '<span class="ds-dot is-neutral" aria-hidden="true"></span>' : `<span class="ds-dot is-${c}" aria-hidden="true"></span>`}<b>${o.w}</b></button>`; }).join('')}</div>`;
  }
  function wpWrap(build){
    const info = wpData(), k = view, x0 = info.x, H0 = build();
    let H1 = H0;
    if(info.kind === 'ok'){ const o = KD[k], rq = RQ[k]; KD[k] = info.x; delete RQ[k]; try { H1 = build(); } finally { KD[k] = o; if(rq) RQ[k] = rq; } }
    const seg = H => { const a = H.indexOf('<div class="ds-detail"'), d = H.indexOf('<div class="dl"'), m = H.indexOf('<div class="abs" style="left:1404px', a), b = m > a ? m : d; return {a, b, d, pnl:H.slice(a, b), dl:H.slice(d)}; };
    const s0 = seg(H0), s1 = seg(H1);
    let pnl = s1.pnl, dl = s1.dl;
    const none = (t, sub) => dl.slice(0, dl.indexOf('>') + 1) + `<div class="dl-c ds-delta-card">${dHead()}<div class="ds-delta-lead">${t}</div><span class="memo">${sub}</span></div></div>`;
    if(info.kind === 'plan'){ const open = pnl.indexOf('>') + 1, n = +info.w.slice(3) - 8;
      pnl = pnl.slice(0, pnl.indexOf('<div class="ds-verdict">')) + wpRow(info.w) + `<div class="ds-empty"><b>${info.w} ${n === 0 ? '지금 측정 중' : '아직 측정 전'}</b><span>${n === 0 ? '측정이 끝나면 결과 표시' : '로봇이 도착하면 결과 표시, 지금 지점에서 ' + n + '곳 뒤'}</span></div></div>`;
      if(open < 1) pnl = s1.pnl;
      dl = none(n === 0 ? '측정 중' : '아직 측정 전', '측정이 끝나면 조치 제안 표시'); }
    else { pnl = pnl.replace('<div class="ds-verdict">', wpRow(info.w) + '<div class="ds-verdict">');
      if(info.kind === 'ok'){
        pnl = pnl.replace('<b>요청 전</b>', '<b>조치 필요 없음</b>').replace('<span class="a">요청 전</span>', '<span class="a"></span>');
        if(!info.x.img) pnl = pnl.replace(/<div class="ds-photo">[^]*?<\/div>/, '<div class="ds-photo is-none">이 지점 사진은 시안에 없음</div>');
        if(x0.g === 'count') pnl = pnl.replace(/<div class="ds-limit">[^]*?<\/small><\/div>/, `<div class="ds-limit"><div style="display:flex;align-items:center;gap:8px">${'<svg width="15" height="36" viewBox="0 0 30 73" aria-hidden="true" style="display:block;flex:none"><g fill="#AFB7C8"><path d="M9.20018 14.9976C9.44815 14.9682 9.79545 14.9643 10.0505 14.964C13.0675 14.9599 16.0847 14.9611 19.1016 14.959C20.0124 14.9583 20.9752 14.9998 21.8617 15.2155C26.4975 16.3438 29.4357 20.2625 29.4746 24.9862L29.4858 38.2888L29.4891 42.1378C29.4895 42.8604 29.5532 43.8261 29.4212 44.5201C28.9669 47.1665 25.2823 47.4545 24.3944 45.0367C24.0661 44.1422 24.2112 41.3281 24.2122 40.2548L24.2112 30.3876L24.2183 27.27C24.2192 26.7762 24.3288 25.3361 23.9977 25.0167C23.8633 24.8881 23.6835 24.8185 23.4975 24.8235C23.2255 24.8305 23.0676 24.9997 22.9852 25.2437C22.8288 25.7087 22.9211 31.5609 22.9211 32.4071L22.9262 57.5737L22.9328 64.9228C22.9332 65.8571 22.9843 67.9336 22.8724 68.7971C22.7759 69.6036 22.4186 70.3566 21.8547 70.9415C21.1738 71.6402 20.2428 72.0397 19.2673 72.0519C18.2736 72.0603 17.3182 71.6702 16.6148 70.9682C15.2699 69.6279 15.5157 67.9626 15.5167 66.2163L15.5204 61.9772L15.5199 46.613C15.5171 45.8679 15.6309 42.5546 15.3738 42.1472C15.2656 41.973 15.09 41.8517 14.8887 41.8119C14.6854 41.7688 14.4733 41.8119 14.3023 41.9309C13.7914 42.2938 13.9633 43.9418 13.9633 44.5843L13.9642 48.9447L13.9652 63.2337V66.6425C13.9652 68.4899 14.1614 70.0808 12.4807 71.3143C11.6877 71.9081 10.689 72.1568 9.71017 72.0051C8.32716 71.7868 7.18604 70.8062 6.76241 69.4715C6.46841 68.5391 6.56207 65.8782 6.56254 64.7397L6.56511 59.5233L6.56085 36.8905L6.56212 29.4358C6.56244 28.1378 6.57031 26.8298 6.55364 25.5322C6.54329 25.3533 6.55064 25.2398 6.44682 25.0858C6.15174 24.6483 5.43457 24.7415 5.33473 25.2926C5.25582 25.7281 5.27881 26.1924 5.28181 26.6495L5.28879 38.5005L5.29164 42.1819C5.29239 42.7986 5.32124 43.7952 5.25212 44.3773C5.20028 44.8526 5.01797 45.3036 4.72537 45.6815C4.28221 46.2454 3.63304 46.6092 2.92112 46.6935C2.2358 46.7788 1.54585 46.576 1.01535 46.1339C-0.137904 45.1715 0.00792682 43.9038 0.0040867 42.5617C0.00263495 42.0475 0.0082997 41.5328 0.00989194 41.0186L0.0182297 35.3277L0.0142023 28.0679C0.0127037 26.5954 -0.0655507 24.2824 0.209954 22.8812C0.534725 21.2578 1.25896 19.7409 2.31715 18.4677C4.0932 16.348 6.47384 15.2278 9.20018 14.9976Z"/><path d="M14.4937 0.00469347C18.213 -0.132755 21.3417 2.7655 21.4883 6.48414C21.6354 10.2028 18.7454 13.339 15.0271 13.4956C11.2952 13.6527 8.14512 10.7497 7.99756 7.0175C7.85004 3.28528 10.7612 0.14261 14.4937 0.00469347Z"/></g></svg>'.repeat(info.s[2] || 2)}<span style="margin-left:8px;color:var(--t2)">작업자 ${info.s[2] || 2}명 모두 착용</span></div><small>기준 미착용 0명, 1명 이상이면 위험</small></div>`);
        dl = none('조치 필요 없음', '정상, 다음 순회에서 다시 측정'); } }
    return H0.slice(0, s0.a) + pnl + H0.slice(s0.b, s0.d) + dl;
  }
  // [v8] 껍데기 = 실제 v7 상단바와 GNB(HTML). 여기서는 상단바 미션 탭(.sb-tabs, mission-tabs-v6.js 와 같은 짜임)과 본문만 그림
  const SEV = {M1:'crit', M2:'warn', M3:'crit'};
  function tabs(on){
    const nav = document.querySelector('[data-sv8-tabs]'); if(!nav) return;
    const tb = (attr, no, name, isOn, s) => `<button type="button" class="sb-tab${isOn ? ' is-on' : ''}" ${attr}${isOn ? ' aria-current="page"' : ''} title="${no ? no + ' ' : ''}${name}${s ? (s === 'crit' ? ', 위험 알림 있음' : ', 주의 알림 있음') : ''}">${no ? `<span class="sb-tab-no t-label-1">${no}</span>` : ''}<span class="sb-tab-name t-label-1">${name}</span>${s ? `<span class="i i-16 sb-tab-sev" data-sev="${s === 'crit' ? 'critical' : 'warning'}" style="--i:var(--ic-${s === 'crit' ? 'error' : 'warning'})" aria-hidden="true"></span>` : ''}</button>`;
    nav.innerHTML = tb('data-go="all"', '', '전체 미션', on === 'all') + MV().map(m => tb((m.id === 'M1' ? 'data-go="m"' : `data-m="${m.id}"`) + ` data-mission="${m.n}"`, m.id, m.n, m.id === 'M1' && on !== 'all', SEV[m.id])).join('');
  }
  function shell3(inner, on){ tabs(on); return `<main class="body" aria-label="안전진단">${inner}</main>`; }
  const st = document.getElementById('st');
  // [v8] 처음 화면 = 주소 #all(전체 미션) · #detail(상세) · 그 밖(미션별). 고른 감지는 이 탭에서만 기억
  const HKEY = {all:'#all', m:'', d:'#detail'};
  let scr = location.hash === '#all' ? 'all' : location.hash === '#detail' ? 'd' : 'm';
  try { const o = JSON.parse(sessionStorage.getItem('aprism.sv8') || '{}'); if(KD[o.view]) view = o.view; } catch(e) {}
  const keep = () => { try { sessionStorage.setItem('aprism.sv8', JSON.stringify({view})); } catch(e) {} if(location.hash !== HKEY[scr]) history.replaceState(null, '', location.pathname + location.search + HKEY[scr]); };
  function render(){
    const A = S.s === 'A'; st.dataset.s = S.s; st.dataset.scr = scr;
    const h = scr === 'all' ? (A ? allA() : allB()) : scr === 'm' ? (A ? missionOrigA() : missionB()) : wpWrap(A ? detailOrigA : detailB2);
    st.innerHTML = shell3(h, scr === 'all' ? 'all' : 'm'); keep();
    inset2();
    drawHG();
    pinTiles();
  }
  /*
   * 본문 안 여백을 실제 안전진단 화면(safety-v7) 왼쪽 판과 같게 — 사방 12(시안은 좌우 24, 위아래 20 이라 더 넓었다).
   * 화면들은 1788×976 기준으로 짜여 있어, 본문 바로 아래 칸들의 자리와 크기를 새 안쪽 크기(1812×992)에 맞춰 옮긴다. 칸 안은 그대로 흐른다.
   */
  function inset(){
    const P = PAD, FX = FXc, FY = FYc, px = v => parseFloat(v);
    st.querySelectorAll('main.body > [style]').forEach(el => { const s = el.style;
      if(s.top) s.top = (P + (px(s.top) - 20) * FY).toFixed(1) + 'px';
      if(s.height) s.height = (px(s.height) * FY).toFixed(1) + 'px';
      if(s.left) s.left = (P + (px(s.left) - 24) * FX).toFixed(1) + 'px';
      if(s.width) s.width = (px(s.width) * FX).toFixed(1) + 'px';
      if(s.right) s.right = P + 'px'; });
  }
  function toast(m){ let t = document.querySelector('.toast'); if(!t){ t = document.createElement('div'); t.className = 'toast sv8-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; t.hidden = false; clearTimeout(tT); tT = setTimeout(() => { t.hidden = true; }, 2400); }
  const show = s => { const from = scr; scr = s; render();
    if(S.s === 'B' && from !== s && !matchMedia('(prefers-reduced-motion: reduce)').matches){
      if(s === 'all') st.querySelectorAll('.v7s > *, .v7l, .v7cr').forEach((n, i) => n.animate([{opacity:0, transform:'translateY(16px)'}, {opacity:1, transform:'none'}], {duration:360, delay:Math.min(i, 12) * 28, easing:EASE, fill:'backwards'}));
      else if(from === 'all') st.querySelectorAll('main.body > *').forEach((n, i) => n.animate([{opacity:0, transform:'translateY(20px)'}, {opacity:1, transform:'none'}], {duration:360, delay:i * 40, easing:EASE, fill:'backwards'})); }
    if(S.s === 'A' && from !== s && from !== 'all' && s !== 'all' && !matchMedia('(prefers-reduced-motion: reduce)').matches) morph(from);
    if(S.s === 'B' && from !== 'all' && s !== 'all' && !matchMedia('(prefers-reduced-motion: reduce)').matches) morphB(from, s); };
  function morphB(from, to){
    const P = 12, W = BOX().W, keep = el => el.classList.contains('lst') || (parseFloat(el.style.left) === P + W - 408 && parseFloat(el.style.top) === P);   // 목록, 작은 지도
    if(from === to){ const p = st.querySelector('main.body > .ds-detail'); if(p) p.animate([{opacity:.4}, {opacity:1}], {duration:180, easing:EASE}); return; }
    const dx = to === 'd' ? 24 : -24, lst = st.querySelector('main.body > .lst');
    if(lst) lst.animate([{transform:`translateY(${to === 'd' ? -48 : 48}px)`}, {transform:'none'}], {duration:320, easing:EASE});   // 상세에서는 돌아가기 줄만큼(48) 내려감
    [...st.querySelectorAll('main.body > *')].filter(el => !keep(el)).forEach((el, i) => el.animate([{opacity:0, transform:`translateX(${dx}px)`}, {opacity:1, transform:'none'}], {duration:320, delay:i * 40, easing:EASE, fill:'backwards'}));
    st.querySelectorAll('.lst .det:not(.sel)').forEach(el => el.animate(to === 'd' ? [{opacity:1}, {opacity:.45}] : [{opacity:.45}, {opacity:1}], {duration:240, easing:EASE}));
    const sel = st.querySelector('.lst .det.sel'); if(sel) sel.animate([{backgroundColor:'rgba(78,87,106,0)'}, {backgroundColor:'#4E576A'}], {duration:240, easing:EASE});
  }
  function act(e){
    const dlo = e.target.closest('[data-dlo]'), dlc = e.target.closest('[data-dlc]');
    if(dlo || dlc){ const sel = ['.amap', '.tabsx', 'main.body > .ds-detail'], old = sel.map(q => { const n = st.querySelector(q); return n && n.style.width; }), oi = st.querySelector('.amap-in'), ot = oi && oi.style.transform;
      dlOpen = !!dlo; render();
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        sel.forEach((q, i) => { const n = st.querySelector(q); if(n && old[i] && old[i] !== n.style.width) n.animate([{width:old[i]}, {width:n.style.width}], {duration:320, easing:EASE}); });
        const ni = st.querySelector('.amap-in'); if(ni && ot) ni.animate([{transform:ot}, {transform:ni.style.transform}], {duration:320, easing:EASE});
        const d = st.querySelector(dlOpen ? 'main.body > .dl' : 'main.body > .dlh'); if(d) d.animate(dlMode === 'float' ? [{opacity:0, transform:'translateY(-8px) scale(.94)'}, {opacity:1, transform:'none'}] : [{opacity:0, transform:'translateX(24px)'}, {opacity:1, transform:'none'}], {duration:dlMode === 'float' ? 220 : 320, easing:EASE}); }
      return; }
    if(e.target.closest('[data-back]')) return show('m');
    const rq = e.target.closest('[data-req]'); if(rq){ const k = rq.dataset.req; RQA[k] = [...st.querySelectorAll('.ds-act')].filter(a => a.querySelector('input:checked')).map(a => a.querySelector('b').textContent); RQ[k] = 'wait'; toast('현장 조치 요청 보냄'); render(); setTimeout(() => { if(RQ[k] === 'wait'){ RQ[k] = 'work'; toast('현장에서 요청 확인, 조치 중'); render(); } }, 5000); return; }
    const hpb = e.target.closest('[data-hpp]'); if(hpb){ hp = hpb.dataset.hpp; return render(); }
    const wb = e.target.closest('[data-w]'); if(wb && scr === 'd'){ wpSel = wb.dataset.w; return render(); }
    const cw = e.target.closest('[data-cw]'); if(cw){ view = cw.dataset.sk; wpSel = cw.dataset.cw; return show('d'); }
    const vc = e.target.closest('.v7c[data-k]');
    if(vc && !vc.dataset.go && !matchMedia('(prefers-reduced-motion: reduce)').matches){ const wrap = st.querySelector('.v7a'); vc.classList.add('pick'); wrap.classList.add('go'); vc.dataset.go = '1'; setTimeout(() => vc.click(), 200); return; }
    const k = e.target.closest('[data-k]'); if(k){ dlOpen = false; view = k.dataset.k; wpSel = null; return show('d'); }
    const m = e.target.closest('[data-m]'); if(m){ if(m.dataset.m === 'M1') return show('m'); return toast(('이 시안은 M1 ' + (window.APRISM_MISSION ? APRISM_MISSION('m1') : '정기 순회 점검') + '만 열림')); }
    const g = e.target.closest('[data-go]'); if(g) show(g.dataset.go);
  }
  st.addEventListener('click', act);
  function sxHover(el){
    st.querySelectorAll('.lst .det.hl').forEach(n => n.classList.remove('hl')); st.querySelectorAll('.mkh').forEach(n => n.remove()); st.querySelectorAll('.sxc.hv').forEach(n => n.classList.remove('hv'));
    if(!el) return; el.classList.add('hv');
    const k = el.dataset.sk, w = el.dataset.cw, x = KD[k], card = st.querySelector('.lst .det[data-k="' + k + '"]'); if(card) card.classList.add('hl');
    const box = st.querySelector('.mp-box'); if(box){ const q = wpPos(+w.slice(3)); box.insertAdjacentHTML('beforeend', `<span class="ds-detect-at is-sel mkh" style="left:${q.u}%;top:${q.v}%">${mkIn(x, el.dataset.cs + ' sm')}</span><span class="ds-badge is-onmap is-strong mkl mkh" style="left:${q.u}%;top:${q.v}%">${w}</span>`); }
  }
  function cardHover(el){
    st.classList.remove('hk'); st.querySelectorAll('.ds-detect-pin.hot, .ds-detect-pin > .ds-detect-mark.hot').forEach(n => n.classList.remove('hot'));
    if(!el) return; const k = el.dataset.k; st.classList.add('hk');
    st.querySelectorAll('.ds-detect-pin > .ds-detect-mark[data-k="' + k + '"]').forEach(p => { p.classList.add('hot'); p.closest('.ds-detect-pin') && p.closest('.ds-detect-pin').classList.add('hot'); });
  }
  const hov = e => { if(scr !== 'm') return; if(S.s === 'B') sxHover(e.target.closest('.sxc')); else cardHover(e.target.closest('.det.lc[data-k]')); };
  st.addEventListener('mouseover', hov); st.addEventListener('focusin', hov);
  st.addEventListener('mouseleave', () => { sxHover(null); cardHover(null); });
  st.addEventListener('keydown', e => { const c = e.target.closest('span.sxc'); if(c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); c.click(); } });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && scr === 'd') show('m'); });
  const nav = document.querySelector('[data-sv8-tabs]'); if(nav) nav.addEventListener('click', act);
  render();
  // 목차(index.html)에서 같은 화면의 #all, #detail 로 오면 그 화면으로
  window.addEventListener('hashchange', () => { const s2 = location.hash === '#all' ? 'all' : location.hash === '#detail' ? 'd' : 'm'; if(s2 !== scr) show(s2); });
  // 창 크기가 바뀌면 칸 자리, 지도 배율, 그래프를 다시 셈
  let rzT; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(render, 150); });
})();
