/*
 * v7 한글판 주소 잇기 — v7 화면은 v6 과 같은 JS 를 쓰고, 그 JS 는 화면 사이 주소를 "*-v6.html" 로 만든다.
 * v7 화면(*-v7.html)에서만 실어, v6 화면으로 가는 주소를 같은 이름의 v7 화면으로 바꾼다.
 *   1) JS 가 부르는 window.aprismHref(영문판 주소 바꾸개와 같은 자리)  2) 링크 · iframe 등의 속성(바뀔 때마다)
 *   3) 그래도 빠진 이동(location.href = …)은 Navigation API 로 가로채 v7 로 돌린다.
 * 영문판(*-v6-en.html)은 v7 한글판에서 만들지만 이 파일은 빼고 만든다(tools/build-en.mjs) — 영문판 주소는 i18n-en.js 가 맡는다.
 */
(function () {
  "use strict";
  var RX = /(^|\/)(mission-setup|mission-precheck|building|main|control|alert-center|safety|report)-v6\.html(?=$|[?#])/;
  function to7(u) { return typeof u === "string" ? u.replace(RX, "$1$2-v7.html") : u; }
  window.APRISM_VER = 7;
  window.aprismHref = to7;
  var ATTRS = ["href", "src", "data-goto", "data-monitor-href", "data-modal-confirm", "action"];
  function fix(el) {
    if (!el || !el.getAttribute) { return; }
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v && RX.test(v)) { el.setAttribute(ATTRS[i], to7(v)); }
    }
  }
  function sweep(root) {
    if (!root || root.nodeType !== 1) { return; }
    fix(root);
    var list = root.querySelectorAll("[href],[src],[data-goto],[data-monitor-href],[data-modal-confirm],[action]");
    for (var i = 0; i < list.length; i++) { fix(list[i]); }
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === "attributes") { fix(m.target); } else { m.addedNodes.forEach(sweep); }
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener("DOMContentLoaded", function () { sweep(document.documentElement); });
  if (window.navigation) {
    window.navigation.addEventListener("navigate", function (e) {
      if (!e.cancelable || e.hashChange || e.downloadRequest) { return; }
      var u = e.destination.url;
      if (!RX.test(new URL(u).pathname)) { return; }
      e.preventDefault();
      location.href = to7(u);
    });
  }
})();

/*
 * [11/20 디자이너 · 정의서 공통-00]
 *   Q4 화면이 없는 메뉴는 비활성(개발 전) — GNB 로봇 · AI · 스케줄러 · Delta · 계정관리 · 환경설정, 계정 메뉴 내 계정 정보 · 비밀번호 변경
 *   Q5 GNB [관제]는 마지막에 보던 탭으로 — 껍데기(control-v7)에 ?view=last 를 붙여 연다(control-shell-v6.js 가 읽는다)
 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var off = document.querySelectorAll('.gnb-item[href="#"]:not([aria-current]), .account-menu a.menu-item[href="#"]');
  for (var i = 0; i < off.length; i++) {
    off[i].removeAttribute("href");
    off[i].setAttribute("aria-disabled", "true");
    off[i].setAttribute("title", "개발 전");
  }
  var home = document.querySelectorAll(".gnb-item[href]");
  for (var j = 0; j < home.length; j++) {
    if (/control-v[67]\.html$/.test(home[j].getAttribute("href"))) { home[j].setAttribute("href", "./control-v7.html?view=last"); }
  }
});

/*
 * [11/20 디자이너 · 정의서 공통-00]
 *   Q3 통신 상태 — window.APRISM_NET("ok" | "slow" | "down"). 시연은 움직임 시뮬레이션의 [통신] 칩(route-sim.js)
 *      ok 막대 4칸 · slow 막대 2칸 · down 막대 없음 + 칩에 위험 기호 + AI Server Offline + 알림 목록에 위험 알림 1건(monitor.js 가 aprism:net 을 받는다)
 *   Q8 화면 크기 — 폭 1920 미만이면 알림 패널을 저절로 접는다(관제사가 직접 펴거나 접으면 그 뒤로는 손대지 않는다). 1600 미만은 가로 스크롤(v7.css)
 */
