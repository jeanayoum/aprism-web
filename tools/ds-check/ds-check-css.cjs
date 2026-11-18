// v7 화면이 불러오는 CSS에서 토큰을 쓰지 않은 여백, 간격, 라운딩, 칩과 버튼 높이를 찾는다.
// 쓰기: node tools/ds-check/ds-check-css.cjs [aprism-web 폴더]   (기본: 이 저장소)
// 결과: 화면에 요약, out/ds-check-css.md 에 전체 목록
const fs = require('fs'); const path = require('path');
const RULES = require('./ds-rules.json');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
if (!fs.existsSync(path.join(ROOT, 'screens'))) { console.log('screens 폴더가 없음: ' + ROOT); process.exit(1); }
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });

// v7 화면이 불러오는 CSS 모으기
const screens = fs.readdirSync(path.join(ROOT, 'screens')).filter(f => /-v7[^/]*\.html$/.test(f));
const cssSet = new Set();
for (const s of screens) {
  const html = fs.readFileSync(path.join(ROOT, 'screens', s), 'utf8');
  for (const m of html.matchAll(/<link[^>]+href="\.\.\/assets\/css\/([^"?]+\.css)/g)) cssSet.add(m[1]);
}
const SKIP = new Set(['tokens.css', 'icons-outline.css', 'i18n-en.css', 'palette-neutral.css']);
const files = [...cssSet].filter(f => !SKIP.has(f)).sort();

const SPACE = new Set(RULES.space);
const RADIUS = new Set(RULES.radius.filter(v => typeof v === 'number'));
const H_CHIP = new Set([...Object.values(RULES.chip.heights), 18]);
const H_BTN = new Set([...Object.values(RULES.button.heights), ...Object.keys(RULES.button.iconOnly).map(Number)]);
const SPACE_PROP = /^(padding(-(top|right|bottom|left|inline|block)(-(start|end))?)?|gap|row-gap|column-gap)$/;
const RADIUS_PROP = /^border(-(top|bottom)-(left|right))?-radius$/;
const CHIP_SEL = /(chip|badge|tag|pill|verdict|-count)\b/;
const BTN_SEL = /(\.btn\b|button|icon-button|-btn\b)/;

const issues = [];
const lineOf = (txt, idx) => txt.slice(0, idx).split('\n').length;
for (const f of files) {
  const txt = fs.readFileSync(path.join(ROOT, 'assets/css', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  for (const blk of txt.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = blk[1].trim().replace(/\s+/g, ' '); if (sel.startsWith('@')) continue;
    const base = blk.index + blk[1].length + 1;
    for (const d of blk[2].matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)) {
      const prop = d[1], val = d[2].replace(/!important/, '').trim(); const line = lineOf(txt, base + d.index);
      const add = (kind, why) => issues.push({ f, line, sel: sel.slice(0, 90), decl: `${prop}: ${val}`.slice(0, 80), kind, why });
      const kindSpace = SPACE_PROP.test(prop), kindRad = RADIUS_PROP.test(prop);
      if (kindSpace || kindRad) {
        if (/var\(--space-(6|10)\b/.test(val)) add(kindSpace ? '여백' : '라운딩', '토큰에 없는 단계 (--space-6, --space-10)');
        if (/var\(--radius-6\b/.test(val)) add('라운딩', '없애기로 한 단계 (--radius-6)');
        const lits = [...val.replace(/var\([^)]*\)/g, ' ').matchAll(/(-?\d*\.?\d+)px/g)].map(m => +m[1]).filter(v => v !== 0);
        if (lits.length) {
          const bad = lits.filter(v => kindSpace ? !SPACE.has(Math.abs(v)) : !(RADIUS.has(v) || v >= 999));
          add(kindSpace ? '여백' : '라운딩', bad.length ? `토큰 없이 단계 밖 값 (${[...new Set(bad)].join(', ')}px)` : `토큰 없이 숫자로 적음 (${[...new Set(lits)].join(', ')}px)`);
        }
      }
      if (/^(height|min-height)$/.test(prop) && (CHIP_SEL.test(sel) || BTN_SEL.test(sel))) {
        const m = val.match(/^(\d+(?:\.\d+)?)px$/); if (!m) continue; const h = +m[1];
        const ok = CHIP_SEL.test(sel) ? H_CHIP.has(h) : H_BTN.has(h);
        if (!ok) add('높이', `칩과 버튼 높이 단계 밖 (${h}px)`);
      }
    }
  }
}

// 요약
const byKind = {}, byFile = {};
for (const i of issues) { byKind[i.kind + ': ' + i.why.replace(/\(.*\)/, '').trim()] = (byKind[i.kind + ': ' + i.why.replace(/\(.*\)/, '').trim()] || 0) + 1; byFile[i.f] = (byFile[i.f] || 0) + 1; }
console.log(`검사한 CSS ${files.length}개 (v7 화면 ${screens.length}개가 불러오는 것), 걸린 곳 ${issues.length}`);
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log('파일별: ' + Object.entries(byFile).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
const md = [`# CSS 규칙 검사 (${new Date().toISOString().slice(0, 10)})`, '', `기준: ds-rules.json (${RULES.updated}). 검사 폴더: ${ROOT}`, '',
  '| 파일:줄 | 종류 | 문제 | 선언 | 선택자 |', '|---|---|---|---|---|',
  ...issues.map(i => `| ${i.f}:${i.line} | ${i.kind} | ${i.why} | \`${i.decl.replace(/\|/g, '\\|')}\` | \`${i.sel.replace(/\|/g, '\\|')}\` |`)].join('\n');
fs.writeFileSync(path.join(OUT, 'ds-check-css.md'), md);
console.log('전체 목록: ' + path.join(OUT, 'ds-check-css.md'));
