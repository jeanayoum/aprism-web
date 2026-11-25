// 브랜딩 화면 검사 — v7 화면을 실제로 띄워, v7 전용이 아닌 예전 판 공용 규칙(v6.css, v3.css, monitor.css 등)이 v7 화면에서 이겨
// 토큰 밖 파랑을 칠하고 있는 곳을 찾는다. brand-check.cjs(파일만 읽음)는 선택자에 ver-7 이 있는 규칙만 보므로 이 경우를 못 잡는다.
// 예: 11/24 라이트 Delta 톤 — v6.css 의 :root[data-theme][data-delta][data-glow] body.ver-6.v2-2.v3 .delta3 { --tone-c: …#4A7FD6… } 가
//     v7 화면(body 에 ver-6 도 붙음)에서 v7 규칙을 이기고 있었다.
// 쓰기: node tools/ds-check/brand-check-screens.cjs [aprism-web 폴더]   (2~3분, 화면은 찍지 않음)
//       ONLY="관제|알림" node tools/ds-check/brand-check-screens.cjs   (일부 화면만)
// 준비: tools/ds-check 에서 npm install 한 번(ds-check-screens 와 같음). 브라우저는 BROWSER 환경 변수, 없으면 설치된 Edge 또는 Chrome
// 결과: 화면에 요약, out/brand-check-screens.md 에 전체 목록. 고치지 않고 보고만 한다
const fs = require('fs'); const path = require('path'); const http = require('http');
const puppeteer = require('puppeteer-core');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
if (!fs.existsSync(path.join(ROOT, 'screens'))) { console.log('screens 폴더가 없음: ' + ROOT); process.exit(1); }
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const PORT = 5332; const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms)); const ev = (p, fn) => p.evaluate(fn).catch(() => {});
// [이름, 주소, 손댈 일] — 다크 · 라이트 둘 다 본다
const BASE = [
  ['관제', 'main-v7.html'],
  ['관제 Delta 펼침', 'main-v7.html', async p => { await ev(p, () => document.querySelector('[data-delta3] [data-ai-toggle], .delta3-plus').click()); await sleep(1500); }],
  // 관제 시연은 위험 단계로 열린다 — Delta 판 보통 · 주의 단계 색도 보려고 단계를 바꿔 본다(11/24 라이트 Delta 톤은 보통 단계에서만 보였음)
  ['관제 Delta 보통 단계', 'main-v7.html', async p => { await ev(p, () => document.querySelectorAll('.delta3').forEach(d => d.classList.remove('is-critical', 'is-warning'))); await sleep(300); }],
  ['관제 Delta 주의 단계', 'main-v7.html', async p => { await ev(p, () => document.querySelectorAll('.delta3').forEach(d => { d.classList.remove('is-critical'); d.classList.add('is-warning'); })); await sleep(300); }],
  ['관제 챗봇형', 'main-v7-chat.html'], ['관제 가로형', 'main-v7-wide.html'],
  ['전체 미션', 'building-v7.html'],
  ['알림센터', 'alert-center-v7.html'], ['알림센터 처리 완료', 'alert-center-v7.html?tab=done'],
  ['미션설정', 'mission-setup-v7.html'], ['사전 점검', 'mission-precheck-v7.html'],
  ['안전진단', 'safety-v7.html'], ['보고서', 'report-v7.html'],
  ['로그인', 'login-v2.html'],
];
const STATES = [];
for (const [n, u, a] of BASE) { STATES.push([n + ' · 다크', u, a]); STATES.push([n + ' · 라이트', u.includes('?') ? u.replace('?', '?theme=light&') : u + '?theme=light', a]); }
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const f = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0]))); if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
});
function findBrowser() {
  const c = [process.env.BROWSER, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const f = c.find(p => fs.existsSync(p)); if (!f) { console.log('브라우저를 찾지 못함. BROWSER 환경 변수에 Edge나 Chrome 경로를 넣어 주세요'); process.exit(1); } return f;
}

// 화면 안에서 도는 검사: 예전 판 규칙 중 토큰 밖 파랑을 적은 선언이 v7 화면의 실제 요소에서 이기고 있는지
function inPage() {
  const SKIP_SHEET = /\/(tokens|icons-outline|palette-neutral|i18n-en)\.css/;
  const V7SEL = /ver-7|ds-auth|\.ds-/;
  const body = document.body, cs = getComputedStyle(body);
  const probe = document.createElement('i'); probe.style.display = 'none'; body.appendChild(probe);
  const norm = c => { probe.style.color = ''; probe.style.color = c; return probe.style.color ? getComputedStyle(probe).color : null; };
  // v7 파랑 램프(이 화면 · 테마에서 실제 값)
  const ramp = new Set(); ['50', '100', '200', '300', '400', '500', '600', '650', '700', '750', '800', '900', '950'].forEach(k => { const v = cs.getPropertyValue('--color-blue-' + k).trim(); if (v) { const n = norm(v); if (n) ramp.add(n); } });
  const hsl = rgb => { const m = rgb.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2; if (!d) return { h: 0, s: 0, l }; const s = d / (1 - Math.abs(2 * l - 1)); let H = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return { h: (H * 60 + 360) % 360, s, l }; };
  const isBlue = rgb => { const c = hsl(rgb); return c && c.s > 0.35 && c.l > 0.2 && c.l < 0.9 && c.h >= 190 && c.h <= 265; };
  const out = [];
  const walk = (rules, file) => {
    for (const r of rules) {
      if (r.cssRules && !r.selectorText) { walk(r.cssRules, file); continue; }
      if (!r.selectorText || !r.style) continue;
      const sel = r.selectorText; if (V7SEL.test(sel)) continue;
      for (let i = 0; i < r.style.length; i++) {
        const prop = r.style[i]; const val = r.style.getPropertyValue(prop); if (!val || /var\(/.test(val) && !/#[0-9a-f]{3,6}\b|rgb/i.test(val)) continue;
        const cols = (val.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g) || []).map(norm).filter(Boolean).map(c => c.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/, 'rgb($1, $2, $3)'));
        const bad = cols.filter(c => isBlue(c) && !ramp.has(c)); if (!bad.length) continue;
        // 이 선언이 실제로 이기는 요소가 있는가
        const parts = sel.split(',').map(s => s.trim());
        let hit = 0, sample = '';
        for (const p0 of parts) {
          const pseudo = (p0.match(/::?(before|after)$/) || [])[0] || null; const base = p0.replace(/::?(before|after)$/, '');
          let els = []; try { els = [...document.querySelectorAll(base)].slice(0, 20); } catch (e) { continue; }
          for (const el of els) {
            const got = getComputedStyle(el, pseudo).getPropertyValue(prop).trim();
            const want = prop.startsWith('--') ? val.trim() : null;
            const wins = want !== null ? got.replace(/\s+/g, ' ') === want.replace(/\s+/g, ' ') : bad.some(b => got.includes(b.replace(/^rgb\((.*)\)$/, '$1')));
            if (wins) { hit++; if (!sample) sample = (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : el.tagName.toLowerCase()) + (pseudo || ''); }
          }
        }
        if (hit) out.push({ file, sel: sel.slice(0, 120), prop, val: val.slice(0, 110), bad: bad.join(' '), hit, sample });
      }
    }
  };
  for (const sh of document.styleSheets) {
    const href = sh.href || ''; if (!href || SKIP_SHEET.test(href)) continue;
    let rules; try { rules = sh.cssRules; } catch (e) { continue; }
    walk(rules, href.replace(/^.*\/assets\/css\//, '').replace(/\?.*$/, ''));
  }
  probe.remove();
  return out;
}

(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const b = await puppeteer.launch({ executablePath: findBrowser(), headless: 'new' });
  const rows = new Map();
  for (const [name, url, act] of STATES) {
    if (ONLY && !ONLY.test(name)) continue;
    const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
    await p.setRequestInterception(true); p.on('request', r => (/script\.google|googleusercontent/.test(r.url()) ? r.abort() : r.continue()));
    await p.goto(`http://127.0.0.1:${PORT}/screens/` + url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
    await sleep(/main|mission|building/.test(url) ? 2500 : 1500); if (act) await act(p);
    const found = await p.evaluate(inPage).catch(() => []); await p.close();
    for (const f of found) {
      const key = [f.file, f.sel, f.prop].join('|');
      const r = rows.get(key) || Object.assign({ where: [] }, f); r.where.push(name); rows.set(key, r);
    }
    process.stdout.write('.');
  }
  await b.close(); server.close();
  const list = [...rows.values()];
  console.log(`\n브랜딩 화면 검사: v7 화면 ${STATES.filter(s => !ONLY || ONLY.test(s[0])).length}개 상태(다크 · 라이트)`);
  console.log(list.length ? `  예전 판 규칙이 v7 화면에서 토큰 밖 파랑을 칠함 ${list.length}건` : '  걸린 곳 없음');
  const md = ['# 브랜딩 화면 검사 — 예전 판 규칙이 v7 화면에서 이기는 곳', '', 'v7 전용이 아닌 규칙(v6.css · v3.css · monitor.css 등)이 v7 화면의 실제 요소에서 토큰 밖 파랑(v7 blue 램프에 없는 값)을 칠하는 곳. 고치는 법: 같은 자리에 body.ver-7 규칙으로 blue 램프 토큰을 적어 덮는다(components-v7.css).', '',
    `걸린 곳 ${list.length}건`, '', '| 파일 | 선택자 | 속성 | 값 | 램프 밖 파랑 | 이기는 요소 | 화면 |', '|---|---|---|---|---|---|---|',
    ...list.map(r => `| ${r.file} | ${r.sel.replace(/\|/g, '\\|')} | ${r.prop} | ${r.val.replace(/\|/g, '\\|')} | ${r.bad} | ${r.sample} 외 ${r.hit - 1} | ${[...new Set(r.where)].join(', ')} |`)].join('\n');
  fs.writeFileSync(path.join(OUT, 'brand-check-screens.md'), md);
  console.log('전체 목록: tools/ds-check/out/brand-check-screens.md');
})();
