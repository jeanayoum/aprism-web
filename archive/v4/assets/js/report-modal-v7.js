/*
 * [11/23 디자이너 · 정의서 관제화면-04 Q1] 미션 완료 [보고서 보러가기] → 관제 화면 위에 보고서 모달.
 *   보고서 화면(report-v7.html?embed=modal)을 투명 틀로 얹어 report.js 의 같은 모달을 쓴다 — 관제를 떠나지 않는다.
 *   모달의 [닫기] · Esc → 틀을 걷는다, "보고서 메뉴에서 보기" → 보고서 화면(보고서-01)으로 간다.
 *   v7 한글 관제(main-v7)만 싣는다.
 */
(function () {
  "use strict";
  if (!document.body.classList.contains("ver-7") || document.documentElement.lang === "en") { return; }
  var frame = null, back = null;
  function close() {
    if (!frame) { return; }
    frame.remove(); frame = null;
    if (back && back.isConnected) { back.focus(); }
  }
  function open(from) {
    close();
    back = from;
    frame = document.createElement("iframe");
    frame.className = "rp-embed-frame";
    frame.title = "미션 보고서";
    frame.src = "./report-v7.html?embed=modal";
    frame.addEventListener("load", function () { try { frame.contentWindow.focus(); } catch (e) { /* 막힘 */ } });
    document.body.appendChild(frame);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-rr-report]");
    if (!a) { return; }
    e.preventDefault();
    open(a);
  }, true);
  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.aprism === "report-close") { close(); }
    if (d.aprism === "report-menu") { location.href = "./report-v7.html"; }
  });
})();
