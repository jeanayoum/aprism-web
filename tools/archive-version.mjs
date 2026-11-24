#!/usr/bin/env node
/*
 * 예전 버전 얼리기 — 화면 파일을 archive/<버전>/ 에 그때 모습 그대로 복사하고, 옛 자리에는 넘겨 주는 안내 파일을 남긴다.
 *
 *   node tools/archive-version.mjs v5 main-v5 safety-v5 report-v5 ...
 *
 * 1) screens/<이름>.html → archive/<버전>/screens/<이름>.html (복사)
 * 2) 그 화면이 쓰는 assets 파일만 따라가며 → archive/<버전>/assets/... (같은 폴더 구조라 화면 안 주소는 고치지 않음)
 *    html, js, css, svg, json 안에 적힌 파일 이름, 폴더 경로, 이어 붙이는 앞부분을 따라간다.
 *    그래도 못 찾는 이름이 있을 수 있으므로 얼린 뒤 화면을 열어 404 를 꼭 확인한다
 * 3) 얼린 화면이 가리키는 다른 html(로그인, 목록, 다른 버전 화면)은 archive 안에 넘겨 주는 안내 파일을 두어 지금 자리로 보낸다
 * 4) screens/<이름>.html 자리에는 archive 로 넘겨 주는 안내 파일을 둔다(주소 뒤 ?, # 그대로 넘김). 예전에 공유한 링크가 계속 열림
 *
 * 안내 파일은 첫 줄 표식(STUB)으로 알아본다. 얼린 파일은 이후 고치지 않는다(tools/stamp-assets.py 도 archive 를 건너뜀).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STUB = '<!-- archive-stub -->';
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json']);
const ASSET_EXT = 'png|jpe?g|webp|gif|svg|glb|gltf|bin|hdr|ktx2|wasm|mp3|wav|ogg|m4a|mp4|webm|woff2?|ttf|otf|js|mjs|css|json|csv|txt';
// 길이를 묶어 둔다: map-model.js 처럼 그림 데이터가 한 줄로 길게 든 파일에서 정규식이 끝없이 되짚지 않게
const TOKEN = new RegExp('(?<![\\w@%.-])[\\w@%.-]{1,100}\\.(?:' + ASSET_EXT + ')(?![\\w])', 'gi');
const HTML_REF = /(?<![\w./-])(?:\.{1,2}\/){0,4}[\w-]{1,60}(?:\/[\w-]{1,60}){0,4}\.html(?![\w-])/g;

const [ver, ...names] = process.argv.slice(2);
if (!/^v[\w.-]+$/.test(ver || '') || names.length === 0) {
  console.error('사용: node tools/archive-version.mjs <버전 v1~> <화면 이름 ...>   예) node tools/archive-version.mjs v5 main-v5 safety-v5');
  process.exit(1);
}
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const isStub = (f) => fs.existsSync(f) && fs.readFileSync(f, 'utf8').startsWith(STUB);
const dest = path.join(ROOT, 'archive', ver);

function stubHtml(target, note) {
  return STUB + '\n<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>이동</title>\n'
    + '<script>location.replace(' + JSON.stringify(target) + ' + location.search + location.hash);</script>\n'
    + '<meta http-equiv="refresh" content="0;url=' + target + '">\n'
    + '</head><body><a href="' + target + '">' + note + '</a></body></html>\n';
}

// assets 파일 이름 → 경로들
const byBase = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { const k = e.name.toLowerCase(); if (!byBase.has(k)) byBase.set(k, []); byBase.get(k).push(p); }
  }
})(path.join(ROOT, 'assets'));

// 1) 화면 파일
const pages = names.map((n) => path.join(ROOT, 'screens', n.replace(/\.html$/, '') + '.html'));
for (const p of pages) {
  if (!fs.existsSync(p)) { console.error('없는 화면: ' + rel(p)); process.exit(1); }
  if (isStub(p)) { console.error('이미 얼린 화면(안내 파일): ' + rel(p)); process.exit(1); }
}

// 2) 화면에서 시작해 assets 를 따라감
//    코드가 이름을 이어 붙여 만드는 파일도 잡도록 세 규칙을 더함
//    - 폴더 경로(img/safety/)가 적혀 있으면 그 폴더 파일 전부
//    - 이어 붙이는 앞부분('alert-live-' + …)으로 시작하는 파일
//    - 따라간 파일의 변형(delta-light-circle.svg → delta-light-circle-critical.svg)
const allAssets = [...byBase.values()].flat();
const keep = new Set(pages);
const queue = [...pages];
const htmlRefs = new Set();
function add(a) {
  if (keep.has(a)) return;
  keep.add(a);
  const ext = path.extname(a).toLowerCase();
  if (TEXT.has(ext)) queue.push(a);
  if (!/^\.(html|m?js|css|json)$/.test(ext)) {
    const stem = path.basename(a, ext).toLowerCase();
    for (const s of fs.readdirSync(path.dirname(a))) {
      const l = s.toLowerCase();
      if (l.startsWith(stem + '-') || l.startsWith(stem + '_')) add(path.join(path.dirname(a), s));
    }
  }
}
const DIR_REF = /(?<![\w-])(?:assets\/)?(img|model|display|audio|icons|robot-dog|prism-orb)\/([\w-]{1,60}(?:\/[\w-]{1,60}){0,3})\/(?=['"`$+\w])/g;
const PREFIX_REF = /(?<![\w-])([\w-]{5,60}[-_])['"`]\s*\+/g;
while (queue.length) {
  const f = queue.shift();
  const src = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.mjs')) for (const m of src.match(HTML_REF) || []) htmlRefs.add(m);
  for (const m of src.match(TOKEN) || []) {
    let base = m.split('/').pop();
    try { base = decodeURIComponent(base); } catch (e) { /* % 가 그냥 글자인 경우 */ }
    for (const a of byBase.get(base.toLowerCase()) || []) add(a);
  }
  for (const m of src.matchAll(DIR_REF)) {
    const dir = path.join(ROOT, 'assets', m[1], m[2]);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) for (const a of allAssets) if (a.startsWith(dir + path.sep)) add(a);
  }
  for (const m of src.matchAll(PREFIX_REF)) {
    const pre = m[1].split('/').pop().toLowerCase();
    if (pre.length < 6) continue;
    for (const a of allAssets) if (path.basename(a).toLowerCase().startsWith(pre)) add(a);
  }
}

