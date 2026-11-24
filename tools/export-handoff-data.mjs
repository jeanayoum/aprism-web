// 인계판 견본 데이터 — v7 화면이 실제로 쓰는 시연 값을 정의서 공통-03(데이터 · 갱신)의 필드 꼴로 handoff/data/*.json 에 내보낸다.
//   화면은 지금처럼 JS 안의 값을 쓴다. 이 파일들은 "서버는 이런 꼴로 보내 주세요"를 보여 주는 견본일 뿐이라 화면에 영향이 없다.
//   값은 인계판 화면을 Chrome 헤드리스로 열어 그대로 읽는다(판마다 덮어쓰는 값까지 v7 기준).
//
//   실행   node tools/build-handoff.mjs && node tools/export-handoff-data.mjs && python tools/stamp-assets.py
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const H = path.join(ROOT, "handoff");
const OUT = path.join(H, "data");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DAY = "2026-11-02";   // 시안 상태 바의 오늘

const PORT = 9400 + Math.floor(Math.random() * 400);
const ud = fs.mkdtempSync(path.join(os.tmpdir(), "aprism-export-"));   // 프로필은 저장소 밖에
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--allow-file-access-from-files", "--user-data-dir=" + ud, "--window-size=1920,1080", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 150; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (tabs.some(t => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let seq = 0, paused = null; const wait = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && wait[m.id]) { wait[m.id](m); delete wait[m.id]; } if (m.method === "Debugger.paused") { paused = m.params; } };
const send = (method, params = {}) => new Promise(r => { const i = ++seq; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
const url = f => "file:///" + path.join(H, "screens", f).split(path.sep).join("/");
const fail = msg => { console.error(msg); ws.close(); chrome.kill(); process.exit(1); };

// ── 1. 로봇 · 미션 층 — building.js 안의 값은 밖으로 안 나와서, 판별 덮어쓰기가 끝난 자리(var BADGE)에서 멈춰 읽는다
await send("Debugger.enable");
const bsrc = fs.readFileSync(path.join(H, "assets/js/building.js"), "utf8").split("\n");
const stop = bsrc.findIndex(l => /^\s*var BADGE\s*=/.test(l));
if (stop < 0) { fail("building.js 에서 var BADGE 줄을 못 찾았어요"); }
await send("Debugger.setBreakpointByUrl", { urlRegex: ".*/handoff/assets/js/building\\.js.*", lineNumber: stop });
send("Page.navigate", { url: url("building-v7.html") });
for (let i = 0; i < 150 && !paused; i++) { await sleep(100); }
if (!paused) { fail("building.js 에서 멈추지 못했어요"); }
const bld = JSON.parse((await send("Debugger.evaluateOnCallFrame", { callFrameId: paused.callFrames[0].callFrameId, expression: "JSON.stringify({ROBOTS:ROBOTS,MISSION_FLOORS:MISSION_FLOORS})", returnByValue: true })).result.result.value);
await send("Debugger.resume"); await send("Debugger.disable");
await sleep(7000);

// ── 2. 알림 · 조치 제안 — alert-data-v7.js 가 밖에 내놓은 값
const al = JSON.parse(await ev(`JSON.stringify((()=>{const A=window.APRISM_ALERTS7; return {list:A.list.map(a=>Object.assign({},a,{img:A.img(a.detect)})), sug:[...new Set(A.list.map(a=>a.mission+'|'+a.detect))].concat(['기타|안전감지','기타|누출감지','기타|온도감지','기타|계기인식','기타|이상음향','기타|부분방전']).map(k=>{const [m,d]=k.split('|');return {mission:m,detect:d,s:A.sug(m,d)};})};})())`));

// ── 3. 미션 지점 목록 — 미션 설정 화면의 점검항목 줄
await send("Page.navigate", { url: url("mission-setup-v7.html") });
await sleep(6000);
const setup = JSON.parse(await ev(`JSON.stringify({mission:(document.querySelector('[data-mission-name], .t-title-2')||{}).textContent||'', rows:[...document.querySelectorAll('.check-row[data-wp]')].map((r,i)=>({order:i+1,id:r.getAttribute('data-wp'),name:(r.querySelector('.check-text')||{}).textContent||'',dwell:+r.getAttribute('data-dwell')||0}))})`));
ws.close(); chrome.kill();

// ── 정의서 꼴로 바꾸기 ──
const robotName = n => "Robot " + String(n).padStart(2, "0");
function splitValue(v) { const m = /^\s*([-+]?[\d.]+)\s*(.*)$/.exec(v || ""); return m ? { value: Number(m[1]), unit: m[2] || null } : { value: null, unit: null }; }
function splitTo(t) { const p = String(t || "").split(/,\s*/); return { team: p[0] || null, contact: p.slice(1).join(", ") || null }; }
const wpNo = id => Number(String(id).replace(/\D/g, "")) || null;

const alerts = al.list.map(a => {
  const v = splitValue(a.value);
  return {
    id: a.id,
    level: a.sev,
    missionId: a.mission,
    robotId: robotName(a.robot + 1),
    floor: a.floor,
    waypoint: { id: a.wp, no: wpNo(a.wp) },
    equipment: a.place,
    detectType: a.detect,
    measure: { item: a.label, value: v.value, unit: v.unit, limit: a.monitor && a.monitor.std ? Number(a.monitor.std) : null, text: a.value },
    trend: (a.monitor && a.monitor.hist || []).map(Number),
    occurredAt: `${DAY}T${(a.time || "").length === 5 ? a.time + ":00" : a.time}+09:00`,
    photo: a.img ? "assets/img/" + a.img : null,
    summary: a.monitor ? a.monitor.sum : null,
    status: "action_needed",
  };
});

// 감지 종류마다 기본 표("*") 하나, 미션이 따로 정한 표는 기본과 다를 때만
const sugRow = (m, d, s) => ({ key: { missionId: m, detectType: d }, message: s[0], actions: s[1].map(r => ({ label: r[0], aiRecommended: !!r[1], recipient: splitTo(r[2]) })) });
const base = {}, suggestions = [];
al.sug.filter(x => x.mission === "기타" && x.s).forEach(x => { base[x.detect] = JSON.stringify(x.s); suggestions.push(sugRow("*", x.detect, x.s)); });
const seenSp = new Set();
al.sug.filter(x => x.mission !== "기타" && x.s && JSON.stringify(x.s) !== base[x.detect]).forEach(x => {
  const k = x.mission + "|" + x.detect; if (seenSp.has(k)) { return; } seenSp.add(k); suggestions.push(sugRow(x.mission, x.detect, x.s));
});

const AV = { run: "running", idle: "idle", done: "done", off: "lost" };
const robots = bld.ROBOTS.map(r => ({
  id: robotName(r.n),
  name: robotName(r.n),
  missionId: r.mission || null,
  availability: r.st === "idle" && r.chg ? "charging" : AV[r.st] || r.st,
  floor: r.floor,
  battery: { level: r.bat, charging: !!r.chg },
  signal: { level: r.sig },
  progress: r.total ? { done: r.done, total: r.total } : null,
  current: r.now || null,
}));

const MST = { running: "running", done: "done" };
const missions = Object.keys(bld.MISSION_FLOORS).map(m => {
  const rb = bld.ROBOTS.find(r => r.mission === m);
  const st = rb ? (rb.st === "run" ? "running" : rb.st === "done" ? "done" : "waiting") : "waiting";
  const out = { id: m, name: m, floors: bld.MISSION_FLOORS[m], robotId: rb ? robotName(rb.n) : null, status: MST[st] || st };
  if (setup.rows.length && m === "정기 순회 점검") {
    out.dock = { start: "DOCK", end: "DOCK" };
    out.waypoints = setup.rows.map(w => ({ order: w.order, id: w.id, name: w.name.trim(), dwellSec: w.dwell }));
  }
  return out;
});

const a1 = alerts[0], s1 = suggestions.find(s => s.key.detectType === a1.detectType && (s.key.missionId === a1.missionId || s.key.missionId === "*"));
const actionRequests = [{
  alertId: a1.id,
  actions: [s1.actions.find(x => x.aiRecommended).label],
  memo: "",
  requester: { name: "(로그인한 관제사 이름)", role: "관제사" },
  recipient: s1.actions.find(x => x.aiRecommended).recipient,
  requestedAt: `${DAY}T10:24:10+09:00`,
  stage: "wait",
  stageHistory: [{ stage: "wait", at: `${DAY}T10:24:10+09:00` }],
  result: null,
}];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const note = "시안 견본 — 정의서 공통-03 꼴. 실제 값은 서버가 보냄";
const write = (f, items) => { fs.writeFileSync(path.join(OUT, f), JSON.stringify({ _note: note, items }, null, 2) + "\n"); console.log(`data/${f}  ${items.length}건`); };
write("alerts.json", alerts);
write("suggestions.json", suggestions);
write("action-requests.json", actionRequests);
write("robots.json", robots);
write("missions.json", missions);
try { fs.rmSync(ud, { recursive: true, force: true }); } catch {}