(function () {
  "use strict";
  var NET = "ok";
  window.APRISM_NET = function (state) {
    NET = state === "slow" || state === "down" ? state : "ok";
    var lv = NET === "ok" ? "4" : NET === "slow" ? "2" : "0";
    Array.prototype.forEach.call(document.querySelectorAll(".signal-chip"), function (chip) {
      chip.classList.toggle("is-down", NET === "down");
      chip.setAttribute("aria-label", NET === "down" ? "통신 상태 · 서버 연결 끊김" : NET === "slow" ? "통신 상태 · 느림" : "통신 상태");
      var bars = chip.querySelector(".signal-bars"); if (bars) { bars.setAttribute("data-level", lv); }
      var ic = chip.querySelector(".net-sev");
      if (NET === "down" && !ic) {
        ic = document.createElement("span"); ic.className = "i i-16 net-sev"; ic.setAttribute("aria-hidden", "true");
        ic.style.setProperty("--i", "var(--ic-error)"); chip.insertBefore(ic, chip.firstChild);
      } else if (NET !== "down" && ic) { ic.remove(); }
    });
    Array.prototype.forEach.call(document.querySelectorAll(".signal-menu .menu-item"), function (row) {
      var name = row.querySelector(".t-label-2"), badge = row.querySelector(".ds-badge");
      if (name && /Network/.test(name.textContent)) { var mb = row.querySelector(".signal-bars"); if (mb) { mb.setAttribute("data-level", lv); } return; }
      if (!badge || !name || !/AI Server/.test(name.textContent)) { return; }
      var down = NET === "down";
      badge.classList.toggle("is-safe", !down); badge.classList.toggle("is-crit", down);
      badge.lastChild.textContent = down ? "Offline" : "Online";
    });
    document.dispatchEvent(new CustomEvent("aprism:net", { detail: { state: NET } }));
  };

  document.addEventListener("DOMContentLoaded", function () {
    var panel = document.getElementById("site-panel"), btn = document.querySelector("[data-panel-toggle]");
    if (!panel || !btn) { return; }
    var auto = false, manual = false, busy = false;
    btn.addEventListener("click", function () { if (!busy) { manual = true; } });
    function fit() {
      if (manual) { return; }
      var narrow = window.innerWidth < 1920, shut = panel.classList.contains("is-collapsed");
      if (narrow && !shut) { busy = true; btn.click(); busy = false; auto = true; }
      else if (!narrow && shut && auto) { busy = true; btn.click(); busy = false; auto = false; }
    }
    fit();
    var t = null;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fit, 120); });
  });
})();

// [11/20 정의서 CM-02 · 기존 기획 UI_04] 자동 로그인 = 마지막 접속부터 72시간 — v7 화면을 열 때마다 기한을 다시 72시간으로 늘린다(auth.js 가 처음 적는다)
(function () {
  try {
    var v = Number(localStorage.getItem("aprism.signedIn") || 0);
    if (v > Date.now()) { localStorage.setItem("aprism.signedIn", String(Date.now() + 72 * 3600 * 1000)); }
  } catch (e) { /* 막힘 */ }
})();


