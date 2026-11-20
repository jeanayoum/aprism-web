/*
 * [10/30 v6] 상단 미션 탭 — 드롭다운(미션 고르기) 대신 윈도우 파일 탐색기처럼 탭을 늘어놓는다(디자이너).
 *   [전체 미션] [미션 △] [미션 ⓧ] [미션] …
 * 지금 보는 탭은 아래 면(content-surface, bg/cell)과 이어져 한 장처럼 보이고, 바닥 양옆이 바깥으로 둥글게 퍼진다.
 * 탭 이름 뒤 기호는 그 미션의 가장 높은 알림 단계(ⓧ 위험 · △ 주의) — 다른 미션에 무슨 일이 났는지 탭에서 바로 보인다.
 *
 * 탭 내용은 기존 미션 메뉴(관제 mission-scope.js 의 [data-scope-menu] · 통합 순회 building.js 의 [data-bld-menu])에서 읽는다.
 * 메뉴는 숨겨 두고 그대로 살려 둔다 — 탭을 누르면 그 메뉴 줄을 대신 누르므로 미션 바꾸기 · 들어가기 동작이 같다.
 * 메뉴가 다시 그려지면(알림 단계 · 미션이 바뀌면) 탭도 다시 그린다.
 * [10/30] 안전진단(safety.js)도 — 상단 경로([data-sf-crumb])를 그릴 때마다 통째로 새로 깔므로, 메뉴 · 통합 순회 단추는 매번 다시 찾는다.
 *   거기서 첫 탭은 다른 화면으로 가지 않고 그 화면의 "미션 전체" 보기(단추 data-sc="all")를 누른다.
 */