let bytes = 0;
for (const f of keep) {
  const to = path.join(dest, rel(f));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(f, to);
  bytes += fs.statSync(f).size;
}

// 3) 얼린 화면이 가리키는 html 중 archive 안에 없는 것 → 지금 자리로 넘김
const pageDir = path.join(dest, 'screens');
let links = 0;
for (const ref of htmlRefs) {
  const at = path.resolve(pageDir, ref);
  if (!at.startsWith(dest + path.sep) || fs.existsSync(at)) continue;
  const live = path.join(ROOT, path.relative(dest, at));
  if (!fs.existsSync(live)) continue;
  const target = path.relative(path.dirname(at), live).split(path.sep).join('/');
  fs.mkdirSync(path.dirname(at), { recursive: true });
  fs.writeFileSync(at, stubHtml(target, '지금 자리로 이동'));
  links++;
}

// 4) 옛 자리 → archive
for (const p of pages) {
  const target = path.relative(path.dirname(p), path.join(dest, rel(p))).split(path.sep).join('/');
  fs.writeFileSync(p, stubHtml(target, ver + ' 보관본으로 이동'));
}

// 5) 다른 버전 archive 안의 넘김 파일이 방금 얼린 화면을 가리키면 한 번에 가도록 고침
let relinked = 0;
for (const v of fs.readdirSync(path.join(ROOT, 'archive'))) {
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'assets') walk(p); continue; }
      if (!e.name.endsWith('.html') || !isStub(p)) continue;
      const t = fs.readFileSync(p, 'utf8').match(/location\.replace\(("[^"]*")/);
      if (!t) continue;
      const live = path.resolve(path.dirname(p), JSON.parse(t[1]));
      if (!pages.includes(live)) continue;
      const target = path.relative(path.dirname(p), path.join(dest, rel(live))).split(path.sep).join('/');
      fs.writeFileSync(p, stubHtml(target, ver + ' 보관본으로 이동'));
      relinked++;
    }
  })(path.join(ROOT, 'archive', v));
}

console.log(ver + ': 화면 ' + pages.length + ', 파일 ' + keep.size + ' (' + (bytes / 1048576).toFixed(1) + 'MB), 지금 자리로 넘김 ' + links + ', 다른 보관본 넘김 고침 ' + relinked);
