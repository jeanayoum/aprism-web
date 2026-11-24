// 개발 인계판 만들기 — v7 화면(+ 진입 v2 화면)과 그 화면이 실제로 쓰는 파일만 handoff/ 로 복사하고 주석을 뺀다.
//   원래 파일(screens/ · assets/)은 건드리지 않는다. 주석(작업 기록)은 원래 파일에 그대로 남는다.
//
//   준비   npm i --no-save --no-package-lock terser      (저장소 맨 위에서 한 번, node_modules 는 .gitignore)
//   실행   node tools/build-handoff.mjs && node tools/export-handoff-data.mjs && python tools/stamp-assets.py
//   결과   handoff/screens/*.html · handoff/assets/** · handoff/index.html(화면 목록)
//
//   JS 는 terser 로 주석만 뺀다(압축 · 이름 바꾸기 없음, 줄 맞춤은 terser 가 다시 함). CSS · HTML 은 문자열을 피해 주석만 뺀다.
//   JS 안에서 글자를 이어 붙여 만드는 주소는 찾지 못하므로, 만든 뒤 화면을 열어 404 를 확인한다(빠진 파일은 EXTRA 에 넣는다).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "handoff");

// 인계하는 화면 — 정의서(Figma UI_99 00.룰)에 장이 있는 화면
export const SCREENS = [
  ["splash-v2.html", "CM-01 스플래시"],
  ["login-v2.html", "CM-02 · CM-03 · CM-07 · CM-13 로그인 · 인증 실패 · 첫 화면 · 교대"],
  ["password-expired-v2.html", "CM-05 비밀번호 변경 강제"],
  ["control-v7.html", "관제 껍데기 (GNB 관제), 안에 전체 미션 · 미션 화면"],
  ["building-v7.html", "공통-01 전체 미션 · 관제화면-03 통합 순회 현황"],
  ["mission-setup-v7.html", "관제화면-01 미션 설정 · CM-06 자동 로그아웃"],
  ["mission-precheck-v7.html", "관제화면-02 사전 점검"],
  ["main-v7.html", "관제화면-04 미션 관제 · 지도-01 · 로봇현황-01/02 · Delta-01"],
  ["main-v7-chat.html", "Delta-02 Delta 챗봇형"],
  ["alert-center-v7.html", "알림센터-01 알림 센터"],
  ["report-v7.html", "보고서-01 보고서 (관제의 보고서 모달도 이 화면)"],
  ["safety-v7.html", "안전진단 (정의서 보류)"],
];
// 글자를 이어 붙여 만들어 자동으로 못 찾는 파일 — 화면을 열어 404 로 찾은 것. 끝이 / 면 폴더 통째, * 는 이름 일부
const EXTRA_RAW = [
  "assets/img/delta-light-*",   // Delta 빛 — 단계(-critical · -warning)를 붙여 부른다
  "assets/img/alert/",          // 알림 검출 사진
  "assets/img/detect-v7/",      // 감지 종류별 그림
  "assets/img/report/",         // 보고서 증거 사진
  "assets/img/safety/",         // 안전진단 그림 · 로봇 위에서 본 모습
];
const EXTRA = EXTRA_RAW.flatMap(e => {
  const dir = e.endsWith("/") ? e : path.posix.dirname(e) + "/";
  const pre = e.endsWith("/") ? "" : path.posix.basename(e).replace("*", "");
  let names = [];
  try { names = fs.readdirSync(path.join(ROOT, dir)); } catch { return []; }
  return names.filter(f => f.startsWith(pre) && fs.statSync(path.join(ROOT, dir, f)).isFile()).map(f => dir + f);
});

