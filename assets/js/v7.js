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