/*
 * [11/20 정의서 CM-13 · CM-06] 계정 메뉴의 로그아웃 · 관제사 교대 + 자동 로그아웃 — v7 한글 화면 모두 같은 동작(여기서 메뉴 항목과 모달 셋을 그린다).
 *   로그아웃: 수행 중인 로봇이 있으면 잠김. 확인 모달(타이머 없음, Accent) → 관제 화면 전체가 로그인 v2 로(토스트 "로그아웃됐어요").
 *   관제사 교대: 늘 보임. 교대자가 모달에서 로그인 → 전체 미션 + Delta 인계 인사(CM-07). 실패 규칙은 로그인과 같음(5회 잠금).
 *   자동 로그아웃: 주소 ?idle=초 로만 켬(시연). 수행 중인 로봇이 있으면 보류.
 *   시연: ?robots=0 이면 수행 중인 로봇 없음(관제 탭을 옮겨도 유지). 기본 3대(전체 미션 로봇 목록의 수행중 수).
 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var menu = document.querySelector(".account-menu");
  if (!menu || document.documentElement.lang === "en" || !/-v7[^\/]*\.html$/.test(location.pathname)) { return; }

  var ss = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* 막힘 */ } },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) { /* 막힘 */ } }
  };
  var rq = /[?&]robots=(\d+)/.exec(location.search);
  if (rq) { ss.set("aprism.robots", rq[1]); }
  function running() { var v = ss.get("aprism.robots"); return v === null ? 3 : Number(v) || 0; }
  var top = window.top || window;

  // 지금 관제사 — 교대하면 이름이 바뀌고, 관제 탭을 옮겨도 그대로다
  var chip = document.querySelector(".account-chip");
  var labels = chip ? chip.querySelectorAll(".t-label-2") : [];
  var who = ss.get("aprism.who");
  if (who && labels[0]) { labels[0].textContent = who; }
  function me() { return labels[0] ? labels[0].textContent.trim() : "홍길동"; }
  function role() { return labels[2] ? labels[2].textContent.trim() : "관제운영"; }

  // ---------- 메뉴 항목 ----------
  var pwItem = null;
  Array.prototype.slice.call(menu.querySelectorAll(".menu-item")).forEach(function (it) {
    var t = it.textContent.trim();
    if (t === "로그아웃" || t === "관제사 교대") { it.remove(); }
    else if (t === "비밀번호 변경") { pwItem = it; }
  });
  var anchor = pwItem;
  function item(label, icon, key) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "menu-item"; b.setAttribute("role", "menuitem"); b.setAttribute("data-v7-acct", key);
    b.innerHTML = '<span class="i i-16" style="--i:var(--ic-' + icon + ')" aria-hidden="true"></span><span class="t-label-2">' + label + "</span>";
    if (anchor) { anchor.insertAdjacentElement("afterend", b); } else { menu.appendChild(b); }
    anchor = b;
    return b;
  }
  var loItem = item("로그아웃", "power", "logout");
  var shItem = item("관제사 교대", "users", "shift");
  var n0 = running();
  loItem.disabled = n0 > 0;
  loItem.title = n0 > 0 ? "수행 중인 로봇이 있어 로그아웃할 수 없어요 · 관제사 교대를 쓰세요" : "";
  function closeMenu() {
    menu.hidden = true;
    var tr = menu.parentElement && menu.parentElement.querySelector("[data-menu-trigger]");
    if (tr) { tr.setAttribute("aria-expanded", "false"); }
  }

  // ---------- 모달 틀 ----------
  var app = document.querySelector(".app");
  var openM = null;
  function mk(html) {
    var d = document.createElement("div"); d.innerHTML = html.trim();
    var s = d.firstChild; document.body.appendChild(s);
    s.addEventListener("click", function (e) { if (e.target === s || e.target.closest("[data-v7m-close]")) { hide(s); } });
    return s;
  }
  function show(s) {
    if (openM) { hide(openM); }
    s.hidden = false; openM = s;
    if (app) { app.inert = true; }
    if (s._onShow) { s._onShow(); }
    var f = s.querySelector("[data-v7m-focus]") || s.querySelector("button"); if (f) { f.focus(); }
  }
  function hide(s) {
    if (s.hidden) { return; }
    s.hidden = true; if (openM === s) { openM = null; }
    if (app) { app.inert = false; }
    if (s._onHide) { s._onHide(); }
    if (chip) { chip.focus(); }
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openM) { e.preventDefault(); hide(openM); } });
  function leave(q) { ss.del("aprism.who"); ss.del("aprism.handover"); top.location.href = "login-v2.html" + q; }
  var X = '<button type="button" class="icon-button modal-close" data-v7m-close aria-label="닫기"><span class="i i-16" style="--i:var(--ic-close)" aria-hidden="true"></span></button>';

  // ---------- 로그아웃 확인 (CM-13 Q1 타이머 없음 · Q2 Accent) ----------
  var lo = mk(
    '<div class="modal-scrim" data-v7m="logout" hidden><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="v7m-lo-t" aria-describedby="v7m-lo-d">' +
    '<div class="modal-head"><div class="modal-titles"><h2 class="t-heading-3" id="v7m-lo-t">로그아웃할까요?</h2></div>' + X + "</div>" +
    '<div class="modal-body" id="v7m-lo-d"><p class="t-body-2 modal-desc-1"><span data-v7m-user></span> 관제를 마치고 로그인 화면으로 돌아가요.</p>' +
    '<p class="t-body-2 modal-desc-2">수행 중인 로봇은 없어요.</p></div>' +
    '<div class="modal-foot"><button type="button" class="btn is-md btn-secondary" data-v7m-close>취소</button>' +
    '<button type="button" class="btn is-md btn-accent" data-v7m-go data-v7m-focus>로그아웃</button></div></div></div>');
  lo._onShow = function () { lo.querySelector("[data-v7m-user]").textContent = me() + " · " + role(); };
  lo.querySelector("[data-v7m-go]").addEventListener("click", function () { leave("?reason=logout"); });
  loItem.addEventListener("click", function () { closeMenu(); if (!loItem.disabled) { show(lo); } });

  // ---------- 관제사 교대 (CM-13 Q3 늘 보임 · Q4 전체 미션 + 인계 인사) ----------
  var sh = mk(
    '<div class="modal-scrim" data-v7m="shift" hidden><div class="modal is-shift" role="dialog" aria-modal="true" aria-labelledby="v7m-sh-t" aria-describedby="v7m-sh-d">' +
    '<div class="shift-head"><h2 class="t-heading-3" id="v7m-sh-t">관제사 교대</h2><p class="t-body-2" id="v7m-sh-d"></p>' + X + "</div>" +
    '<div class="v7m-alert" role="alert" hidden><span class="i i-20" aria-hidden="true"></span><div><p class="v7m-alert-title">계정이 잠겼어요</p>' +
    '<p class="v7m-alert-text">비밀번호를 5회 잘못 입력했어요. 설비운영팀(내선 2400)에 잠금 해제를 요청하세요.</p></div></div>' +
    '<div class="shift-fields">' +
    '<label class="field"><span class="field-label">아이디</span><span class="field-box"><span class="i i-20" style="--i:var(--ic-user)" aria-hidden="true"></span>' +
    '<input type="text" class="field-input" id="v7m-sh-id" placeholder="사번 또는 아이디를 입력하세요" autocomplete="off" data-v7m-focus /></span></label>' +
    '<label class="field"><span class="field-label">비밀번호</span><span class="field-box"><span class="i i-20" style="--i:var(--ic-lock)" aria-hidden="true"></span>' +
    '<input type="password" class="field-input" id="v7m-sh-pw" placeholder="비밀번호를 입력하세요" autocomplete="off" />' +
    '<button type="button" class="field-eye" aria-label="비밀번호 보기"><span class="i i-20" style="--i:var(--ic-eye-off)" aria-hidden="true"></span></button></span></label>' +
    "</div>" +
    '<button type="button" class="btn is-lg btn-accent shift-go">로그인</button>' +
    '<div class="shift-help"><span class="shift-divider" aria-hidden="true"></span>' +
    '<p class="t-caption">계정 발급 · 잠금 해제 문의 : 설비운영팀 내선 2400</p>' +
    '<p class="t-caption">ⓒ 2026 APRISM · 모든 접속 기록은 감사 로그에 저장됩니다.</p></div></div></div>');
  var idIn = sh.querySelector("#v7m-sh-id"), pwIn = sh.querySelector("#v7m-sh-pw");
  var go = sh.querySelector(".shift-go"), alertBox = sh.querySelector(".v7m-alert"), eye = sh.querySelector(".field-eye");
  var MAX = 5, FAILS = "aprism.fails";
  function fails() { try { return JSON.parse(ss.get(FAILS) || "{}"); } catch (e) { return {}; } }
  function saveFails(o) { ss.set(FAILS, JSON.stringify(o)); }
  function setErr(input, msg, quiet) {
    var f = input.closest(".field"), h = f.querySelector(".field-helper");
    if (msg && !quiet && !h) { h = document.createElement("p"); h.className = "field-helper t-caption"; h.setAttribute("role", "alert"); h.id = input.id + "-help"; input.setAttribute("aria-describedby", h.id); f.appendChild(h); }
    f.classList.toggle("is-error", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (h) { h.textContent = quiet ? "" : (msg || ""); h.hidden = quiet || !msg; }
  }
  function setLock(on) {
    alertBox.hidden = !on; pwIn.disabled = on; go.disabled = on;
    if (on) { setErr(idIn, ""); setErr(pwIn, ""); }
  }
  function reset() {
    idIn.value = ""; pwIn.value = ""; setErr(idIn, ""); setErr(pwIn, ""); setLock(false);
    go.textContent = "로그인"; go.removeAttribute("aria-busy");
  }
  sh._onShow = function () {
    var n = running();
    sh.querySelector("#v7m-sh-d").innerHTML = n > 0
      ? "수행 중인 로봇 " + n + "대가 있어 로그아웃할 수 없어요.<br />교대해도 로봇 임무는 중단되지 않아요."
      : "교대할 관제사가 로그인하면 관제가 그대로 이어져요.";
  };
  sh._onHide = reset;
  idIn.addEventListener("input", function () { setErr(idIn, ""); setErr(pwIn, ""); setLock((fails()[idIn.value.trim()] || 0) >= MAX); });
  pwIn.addEventListener("input", function () { setErr(pwIn, ""); setErr(idIn, ""); });
  eye.addEventListener("click", function () {
    var shown = pwIn.type === "text"; pwIn.type = shown ? "password" : "text";
    eye.querySelector(".i").style.setProperty("--i", shown ? "var(--ic-eye-off)" : "var(--ic-eye)");
    eye.setAttribute("aria-label", shown ? "비밀번호 보기" : "비밀번호 숨기기");
  });
  [idIn, pwIn].forEach(function (el) { el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go.click(); } }); });
  go.addEventListener("click", function () {
    var id = idIn.value.trim(), pw = pwIn.value;
    setErr(idIn, id ? "" : "아이디를 입력하세요");
    setErr(pwIn, pw ? "" : "비밀번호를 입력하세요");
    if (!id) { idIn.focus(); return; }
    if (!pw) { pwIn.focus(); return; }
    var cur = (ss.get("aprism.user") || "").trim();
    if (id === me() || (cur && id === cur)) { setErr(idIn, "지금 로그인한 계정이에요. 교대할 관제사 계정을 입력하세요"); idIn.focus(); return; }
    if ((fails()[id] || 0) >= MAX) { setLock(true); return; }
    go.disabled = true; go.setAttribute("aria-busy", "true"); go.textContent = "로그인 중";
    window.setTimeout(function () {
      go.disabled = false; go.removeAttribute("aria-busy"); go.textContent = "로그인";
      var o = fails();
      if (pw === "wrong") {
        o[id] = (o[id] || 0) + 1; saveFails(o);
        if (o[id] >= MAX) { setLock(true); return; }
        setErr(idIn, "x", true);
        setErr(pwIn, "아이디 또는 비밀번호가 맞지 않아요 (남은 시도 " + (MAX - o[id]) + "회)");
        pwIn.focus(); pwIn.select();
        return;
      }
      delete o[id]; saveFails(o);
      ss.set("aprism.who", id); ss.set("aprism.user", id); ss.set("aprism.handover", "1");
      top.location.href = "control-v7.html";
    }, 700);
  });
  shItem.addEventListener("click", function () { closeMenu(); show(sh); });

  // ---------- 자동 로그아웃 (CM-06) ----------
  var m = /[?&]idle=(\d+)/.exec(location.search);
  if (!m) { return; }
  var sec = Math.max(3, parseInt(m[1], 10)), wait = null, tick = null, left = 35;
  var au = mk(
    '<div class="modal-scrim" data-v7m="autologout" hidden><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="v7m-au-t" aria-describedby="v7m-au-d">' +
    '<div class="modal-head"><div class="modal-titles"><h2 class="t-heading-3" id="v7m-au-t">자동 로그아웃 안내</h2>' +
    '<span class="t-title-1 modal-timer num" aria-live="off">35s</span></div>' + X + "</div>" +
    '<div class="modal-body" id="v7m-au-d"><p class="t-body-2 modal-desc-1"><span data-v7m-user></span> · <span data-v7m-min>30</span>분 동안 사용 기록이 없어 곧 로그아웃돼요.</p>' +
    '<p class="t-body-2 modal-desc-2">로그인을 연장할까요?</p></div>' +
    '<div class="modal-foot"><button type="button" class="btn is-md btn-ghost" data-v7m-go>로그아웃</button>' +
    '<button type="button" class="btn is-md btn-accent" data-v7m-close data-v7m-focus>연장하기</button></div></div></div>');
  if (sec >= 60) { au.querySelector("[data-v7m-min]").textContent = String(Math.round(sec / 60)); }
  var clock = au.querySelector(".modal-timer");
  au._onShow = function () {
    au.querySelector("[data-v7m-user]").textContent = me() + " · " + role();
    left = 35; clock.textContent = left + "s";
    tick = window.setInterval(function () { left -= 1; clock.textContent = Math.max(0, left) + "s"; if (left <= 0) { window.clearInterval(tick); leave("?reason=idle"); } }, 1000);
  };
  au._onHide = function () { window.clearInterval(tick); arm(); };
  au.querySelector("[data-v7m-go]").addEventListener("click", function () { ss.set("aprism.logoutBy", "user"); leave("?reason=idle"); });
  // 관제 껍데기(control-v7)에서 가려진 탭은 세지 않는다 — 보이는 탭이 센다
  function hiddenFrame() { try { var f = window.frameElement; return !!(f && !f.classList.contains("is-on")); } catch (e) { return false; } }
  function arm() {
    window.clearTimeout(wait);
    wait = window.setTimeout(function () { if (running() > 0 || hiddenFrame() || openM) { arm(); return; } show(au); }, sec * 1000);
  }
  ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"].forEach(function (ev) {
    document.addEventListener(ev, function () { if (au.hidden) { arm(); } }, { passive: true, capture: true });
  });
  arm();
});
