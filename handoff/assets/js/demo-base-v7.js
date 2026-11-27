(function() {
  "use strict";
  var B = {
    me: "op1",
    people: {
      op1: {
        name: "홍길동",
        team: "관제"
      },
      op2: {
        name: "김현대",
        team: "관제"
      },
      op3: {
        name: "이수진",
        team: "관제"
      },
      fe1: {
        name: "김현우",
        team: "설비팀"
      },
      fe2: {
        name: "박지훈",
        team: "설비팀"
      },
      el1: {
        name: "이도윤",
        team: "전기팀"
      },
      sa1: {
        name: "최서연",
        team: "안전관리팀"
      }
    },
    robots: {
      r00: "Robot 00",
      r01: "Robot 01",
      r02: "Robot 02",
      r03: "Robot 03",
      r04: "Robot 04",
      r05: "Robot 05",
      r06: "Robot 06",
      r07: "Robot 07",
      r08: "Robot 08",
      r09: "Robot 09",
      r10: "Robot 10",
      r11: "Robot 11",
      r12: "Robot 12"
    },
    missions: {
      m1: "정기 순회 점검",
      m2: "발전기실 설비 점검",
      m3: "전기실 열화상 점검",
      m4: "소방 설비 점검",
      m5: "주간 설비 점검",
      m6: "야간 순회 점검",
      m7: "공조 설비 순회",
      m8: "유틸리티 순회",
      m9: "통합 순회"
    }
  };
  B.name = function(id, fallback) {
    var p = B.people[id];
    return p ? p.name : fallback || "";
  };
  B.team = function(id, fallback) {
    var p = B.people[id];
    return p ? p.team : fallback || "";
  };
  B.robot = function(id, fallback) {
    return B.robots[id] || fallback || "";
  };
  B.mission = function(id, fallback) {
    return B.missions[id] || fallback || "";
  };
  B.copy = function(s) {
    return s == null ? s : String(s).replace(/\s*·\s*/g, ", ");
  };
  B.robotAt = function(n) {
    var id = "r" + (n < 10 ? "0" : "") + n;
    return B.robots[id] || "Robot " + (n < 10 ? "0" : "") + n;
  };
  B.fill = function(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-base]"), function(el) {
      var k = el.getAttribute("data-base"), v = k === "me" ? B.name(B.me) : k.indexOf("person.") === 0 ? B.name(k.slice(7)) : k.indexOf("robot.") === 0 ? B.robot(k.slice(6)) : k.indexOf("mission.") === 0 ? B.mission(k.slice(8)) : "";
      if (v && el.textContent !== v) {
        el.textContent = v;
      }
    });
  };
  window.APRISM_BASE = B;
  window.APRISM_NAME = function(id) {
    return B.name(id);
  };
  window.APRISM_ROBOT = function(id) {
    return B.robot(id);
  };
  window.APRISM_ROBOT_AT = B.robotAt;
  window.APRISM_MISSION = function(id) {
    return B.mission(id);
  };
  window.APRISM_COPY = B.copy;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      B.fill();
    });
  } else {
    B.fill();
  }
})();