(function () {
  "use strict";

  var left = document.querySelector(".status-bar-left");
  var MENU = "[data-scope-menu], [data-bld-menu], .sf-scope";
  if (!left || !document.querySelector(MENU)) { return; }
  var menu, overview, onOverview;
  function find() {
    menu = document.querySelector(MENU);
    overview = left.querySelector(".sb-overview");
    onOverview = !!(overview && overview.classList.contains("is-on"));
  }

  var bar = document.createElement("nav");
  bar.className = "sb-tabs";
  bar.setAttribute("aria-label", "보는 범위");
  var logo = left.querySelector(".status-bar-logo");
  if (logo && logo.nextSibling) { left.insertBefore(bar, logo.nextSibling); } else { left.appendChild(bar); }

  // [11/05] 미션 번호 — 탭 이름 앞에 M1, M2 … 를 붙인다(디자이너). 탭을 끌어 순서를 바꿔도 번호는 미션을 따라간다.
  //   번호는 처음 펼친 탭 차례(수행중 → 대기 → 완료) 그대로 고정한다.
  var MNO = ["정기 순회 점검", "발전기실 설비 점검", "전기실 열화상 점검", "소방 설비 점검", "주간 설비 점검", "야간 순회 점검", "공조 설비 순회", "유틸리티 순회"];
  //   영문판은 번역기가 이름을 먼저 영어로 바꿔 두므로 사전(APRISM_EN)으로 영어 이름도 같은 번호에 잇는다
  var EN = window.APRISM_EN || {};
  var MNO_EN = MNO.map(function (k) { return EN[k]; });
  var IDLE = ["소방 설비 점검", "주간 설비 점검"];   // 데모 대기 미션(screen.js ver-6 블록과 같다)
  // [11/20 정의서 공통-01 Q1] v7 한글 — 미션 탭이 탭 줄 폭을 넘으면 넘친 미션을 줄 끝 [+N] 더보기 메뉴로. 보이는 개수는 화면 폭에 따름
  //   시연: 주소 ?missions=30 (관제 탭을 옮겨도 유지) — 창 폭을 줄이면 [+N] 숫자가 는다
  var V7KO = document.body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  var FIT_GAP = 24;      // 탭 줄 끝과 오른쪽 계정 영역 사이 최소 간격 (components-v7.css --ds-mtab-right-gap 과 같게)
  var SPARE = 40;        // 알림 아이콘 두 개(16 + 간격 4) 만큼 여유 — 알림이 새로 붙어도 탭이 바로 밀려나지 않게
  var MORE_W = 80;       // [+N] 버튼 자리(번호 + 알림 아이콘) — 늘 미리 비워 둔다
  if (V7KO) {
    var demoN = 0, qs = location.search; try { qs += (window.top || window).location.search; } catch (e) { /* 다른 출처 */ }
    var mq = /[?&]missions=(\d+)/.exec(qs);
    try { if (mq) { sessionStorage.setItem("aprism.missions", mq[1]); } demoN = Number(sessionStorage.getItem("aprism.missions") || 0); } catch (e) { demoN = mq ? Number(mq[1]) : 0; }
    for (var di = MNO.length + 1; di <= Math.min(demoN, 30); di++) { var dn = "추가 순회 점검 " + di; MNO.push(dn); IDLE.push(dn); }
  }
  function mno(name) { var i = MNO.indexOf(name); return i >= 0 ? i : MNO_EN.indexOf(name); }
  // 탭 밖에서 같은 번호를 쓰는 곳(전체 미션 층 카드 · building.js)이 읽는다
  window.APRISM_MISSION_NO = function (name) { var i = mno(name); return i >= 0 ? "M" + (i + 1) : ""; };
  document.dispatchEvent(new Event("aprism:mission-no"));

  function tab(tag, name, on) {
    var t = document.createElement(tag);
    t.className = "sb-tab" + (on ? " is-on" : "");
    if (tag === "button") { t.type = "button"; }
    if (on) { t.setAttribute("aria-current", "page"); }
    var n = document.createElement("span");
    n.className = "sb-tab-name t-label-1";
    n.textContent = name;
    var no = mno(name);
    if (no >= 0) {
      var m = document.createElement("span");
      m.className = "sb-tab-no t-label-1";
      m.textContent = "M" + (no + 1);
      t.appendChild(m);
    }
    t.appendChild(n);
    return t;
  }

  function build() {
    find();
    if (!menu) { return; }
    bar.textContent = "";
    // 통합 순회 현황 — 관제에서는 그 화면으로 가는 링크, 통합 순회 현황에서는 지금 탭, 안전진단에서는 "미션 전체" 단추
    var isBtn = !!(overview && overview.tagName === "BUTTON");
    // [10/30] 첫 탭 이름 = "전체 미션"(디자이너 — 관제 · 통합 순회 현황 · 안전진단 통일)
    var first = tab(isBtn ? "button" : onOverview ? "span" : "a", "전체 미션", onOverview);
    first.querySelector(".sb-tab-name").setAttribute("data-en", "All");   // [11/05] 영문판 첫 탭은 All
    if (isBtn) { var ov = overview; first.addEventListener("click", function () { if (!first.classList.contains("is-on")) { ov.click(); } }); }
    else if (!onOverview && overview) { first.href = overview.getAttribute("href") || "building-v6.html"; }
    bar.appendChild(first);

    // 끌어서 바꾼 순서(저장된 이름 차례)를 먼저, 처음 보는 미션은 메뉴 차례대로 뒤에
    var saved = loadOrder();
    var items = Array.prototype.slice.call(menu.querySelectorAll(".scope-item")).filter(function (item) { return item.querySelector(".scope-name .t-label-2"); });
    // 기본 차례는 수행중 → 대기 → 완료(관제 메뉴와 같다) — 안전진단 메뉴는 로봇 번호 차례라 여기서 맞춘다
    var RUN = { run: 0, idle: 1, done: 2 };
    var at = function (item) {
      var i = saved.indexOf(item.querySelector(".scope-name .t-label-2").textContent);
      if (i >= 0) { return i; }
      var r = item.querySelector(".scope-run"), g = r ? RUN[r.getAttribute("data-run")] : 1;
      return 1e3 + (g == null ? 1 : g) * 100 + items.indexOf(item);
    };
    items.sort(function (a, b) { return at(a) - at(b); });
    items.forEach(function (item) {
      var nm = item.querySelector(".scope-name .t-label-2");
      var on = !onOverview && item.getAttribute("aria-checked") === "true";
      var t = tab("button", nm.textContent, on);
      var run = item.querySelector(".scope-run");
      if (run) { t.setAttribute("data-run", run.getAttribute("data-run") || ""); }
      var sevEl = item.querySelector(".scope-sev");
      var sev = sevEl && sevEl.getAttribute("data-sev");
      var label = nm.textContent;
      if (mno(label) >= 0) { label = "M" + (mno(label) + 1) + " " + label; }
      if (sev) {
        var ic = document.createElement("span");
        ic.className = "i i-16 sb-tab-sev";
        ic.setAttribute("data-sev", sev);
        ic.style.setProperty("--i", "var(--ic-" + (sev === "critical" ? "error" : "warning") + ")");
        ic.setAttribute("aria-hidden", "true");
        t.appendChild(ic);
        label += " · " + (sev === "critical" ? "위험" : "주의") + " 알림 있음";
      }
      // 다른 미션에 새 위험(안전진단 시연 — 메뉴 줄의 data-new) — 탭 이름 앞 점이 깜빡이고 "새로"가 붙는다. 그 미션을 열면 사라진다
      if (item.getAttribute("data-new")) {
        t.classList.add("is-new");
        var nd = document.createElement("i"); nd.className = "sb-tab-new"; nd.setAttribute("aria-hidden", "true");
        t.insertBefore(nd, t.firstChild);
        label += " · 새 위험";
      }
      t.title = label;
      t.setAttribute("aria-label", label);
      t.setAttribute("data-mission", nm.textContent);
      t.title = label + " — 끌어서 순서 바꾸기";
      t.addEventListener("click", function () { if (justDragged) { return; } item.click(); });
      t.addEventListener("pointerdown", startDrag);
      t.addEventListener("keydown", keyMove);
      bar.appendChild(t);
    });

    // [11/05] 상단 탭 줄은 어느 화면이나 같다(디자이너) — 메뉴에 대기 미션이 없는 화면(전체 미션 · 안전진단)도 M4 · M5 를 두고, 누르면 관제 탭처럼 그 미션 설정으로
    IDLE.forEach(function (name) {
      if (bar.querySelector(".sb-tab[data-mission='" + name + "'], .sb-tab[data-mission='" + EN[name] + "']")) { return; }
      var t = tab("button", name, false);
      t.setAttribute("data-run", "idle");
      t.setAttribute("data-mission", name);
      t.title = "M" + (mno(name) + 1) + " " + name + " — 끌어서 순서 바꾸기";
      t.addEventListener("click", function () { if (justDragged) { return; } window.location.href = (window.aprismHref || String)("./mission-setup-v6.html?mission=" + encodeURIComponent(name)); });
      t.addEventListener("pointerdown", startDrag);
      t.addEventListener("keydown", keyMove);
      bar.insertBefore(t, bar.querySelector(".sb-tab[data-run='done']"));
    });
    // 끌어서 바꾼 순서가 있으면 채워 넣은 탭까지 그 차례로
    if (saved.length) {
      var pos = function (t) { var i = saved.indexOf(t.getAttribute("data-mission")); return i >= 0 ? i : 1e3; };
      missionTabs().map(function (t, i) { return [pos(t), i, t]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).forEach(function (e) { bar.appendChild(e[2]); });
    }
    fit();
  }

  /*
   * [11/20 정의서 공통-01 Q1] 넘침 — 미션 탭을 차례대로 폭이 허락하는 만큼 보이고 나머지는 [+N] 메뉴로.
   *   폭 = 오른쪽 계정 영역 왼쪽 끝 − 24, [+N] 자리와 아이콘 두 개 여유는 미리 뺀다.
   *   개수는 창 크기 · 미션 수 · 지금 미션이 바뀔 때만 다시 센다. 그 사이 알림 아이콘이 붙고 빠져도 개수는 그대로(넘칠 때만 줄인다) — 탭이 들락날락하지 않게.
   *   지금 보는 미션이 숨을 자리면 마지막으로 보이는 탭과 자리를 바꾼다. 아무리 좁아도 [전체 미션] · 지금 미션 · [+N] 은 남는다.
   *   [+N] 에는 숨은 미션 중 가장 높은 알림 단계 아이콘(숨어 있어도 위험을 놓치지 않게), 새 위험이 있으면 점.
   */
  var more = null, moreMenu = null, fitKey = "", fitCount = 0;
  function closeMore() {
    if (moreMenu) { moreMenu.remove(); moreMenu = null; }
    if (more) { more.setAttribute("aria-expanded", "false"); }
  }
  function fit() {
    if (!V7KO) { return; }
    closeMore();
    if (more) { more.remove(); more = null; }
    var all = Array.prototype.slice.call(bar.querySelectorAll(".sb-tab[data-mission]"));
    all.forEach(function (t) { t.hidden = false; });
    if (!all.length) { return; }
    var br = bar.getBoundingClientRect();
    if (!br.width) { return; }   // 숨은 화면(보이지 않는 틀) — 보일 때 크기 변화로 다시 센다
    var gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
    var x0 = all[0].getBoundingClientRect().left;
    var w = all.map(function (t) { return t.getBoundingClientRect().width + gap; });
    // 오른쪽 끝은 탭을 다 숨긴 채로 잰다 — 다 펼친 채로 재면 넘친 탭에 계정 영역이 밀려 있다
    all.forEach(function (t) { t.hidden = true; });
    var right = document.querySelector(".status-bar-right");
    br = bar.getBoundingClientRect();
    var limit = right ? Math.min(br.right, right.getBoundingClientRect().left - FIT_GAP) : br.right - FIT_GAP;
    all.forEach(function (t) { t.hidden = false; });
    var sum = function (arr) { return arr.reduce(function (a, b) { return a + b; }, 0); };
    var ci = all.findIndex(function (t) { return t.classList.contains("is-on"); });
    var key = window.innerWidth + "|" + all.length + "|" + (ci >= 0 ? all[ci].getAttribute("data-mission") : "");
    var same = key === fitKey;
    fitKey = key;
    var fitsAll = x0 + sum(w) - gap <= limit - (same ? 0 : SPARE);
    if (fitsAll && !(same && fitCount < all.length)) { fitCount = all.length; return; }   // 다 들어간다
    var room = limit - x0 - MORE_W - (same ? 0 : SPARE);
    var keep = [], used = ci >= 0 ? w[ci] : 0, cap = same ? fitCount : Infinity;
    all.forEach(function (t, i) {
      if (i === ci) { keep.push(i); return; }
      if (keep.length < cap && used + w[i] <= room) { used += w[i]; keep.push(i); } else { used = Infinity; }   // 한 번 넘치면 뒤는 모두 숨김(차례 유지)
    });
    fitCount = keep.length;
    var vis = all.filter(function (t, i) { return keep.indexOf(i) >= 0; });
    var hid = all.filter(function (t, i) { return keep.indexOf(i) < 0; });
    if (!hid.length) { return; }
    hid.forEach(function (t) { t.hidden = true; });
    more = document.createElement("button");
    more.type = "button";
    more.className = "sb-tab sb-tab-more";
    more.setAttribute("aria-haspopup", "menu");
    more.setAttribute("aria-expanded", "false");
    var lab = document.createElement("span"); lab.className = "sb-tab-no t-label-1"; lab.textContent = "+" + hid.length;
    more.appendChild(lab);
    var top = null;
    hid.forEach(function (t) { var ic = t.querySelector(".sb-tab-sev"); if (ic && (!top || ic.getAttribute("data-sev") === "critical")) { top = ic; } });
    if (top) { more.appendChild(top.cloneNode(true)); }
    var fresh = hid.some(function (t) { return t.classList.contains("is-new"); });
    if (fresh) { more.classList.add("is-new"); var nd = document.createElement("i"); nd.className = "sb-tab-new"; nd.setAttribute("aria-hidden", "true"); more.insertBefore(nd, more.firstChild); }
    var say = "숨은 미션 " + hid.length + "개" + (top ? " · " + (top.getAttribute("data-sev") === "critical" ? "위험" : "주의") + " 알림 있음" : "") + (fresh ? " · 새 위험" : "");
    more.title = say; more.setAttribute("aria-label", say);
    more.addEventListener("click", function (event) {
      event.stopPropagation();
      if (moreMenu) { closeMore(); return; }
      moreMenu = document.createElement("div");
      moreMenu.className = "dropdown-menu sb-more-menu";
      moreMenu.setAttribute("role", "menu");
      moreMenu.setAttribute("aria-label", "숨은 미션");
      hid.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "menu-item"; b.setAttribute("role", "menuitem");
        var no = t.querySelector(".sb-tab-no"), nm = t.querySelector(".sb-tab-name"), ic = t.querySelector(".sb-tab-sev");
        if (no) { b.appendChild(no.cloneNode(true)); }
        var n2 = document.createElement("span"); n2.className = "t-label-2 sb-more-name"; n2.textContent = nm ? nm.textContent : ""; b.appendChild(n2);
        if (ic) { b.appendChild(ic.cloneNode(true)); }
        b.setAttribute("aria-label", t.getAttribute("aria-label") || t.getAttribute("data-mission"));
        b.addEventListener("click", function () { closeMore(); t.click(); });
        moreMenu.appendChild(b);
      });
      var r = more.getBoundingClientRect();
      moreMenu.style.position = "fixed";
      moreMenu.style.top = Math.round(r.bottom + 4) + "px";
      moreMenu.style.left = Math.round(r.left) + "px";
      document.body.appendChild(moreMenu);
      more.setAttribute("aria-expanded", "true");
      var f = moreMenu.querySelector(".menu-item"); if (f) { f.focus(); }
    });
    bar.appendChild(more);
  }
  if (V7KO) {
    // 창 크기가 바뀌면(숨었던 틀이 보일 때 포함) 다시 센다 — 폭만 본다
    var lastW = -1, raf = 0;
    var refit = function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var wd = window.innerWidth; if (wd !== lastW && !drag) { lastW = wd; fit(); } }); };
    window.addEventListener("resize", refit);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (!drag) { fit(); } }); }   // 글꼴이 늦게 오면 폭이 달라진다
    document.addEventListener("click", function (event) { if (moreMenu && !moreMenu.contains(event.target)) { closeMore(); } });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && moreMenu) { closeMore(); if (more) { more.focus(); } } });
  }

  /*
   * [10/30 v6] 탭 순서 바꾸기 — 미션 탭을 잡고 옆으로 끌면 자리가 바뀐다(디자이너). [통합 순회 현황]은 맨 앞에 고정.
   * 끄는 탭은 손을 따라오고, 지나치는 탭은 반 넘게 넘어가면 비켜 선다(부드럽게 미끄러짐). 놓으면 제자리로 붙는다.
   * 순서는 이 브라우저에 기억한다(localStorage) — 관제 · 통합 순회 현황 두 화면이 같은 순서를 쓴다.
   * 키보드: 탭에 초점을 두고 Alt + ← / → 로 한 칸씩 옮긴다.
   */
  var KEY = "aprism-v6-tab-order";
  function loadOrder() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function saveOrder() {
    var names = Array.prototype.map.call(bar.querySelectorAll(".sb-tab[data-mission]"), function (t) { return t.getAttribute("data-mission"); });
    try { localStorage.setItem(KEY, JSON.stringify(names)); } catch (e) { /* 저장 못 하면 이번 화면에서만 */ }
  }
  // [11/05] 관제 껍데기(control-v6)는 두 화면을 함께 띄워 둔다 — 한쪽에서 순서를 바꾸면 다른 쪽 탭 줄도 다시 그린다
  window.addEventListener("storage", function (event) { if (event.key === KEY) { build(); } });
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var drag = null, justDragged = false, pending = false;

  function missionTabs() { return Array.prototype.slice.call(bar.querySelectorAll(".sb-tab[data-mission]:not([hidden])")); }
  // 옮기기 전후 자리를 재서 비켜 서는 탭을 미끄러뜨린다(FLIP)
  function slide(moveFn, except) {
    var tabs = missionTabs().filter(function (t) { return t !== except; });
    var before = tabs.map(function (t) { return t.getBoundingClientRect().left; });
    moveFn();
    if (reduce) { return; }
    tabs.forEach(function (t, i) {
      var dx = before[i] - t.getBoundingClientRect().left;
      if (!dx) { return; }
      t.style.transition = "none";
      t.style.transform = "translateX(" + dx + "px)";
      requestAnimationFrame(function () { t.style.transition = "transform 180ms ease"; t.style.transform = ""; });
    });
  }
  function startDrag(event) {
    if (event.button !== 0) { return; }
    var t = event.currentTarget;
    drag = { t: t, x0: event.clientX, moved: false, id: event.pointerId };
    t.addEventListener("pointermove", onDrag);
    t.addEventListener("pointerup", endDrag);
    t.addEventListener("pointercancel", endDrag);
  }
  function onDrag(event) {
    if (!drag) { return; }
    var t = drag.t, dx = event.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) { return; }
      drag.moved = true;
      try { t.setPointerCapture(drag.id); } catch (e) { /* 합성 이벤트 등 */ }
      t.classList.add("is-dragging");
      bar.classList.add("is-sorting");
      t.style.transition = "none";
    }
    // 손 자리 — 끄는 탭의 원래 자리(transform 뺀 것)에서 dx 만큼. 맨 앞 · 맨 뒤 미션 탭 밖으로는 안 나간다
    t.style.transform = "";
    var home = t.getBoundingClientRect();
    var tabs = missionTabs(), lo = tabs[0].getBoundingClientRect().left - home.left, hi = tabs[tabs.length - 1].getBoundingClientRect().right - home.right;
    var off = Math.max(lo, Math.min(hi, event.clientX - drag.x0));
    var cx = home.left + home.width / 2 + off;
    // 반 넘게 넘어간 옆 탭과 자리를 바꾼다
    var prev = t.previousElementSibling, next = t.nextElementSibling;
    if (next && next.hasAttribute("data-mission") && cx > next.getBoundingClientRect().left + next.getBoundingClientRect().width / 2) {
      slide(function () { bar.insertBefore(next, t); }, t);
    } else if (prev && prev.hasAttribute("data-mission") && cx < prev.getBoundingClientRect().left + prev.getBoundingClientRect().width / 2) {
      slide(function () { bar.insertBefore(t, prev); }, t);
    }
    // 자리를 바꿨으면 원래 자리가 옮겨졌다 — 그만큼 기준을 옮겨 탭이 손 밑에 그대로 있게
    var shift = t.getBoundingClientRect().left - home.left;
    drag.x0 += shift;
    t.style.transform = "translateX(" + (off - shift) + "px)";
  }
  function endDrag() {
    if (!drag) { return; }
    var t = drag.t, moved = drag.moved;
    t.removeEventListener("pointermove", onDrag);
    t.removeEventListener("pointerup", endDrag);
    t.removeEventListener("pointercancel", endDrag);
    drag = null;
    if (!moved) { return; }
    // 놓으면 제자리로 붙는다. 끈 뒤 바로 오는 click 은 미션을 바꾸지 않게 한 번 막는다
    t.style.transition = reduce ? "none" : "transform 160ms ease";
    t.style.transform = "";
    t.classList.remove("is-dragging");
    bar.classList.remove("is-sorting");
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 0);
    saveOrder();
    if (pending) { pending = false; build(); } else { fit(); }
  }
  function keyMove(event) {
    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) { return; }
    event.preventDefault();
    var t = event.currentTarget, sib = event.key === "ArrowLeft" ? t.previousElementSibling : t.nextElementSibling;
    if (!sib || !sib.hasAttribute("data-mission")) { return; }
    slide(function () { if (event.key === "ArrowLeft") { bar.insertBefore(t, sib); } else { bar.insertBefore(sib, t); } });
    t.focus();
    saveOrder();
    fit();
    t.focus();
  }

  build();
  // 메뉴가 다시 그려지면(알림 단계 · 미션) 탭도 — 끄는 중이면 놓은 뒤에
  // 상태바 왼쪽 전체를 본다 — 메뉴가 통째로 바뀌는 화면(안전진단)도 있다. 탭 줄 자신이 바뀐 것은 무시한다
  new MutationObserver(function (list) {
    if (list.every(function (r) { return bar.contains(r.target); })) { return; }
    if (drag && drag.moved) { pending = true; } else { build(); }
  }).observe(left, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-checked", "class"] });
})();