const EXT_TEXT = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".gltf", ".txt"]);
const ASSET_RX = /["'`]((?:\.{0,2}\/)?[\w@~.\-\/가-힣]+\.(?:js|mjs|css|svg|png|webp|jpe?g|gif|avif|glb|gltf|bin|ktx2|hdr|mp3|wav|ogg|m4a|mp4|webm|json|woff2?|ttf|otf|html))(?:[?#][^"'`]*)?["'`]/g;

const screenSet = new Set(SCREENS.map(s => "screens/" + s[0]));
const seen = new Set();
const queue = [...screenSet, ...EXTRA];

function rel(p) { return path.relative(ROOT, p).split(path.sep).join("/"); }
function exists(r) { try { return fs.statSync(path.join(ROOT, r)).isFile(); } catch { return false; } }
function resolveRef(ref, fromRel) {
  if (/^(https?:|data:|mailto:|tel:|javascript:|#|\/\/)/.test(ref)) { return null; }
  const clean = ref.split(/[?#]/)[0];
  if (!clean) { return null; }
  const bases = [path.posix.dirname(fromRel), "screens", ""];
  for (const b of bases) {
    const r = path.posix.normalize(path.posix.join(b, clean));
    if (r.startsWith("..")) { continue; }
    if (exists(r)) {
      if (r.endsWith(".html") && !screenSet.has(r)) { return null; }   // 인계하지 않는 화면(v6 등)은 따라가지 않는다
      return r;
    }
  }
  return null;
}
function refsOf(r, text) {
  const out = [];
  const ext = path.extname(r).toLowerCase();
  if (ext === ".html" || ext === ".svg") {
    for (const m of text.matchAll(/\b(?:src|href|data-src|poster)\s*=\s*"([^"]+)"/g)) { out.push(m[1]); }
    for (const m of text.matchAll(/srcset\s*=\s*"([^"]+)"/g)) { m[1].split(",").forEach(s => out.push(s.trim().split(/\s+/)[0])); }
  }
  if (ext === ".html" || ext === ".css" || ext === ".svg") {
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) { out.push(m[1]); }
    for (const m of text.matchAll(/@import\s+["']([^"']+)["']/g)) { out.push(m[1]); }
  }
  if (ext === ".js" || ext === ".mjs" || ext === ".html") {
    for (const m of text.matchAll(ASSET_RX)) { out.push(m[1]); }
  }
  if (ext === ".gltf") {
    try { const j = JSON.parse(text); [...(j.buffers || []), ...(j.images || [])].forEach(b => b.uri && out.push(b.uri)); } catch {}
  }
  return out;
}

while (queue.length) {
  const r = queue.shift();
  if (seen.has(r) || !exists(r)) { continue; }
  seen.add(r);
  if (!EXT_TEXT.has(path.extname(r).toLowerCase())) { continue; }
  const text = fs.readFileSync(path.join(ROOT, r), "utf8");
  for (const ref of refsOf(r, text)) {
    const t = resolveRef(ref, r);
    if (t && !seen.has(t)) { queue.push(t); }
  }
}

// ── 주석 빼기 ──
function stripCss(s) {
  let o = "", i = 0, q = null;
  while (i < s.length) {
    const c = s[i];
    if (q) { o += c; if (c === "\\") { o += s[i + 1] || ""; i += 2; continue; } if (c === q) { q = null; } i++; continue; }
    if (c === '"' || c === "'") { q = c; o += c; i++; continue; }
    if (c === "/" && s[i + 1] === "*") { const e = s.indexOf("*/", i + 2); i = e < 0 ? s.length : e + 2; continue; }
    o += c; i++;
  }
  return tidy(o);
}
function tidy(s) { return s.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, ""); }
function stripHtml(s) {
  s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
  s = s.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (_, a, b, c) => a + stripCss(b) + c);
  return s.split("\n").filter((l, k, arr) => !(l.trim() === "" && (arr[k - 1] || "").trim() === "")).join("\n");
}
let terser;
try { terser = await import("terser"); } catch { console.error("terser 가 없어요 — 저장소 맨 위에서: npm i --no-save --no-package-lock terser"); process.exit(1); }
async function stripJs(code, r) {
  const isModule = /^\s*(import|export)\s/m.test(code);
  const res = await terser.minify(code, {
    compress: false, mangle: false, module: isModule,
    format: { beautify: true, comments: /@license|@preserve|^!/, indent_level: 2, ascii_only: false, quote_style: 3, keep_numbers: true },
  });
  if (res.code == null) { throw new Error("terser 실패: " + r); }
  return res.code + "\n";
}

// README.md 는 손으로 쓰는 안내라 다시 뽑아도 남긴다
const README = path.join(OUT, "README.md");
const readme = fs.existsSync(README) ? fs.readFileSync(README) : null;
fs.rmSync(OUT, { recursive: true, force: true });
if (readme) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(README, readme); }
let n = 0, before = 0, after = 0;
for (const r of [...seen].sort()) {
  const src = path.join(ROOT, r), dst = path.join(OUT, r);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const ext = path.extname(r).toLowerCase();
  if (ext === ".js" || ext === ".mjs" || ext === ".css" || ext === ".html") {
    const t = fs.readFileSync(src, "utf8");
    const o = ext === ".css" ? stripCss(t) : ext === ".html" ? stripHtml(t) : await stripJs(t, r);
    fs.writeFileSync(dst, o);
    before += t.length; after += o.length;
  } else {
    fs.copyFileSync(src, dst);
  }
  n++;
}

// 화면 목록(handoff/index.html) — 화면들이 "../index.html" 로 돌아올 때도 여기로 온다
const day = new Date().toISOString().slice(0, 10);
const rows = SCREENS.map(([f, d]) => `      <tr><td><a href="screens/${f}">${f}</a></td><td>${d}</td></tr>`).join("\n");
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>APRISM 개발 인계판</title>
  <style>
    :root { color-scheme: light dark; --bg: #fff; --fg: #111; --sub: #5b616b; --line: #e3e5e8; --link: #1d5fd6; }
    @media (prefers-color-scheme: dark) { :root { --bg: #111; --fg: #f2f3f5; --sub: #a0a5ab; --line: #2c2f34; --link: #6ea2ff; } }
    body { margin: 0; padding: 40px 16px; background: var(--bg); color: var(--fg); font: 15px/1.6 system-ui, sans-serif; }
    main { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 24px; margin: 0 0 4px; } p { color: var(--sub); margin: 0 0 24px; }
    table { width: 100%; border-collapse: collapse; } td { padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
    td:first-child { white-space: nowrap; font-family: ui-monospace, monospace; font-size: 14px; } a { color: var(--link); }
  </style>
</head>
<body>
  <main>
    <h1>APRISM 개발 인계판</h1>
    <p>${day} 기준 사본 · 화면별 동작과 규칙은 Figma 화면 정의서(UI_99 · 00.룰), 자세한 안내는 README.md</p>
    <table>
${rows}
    </table>
  </main>
</body>
</html>
`);
console.log(`인계판: 파일 ${n}개, 글자 ${before.toLocaleString()} → ${after.toLocaleString()} (주석을 뺀 텍스트 파일 기준)`);
