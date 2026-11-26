// v7 화면을 실제로 띄워 칩과 버튼의 높이, 패딩, 간격, 라운딩이 규칙(ds-rules.json) 안에 있는지 잰다. 화면은 찍지 않는다.
// 쓰기: node tools/ds-check/ds-check-screens.cjs [aprism-web 폴더]   (기본: 이 저장소)
//       ONLY="관제|알림" node tools/ds-check/ds-check-screens.cjs   (일부 화면만)
// 준비: tools/ds-check 에서 npm install 한 번. 브라우저는 BROWSER 환경 변수, 없으면 설치된 Edge 또는 Chrome
// 결과: 화면에 요약, out/ds-check-screens.md 에 전체 목록
const fs = require('fs'); const path = require('path'); const http = require('http');
const puppeteer = require('puppeteer-core');
const RULES = require('./ds-rules.json'); const inPage = require('./ds-measure.js');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
if (!fs.existsSync(path.join(ROOT, 'screens'))) { console.log('screens 폴더가 없음: ' + ROOT); process.exit(1); }
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const PORT = 5331; const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms)); const ev = (p, fn) => p.evaluate(fn).catch(() => {});
const STATES = [
  ['관제', 'main-v7.html#critical'],
  ['관제 알림 카드', 'main-v7.html#critical', async p => { await ev(p, () => document.querySelector('[data-ah-list] .ah-item').click()); await sleep(1800); }],
  ['관제 Delta', 'main-v7.html#critical', async p => { await ev(p, () => document.querySelector('[data-delta3] [data-ai-toggle]').click()); await sleep(1500); await ev(p, () => { const i = document.querySelector('[data-ai-ask]'); i.focus(); i.click(); }); await sleep(300); await p.keyboard.type('지금 위험한 곳 알려줘'); await p.keyboard.press('Enter'); await sleep(6000); }],
  ['알림센터', 'alert-center-v7.html'], ['알림센터 처리 완료', 'alert-center-v7.html?tab=done'],
  ['미션설정', 'mission-setup-v7.html'], ['사전 점검', 'mission-precheck-v7.html'],
  ['안전진단', 'safety-v7.html'], ['안전진단 상세', 'safety-v7.html#detail'],
  ['안전진단 v8-A 전체 미션', 'safety-v8-a.html#all'], ['안전진단 v8-A 미션별', 'safety-v8-a.html'], ['안전진단 v8-A 상세', 'safety-v8-a.html#detail'],
  ['안전진단 v8-B 전체 미션', 'safety-v8-b.html#all'], ['안전진단 v8-B 미션별', 'safety-v8-b.html'], ['안전진단 v8-B 상세', 'safety-v8-b.html#detail'],
  ['보고서', 'report-v7.html#day'], ['보고서 내보내기', 'report-v7.html#modal'],
];
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  let f = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0]))); if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
});
function findBrowser() {
  const c = [process.env.BROWSER, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const f = c.find(p => fs.existsSync(p)); if (!f) { console.log('브라우저를 찾지 못함. BROWSER 환경 변수에 Edge나 Chrome 경로를 넣어 주세요'); process.exit(1); } return f;
}
const SPACE = new Set(RULES.space);
const H = { 칩: new Set([...Object.values(RULES.chip.heights), 18]), 버튼: new Set(Object.values(RULES.button.heights)), 아이콘: new Set(Object.keys(RULES.button.iconOnly).map(Number)) };
(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const b = await puppeteer.launch({ executablePath: findBrowser(), headless: 'new' });
  const rows = []; const seen = new Set();
  for (const [name, url, act] of STATES) {
    if (ONLY && !ONLY.test(name)) continue;
    const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
    await p.setRequestInterception(true); p.on('request', r => (/script\.google|googleusercontent/.test(r.url()) ? r.abort() : r.continue()));
    const q = url.includes('?') ? url.replace('?', '?theme=light&') : url.replace(/(#|$)/, '?theme=light$1');
    await p.goto(`http://127.0.0.1:${PORT}/screens/` + q, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
    await sleep(/main|mission/.test(url) ? 2500 : 1500); if (act) await act(p);
    const els = await p.evaluate(inPage); await p.close();
    for (const e of els) {
      if (e.k === '입력') continue;
      const iconOnly = e.k === '버튼' && !e.text; const kind = e.k === '칩' ? '칩' : iconOnly ? '아이콘' : e.k === '버튼' ? '버튼' : null;
      const why = [];
      if (kind && !H[kind].has(Math.round(e.h))) why.push(`높이 ${Math.round(e.h)}`);
      const pads = [...new Set(e.p.map(v => Math.round(v * 10) / 10))].filter(v => !SPACE.has(v)); if (pads.length) why.push(`패딩 ${pads.join(', ')}`);
      if (e.gap && !SPACE.has(e.gap)) why.push(`간격 ${e.gap}`);
      if (e.rad && !(RULES.radius.includes(e.rad) || e.rad >= e.h / 2)) why.push(`라운딩 ${e.rad}`);
      if (!why.length) continue;
      const key = [e.t, e.text, why.join()].join('|'); if (seen.has(key)) continue; seen.add(key);
      rows.push({ name, what: `${e.k === e.t.split(' ')[0] ? e.t : e.k + ', ' + e.t}`, text: e.text || '(아이콘)', size: `${Math.round(e.w)}×${Math.round(e.h)}`, why: why.join('; ') });
    }
    console.log(name, '완료');
  }
  await b.close(); server.close();
  const c = {}; for (const r of rows) for (const w of r.why.split('; ')) { const k = w.split(' ')[0]; c[k] = (c[k] || 0) + 1; }
  console.log(`규칙 밖 칩과 버튼 ${rows.length}가지: ` + Object.entries(c).map(([k, v]) => `${k} ${v}`).join(', '));
  const md = [`# 화면 규칙 검사 (${new Date().toISOString().slice(0, 10)})`, '', `기준: ds-rules.json (${RULES.updated}). 검사 폴더: ${ROOT}`, '',
    '| 화면 | 종류 | 글자 | 너비×높이 | 규칙 밖 값 |', '|---|---|---|---|---|', ...rows.map(r => `| ${r.name} | ${r.what} | ${r.text.replace(/\|/g, ' ')} | ${r.size} | ${r.why} |`)].join('\n');
  fs.writeFileSync(path.join(OUT, 'ds-check-screens.md'), md);
  console.log('전체 목록: ' + path.join(OUT, 'ds-check-screens.md'));
})();
