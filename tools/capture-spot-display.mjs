/*
 * SPOT 디스플레이(spot-display.html A안) 화면을 KISTA 작업현장(kista-site.html) 장면 단계별로 프레임을 찍어 묶는다.
 *
 *   node tools/capture-spot-display.mjs
 *
 * 왜: 로봇 등 화면 · 오른쪽 위 고정 화면에 원본 그대로(기호 · 글자 모션 포함) 띄우려고. HTML/CSS 애니메이션은 WebGL 에
 *     바로 못 넣으므로, 헤드리스 Chrome(원격 디버깅)에서 화면 애니메이션 시각을 멈추고 1/15초씩 옮겨 가며 찍는다.
 * 결과: assets/display/kista/<장면>.bin (webp 프레임을 이어 붙인 것) + <장면>.json (구간 · 프레임 위치).
 * spot-display.html 이나 아래 SEG(장면 단계 ↔ 화면) 를 바꾸면 다시 돌린다.
 *
 * 프레임 576×320 = 화면 실물 비율 155:86(7인치 표시 영역). 15fps.
 * 배터리 % 숫자는 페이지가 JS(rAF)로 세어 올려 애니메이션 시각으로 못 멈추므로, 같은 식(0.9초 · ease-out cubic)으로 직접 쓴다.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets/display/kista");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 15, W = 576, H = 320;

// 장면 단계 ↔ SPOT 화면 [시작초, 끝초, 시나리오 id, 단계 번호(0부터)] — kista-site.html SCRIPT 의 st 와 맞춘다
const SEG = {
  "1-1": [[0, 2, "s1", 0], [2, 4, "s1", 1], [4, 7, "s1", 2], [7, 10, "s1", 3], [10, 12, "s1", 4]],
  "1-2": [[0, 2.4, "s2", 0], [2.4, 4.8, "s2", 1], [4.8, 7.2, "s2", 2], [7.2, 9.6, "s2", 3], [9.6, 12, "s2", 4]],
  // 2-1 은 KISTA 흐름(미조치 → 관제 연결 → 착용 확인 → 재개)대로: 01 · 02(착용 대기까지) · 3-2 마이크 · 3-1 확인 · 04
  "2-1": [[0, 2.8, "s4", 0], [2.8, 8.4, "s4", 1], [8.4, 12.0, "s4", 3], [12.0, 15.9, "s4", 2], [15.9, 18, "s4", 4]],
  "2-2": [[0, 2.8, "s3", 0], [2.8, 5.6, "s3", 1], [5.6, 8.4, "s3", 2], [8.4, 11.2, "s3", 3], [11.2, 14, "s3", 4]],
  "3-1": [[0, 3.0, "s6", 0], [3.0, 7.3, "s6", 1], [7.3, 12.6, "s6", 2], [12.6, 21.0, "s6", 3], [21.0, 24, "s6", 4]],
  "3-2": [[0, 6.4, "s7", 0], [6.4, 11.6, "s7", 1], [11.6, 16.0, "s7", 2], [16.0, 22.0, "s7", 3], [22.0, 26, "s7", 4]],
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ud = path.join(process.env.TEMP || "/tmp", "spotcap-" + Date.now());
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9352", `--user-data-dir=${ud}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let ws;
for (let i = 0; i < 60 && !ws; i++) { try { const j = await (await fetch("http://127.0.0.1:9352/json")).json(); const t = j.find(x => x.type === "page"); if (t) ws = new WebSocket(t.webSocketDebuggerUrl); } catch (e) {} if (!ws) await sleep(250); }
await new Promise(r => ws.onopen = r);
let id = 0; const pend = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value; };

await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 700, deviceScaleFactor: 1, mobile: false });
await send("Page.enable");
await send("Page.navigate", { url: pathToFileURL(path.join(ROOT, "spot-display.html")).href });
await sleep(3000);
await ev("document.fonts.ready.then(() => true)");
// 찍을 화면 하나만 왼쪽 위에 — 나머지 판의 자동 넘김은 멈춘다
await ev(`(() => {
  boards.forEach(b => clearInterval(b.tm));
  document.querySelector('main') && (document.querySelector('main').style.visibility = 'hidden');
  const wrap = document.createElement('div');
  wrap.id = 'cap'; wrap.style.cssText = 'position:fixed;left:0;top:0;width:${W}px;height:${H}px;z-index:2147483647;background:#15171A;visibility:visible';
  wrap.innerHTML = '<div class="scr" style="width:${W}px"></div>'; document.body.appendChild(wrap);
  window.__scr = wrap.querySelector('.scr'); return true;
})()`);

fs.mkdirSync(OUT, { recursive: true });
const ONLY = process.argv.slice(2);   // 장면만 골라 찍기: node tools/capture-spot-display.mjs 1-1 2-1
for (const [scene, segs] of Object.entries(SEG)) {
  if (ONLY.length && !ONLY.includes(scene)) continue;
  const bufs = [], index = [];
  let off = 0;
  for (const [t0, t1, sid, si] of segs) {
    await ev(`(() => { LANG = 'ko'; const st = SCENES.find(s => s.id === '${sid}').steps[${si}]; show(__scr, st.s()); return true; })()`);
    await sleep(1100);   // 배터리 % 세기(0.9초 rAF)가 끝나기를 기다린 뒤 직접 쓴다
    await ev(`(() => { window.__anims = __scr.getAnimations({ subtree: true }); __anims.forEach(a => a.pause());
      const n = __scr.querySelector('.c1 > .key > .num'); window.__num = n && n.firstChild && n.firstChild.nodeType === 3 ? [n.firstChild, parseInt(n.firstChild.textContent, 10)] : null; return __anims.length; })()`);
    const frames = Math.max(1, Math.round((t1 - t0) * FPS));
    const seg = { t0, t1, sid, si, first: index.length, count: frames };
    for (let k = 0; k < frames; k++) {
      const ms = k * 1000 / FPS;
      await ev(`(() => { __anims.forEach(a => { a.currentTime = ${ms}; });
        if (__num) { const kk = Math.min(1, ${ms} / 900); __num[0].textContent = Math.round(__num[1] * (1 - Math.pow(1 - kk, 3))); } return true; })()`);
      const r = await send("Page.captureScreenshot", { format: "webp", quality: 82, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
      const b = Buffer.from(r.result.data, "base64");
      bufs.push(b); index.push([off, b.length]); off += b.length;
    }
    seg.frames = undefined;
    (index.segs ||= []).push(seg);
    process.stdout.write(`${scene} ${sid}#${si} ${frames}f  `);
  }
  fs.writeFileSync(path.join(OUT, `${scene}.bin`), Buffer.concat(bufs));
  fs.writeFileSync(path.join(OUT, `${scene}.json`), JSON.stringify({ fps: FPS, w: W, h: H, segs: index.segs, frames: index }));
  console.log(`\n${scene}: ${index.length} frames, ${(off / 1e6).toFixed(2)} MB`);
}
await send("Browser.close").catch(() => {});
ws.close(); setTimeout(() => process.exit(0), 300);
