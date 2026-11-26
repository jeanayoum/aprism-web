/*
 * [11/26 v7, v8] 예시 데이터 기준 목록 — 사람, 로봇, 미션 이름을 한 곳에.
 *   예전에는 같은 이름이 화면 JS 와 HTML 여러 곳에 따로 적혀(홍길동 20곳, 김현대 7곳 등) 하나만 고치면 화면끼리 어긋났다.
 *   v7, v8 화면(*-v7.html, safety-v8-*.html)만 가장 먼저 싣는다. v6 이하 화면은 이 파일이 없어 각 JS 의 예전 글을 그대로 씀.
 *
 *   쓰는 법
 *     JS    : var B = window.APRISM_BASE; B ? B.name("op2", "김현대") : "김현대"   (파일마다 작은 도우미 NAME 을 둠)
 *     HTML  : <span data-base="me">홍길동</span>  → 이 파일이 글을 채움(글은 빈 화면 대비 예전 글 그대로 둠)
 *     메모  : B.copy("현장 점검 · 이상 없음") → "현장 점검, 이상 없음"  (화면 글 규칙: 가운뎃점 대신 쉼표)
 *
 *   나중에 서버가 생기면 이 파일만 서버 응답으로 바꾸면 된다(화면 코드는 번호로만 가리킴).
 */
(function () {
  "use strict";
  var B = {
    me: "op1",   // 로그인한 관제사
    // 사람: 관제사(op), 현장 담당(fe 설비, el 전기, sa 안전관리)
    people: {
      op1: { name: "홍길동", team: "관제" },
      op2: { name: "김현대", team: "관제" },
      op3: { name: "이수진", team: "관제" },
      fe1: { name: "김현우", team: "설비팀" },
      fe2: { name: "박지훈", team: "설비팀" },
      el1: { name: "이도윤", team: "전기팀" },
      sa1: { name: "최서연", team: "안전관리팀" }
    },
    // 로봇: 번호 → 이름
    robots: { r00: "Robot 00", r01: "Robot 01", r02: "Robot 02", r03: "Robot 03", r04: "Robot 04", r05: "Robot 05", r06: "Robot 06", r07: "Robot 07", r08: "Robot 08", r09: "Robot 09", r10: "Robot 10", r11: "Robot 11", r12: "Robot 12" },
    // 미션: 번호 → 이름
    missions: { m1: "정기 순회 점검", m2: "발전기실 설비 점검", m3: "전기실 열화상 점검", m4: "소방 설비 점검", m5: "주간 설비 점검", m6: "야간 순회 점검", m7: "공조 설비 순회", m8: "유틸리티 순회", m9: "통합 순회" }
  };
  B.name = function (id, fallback) { var p = B.people[id]; return p ? p.name : (fallback || ""); };
  B.team = function (id, fallback) { var p = B.people[id]; return p ? p.team : (fallback || ""); };
  B.robot = function (id, fallback) { return B.robots[id] || fallback || ""; };
  B.mission = function (id, fallback) { return B.missions[id] || fallback || ""; };
  // 화면 글 규칙: 가운뎃점(·) 구분자 대신 쉼표
  B.copy = function (s) { return s == null ? s : String(s).replace(/\s*·\s*/g, ", "); };
  // 로봇 번호(1부터)로 이름: robotAt(5) → "Robot 05". 화면 JS 가 번호에서 이름을 만들 때 씀
  B.robotAt = function (n) { var id = "r" + (n < 10 ? "0" : "") + n; return B.robots[id] || ("Robot " + (n < 10 ? "0" : "") + n); };
  // data-base 붙은 요소 글 채우기: "me" = 로그인 관제사, "person.op2" = 사람, "robot.r05" = 로봇, "mission.m2" = 미션
  B.fill = function (root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-base]"), function (el) {
      var k = el.getAttribute("data-base"), v = k === "me" ? B.name(B.me) : k.indexOf("person.") === 0 ? B.name(k.slice(7)) : k.indexOf("robot.") === 0 ? B.robot(k.slice(6)) : k.indexOf("mission.") === 0 ? B.mission(k.slice(8)) : "";
      if (v && el.textContent !== v) { el.textContent = v; }
    });
  };
  window.APRISM_BASE = B;
  // 공유 JS(v6 도 쓰는 파일)에서 짧게 부르는 도우미: (window.APRISM_NAME ? APRISM_NAME("op1") : "홍길동")
  window.APRISM_NAME = function (id) { return B.name(id); };
  window.APRISM_ROBOT = function (id) { return B.robot(id); };
  window.APRISM_ROBOT_AT = B.robotAt;
  window.APRISM_MISSION = function (id) { return B.mission(id); };
  window.APRISM_COPY = B.copy;
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { B.fill(); }); } else { B.fill(); }
})();
