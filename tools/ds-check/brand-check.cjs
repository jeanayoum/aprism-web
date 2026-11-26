// v7 이후 화면의 브랜딩 · 시각 원칙(CLAUDE.md "브랜딩과 시각 원칙") 중 기계로 잡히는 것을 찾는다. 고치지 않고 보고만 한다.
// 쓰기: node tools/ds-check/brand-check.cjs [aprism-web 폴더]   (기본: 이 저장소)
// 결과: 화면에 요약, out/brand-check.md 에 전체 목록
//   1) 파랑 하나   — v7 CSS 에 토큰 없이 적은 파랑 hex(blue 램프 --color-blue-* 를 쓸 것)
//   2) 숫자 글꼴   — 글꼴 이름(JetBrains Mono, SUIT)을 토큰(--font-family-mono / -sans) 없이 적음
//   3) 분광        — --color-spectrum-* 를 Delta · 오브 · 엣지 밖에서 씀(분광은 DELTA 의 빛)
//   4) 로봇 이름   — 화면에 나가는 글에 대문자 "ROBOT 01"(표기는 "Robot 01", APRISM_ROBOT_LABEL)
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
if (!fs.existsSync(path.join(ROOT, 'screens'))) { console.log('screens 폴더가 없음: ' + ROOT); process.exit(1); }
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });

// v7 이후 화면과 그 화면이 불러오는 CSS · JS
const screens = fs.readdirSync(path.join(ROOT, 'screens')).filter(f => /-v([7-9]|[1-9]\d)[^/]*\.html$/.test(f) && !/^lab-/.test(f));
const css = new Set(), js = new Set();
for (const s of screens) {
  const html = fs.readFileSync(path.join(ROOT, 'screens', s), 'utf8');
  for (const m of html.matchAll(/href="\.\.\/assets\/css\/([^"?]+\.css)/g)) css.add(m[1]);
  for (const m of html.matchAll(/src="\.\.\/assets\/js\/([^"?]+\.js)/g)) js.add(m[1]);
}
const CSS_SKIP = new Set(['tokens.css', 'icons-outline.css', 'i18n-en.css', 'palette-neutral.css']);
const JS_SKIP = /^(i18n-en|i18n-en-dict)\.js$/;

const issues = [];
const lineOf = (t, i) => t.slice(0, i).split('\n').length;
const noComments = t => t.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
function hue(hex) {
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return null;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)); if (d === 0) return { h: 0, s: 0, l };
  let H = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (H * 60 + 360) % 360, s, l };
}

for (const f of [...css].filter(f => !CSS_SKIP.has(f)).sort()) {
  const t = noComments(fs.readFileSync(path.join(ROOT, 'assets/css', f), 'utf8'));
  for (const blk of t.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = blk[1].trim().replace(/\s+/g, ' '); if (sel.startsWith('@')) continue;
    // v7 이후 화면에만 걸리는 규칙만 본다(body.ver-7, ds-auth). 예전 판 공용 규칙은 v6 기록이라 건너뜀
    if (!/ver-7|ds-auth|\.ds-/.test(sel)) continue;
    const base = blk.index + blk[1].length + 1;
    for (const d of blk[2].matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)) {
      const prop = d[1], val = d[2]; const line = lineOf(t, base + d.index);
      const add = (kind, why) => issues.push({ where: `assets/css/${f}:${line}`, sel: sel.slice(0, 80), decl: `${prop}: ${val.trim()}`.slice(0, 90), kind, why });
      if (!prop.startsWith('--color-')) {
        for (const m of val.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
          const c = hue(m[0]); if (c && c.s > 0.35 && c.l > 0.2 && c.l < 0.9 && c.h >= 190 && c.h <= 265) add('파랑 하나', `토큰 없는 파랑 ${m[0]} — blue 램프(--color-blue-*) 를 쓸 것`);
        }
      }
      if (/font-family/.test(prop) && /JetBrains|SUIT/.test(val) && !/var\(--font-family/.test(val)) add('숫자 글꼴', '글꼴 이름을 직접 적음 — --font-family-mono / --font-family-sans');
      if (/--color-spectrum-/.test(val) && !/delta|orb|edge|dchat|d3|spectrum/i.test(sel + prop)) add('분광', '분광 색을 Delta · 오브 · 엣지 밖에서 씀');
    }
  }
}
// 화면 글: HTML 본문 글과 JS 문자열 속 "ROBOT 01"(주석은 뺌)
for (const s of screens) {
  const t = fs.readFileSync(path.join(ROOT, 'screens', s), 'utf8').replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' ')).replace(/<script[\s\S]*?<\/script>/g, m => m.replace(/[^\n]/g, ' '));
  for (const m of t.matchAll(/>[^<]*\bROBOT\s*\d+[^<]*</g)) issues.push({ where: `screens/${s}:${lineOf(t, m.index)}`, sel: '', decl: m[0].slice(1, -1).trim().slice(0, 60), kind: '로봇 이름', why: '대문자 ROBOT — "Robot 01"' });
}
for (const f of [...js].filter(f => !JS_SKIP.test(f)).sort()) {
  const raw = fs.readFileSync(path.join(ROOT, 'assets/js', f), 'utf8');
  const t = raw.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:"'\\])\/\/.*$/gm, (m, a) => a + m.slice(a.length).replace(/./g, ' '));
  for (const m of t.matchAll(/(["'`])[^"'`\n]*\bROBOT\s*\d+[^"'`\n]*\1/g)) {
    // 지도 로봇 목록(map-v6.js ROBOTS 의 name)은 APRISM_ROBOT_LABEL 이 화면에 낼 때 바꿈 · 미션 설정의 찾기 열쇠는 화면에 안 나감
    if (/map-v6\.js$/.test(f) && /name:\s*$/.test(t.slice(Math.max(0, m.index - 12), m.index))) continue;
    if (/mission-setup\.js$/.test(f)) continue;
    issues.push({ where: `assets/js/${f}:${lineOf(t, m.index)}`, sel: '', decl: m[0].slice(0, 60), kind: '로봇 이름', why: '대문자 ROBOT — "Robot 01"(APRISM_ROBOT_LABEL)' });
  }
}

const by = {}; issues.forEach(i => { by[i.kind] = (by[i.kind] || 0) + 1; });
console.log(`브랜딩 검사: v7 이후 화면 ${screens.length}장, CSS ${css.size}개, JS ${js.size}개`);
console.log(issues.length ? Object.entries(by).map(([k, n]) => `  ${k} ${n}건`).join('\n') : '  걸린 곳 없음');
const md = ['# 브랜딩 검사 (CLAUDE.md "브랜딩과 시각 원칙")', '', `걸린 곳 ${issues.length}건`, '', '| 종류 | 위치 | 선택자 | 값 | 이유 |', '|---|---|---|---|---|',
  ...issues.map(i => `| ${i.kind} | ${i.where} | ${i.sel.replace(/\|/g, '\\|')} | ${i.decl.replace(/\|/g, '\\|')} | ${i.why} |`)].join('\n');
fs.writeFileSync(path.join(OUT, 'brand-check.md'), md);
console.log('전체 목록: tools/ds-check/out/brand-check.md');
