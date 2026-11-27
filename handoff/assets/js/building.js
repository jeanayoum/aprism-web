(function() {
  "use strict";
  var body = document.body;
  if (!body.classList.contains("is-building")) {
    return;
  }
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) {
      node.className = cls;
    }
    if (text != null) {
      node.textContent = text;
    }
    return node;
  }
  function icon(name, size) {
    var node = el("span", "i i-" + (size || 16));
    node.style.setProperty("--i", "var(--ic-" + name + ")");
    node.setAttribute("aria-hidden", "true");
    return node;
  }
  var FLOORS = [ "B3", "B4" ];
  var FNAME = {
    B3: "지하 3층",
    B4: "지하 4층"
  };
  var MISSION_FLOORS = {
    [window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검"]: [ "B3", "B4" ],
    [window.APRISM_MISSION ? APRISM_MISSION("m6") : "야간 순회 점검"]: [ "B4" ],
    [window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검"]: [ "B3" ],
    [window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회"]: [ "B3" ],
    [window.APRISM_MISSION ? APRISM_MISSION("m8") : "유틸리티 순회"]: [ "B4" ],
    [window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검"]: [ "B3" ]
  };
  var V3 = body.classList.contains("ver-3");
  var V6 = body.classList.contains("ver-6");
  var V7B = body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  if (V3) {
    MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검"] = [ "B4" ];
    MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검"] = [ "B3", "B4" ];
  }
  var floorView = null;
  var MISSION_LIST = Object.keys(MISSION_FLOORS);
  function missionsOn(f) {
    return MISSION_LIST.filter(function(m) {
      return MISSION_FLOORS[m].indexOf(f) >= 0;
    });
  }
  var ROBOTS = [ {
    n: 1,
    floor: "B4",
    st: "run",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검",
    now: "N₂ 배관 압력 점검",
    done: 3,
    total: 20,
    bat: 78,
    sig: 4,
    uv: [ 0.42, 0.40 ]
  }, {
    n: 2,
    floor: "B4",
    st: "idle",
    mission: null,
    now: "복귀 중",
    bat: 18,
    chg: false,
    sig: 2,
    uv: [ 0.70, 0.66 ],
    moving: true
  }, {
    n: 3,
    floor: "B4",
    st: "idle",
    mission: null,
    now: "대기 중",
    bat: 35,
    chg: true,
    sig: 3,
    uv: [ 0.90, 0.92 ],
    dock: true
  }, {
    n: 4,
    floor: "B4",
    st: "done",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m6") : "야간 순회 점검",
    now: "순회 완료",
    done: 20,
    total: 20,
    bat: 92,
    sig: 4,
    uv: [ 0.76, 0.92 ],
    dock: true
  }, {
    n: 5,
    floor: "B4",
    st: "run",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검",
    now: "발전기 베어링 진동 측정",
    done: 13,
    total: 20,
    bat: 64,
    sig: 3,
    uv: [ 0.58, 0.30 ]
  }, {
    n: 6,
    floor: "B4",
    st: "idle",
    mission: null,
    now: "충전 중",
    bat: 8,
    chg: true,
    sig: 2,
    uv: [ 0.90, 0.80 ],
    dock: true
  }, {
    n: 7,
    floor: "B3",
    st: "done",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회",
    now: "순회 완료",
    done: 20,
    total: 20,
    bat: 96,
    chg: true,
    sig: 4,
    uv: [ 0.10, 0.92 ],
    dock: true
  }, {
    n: 8,
    floor: "B3",
    st: "idle",
    mission: null,
    now: "대기 중",
    bat: 47,
    sig: 3,
    uv: [ 0.24, 0.92 ],
    dock: true
  }, {
    n: 9,
    floor: "B4",
    st: "done",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m8") : "유틸리티 순회",
    now: "순회 완료",
    done: 20,
    total: 20,
    bat: 88,
    sig: 4,
    uv: [ 0.76, 0.80 ],
    dock: true
  }, {
    n: 10,
    floor: "B3",
    st: "off",
    mission: null,
    now: "통신 끊김",
    bat: 29,
    sig: 0,
    uv: [ 0.30, 0.62 ]
  }, {
    n: 11,
    floor: "B3",
    st: "run",
    mission: window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검",
    now: "배전반실 열화상 점검",
    done: 3,
    total: 20,
    bat: 71,
    sig: 4,
    uv: [ 0.66, 0.58 ]
  }, {
    n: 12,
    floor: "B3",
    st: "idle",
    mission: null,
    now: "충전 중",
    bat: 55,
    chg: true,
    sig: 3,
    uv: [ 0.10, 0.80 ],
    dock: true
  } ];
  if (body.classList.contains("ver-5")) {
    ROBOTS[0].done = 7;
  }
  if (V6) {
    ROBOTS[2].mission = window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검";
    ROBOTS[7].mission = window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검";
    MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검"] = [ "B4" ];
    MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검"] = [ "B3" ];
    MISSION_LIST = Object.keys(MISSION_FLOORS);
  }
  if (V3) {
    ROBOTS.forEach(function(r) {
      if (r.n === 11) {
        r.now = "케미컬 공급 캐비닛 CDS-02 판독";
        r.done = 7;
      }
    });
  }
  var BADGE = {
    run: {
      cls: "badge-info",
      text: "수행중"
    },
    done: {
      cls: "badge-normal",
      text: "완료"
    },
    idle: {
      cls: "badge-idle",
      text: "대기"
    },
    off: {
      cls: "badge-danger",
      text: "끊김"
    }
  };
  function rname(r) {
    return window.APRISM_ROBOT_AT ? APRISM_ROBOT_AT(r.n) : "Robot " + (r.n < 10 ? "0" : "") + r.n;
  }
  var ALERTS = [ {
    sev: "critical",
    robot: 1,
    floor: "B4",
    where: "터빈 2 / Unit 03 · WP-04 N₂ 배관 압력계",
    time: "10:12:40",
    title: "지하발전소 터빈 2 NG 1건 발견",
    uv: [ 0.38, 0.34 ]
  }, {
    sev: "warning",
    robot: 1,
    floor: "B4",
    where: "APRO 4F · WP-03 냉각수 배관 밸브",
    time: "10:11:19",
    title: "누출감지 · 냉각수 배관 밸브",
    uv: [ 0.30, 0.52 ]
  }, {
    sev: "warning",
    robot: 5,
    floor: "B3",
    where: (window.APRISM_ROBOT ? APRISM_ROBOT("r05") : "Robot 05") + " · WP-06 수배전반",
    time: "10:09:42",
    title: "부분방전 · 이상 점수 9.41",
    uv: [ 0.62, 0.22 ]
  }, {
    sev: "warning",
    robot: 5,
    floor: "B3",
    where: (window.APRISM_ROBOT ? APRISM_ROBOT("r05") : "Robot 05") + " · WP-12 냉각 펌프 P-2",
    time: "10:06:05",
    title: "진동 상승 · 냉각 펌프 P-2",
    uv: [ 0.64, 0.46 ]
  }, {
    sev: "warning",
    robot: 5,
    floor: "B3",
    where: (window.APRISM_ROBOT ? APRISM_ROBOT("r05") : "Robot 05") + " · WP-02 발전기 베어링",
    time: "10:03:27",
    title: "과열 · 발전기 베어링 68.4℃",
    uv: [ 0.56, 0.24 ]
  }, {
    sev: "warning",
    robot: 5,
    floor: "B4",
    where: (window.APRISM_ROBOT ? APRISM_ROBOT("r05") : "Robot 05") + " · WP-13 공기 압축기 C-1",
    time: "10:01:12",
    title: "압력 편차 · 공기 압축기 C-1",
    uv: [ 0.50, 0.74 ]
  } ];
  if (V3) {
    ALERTS.push({
      sev: "critical",
      robot: 11,
      floor: "B3",
      where: (window.APRISM_ROBOT ? APRISM_ROBOT("r11") : "Robot 11") + " · WP-02 HEPA Filter 차압계",
      time: "09:44:18",
      title: "차압 NG · HEPA Filter 차압계",
      uv: [ 0.60, 0.50 ]
    }, {
      sev: "warning",
      robot: 11,
      floor: "B3",
      where: (window.APRISM_ROBOT ? APRISM_ROBOT("r11") : "Robot 11") + " · WP-04 N₂ 배관 압력계",
      time: "10:15:52",
      title: "압력 편차 · N₂ 배관 압력계",
      uv: [ 0.70, 0.64 ]
    });
  }
  if (body.classList.contains("ver-5")) {
    ROBOTS.forEach(function(r) {
      if (r.n === 1) {
        r.done = 7;
        r.now = "열교환기로 이동 중";
      }
    });
    ALERTS.push({
      sev: "warning",
      robot: 1,
      floor: "B4",
      where: "APRO 4F · WP-05 냉각 펌프 P-2",
      time: "10:13:52",
      title: "이상음향 · 냉각 펌프 P-2",
      uv: [ 0.22, 0.62 ]
    }, {
      sev: "warning",
      robot: 1,
      floor: "B4",
      where: "APRO 4F · WP-05 냉각 펌프 P-2",
      time: "10:14:10",
      title: "온도감지 · 냉각 펌프 P-2 48.6℃",
      uv: [ 0.24, 0.66 ]
    }, {
      sev: "warning",
      robot: 1,
      floor: "B4",
      where: "APRO 4F · WP-06 수배전반 MCC-1",
      time: "10:15:31",
      title: "부분방전 · CH1 이상 점수 9.05",
      uv: [ 0.30, 0.78 ]
    }, {
      sev: "critical",
      robot: 1,
      floor: "B4",
      where: "APRO 4F · WP-07 고소 작업 발판",
      time: "10:16:48",
      title: "안전감지 · 안전벨트 미착용 1명",
      uv: [ 0.40, 0.62 ]
    });
  }
  if (window.APRISM_ALERTS7) {
    ALERTS = window.APRISM_ALERTS7.forBuilding();
  }
  ALERTS.forEach(function(a) {
    a.mission = robotNo(a.robot).mission;
  });
  if (body.classList.contains("ver-6")) {
    ALERTS.forEach(function(al) {
      if (al.title === "진동 상승 · 냉각 펌프 P-2") {
        al.title = "이상음향 · 이상 점수 21.6";
      }
      var T = {
        "이상음향 · 이상 점수 21.6": "09:56:05",
        "부분방전 · 이상 점수 9.41": "09:36:42",
        "과열 · 발전기 베어링 68.4℃": "09:20:14"
      };
      if (T[al.title]) {
        al.time = T[al.title];
      }
    });
  }
  var DONE = [ {
    time: "10:29:10",
    title: "온도감지 · WP-03 펌프 하우징",
    how: "추이 관찰 · 다음 순회 재측정",
    who: window.APRISM_NAME ? APRISM_NAME("op2") : "김현대"
  }, {
    time: "10:18:52",
    title: "소음 이상 · 변압기 TR-1",
    how: "현장 점검 요청 · 이상 없음",
    who: window.APRISM_NAME ? APRISM_NAME("op2") : "김현대"
  }, {
    time: "10:02:31",
    title: "진동감지 · WP-02 터빈1 베어링",
    how: "추이 관찰 · 다음 순회 재측정",
    who: window.APRISM_NAME ? APRISM_NAME("op1") : "홍길동"
  }, {
    time: "09:47:15",
    title: "온도감지 · WP-03 펌프 하우징",
    how: "현장 점검 요청 · 이상 없음",
    who: window.APRISM_NAME ? APRISM_NAME("op1") : "홍길동"
  }, {
    time: "09:30:08",
    title: "누유 흔적 · 유압 유닛 HU-2",
    how: "청소 후 재측정 · 정상",
    who: window.APRISM_NAME ? APRISM_NAME("op2") : "김현대"
  } ];
  if (V6) {
    [ [ "온도감지 · 최고 온도 44.2 ℃", "WP-03" ], [ "부분방전 · 이상 점수 8.92", "WP-11" ], [ "이상음향 · 이상 점수 19.6", "WP-02" ], [ "온도감지 · 최고 온도 41.5 ℃", "WP-03" ], [ "누출감지 · 누출 의심도 58%", "WP-09" ] ].forEach(function(x, i) {
      DONE[i].title = x[0];
      DONE[i].wp = x[1];
    });
    DONE[0].time = "10:19:10";
  }
  var DONE_ST = {
    wait: "현장 응답 대기",
    work: "현장 조치 중",
    done: "조치 완료"
  };
  if (V7B) {
    DONE = window.APRISM_ALERTS7 ? window.APRISM_ALERTS7.doneBase().map(function(d) {
      delete d.who;
      return d;
    }) : [];
  }
  if (window.APRISM_ALERTS7) {
    var R7 = window.APRISM_ALERTS7.req.all(), ids7 = Object.keys(R7).sort().join(",");
    ALERTS = ALERTS.filter(function(a) {
      var r = a.id && R7[a.id];
      if (!r) {
        return true;
      }
      DONE.push({
        time: r.t,
        title: window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(a.title) : a.title,
        how: (r.how || []).join(" · "),
        who: r.who || (window.APRISM_NAME ? APRISM_NAME("op1") : "홍길동"),
        wp: (/WP-\d+/.exec(a.where) || [ "" ])[0],
        reqId: a.id,
        mission: a.mission
      });
      return false;
    });
    DONE.sort(function(x, y) {
      return x.time < y.time ? 1 : x.time > y.time ? -1 : 0;
    });
    document.addEventListener("aprism:requested", function() {
      if (Object.keys(window.APRISM_ALERTS7.req.all()).sort().join(",") !== ids7) {
        location.reload();
      }
    });
  }
  var T0 = 6 * 60, T1 = 14 * 60, NOW = 10 * 60 + 11;
  function hm(t) {
    var p = t.split(":");
    return +p[0] * 60 + +p[1];
  }
  var GANTT = [ {
    n: 1,
    bars: [ [ "09:12", "10:11", "run" ], [ "10:11", "14:00", "run", 1 ] ]
  }, {
    n: 2,
    bars: [ [ "08:40", "10:11", "move" ], [ "10:11", "10:25", "move", 1 ], [ "10:25", "12:30", "chg", 1 ] ]
  }, {
    n: 4,
    bars: [ [ "07:20", "09:06", "run" ], [ "09:06", "09:20", "move" ], [ "09:20", "10:11", "chg" ], [ "10:11", "10:40", "chg", 1 ] ]
  }, {
    n: 5,
    bars: [ [ "07:28", "10:11", "run" ], [ "10:11", "11:50", "run", 1 ] ]
  }, {
    n: 7,
    bars: [ [ "06:05", "07:16", "run" ], [ "07:16", "07:30", "move" ], [ "07:30", "10:11", "chg" ], [ "11:30", "12:50", "run", 1 ] ]
  }, {
    n: 9,
    bars: [ [ "06:00", "06:41", "run" ], [ "06:41", "06:55", "move" ], [ "06:55", "08:30", "chg" ] ]
  }, {
    n: 11,
    bars: [ [ "09:40", "10:11", "run" ], [ "10:11", "12:10", "run", 1 ] ]
  } ];
  var SCHED = [ {
    time: "10:25",
    text: (window.APRISM_ROBOT ? APRISM_ROBOT("r02") : "Robot 02") + " · 도크 도착 후 충전",
    floor: "B4"
  }, {
    time: "11:30",
    text: (window.APRISM_ROBOT ? APRISM_ROBOT("r07") : "Robot 07") + " · " + (window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회") + " 2회차 시작",
    floor: "B3"
  }, {
    time: "12:10",
    text: (window.APRISM_ROBOT ? APRISM_ROBOT("r11") : "Robot 11") + " · " + (window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검") + " 끝",
    floor: "B3"
  } ];
  var scopeMission = null;
  if (V3) {
    var mq = /[?&]mission=([^&#]+)/.exec(location.search);
    if (mq) {
      try {
        var mm = decodeURIComponent(mq[1].replace(/\+/g, " "));
        if (MISSION_FLOORS[mm]) {
          scopeMission = mm;
        }
      } catch (e) {}
    }
  }
  if (scopeMission) {
    ALERTS = ALERTS.filter(function(a) {
      return a.mission === scopeMission;
    });
    ROBOTS = ROBOTS.filter(function(r) {
      return r.mission === scopeMission;
    });
    GANTT = GANTT.filter(function(g) {
      return ROBOTS.some(function(r) {
        return r.n === g.n;
      });
    });
    SCHED = SCHED.filter(function(s) {
      return ROBOTS.some(function(r) {
        return s.text.indexOf(rname(r)) === 0;
      });
    });
  }
  function inScope(f) {
    return !scopeMission || MISSION_FLOORS[scopeMission].indexOf(f) >= 0;
  }
  function allUrl() {
    var keep = (location.search.match(/[?&](theme|palette|delta|glow)=[\w-]+/g) || []).map(function(s) {
      return s.slice(1);
    });
    return (document.body.classList.contains("ver-6") ? "building-v6.html" : document.body.classList.contains("ver-5") ? "building-v5.html" : "building-v3.html") + (keep.length ? "?" + keep.join("&") : "");
  }
  function robotNo(n) {
    return ROBOTS.filter(function(r) {
      return r.n === n;
    })[0];
  }
  function robotsOn(f) {
    return ROBOTS.filter(function(r) {
      return r.floor === f;
    });
  }
  function alertsOn(f) {
    return ALERTS.filter(function(a) {
      return a.floor === f;
    });
  }
  function alertsOf(m) {
    return ALERTS.filter(function(a) {
      return a.mission === m;
    });
  }
  function topSev(list) {
    if (list.some(function(a) {
      return a.sev === "critical";
    })) {
      return "critical";
    }
    return list.length ? "warning" : null;
  }
  function sevSay(list) {
    var c = list.filter(function(a) {
      return a.sev === "critical";
    }).length, w = list.length - c;
    return (c ? "위험 " + c + "건" + (w ? ", 주의 " + w + "건" : "") : "주의 " + w + "건") + "이";
  }
  function sevParts(box, list) {
    [ [ "critical", "위험" ], [ "warning", "주의" ] ].forEach(function(k) {
      var n = list.filter(function(a) {
        return a.sev === k[0];
      }).length;
      if (!n) {
        return;
      }
      var one = el("span", "bld-sev" + (document.body.classList.contains("ver-7") ? " ds-badge is-plain is-" + (k[0] === "critical" ? "crit" : "warn") : ""));
      one.setAttribute("data-sev", k[0]);
      one.appendChild(el("span", "bld-sev-dot"));
      one.appendChild(document.createTextNode(k[1] + " " + n));
      box.appendChild(one);
    });
  }
  function sevCount(list) {
    var c = list.filter(function(a) {
      return a.sev === "critical";
    }).length;
    var w = list.length - c;
    var out = [];
    if (c) {
      out.push("위험 " + c);
    }
    if (w) {
      out.push("주의 " + w);
    }
    return out.join(" · ");
  }
  function floorFor(m) {
    var mine = ROBOTS.filter(function(r) {
      return r.mission === m;
    }).sort(function(a, b) {
      return (a.st === "run" ? 0 : 1) - (b.st === "run" ? 0 : 1);
    });
    return mine.length ? mine[0].floor : MISSION_FLOORS[m][0];
  }
  function missionFor(f) {
    var list = missionsOn(f);
    var best = null, rank = -1;
    list.forEach(function(m) {
      var s = topSev(alertsOf(m));
      var k = s === "critical" ? 3 : s === "warning" ? 2 : ROBOTS.some(function(r) {
        return r.mission === m && r.st === "run";
      }) ? 1 : 0;
      if (k > rank) {
        rank = k;
        best = m;
      }
    });
    return best;
  }
  function mainUrl(mission, floor) {
    var keep = (location.search.match(/[?&](theme|palette|delta|glow)=[\w-]+/g) || []).map(function(s) {
      return s.slice(1);
    });
    keep.push("mission=" + encodeURIComponent(mission));
    if (V3 && floor && MISSION_FLOORS[mission] && MISSION_FLOORS[mission].indexOf(floor) >= 0) {
      keep.push("floor=" + floor);
    }
    return (window.aprismHref || String)((document.body.classList.contains("ver-6") ? "main-v6.html?" : document.body.classList.contains("ver-5") ? "main-v5.html?" : document.body.classList.contains("ver-3") ? "main-v3.html?" : "main-v2-2.html?") + keep.join("&"));
  }
  var menuBox = $("[data-bld-menu-box]");
  var trigger = $("[data-bld-trigger]");
  var menu = $("[data-bld-menu]");
  function closeMenu() {
    if (!trigger) {
      return;
    }
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }
  function stateOf(m) {
    var mine = ROBOTS.filter(function(r) {
      return r.mission === m;
    });
    if (mine.some(function(r) {
      return r.st === "run";
    })) {
      return "run";
    }
    if (mine.length && mine.every(function(r) {
      return r.st === "done";
    })) {
      return "done";
    }
    return "idle";
  }
  function buildMenu() {
    menu.textContent = "";
    var head = el("div", "scope-head t-caption");
    head.setAttribute("aria-hidden", "true");
    [ "수행", "미션", "층", "로봇" ].forEach(function(t) {
      head.appendChild(el("span", null, t));
    });
    menu.appendChild(head);
    [ [ "run", "수행중" ], [ "idle", "대기" ], [ "done", "완료" ] ].forEach(function(g) {
      MISSION_LIST.filter(function(m) {
        return stateOf(m) === g[0];
      }).forEach(function(m) {
        var item = el("button", "menu-item scope-item is-" + g[0]);
        item.type = "button";
        item.setAttribute("role", "menuitem");
        var run = el("span", "scope-run");
        run.setAttribute("data-run", g[0]);
        run.title = g[1];
        item.appendChild(run);
        var name = el("span", "scope-name");
        name.appendChild(el("span", "t-label-2", m));
        var s = topSev(alertsOf(m));
        if (s) {
          var sev = icon(s === "critical" ? "error" : "warning");
          sev.classList.add("scope-sev");
          sev.setAttribute("data-sev", s);
          sev.removeAttribute("aria-hidden");
          sev.title = s === "critical" ? "위험 알림 있음" : "주의 알림 있음";
          name.appendChild(sev);
        }
        item.appendChild(name);
        var fl = el("span", "scope-floors");
        MISSION_FLOORS[m].forEach(function(f) {
          fl.appendChild(el("span", "floor-tag num" + (document.body.classList.contains("ver-7") ? " ds-floor" : ""), f));
        });
        item.appendChild(fl);
        item.appendChild(el("span", "scope-robots num", ROBOTS.filter(function(r) {
          return r.mission === m;
        }).map(function(r) {
          return (r.n < 10 ? "0" : "") + r.n;
        }).join(" · ")));
        if (V3) {
          item.setAttribute("role", "menuitemradio");
          item.setAttribute("aria-checked", m === scopeMission ? "true" : "false");
        }
        item.addEventListener("click", function() {
          closeMenu();
          enter(floorFor(m), m);
        });
        menu.appendChild(item);
      });
    });
  }
  if (trigger) {
    buildMenu();
    trigger.addEventListener("click", function(event) {
      event.stopPropagation();
      var open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
    });
    document.addEventListener("click", function(event) {
      if (!menuBox.contains(event.target)) {
        closeMenu();
      }
    });
    menuBox.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        closeMenu();
        trigger.focus();
      }
    });
  }
  var RANK = {
    critical: 0,
    warning: 1
  };
  var filter = "all";
  function alertRow(a) {
    var node = el("button", "ah-item is-" + a.sev + (document.body.classList.contains("ver-7") ? " ds-list-item is-l" : ""));
    node.type = "button";
    node.setAttribute("role", "listitem");
    node.setAttribute("aria-pressed", "false");
    var title = el("span", "ah-title t-label-2");
    title.appendChild(icon(a.sev === "critical" ? "error" : "warning"));
    var A6 = V6 && window.APRISM_ALERT6, r6 = A6 && A6.of(a.title);
    title.appendChild(el("span", null, A6 ? A6.title(a.title) : a.title));
    var tm = el("span", "ah-time t-caption num");
    var hm = V6 && /^(\d{1,2}:\d{2})(:\d{2})$/.exec(a.time || "");
    if (hm) {
      tm.appendChild(document.createTextNode(hm[1]));
      tm.appendChild(el("span", "ah-time-s", hm[2]));
      tm.title = a.time;
    } else {
      tm.textContent = a.time;
    }
    title.appendChild(tm);
    var where = el("span", "ah-where t-caption");
    where.appendChild(el("span", "floor-tag num" + (document.body.classList.contains("ver-7") ? " ds-floor" : ""), a.floor));
    var wpNo = document.body.classList.contains("ver-7") && /WP-(\d+)/.exec((a.wp || "") + " " + (a.where || ""));
    if (wpNo) {
      var wpPin = el("span", "mbt-pin is-plain ah-wp-pin" + (document.body.classList.contains("ver-7") ? " ds-wp is-s" : ""));
      wpPin.setAttribute("data-n", String(parseInt(wpNo[1], 10)));
      wpPin.setAttribute("role", "img");
      wpPin.setAttribute("aria-label", "WP-" + wpNo[1]);
      where.appendChild(wpPin);
    }
    var wp = /WP-\d+.*$/.exec(a.where);
    where.appendChild(el("span", "ah-wp", wp ? V6 ? wp[0].replace(/^WP-\d+\s*/, "") : wp[0] : a.where));
    var scope = el("span", "ah-scope t-caption");
    if (!V3) {
      scope.appendChild(icon("way"));
    }
    var mno = window.APRISM_MISSION_NO && window.APRISM_MISSION_NO(a.mission);
    if (mno) {
      scope.appendChild(el("span", "ah-no", mno));
    }
    scope.appendChild(el("span", null, a.mission));
    node.appendChild(title);
    if (V3) {
      node.appendChild(scope);
      node.appendChild(where);
    } else {
      node.appendChild(where);
      node.appendChild(scope);
    }
    if (!V6) {
      node.addEventListener("mouseenter", function() {
        setHot(a.floor, null, true);
      });
      node.addEventListener("mouseleave", function() {
        setHot(null);
      });
    }
    node.addEventListener("click", function() {
      enter(a.floor, a.mission, V6 ? a : null);
    });
    var row = el("div", "ah-row");
    row.setAttribute("role", "listitem");
    node.removeAttribute("role");
    var go;
    if (V6) {
      go = el("a", "btn btn-ghost is-xs ah-report");
      var dq = new URLSearchParams({
        mission: a.mission
      });
      var det = a.detect || r6 && r6.detect;
      if (det) {
        dq.set("detect", det);
      }
      go.href = (window.aprismHref || String)("./safety-v6.html?" + dq.toString());
      go.title = "안전진단에서 이 알림의 감지 결과 보기";
    } else {
      go = el("button", "btn btn-ghost is-xs ah-report");
      go.type = "button";
      go.title = "안전진단 화면 준비 중";
    }
    go.setAttribute("aria-label", document.body.classList.contains("ver-6") ? "진단 상세" : "안전진단");
    go.appendChild(icon("shield"));
    go.appendChild(el("span", "ah-report-label", document.body.classList.contains("ver-6") ? "진단 상세" : "안전진단"));
    row.appendChild(node);
    row.appendChild(go);
    if (V6) {
      row.addEventListener("mouseenter", function() {
        setHot(a.floor, null, true);
      });
      row.addEventListener("mouseleave", function() {
        setHot(null);
      });
    }
    return row;
  }
  function doneRow(d) {
    var node = el("div", "done-item" + (document.body.classList.contains("ver-7") ? " ds-record" : ""));
    node.setAttribute("role", "listitem");
    var head = el("span", "done-title");
    head.appendChild(el("span", "t-label-2", window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(d.title) : d.title));
    head.appendChild(el("span", "t-caption num" + (V6 ? " done-time" : ""), d.time));
    if (V7B) {
      var rq = d.reqId && window.APRISM_ALERTS7 ? window.APRISM_ALERTS7.req.all()[d.reqId] : null;
      var st = rq && DONE_ST[rq.st] && rq.st || d.st || "wait";
      var line = el("span", "done-how done-stage t-caption is-" + st);
      var res = st === "done" ? rq && rq.res || d.res || "" : "";
      var stw = el("span", "done-st");
      stw.appendChild(el("span", "done-st-t", DONE_ST[st] + (res ? ", " + res : "")));
      line.appendChild(stw);
      line.appendChild(el("span", null, rq && rq.to || d.to || "현장 작업자"));
      node.tabIndex = 0;
      var acts = rq && rq.how && rq.how.length ? rq.how : String(d.how || "").split(/\s*·\s*/).filter(Boolean);
      if (acts.length) {
        stw.appendChild(el("span", "done-req", "요청: " + acts[0] + (acts.length > 1 ? " 외 " + (acts.length - 1) + "건" : "")));
      }
      node.appendChild(head);
      node.appendChild(line);
      return node;
    }
    var how = el("span", "done-how t-caption");
    how.appendChild(icon("check"));
    if (V6) {
      var parts = String(d.how || "").split(/\s*·\s*/);
      var txt = el("span", "done-res");
      if (parts.length > 1) {
        txt.appendChild(el("span", "done-act", parts[0]));
      }
      txt.appendChild(document.createTextNode(parts[parts.length - 1]));
      how.appendChild(txt);
    } else {
      how.appendChild(el("span", null, d.how));
    }
    how.appendChild(el("span", null, d.who));
    node.appendChild(head);
    node.appendChild(how);
    return node;
  }
  function renderLeft() {
    var list = $("[data-ah-list]");
    if (!list) {
      return;
    }
    var SORT = window.APRISM_AH_SORT;
    var all = (floorView ? alertsOn(floorView) : ALERTS).slice().sort(function(a, b) {
      return RANK[a.sev] - RANK[b.sev] || (SORT ? SORT.time(a, b) : a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    });
    var shown = all.filter(function(a) {
      return filter === "all" || a.sev === filter;
    });
    list.textContent = "";
    shown.forEach(function(a) {
      list.appendChild(alertRow(a));
    });
    if (!shown.length && document.body.classList.contains("ver-7") && document.documentElement.lang !== "en") {
      var em = document.createElement("p");
      em.className = "ah-empty t-body-3";
      em.setAttribute("role", "status");
      em.textContent = filter === "critical" ? "위험 알림이 없어요" : filter === "warning" ? "주의 알림이 없어요" : "조치가 필요한 알림이 없어요";
      list.appendChild(em);
    }
    var counts = {
      all: all.length,
      critical: 0,
      warning: 0
    };
    all.forEach(function(a) {
      counts[a.sev] += 1;
    });
    $$("[data-ah-count]").forEach(function(n) {
      n.textContent = counts[n.getAttribute("data-ah-count")];
    });
    window.APRISM_FLOOR_COUNTS = function(list) {
      var c = {
        all: list.length
      };
      list.forEach(function(a) {
        if (a.floor) {
          c[a.floor] = (c[a.floor] || 0) + 1;
        }
      });
      return c;
    }(ALERTS);
    document.dispatchEvent(new CustomEvent("aprism:floor-counts", {
      detail: window.APRISM_FLOOR_COUNTS
    }));
    var top = counts.critical ? "critical" : counts.warning ? "warning" : null;
    window.APRISM_DELTA_DETECTS = all.map(function(a) {
      return a.detect || a.title || "";
    });
    if (V3) {
      body.setAttribute("data-level", top || "normal");
    }
    document.dispatchEvent(new CustomEvent("aprism:severity", {
      detail: deltaSay(top, all)
    }));
    $$("[data-ah-filter]").forEach(function(b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-ah-filter") === filter ? "true" : "false");
    });
    var done = $("[data-done-list]");
    done.textContent = "";
    DONE.forEach(function(d) {
      done.appendChild(doneRow(d));
    });
    var dc = $("[data-done-count]");
    if (dc) {
      dc.textContent = DONE.length + "건";
    }
  }
  $$("[data-ah-filter]").forEach(function(b) {
    b.addEventListener("click", function() {
      filter = b.getAttribute("data-ah-filter");
      renderLeft();
    });
  });
  $$("[data-ah-all]").forEach(function(allBtn) {
    allBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      var tab = allBtn.getAttribute("data-ah-all") === "done" ? "?tab=done" : "";
      location.href = (window.aprismHref || String)((document.body.classList.contains("ver-6") ? "alert-center-v6.html" : document.body.classList.contains("ver-5") ? "alert-center-v5.html" : document.body.classList.contains("ver-3") ? "alert-center-v3.html" : "alert-center.html") + tab);
    });
  });
  var fleetFloor = "all";
  var fleetSt = "all";
  var SIG = {
    4: "Strong",
    3: "Good",
    2: "Weak",
    1: "Weak",
    0: "끊김"
  };
  if (V7B) {
    SIG = {
      4: "강함",
      3: "보통",
      2: "약함",
      1: "약함",
      0: "끊김"
    };
  }
  function chip(cls) {
    return el("span", "bld-chip" + (cls ? " " + cls : ""));
  }
  var STEPS = {
    1: [ [ "N₂ 배관 압력계", "WP-04" ], [ "waypoint name", "WP-05" ] ],
    5: [ [ "공기 압축기 C-1", "WP-13" ], [ "냉각수 펌프 P-3", "WP-14" ] ],
    11: [ [ "배전반실 열화상", "WP-04" ], [ "변압기 TR-2", "WP-05" ] ]
  };
  if (V3) {
    STEPS[11] = [ [ "케미컬 공급 캐비닛 CDS-02", "WP-08" ], [ "FFU-02 토출구", "WP-09" ] ];
  }
  if (body.classList.contains("ver-5")) {
    STEPS[1] = [ [ "냉각수 열교환기 HX-1", "WP-08" ], [ "waypoint name", "WP-09" ] ];
  }
  if (body.classList.contains("ver-7")) {
    STEPS[1][1][0] = "설비 18";
  }
  var ST_TONE = {
    run: "info",
    done: "normal",
    idle: "idle",
    off: "critical"
  };
  function rcStep(name, sub, now, ic, subCls) {
    var item = el("span", "bld-rc-step" + (now ? " is-now" : ""));
    var rail = el("span", "bld-rc-rail");
    rail.appendChild(el("i", "bld-rc-line"));
    var mark = el("span", "bld-rc-mark");
    mark.appendChild(icon(ic, now ? 12 : 16));
    rail.appendChild(mark);
    rail.appendChild(el("i", "bld-rc-line is-tail"));
    item.appendChild(rail);
    var txt = el("span", "bld-rc-step-txt");
    txt.appendChild(el("span", "bld-rc-step-name", name));
    if (sub) {
      txt.appendChild(el("span", "bld-rc-step-wp" + (subCls ? " " + subCls : ""), sub));
    }
    item.appendChild(txt);
    return item;
  }
  function fleetCard(r) {
    var node = el("button", "bld-robot bld-rc is-" + r.st);
    node.type = "button";
    node.setAttribute("role", "listitem");
    node.setAttribute("data-floor", r.floor);
    node.setAttribute("aria-label", rname(r) + " · " + FNAME[r.floor] + " · " + (r.mission ? r.mission + " · " : "") + r.now);
    var head = el("span", "bld-rc-head");
    head.appendChild(el("span", "bld-rc-name", rname(r)));
    if (r.mission) {
      head.appendChild(el("span", "bld-rc-mission", r.mission));
    }
    node.appendChild(head);
    var main = el("span", "bld-rc-main");
    var steps = el("span", "bld-rc-steps");
    var wp = STEPS[r.n];
    if (r.st === "run" && wp) {
      steps.appendChild(rcStep(r.now, V6 ? wp[0][0] : wp[0][1] + " " + wp[0][0], true, "way"));
      steps.appendChild(rcStep(wp[1][0], wp[1][1], false, "target", "is-no"));
    } else {
      var where = r.st === "done" ? (r.mission || "") + " 끝" : r.st === "off" ? FNAME[r.floor] + (V7B ? ", 마지막 위치" : " · 마지막 위치") : FNAME[r.floor] + (r.dock ? V7B ? ", 도크" : " · 도크" : "");
      var restIc = r.st === "done" ? "check-circle" : /충전/.test(r.now) ? "bolt" : r.moving ? "way" : "clock";
      var restStep = rcStep(r.now, where, true, r.st === "off" ? "way" : restIc);
      if (r.st !== "off") {
        restStep.classList.add("is-rest");
      }
      steps.appendChild(restStep);
    }
    main.appendChild(steps);
    var side = el("span", "bld-rc-side");
    var pct = r.total ? Math.round(r.done / r.total * 100) : null;
    var prog = el("span", "bld-rc-prog");
    prog.appendChild(el("span", "bld-rc-pct num", pct == null ? "—" : r.done + "/" + r.total));
    var track = el("span", "bld-rc-track");
    var fill = el("i");
    fill.style.width = (pct || 0) + "%";
    track.appendChild(fill);
    prog.appendChild(track);
    side.appendChild(prog);
    function line(label, value) {
      var row = el("span", "bld-rc-state");
      row.appendChild(el("span", "bld-rc-label", label));
      row.appendChild(value);
      side.appendChild(row);
    }
    var b = BADGE[r.st];
    var st = el("span", "bld-rc-badge is-" + ST_TONE[r.st] + (document.body.classList.contains("ver-7") && window.ds ? " " + window.ds.statusCls(r.st) : ""));
    st.appendChild(el("i"));
    st.appendChild(el("span", null, b.text));
    line(V7B ? "미션" : "Mission", st);
    var bat = el("span", window.ds ? window.ds.batteryCls(r.bat, r.chg) : "battery" + (r.bat <= 20 ? " is-critical" : r.bat <= 40 ? " is-warning" : "") + (r.chg ? " is-charging" : ""));
    var bb = el("span", "battery-body");
    var bf = el("span", "battery-fill");
    bf.style.width = r.bat + "%";
    bb.appendChild(bf);
    if (r.chg) {
      var bolt = el("span", "i battery-bolt");
      bolt.style.setProperty("--i", "var(--ic-bolt)");
      bolt.setAttribute("aria-hidden", "true");
      bb.appendChild(bolt);
    }
    bat.appendChild(bb);
    bat.appendChild(el("span", "battery-tip"));
    bat.appendChild(el("span", "t-caption num", r.bat + "%"));
    line(V7B ? "배터리" : "Battery", bat);
    var sig = el("span", "battery" + (r.sig === 1 ? " is-critical" : r.sig === 2 ? " is-warning" : ""));
    var bars = el("span", "signal-bars");
    bars.setAttribute("data-level", String(r.sig));
    for (var i = 0; i < 4; i += 1) {
      bars.appendChild(el("i"));
    }
    sig.appendChild(bars);
    sig.appendChild(el("span", "t-caption", SIG[r.sig]));
    line(V7B ? "신호" : "Signal", sig);
    main.appendChild(side);
    node.appendChild(main);
    node.addEventListener("mouseenter", function() {
      setHot(r.floor, null, true);
      markRobot(r, true);
    });
    node.addEventListener("mouseleave", function() {
      setHot(null);
      markRobot(r, false);
    });
    node.addEventListener("click", function() {
      if (V7B && !r.mission) {
        flashBot(r);
        return;
      }
      enter(r.floor, r.mission || missionFor(r.floor));
    });
    return node;
  }
  function rcVerb(s) {
    var m = /(이동 중|측정|판독|촬영|점검|순회)$/.exec(s || "");
    return !m ? s : m[1] === "이동 중" ? "이동 중" : m[1] + " 중";
  }
  function fleetCardSlim(r) {
    var node = el("button", "bld-robot bld-rc2 ds-card is-" + r.st);
    node.type = "button";
    node.setAttribute("role", "listitem");
    node.setAttribute("data-floor", r.floor);
    node.setAttribute("aria-label", rname(r) + " · " + FNAME[r.floor] + " · " + (r.mission ? r.mission + " · " : "") + r.now);
    var head = el("span", "bld-rc2-head");
    head.appendChild(el("span", "bld-rc2-name", rname(r)));
    if (r.mission) {
      head.appendChild(el("span", "bld-rc2-mission t-caption", r.mission));
    }
    node.appendChild(head);
    var vit = el("span", "bld-rc2-vitals");
    var b = BADGE[r.st];
    var st = el("span", "bld-rc2-cell bld-rc-badge is-" + ST_TONE[r.st] + (document.body.classList.contains("ver-7") && window.ds ? " " + window.ds.statusCls(r.st) : ""));
    st.appendChild(el("i"));
    st.appendChild(el("span", null, b.text));
    vit.appendChild(st);
    var bat = el("span", "bld-rc2-cell " + (window.ds ? window.ds.batteryCls(r.bat, r.chg) : "battery" + (r.bat <= 20 ? " is-critical" : r.bat <= 40 ? " is-warning" : "") + (r.chg ? " is-charging" : "")));
    bat.title = "배터리 " + r.bat + "%" + (r.chg ? " · 충전 중" : "");
    var bb = el("span", "battery-body");
    var bf = el("span", "battery-fill");
    bf.style.width = r.bat + "%";
    bb.appendChild(bf);
    if (r.chg) {
      var bolt = el("span", "i battery-bolt");
      bolt.style.setProperty("--i", "var(--ic-bolt)");
      bolt.setAttribute("aria-hidden", "true");
      bb.appendChild(bolt);
    }
    bat.appendChild(bb);
    bat.appendChild(el("span", "battery-tip"));
    bat.appendChild(el("span", "t-caption num", r.bat + "%"));
    vit.appendChild(bat);
    var sig = el("span", "bld-rc2-cell battery" + (r.sig === 1 ? " is-critical" : r.sig === 2 ? " is-warning" : ""));
    sig.title = "신호 " + SIG[r.sig];
    var bars = el("span", "signal-bars");
    bars.setAttribute("data-level", String(r.sig));
    for (var i = 0; i < 4; i += 1) {
      bars.appendChild(el("i"));
    }
    sig.appendChild(bars);
    sig.appendChild(el("span", "t-caption", SIG[r.sig]));
    vit.appendChild(sig);
    node.appendChild(vit);
    var wp = r.st === "run" ? STEPS[r.n] : null;
    var bodyEl = el("span", "bld-rc2-body" + (wp ? " has-next" : ""));
    var nowRow = el("span", "bld-rc2-step is-now");
    var ic = "target";
    if (r.st === "off") {
      nowRow.classList.add("is-off");
    } else if (r.st !== "run") {
      nowRow.classList.add("is-rest");
      ic = r.st === "done" ? "check-circle" : /충전/.test(r.now) ? "bolt" : r.moving ? "way" : "clock";
    }
    var nm = el("span", "bld-rc2-mark");
    nm.appendChild(icon(ic, 16));
    nowRow.appendChild(nm);
    var nt = el("span", "bld-rc2-txt");
    if (wp && V6) {
      nt.appendChild(el("span", "bld-rc2-now", wp[0][0]));
      nt.appendChild(el("span", "bld-rc2-wp t-caption", rcVerb(r.now)));
    } else {
      nt.appendChild(el("span", "bld-rc2-now", r.now));
      if (wp) {
        nt.appendChild(el("span", "bld-rc2-wp t-caption", V6 ? wp[0][0] : wp[0][1] + " " + wp[0][0]));
      } else {
        nt.appendChild(el("span", "bld-rc2-wp t-caption", r.st === "done" ? (r.mission || "") + " 끝" : r.st === "off" ? FNAME[r.floor] + (V7B ? ", 마지막 위치" : " · 마지막 위치") : FNAME[r.floor] + (r.dock ? V7B ? ", 도크" : " · 도크" : "")));
      }
    }
    nowRow.appendChild(nt);
    bodyEl.appendChild(nowRow);
    if (wp) {
      var nextRow = el("span", "bld-rc2-step is-next");
      var xm = el("span", "bld-rc2-mark");
      xm.appendChild(icon("target", 16));
      nextRow.appendChild(xm);
      nextRow.appendChild(el("span", "bld-rc2-txt bld-rc2-next t-caption", wp[1][0]));
      bodyEl.appendChild(nextRow);
    }
    node.appendChild(bodyEl);
    if (r.total) {
      var prog = el("span", "bld-rc2-prog");
      var bar = el("span", "progress-track ds-progress");
      bar.style.setProperty("--progress", Math.round(r.done / r.total * 100) + "%");
      bar.appendChild(el("span", "progress-fill ds-progress-fill"));
      var knob = el("span", "progress-knob ds-progress-cursor");
      var kic = icon("way", 16);
      kic.classList.add("ds-progress-icon");
      knob.appendChild(kic);
      bar.appendChild(knob);
      prog.appendChild(bar);
      prog.appendChild(el("span", "t-caption num", r.done + "/" + r.total));
      node.appendChild(prog);
    }
    node.addEventListener("mouseenter", function() {
      setHot(r.floor, null, true);
      markRobot(r, true);
    });
    node.addEventListener("mouseleave", function() {
      setHot(null);
      markRobot(r, false);
    });
    node.addEventListener("click", function() {
      if (V7B && !r.mission) {
        flashBot(r);
        return;
      }
      enter(r.floor, r.mission || missionFor(r.floor));
    });
    return node;
  }
  function fleetRow(r) {
    if (V3) {
      return fleetCardSlim(r);
    }
    var node = el("button", "bld-robot" + (r.st === "off" ? " is-offline" : ""));
    node.type = "button";
    node.setAttribute("role", "listitem");
    node.setAttribute("data-floor", r.floor);
    node.setAttribute("aria-label", rname(r) + " · " + FNAME[r.floor] + " · " + r.now);
    var body = el("span", "bld-robot-body");
    var top = el("span", "bld-robot-top");
    top.appendChild(el("span", "bld-floor-tag num", r.floor));
    top.appendChild(el("span", "bld-robot-name", rname(r)));
    body.appendChild(top);
    body.appendChild(el("span", "bld-robot-mission t-caption", r.mission ? r.mission + " · " + r.now : r.now));
    var prog = el("span", "bld-robot-prog");
    var bar = el("span", "bld-bar");
    var fill = el("i");
    fill.style.width = (r.total ? Math.round(r.done / r.total * 100) : 0) + "%";
    bar.appendChild(fill);
    prog.appendChild(bar);
    prog.appendChild(el("span", "num bld-robot-count", r.total ? r.done + "/" + r.total : "—"));
    body.appendChild(prog);
    var foot = el("span", "bld-robot-foot");
    var b = BADGE[r.st];
    var st = chip("badge " + b.cls + (document.body.classList.contains("ver-7") && window.ds ? " " + window.ds.statusCls(r.st) : ""));
    st.appendChild(el("span", "badge-dot"));
    st.appendChild(el("span", "t-caption", b.text));
    foot.appendChild(st);
    var bc = chip();
    var bat = el("span", "battery" + (r.bat <= 20 ? " is-critical" : r.bat <= 40 ? " is-warning" : "") + (r.chg ? " is-charging" : ""));
    var bb = el("span", "battery-body");
    var bf = el("span", "battery-fill");
    bf.style.width = r.bat + "%";
    bb.appendChild(bf);
    if (r.chg) {
      var bolt = el("span", "i battery-bolt");
      bolt.style.setProperty("--i", "var(--ic-bolt)");
      bolt.setAttribute("aria-hidden", "true");
      bb.appendChild(bolt);
    }
    bat.appendChild(bb);
    bat.appendChild(el("span", "battery-tip"));
    bat.appendChild(el("span", "t-caption num", r.bat + "%"));
    bc.appendChild(bat);
    foot.appendChild(bc);
    var sc = chip();
    var sig = el("span", "battery" + (r.sig <= 2 ? " is-warning" : ""));
    var bars = el("span", "signal-bars");
    bars.setAttribute("data-level", String(r.sig));
    for (var i = 0; i < 4; i += 1) {
      bars.appendChild(el("i"));
    }
    sig.appendChild(bars);
    sig.appendChild(el("span", "t-caption", SIG[r.sig]));
    sc.appendChild(sig);
    foot.appendChild(sc);
    node.appendChild(body);
    node.appendChild(foot);
    node.addEventListener("mouseenter", function() {
      setHot(r.floor, null, true);
      markRobot(r, true);
    });
    node.addEventListener("mouseleave", function() {
      setHot(null);
      markRobot(r, false);
    });
    node.addEventListener("click", function() {
      if (V7B && !r.mission) {
        flashBot(r);
        return;
      }
      enter(r.floor, r.mission || missionFor(r.floor));
    });
    return node;
  }
  function renderRight() {
    var running = ROBOTS.filter(function(r) {
      return r.st === "run";
    }).length;
    var cnt = $("[data-bld-count]");
    var linked = body.classList.contains("ver-7") ? ROBOTS.filter(function(r) {
      return r.st !== "off";
    }).length : ROBOTS.length;
    if (cnt) {
      cnt.textContent = linked + "대 연결";
    }
    var run = $("[data-bld-running]");
    if (run) {
      run.textContent = running + "대 수행중";
    }
    var ff = $("[data-bld-fleet-filter]");
    ff.textContent = "";
    if (floorView) {
      fleetFloor = floorView;
    }
    ff.hidden = !!floorView || !!scopeMission;
    [ [ "all", "전체", ROBOTS.length ] ].concat(FLOORS.map(function(f) {
      return [ f, f, robotsOn(f).length ];
    })).forEach(function(x) {
      var b = el("button", "btn is-xs " + (fleetFloor === x[0] ? "btn-inverse" : "btn-secondary"));
      b.type = "button";
      b.setAttribute("aria-pressed", fleetFloor === x[0] ? "true" : "false");
      b.appendChild(document.createTextNode(x[1] + " "));
      b.appendChild(el("span", "num", String(x[2])));
      b.addEventListener("click", function() {
        fleetFloor = x[0];
        renderRight();
      });
      ff.appendChild(b);
    });
    var list = $("[data-bld-fleet]");
    list.textContent = "";
    var ORDER = {
      run: 0,
      off: 1,
      done: 2,
      idle: 3
    };
    var onFloor = ROBOTS.filter(function(r) {
      return fleetFloor === "all" || r.floor === fleetFloor;
    });
    var sf = $("[data-bld-st-filter]");
    if (sf) {
      sf.textContent = "";
      [ [ "all", "전체" ], [ "run", "수행중" ], [ "off", "끊김" ], [ "done", "완료" ], [ "idle", "대기" ] ].forEach(function(x) {
        var n = x[0] === "all" ? onFloor.length : onFloor.filter(function(r) {
          return r.st === x[0];
        }).length;
        var b = el("button", document.body.classList.contains("ver-7") ? "ds-chip" : "btn is-xs");
        b.type = "button";
        b.setAttribute("aria-pressed", fleetSt === x[0] ? "true" : "false");
        b.appendChild(document.createTextNode(x[1] + " "));
        b.appendChild(el("span", "num", String(n)));
        b.addEventListener("click", function() {
          fleetSt = x[0];
          renderRight();
        });
        sf.appendChild(b);
      });
    }
    var shown = onFloor.filter(function(r) {
      return fleetSt === "all" || r.st === fleetSt;
    });
    shown.slice().sort(function(a, b) {
      return ORDER[a.st] - ORDER[b.st] || a.n - b.n;
    }).forEach(function(r) {
      list.appendChild(fleetRow(r));
    });
    if (!shown.length) {
      list.appendChild(el("p", "bld-fleet-empty t-caption", (BADGE[fleetSt] ? BADGE[fleetSt].text : "") + " 로봇이 없어요"));
    }
    var g = $("[data-bld-gantt]");
    if (g) {
      g.textContent = "";
      var span = T1 - T0;
      var ticks = el("div", "bld-g-row is-ticks");
      ticks.appendChild(el("span"));
      var tt = el("span", "bld-g-ticks t-caption num");
      for (var t = T0; t <= T1; t += 120) {
        var s = el("span", null, (t / 60 < 10 ? "0" : "") + t / 60);
        s.style.left = (t - T0) / span * 100 + "%";
        tt.appendChild(s);
      }
      ticks.appendChild(tt);
      g.appendChild(ticks);
      var rows = el("div", "bld-g-body");
      GANTT.forEach(function(row) {
        var r = robotNo(row.n);
        if (floorView && r.floor !== floorView) {
          return;
        }
        var line = el("button", "bld-g-row");
        line.type = "button";
        line.setAttribute("aria-label", rname(r) + " 운행 흐름 · " + FNAME[r.floor]);
        line.appendChild(el("span", "bld-g-name t-caption num", (r.n < 10 ? "0" : "") + r.n));
        var track = el("span", "bld-g-track");
        row.bars.forEach(function(bar) {
          var a = Math.max(T0, hm(bar[0])), z = Math.min(T1, hm(bar[1]));
          if (z <= a) {
            return;
          }
          var seg = el("i", "is-" + bar[2] + (bar[3] ? " is-plan" : ""));
          seg.style.left = (a - T0) / span * 100 + "%";
          seg.style.width = (z - a) / span * 100 + "%";
          track.appendChild(seg);
        });
        line.appendChild(track);
        line.addEventListener("mouseenter", function() {
          setHot(r.floor, null, true);
          markRobot(r, true);
        });
        line.addEventListener("mouseleave", function() {
          setHot(null);
          markRobot(r, false);
        });
        line.addEventListener("click", function() {
          if (r.mission) {
            enter(r.floor, r.mission);
          }
        });
        rows.appendChild(line);
      });
      var now = el("span", "bld-g-now");
      now.style.setProperty("--x", (NOW - T0) / span);
      now.appendChild(el("b", "t-caption num", "10:11"));
      rows.appendChild(now);
      g.appendChild(rows);
    }
    var sc = $("[data-bld-sched]");
    if (sc) {
      sc.textContent = "";
      if (!SCHED.length) {
        sc.appendChild(el("li", "bld-sched-item t-caption", "예정된 일정이 없어요"));
      }
      SCHED.forEach(function(s) {
        var li = el("li", "bld-sched-item");
        li.appendChild(el("span", "t-caption num bld-sched-time", s.time));
        li.appendChild(el("span", "t-label-2", s.text));
        sc.appendChild(li);
      });
    }
  }
  var floorsBox = $("[data-bld-floors]");
  FLOORS.forEach(function(f) {
    var b = el("button", document.body.classList.contains("ver-7") ? "map-floor ds-tab" : "map-floor", f);
    b.type = "button";
    b.setAttribute("data-bld-floor", f);
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", FNAME[f] + "으로 들어가기");
    var s = topSev(alertsOn(f));
    if (s) {
      var dot = el("span", "bld-floor-dot" + (document.body.classList.contains("ver-7") ? " ds-dot is-" + (s === "critical" ? "crit" : "warn") : ""));
      dot.setAttribute("data-sev", s);
      b.appendChild(dot);
    }
    if (!inScope(f)) {
      b.classList.add("is-out");
      b.disabled = true;
      b.setAttribute("aria-label", FNAME[f] + " · 이 미션은 지나지 않아요");
    } else if (scopeMission) {
      b.setAttribute("aria-label", FNAME[f] + " · " + scopeMission + " 으로 들어가기");
    }
    if (s && document.body.classList.contains("ver-7")) {
      b.setAttribute("aria-label", b.getAttribute("aria-label") + ", " + (s === "critical" ? "위험" : "주의") + " 알림 있음");
    }
    floorsBox.appendChild(b);
  });
  $$("[data-bld-floor]").forEach(function(b) {
    var f = b.getAttribute("data-bld-floor");
    b.classList.toggle("is-on", f === "all");
    b.addEventListener("click", function() {
      if (V3) {
        if (f === "all") {
          closeFloor();
        } else {
          openFloor(f);
        }
        return;
      }
      if (f !== "all") {
        enter(f, missionFor(f));
      }
    });
    if (f !== "all") {
      b.addEventListener("mouseenter", function() {
        setHot(f, null, true);
      });
      b.addEventListener("mouseleave", function() {
        setHot(null);
      });
    }
  });
  function renderSum() {
    var rows = $("[data-bld-sum-rows]");
    var sumBox = $("[data-bld-sum]");
    if (sumBox && !floorView) {
      sumBox.classList.remove("has-cards");
    }
    if (floorView) {
      renderFloorSum(rows);
      return;
    }
    if (scopeMission) {
      renderMissionSum(rows);
      return;
    }
    var label = $(".bld-sum-label");
    if (label) {
      label.textContent = "전체 건물";
    }
    var unitTxt = $(".bld-sum-num .t-label-2");
    if (unitTxt) {
      unitTxt.textContent = "개 층";
    }
    $("[data-bld-sum-floors]").textContent = FLOORS.length;
    rows.textContent = "";
    var running = ROBOTS.filter(function(r) {
      return r.st === "run";
    }).length;
    var r0 = el("div");
    r0.appendChild(el("dt", "t-caption", "로봇"));
    r0.appendChild(el("dd", "t-label-2", ROBOTS.length + "대 · " + running + "대 수행중"));
    rows.appendChild(r0);
    FLOORS.forEach(function(f) {
      var list = alertsOn(f);
      var d = el("div");
      d.appendChild(el("dt", "t-caption num", f));
      var dd = el("dd", "t-label-2 bld-sev");
      var s = topSev(list);
      if (s) {
        dd.setAttribute("data-sev", s);
      }
      dd.appendChild(el("span", "bld-sev-dot"));
      dd.appendChild(document.createTextNode(list.length ? sevCount(list) : "알림 없음"));
      d.appendChild(dd);
      rows.appendChild(d);
    });
  }
  var FLOOR_WP = {
    5: {
      B3: [ 1, 12 ],
      B4: [ 13, 20 ]
    }
  };
  function renderFloorCards(rows, f, ms) {
    var box = $("[data-bld-sum]");
    box.classList.add("has-cards");
    var row = el("div", "bld-mcards");
    ms.forEach(function(m) {
      var r = ROBOTS.filter(function(x) {
        return x.mission === m;
      })[0];
      var here = alertsOf(m).filter(function(a) {
        return a.floor === f;
      });
      var rng = r && FLOOR_WP[r.n] && FLOOR_WP[r.n][f] || [ 1, r && r.total || 20 ];
      var n = rng[1] - rng[0] + 1, done = r ? Math.max(0, Math.min(n, (r.done || 0) - (rng[0] - 1))) : 0;
      var marks = {};
      here.forEach(function(a) {
        var mm = /WP-(\d+)/.exec(a.where || "");
        if (mm) {
          var k = +mm[1] - rng[0];
          if (k >= 0 && k < n) {
            marks[k] = a.sev === "critical" ? "crit" : "warn";
          }
        }
      });
      var card = el("button", "bld-mcard" + (document.body.classList.contains("ver-7") ? " ds-floor-mission" : ""));
      card.type = "button";
      card.setAttribute("aria-label", m + " 미션으로 들어가기");
      var head = el("span", "bld-mcard-head");
      var no = window.APRISM_MISSION_NO && window.APRISM_MISSION_NO(m);
      if (no) {
        head.appendChild(el("span", "t-label-1 sb-tab-no", no));
      }
      head.appendChild(el("span", "t-label-1 bld-mcard-name", m));
      if (r && r.st !== "run") {
        head.appendChild(el("span", "t-caption bld-mcard-st", r.st === "done" ? "완료" : "대기"));
      }
      var sv = el("span", "t-caption bld-sev");
      var s0 = topSev(here);
      if (s0) {
        sv.setAttribute("data-sev", s0);
      }
      sv.appendChild(el("span", "bld-sev-dot"));
      sv.appendChild(document.createTextNode(here.length ? sevCount(here) : "알림 없음"));
      head.appendChild(sv);
      card.appendChild(head);
      var map = el("span", "bld-mcard-map");
      map.innerHTML = window.APRISM_MINI.svg({
        mission: m,
        floor: f,
        n: n,
        done: done,
        robot: !!(r && r.floor === f && r.st === "run"),
        marks: marks,
        kind: r && r.n === 5 ? "wheel" : "spot",
        land: true,
        w: 230,
        label: m + " " + FNAME[f] + " 경로"
      });
      card.appendChild(map);
      card.addEventListener("click", function() {
        enter(f, m);
      });
      if (r) {
        card.addEventListener("mouseenter", function() {
          markRobot(r, true);
        });
        card.addEventListener("mouseleave", function() {
          markRobot(r, false);
        });
      }
      row.appendChild(card);
    });
    rows.appendChild(row);
  }
  function renderFloorSum(rows) {
    var f = floorView;
    var ms = missionsOn(f);
    if (V6 && window.APRISM_MINI) {
      $(".bld-sum-label").textContent = FNAME[f];
      $("[data-bld-sum-floors]").textContent = ms.length;
      $(".bld-sum-num .t-label-2").textContent = "개 미션이 지나요";
      rows.textContent = "";
      renderFloorCards(rows, f, ms);
      return;
    }
    var bx = $("[data-bld-sum]");
    if (bx) {
      bx.classList.remove("has-cards");
    }
    $(".bld-sum-label").textContent = FNAME[f];
    $("[data-bld-sum-floors]").textContent = ms.length;
    $(".bld-sum-num .t-label-2").textContent = "개 미션이 지나요";
    rows.textContent = "";
    var bots = robotsOn(f);
    var r0 = el("div");
    r0.appendChild(el("dt", "t-caption", "로봇"));
    r0.appendChild(el("dd", "t-label-2", bots.length + "대 · " + bots.filter(function(r) {
      return r.st === "run";
    }).length + "대 수행중"));
    rows.appendChild(r0);
    ms.forEach(function(m) {
      var here = alertsOf(m).filter(function(a) {
        return a.floor === f;
      });
      var d = el("div", "bld-sum-mission");
      var go = el("button", "bld-sum-go");
      go.type = "button";
      go.setAttribute("aria-label", m + " 미션으로 들어가기");
      go.appendChild(icon("way"));
      go.appendChild(el("span", "t-label-2 bld-sum-go-name", m));
      var dd = el("span", "t-caption bld-sev");
      var s = topSev(here);
      if (s) {
        dd.setAttribute("data-sev", s);
      }
      dd.appendChild(el("span", "bld-sev-dot"));
      dd.appendChild(document.createTextNode(here.length ? sevCount(here) : "알림 없음"));
      go.appendChild(dd);
      go.addEventListener("click", function() {
        enter(f, m);
      });
      d.appendChild(go);
      rows.appendChild(d);
    });
  }
  function renderMissionSum(rows) {
    var m = scopeMission;
    var fl = MISSION_FLOORS[m];
    $(".bld-sum-label").textContent = m;
    $("[data-bld-sum-floors]").textContent = fl.length;
    $(".bld-sum-num .t-label-2").textContent = "개 층을 지나요";
    rows.textContent = "";
    var r0 = el("div");
    r0.appendChild(el("dt", "t-caption", "로봇"));
    r0.appendChild(el("dd", "t-label-2", ROBOTS.map(rname).join(" · ") || "배정 없음"));
    rows.appendChild(r0);
    fl.forEach(function(f) {
      var here = alertsOn(f);
      var d = el("div", "bld-sum-mission");
      var go = el("button", "bld-sum-go");
      go.type = "button";
      go.setAttribute("aria-label", FNAME[f] + " · " + m + " 으로 들어가기");
      go.appendChild(el("b", "num bld-sum-go-floor", f));
      go.appendChild(el("span", "t-label-2 bld-sum-go-name", FNAME[f]));
      var dd = el("span", "t-caption bld-sev");
      var s = topSev(here);
      if (s) {
        dd.setAttribute("data-sev", s);
      }
      dd.appendChild(el("span", "bld-sev-dot"));
      dd.appendChild(document.createTextNode(here.length ? sevCount(here) : "알림 없음"));
      go.appendChild(dd);
      go.addEventListener("click", function() {
        enter(f, m);
      });
      d.appendChild(go);
      rows.appendChild(d);
    });
  }
  var deltaFirst = null;
  function handoverName() {
    var on = false;
    try {
      on = sessionStorage.getItem("aprism.handover") === "1";
    } catch (e) {
      on = false;
    }
    if (!on || !V6) {
      return "";
    }
    var who = "";
    try {
      who = sessionStorage.getItem("aprism.who") || "";
    } catch (e) {
      who = "";
    }
    if (who) {
      return who;
    }
    var chip = document.querySelector(".account-chip .t-label-2");
    return chip ? chip.textContent.trim() : "관제사";
  }
  function endHandover() {
    try {
      sessionStorage.removeItem("aprism.handover");
    } catch (e) {}
    renderLeft();
  }
  if (handoverName()) {
    if (!window.APRISM_DELTA_DO) {
      window.APRISM_DELTA_DO = function() {
        if (!handoverName()) {
          return;
        }
        try {
          sessionStorage.removeItem("aprism.handover");
        } catch (e) {}
        var go = document.querySelector("[data-ah-all]:not([data-ah-all='done'])");
        if (go) {
          go.click();
        }
      };
    }
    document.addEventListener("pointerdown", function end(e) {
      if (e.target.closest && e.target.closest(".delta3")) {
        return;
      }
      document.removeEventListener("pointerdown", end, true);
      endHandover();
    }, true);
  }
  var D7 = null;
  function publishDelta(list) {
    if (!V7B || !window.APRISM_ALERTS7 || !window.APRISM_ALERTS7.forDelta) {
      return;
    }
    if (!D7) {
      D7 = window.APRISM_ALERTS7.forDelta();
    }
    var byId = {};
    list.forEach(function(a) {
      byId[a.id] = a;
    });
    var all = D7.filter(function(o) {
      return byId[o.id];
    });
    all.forEach(function(o) {
      o.bld = byId[o.id];
    });
    var t = function(a, b) {
      return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
    };
    var crit = all.filter(function(a) {
      return a.sev === "critical";
    }).sort(t), warn = all.filter(function(a) {
      return a.sev !== "critical";
    }).sort(t);
    window.APRISM_DELTA_ALERTS = {
      all: all,
      mine: [],
      mission: null,
      missionOf: function(a) {
        return a.mission || null;
      },
      order: crit.concat(warn)
    };
    window.APRISM_DELTA_COUNT = {
      crit: crit.length,
      warn: warn.length,
      total: all.length
    };
    window.APRISM_OPEN_ALERT = function(o) {
      var b = o && o.bld;
      if (b) {
        enter(b.floor, b.mission, b);
      }
    };
  }
  function deltaSay(top, list) {
    var d = {
      level: top,
      glow: top
    };
    if (!V3) {
      return d;
    }
    var l1 = $(".ai-line-1"), l2 = $(".ai-line-2");
    if (deltaFirst === null && l2) {
      deltaFirst = {
        line1: l1 ? l1.textContent : "",
        line2: l2.textContent
      };
    }
    window.APRISM_DELTA_SCOPE = floorView;
    publishDelta(list);
    window.APRISM_DELTA_SAY = null;
    if (scopeMission && !floorView) {
      var fl = MISSION_FLOORS[scopeMission];
      d.line1 = scopeMission;
      d.line2 = V6 ? list.length ? sevSay(list) + " 있어요. " + fl.join(" → ") + " 중 층을 골라 주세요." : "알림이 없어요. " + fl.join(" → ") + " 중 층을 골라 주세요." : scopeMission + "은 " + fl.join(" → ") + " 를 지나요. " + (list.length ? "알림이 " + list.length + "건(" + sevCount(list) + ") 들어와 있어요. 어느 층부터 볼까요?" : "지금은 들어온 알림이 없어요. 보고 싶은 층을 골라 주세요.");
      return d;
    }
    if (!floorView) {
      if (deltaFirst) {
        d.line1 = deltaFirst.line1 || " ";
        var nc = list.filter(function(a) {
          return a.sev === "critical";
        }).length;
        if (!V6) {
          d.line2 = deltaFirst.line2.replace(/위험 알림 \d+건, 주의 알림 \d+건/, "위험 알림 " + nc + "건, 주의 알림 " + (list.length - nc) + "건");
        } else if (!list.length) {
          d.line2 = "알림이 없어요. 순회는 정상이에요.";
        } else if (handoverName()) {
          var hn = handoverName();
          var hs = {
            l: [ "어서오세요 " + hn + "님", "인계된 알림 " + list.length + "건이 있어요. 살펴볼까요?" ],
            clue: "인계 알림 " + list.length + "건",
            yes: "살펴보기"
          };
          window.APRISM_DELTA_SAY = hs;
          d.line2 = hs.l.join("\n");
        } else {
          var crit = list.filter(function(a) {
            return a.sev === "critical";
          });
          var first = (crit.length ? crit : list).slice().sort(function(a, b) {
            return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
          })[0];
          var say = {
            l: [ sevSay(list) + " 있어요.", first.mission + "부터 확인하세요." ]
          };
          say.parts = {
            ko: [ [ say.l[0] ], [ {
              m: first.mission
            }, "부터 확인하세요." ] ],
            en: [ [ say.l[0] ], [ "Check ", {
              m: first.mission
            }, " first." ] ]
          };
          window.APRISM_DELTA_SAY = say;
          d.line2 = say.l.join("\n");
        }
      }
      return d;
    }
    var ms = missionsOn(floorView);
    d.line1 = FNAME[floorView];
    d.line2 = !V6 ? list.length ? FNAME[floorView] + "에서 알림이 " + list.length + "건(" + sevCount(list) + ") 들어와 있어요. 이 층을 지나는 미션은 " + ms.length + "개예요. 어느 미션부터 들어가 볼까요?" : FNAME[floorView] + "은 지금 조용해요. 이 층을 지나는 미션 " + ms.length + "개가 순회 중이에요. 궁금한 미션이 있으면 골라 주세요." : list.length ? sevSay(list) + " 있어요. 미션을 골라 주세요." : "알림이 없어요. 미션 " + ms.length + "개가 순회 중이에요.";
    return d;
  }
  if (scopeMission && trigger) {
    trigger.querySelector(".t-title-2").textContent = scopeMission;
  }
  if (scopeMission) {
    body.classList.add("is-mission-scope");
    var ov = $(".sb-overview");
    if (ov) {
      ov.classList.remove("is-on");
      ov.removeAttribute("aria-current");
    }
    var order = $(".ah-order");
    if (order) {
      order.textContent = document.body.classList.contains("ver-7") ? "오래된 순, 위험 우선" : "오래된 순 · 위험 우선";
    }
    var hintTxt = $("[data-bld-hint]");
    if (hintTxt) {
      hintTxt.textContent = "이 미션이 지나는 층이에요. 층을 누르면 그 층의 미션 관제로 돌아가요";
    }
  }
  renderLeft();
  renderRight();
  renderSum();
  if (window.APRISM_AH_SORT) {
    window.APRISM_AH_SORT.mount(function() {
      renderLeft();
    });
  }
  document.addEventListener("aprism:mission-no", function() {
    renderLeft();
  });
  var view = $(".map-view");
  var canvas = $("[data-bld-scene]");
  var hit = $("[data-bld-hit]");
  var panel = $(".map-panel");
  var labels = $("[data-bld-labels]");
  var tip = $("[data-bld-tip]");
  var loading = $("[data-bld-loading]");
  var hint = $("[data-bld-hint]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE, renderer, scene, camera;
  var ready = false;
  var fx = null;
  var F = {};
  var mode = "all";
  var cur = null;
  var hot = null;
  var busy = false;
  var tween = null;
  var cam = {
    target: null,
    zoom: 1,
    user: 1,
    pan: null
  };
  var unit = 1;
  var GAP = 0.78;
  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }
  var PAL = {
    dark: {
      ghost: 0x0e131c,
      ghostLift: 0,
      edge: 0x7b8fb4,
      edgeSolid: 0x7b8fb4,
      hotEdge: 0xd1d5de,
      hotFace: 0x1a2232,
      face: {
        floor: 0x18202e,
        wall: 0x3a475f,
        equipment: 0x41506a,
        stairs: 0x34405a,
        other: 0x36435a
      },
      lift: {
        floor: 0,
        wall: 0.55,
        equipment: 0.4,
        stairs: 0.45,
        other: 0.4
      }
    },
    light: {
      ghost: 0xeff1f4,
      ghostLift: 0.63,
      edge: 0x5d6773,
      edgeSolid: 0x5d6773,
      hotEdge: 0x2b2f36,
      hotFace: 0xe4e7ec,
      face: {
        floor: 0xeceef1,
        wall: 0xb4bcc9,
        equipment: 0x9aa5b6,
        stairs: 0xc3cad5,
        other: 0xb0b8c6
      },
      lift: {
        floor: 0,
        wall: 0.08,
        equipment: 0.06,
        stairs: 0.07,
        other: 0.06
      }
    }
  };
  if (V6) {
    var G = PAL.light.ghost, GL = PAL.light.ghostLift;
    PAL.light.face = {
      floor: G,
      wall: G,
      equipment: G,
      stairs: G,
      other: G
    };
    PAL.light.lift = {
      floor: GL,
      wall: GL,
      equipment: GL,
      stairs: GL,
      other: GL
    };
  }
  var KINDS = [ "floor", "wall", "equipment", "stairs", "other" ];
  function kindOf(node) {
    var n = node;
    while (n) {
      var s = String(n.name || "").toLowerCase().replace(/^[0-9]+[_\-\s]*/, "").split(/[\s\-–_]/)[0];
      if (KINDS.indexOf(s) >= 0) {
        return s;
      }
      n = n.parent;
    }
    return "other";
  }
  function floorIdOf(name) {
    var m = String(name || "").match(/지하[\s_]*([0-9]+)[\s_]*층/);
    return m ? "B" + m[1] : "";
  }
  function b64ToBuffer(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i += 1) {
      out[i] = bin.charCodeAt(i);
    }
    return out.buffer;
  }
  function start(mods) {
    THREE = mods[0];
    var GLTFLoader = mods[1].GLTFLoader;
    var merge = mods[2].mergeGeometries;
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    scene = new THREE.Scene;
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x0b0e16, 1.5));
    var sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(60, 120, 30);
    scene.add(sun);
    cam.target = new THREE.Vector3;
    cam.pan = new THREE.Vector3;
    (new GLTFLoader).parse(b64ToBuffer(window.APRISM_MAP_GLB), "", function(gltf) {
      build(gltf.scene, merge);
    }, function(err) {
      loading.textContent = "3D 맵 파일을 불러오지 못했어요";
      if (window.console) {
        console.error(err);
      }
    });
  }
  function trimJoins(geos, egs) {
    var EPS = 0.12, STEP = 0.1;
    var dmat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide
    });
    var list = geos.map(function(g) {
      var m = new THREE.Mesh(g, dmat);
      m.updateMatrixWorld(true);
      return m;
    });
    var boxes = geos.map(function(g) {
      g.computeBoundingBox();
      return g.boundingBox.clone().expandByScalar(EPS * 2);
    });
    var rc = new THREE.Raycaster;
    var DIRS = [ [ 1, 0.013, 0.021 ], [ -1, 0.017, -0.011 ], [ 0.019, 1, 0.012 ], [ -0.014, -1, 0.018 ], [ 0.011, 0.016, 1 ], [ -0.021, 0.012, -1 ] ].map(function(d) {
      return new THREE.Vector3(d[0], d[1], d[2]).normalize();
    });
    var raw = geos.map(function(g) {
      return g.boundingBox ? g.boundingBox.clone().expandByScalar(1e-3) : null;
    });
    function inside(pt) {
      var near = [];
      for (var j = 0; j < list.length; j += 1) {
        if (raw[j] && raw[j].containsPoint(pt)) {
          near.push(list[j]);
        }
      }
      if (!near.length) {
        return false;
      }
      for (var i = 0; i < DIRS.length; i += 1) {
        rc.set(pt, DIRS[i]);
        var h = rc.intersectObjects(near, false)[0];
        if (h && h.face && h.face.normal.dot(DIRS[i]) > 0) {
          return true;
        }
      }
      return false;
    }
    function clip(p0, p1, bx) {
      var t0 = 0, t1 = 1, ax = [ "x", "y", "z" ];
      for (var j = 0; j < 3; j += 1) {
        var c = ax[j], dd = p1[c] - p0[c];
        if (Math.abs(dd) < 1e-9) {
          if (p0[c] < bx.min[c] || p0[c] > bx.max[c]) {
            return null;
          }
          continue;
        }
        var ta = (bx.min[c] - p0[c]) / dd, tb = (bx.max[c] - p0[c]) / dd;
        if (ta > tb) {
          var tt = ta;
          ta = tb;
          tb = tt;
        }
        t0 = Math.max(t0, ta);
        t1 = Math.min(t1, tb);
        if (t0 > t1) {
          return null;
        }
      }
      return [ t0, t1 ];
    }
    var a = new THREE.Vector3, b = new THREE.Vector3, d = new THREE.Vector3, u = new THREE.Vector3, v = new THREE.Vector3, mid = new THREE.Vector3, pt = new THREE.Vector3, UP = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0);
    return egs.map(function(eg, wi) {
      var pos = eg.getAttribute("position"), keep = [], cutAny = false;
      for (var i = 0; i < pos.count; i += 2) {
        a.fromBufferAttribute(pos, i);
        b.fromBufferAttribute(pos, i + 1);
        var len = a.distanceTo(b);
        var spans = [];
        boxes.forEach(function(bx, bi) {
          if (bi === wi) {
            return;
          }
          var c = clip(a, b, bx);
          if (c) {
            spans.push(c);
          }
        });
        if (!spans.length) {
          keep.push(a.x, a.y, a.z, b.x, b.y, b.z);
          continue;
        }
        d.subVectors(b, a).normalize();
        u.crossVectors(d, Math.abs(d.y) > 0.9 ? AX : UP).normalize();
        v.crossVectors(d, u).normalize();
        var n = Math.max(1, Math.ceil(len / STEP)), cut = [];
        for (var k = 0; k < n; k += 1) {
          var t = (k + 0.5) / n;
          if (!spans.some(function(sp) {
            return t >= sp[0] && t <= sp[1];
          })) {
            cut.push(false);
            continue;
          }
          mid.lerpVectors(a, b, t);
          var inn = [ [ 1, 1 ], [ 1, -1 ], [ -1, -1 ], [ -1, 1 ] ].map(function(q) {
            pt.copy(mid).addScaledVector(u, q[0] * EPS).addScaledVector(v, q[1] * EPS);
            return inside(pt);
          });
          var cnt = inn.filter(Boolean).length;
          cut.push(cnt >= 3 || cnt === 2 && (inn[0] === inn[1] || inn[1] === inn[2]));
        }
        var k0 = -1;
        for (var k2 = 0; k2 <= n; k2 += 1) {
          if (k2 < n && !cut[k2]) {
            if (k0 < 0) {
              k0 = k2;
            }
            continue;
          }
          if (k0 >= 0) {
            pt.lerpVectors(a, b, k0 / n);
            mid.lerpVectors(a, b, k2 / n);
            keep.push(pt.x, pt.y, pt.z, mid.x, mid.y, mid.z);
            k0 = -1;
          }
          if (k2 < n) {
            cutAny = true;
          }
        }
      }
      if (!cutAny) {
        return eg;
      }
      var out = new THREE.BufferGeometry;
      out.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
      return out;
    });
  }
  function build(root, merge) {
    root.updateMatrixWorld(true);
    var tops = root.children.filter(function(c) {
      return floorIdOf(c.name);
    });
    var all = (new THREE.Box3).setFromObject(root);
    var center = all.getCenter(new THREE.Vector3);
    var b4 = tops.filter(function(c) {
      return floorIdOf(c.name) === "B4";
    })[0] || tops[0];
    var b4size = (new THREE.Box3).setFromObject(b4).getSize(new THREE.Vector3);
    var S = 100 / Math.max(b4size.x, b4size.z);
    tops.forEach(function(top) {
      var f = floorIdOf(top.name);
      if (FLOORS.indexOf(f) < 0) {
        return;
      }
      var box = (new THREE.Box3).setFromObject(top);
      var place = (new THREE.Matrix4).makeScale(S, S, S).multiply((new THREE.Matrix4).makeTranslation(-center.x, -box.min.y, -center.z));
      var parts = {}, edges = {};
      KINDS.forEach(function(k) {
        parts[k] = [];
        edges[k] = [];
      });
      top.traverse(function(node) {
        if (!node.isMesh || !node.geometry) {
          return;
        }
        var g = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
        Object.keys(g.attributes).forEach(function(a) {
          if (a !== "position" && a !== "normal") {
            g.deleteAttribute(a);
          }
        });
        if (!g.attributes.normal) {
          g.computeVertexNormals();
        }
        g.applyMatrix4(node.matrixWorld);
        g.applyMatrix4(place);
        var k = kindOf(node);
        parts[k].push(g);
        edges[k].push(new THREE.EdgesGeometry(g, 28));
      });
      if (V6 && parts.wall.length > 1) {
        edges.wall = trimJoins(parts.wall, edges.wall);
      }
      var holder = new THREE.Group;
      var mats = {}, lines = [], meshes = [];
      KINDS.forEach(function(k) {
        if (!parts[k].length) {
          return;
        }
        var geo = parts[k].length > 1 ? merge(parts[k], false) : parts[k][0];
        var mat = new THREE.MeshLambertMaterial({
          color: 0x000000,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.userData.floor = f;
        mesh.userData.kind = k;
        holder.add(mesh);
        meshes.push(mesh);
        mats[k] = mat;
        var eg = edges[k].length > 1 ? merge(edges[k], false) : edges[k][0];
        var lm = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.75
        });
        var ls = new THREE.LineSegments(eg, lm);
        ls.raycast = function() {};
        ls.userData.kind = k;
        holder.add(ls);
        lines.push(ls);
      });
      var size = (new THREE.Box3).setFromObject(holder).getSize(new THREE.Vector3);
      var bounds = (new THREE.Box3).setFromObject(holder);
      scene.add(holder);
      F[f] = {
        holder: holder,
        mats: mats,
        lines: lines,
        meshes: meshes,
        size: size,
        bounds: bounds,
        y: 0,
        op: 1,
        solid: 0,
        hot: 0
      };
    });
    seat();
    layout(true);
    ready = true;
    loading.remove();
    if (window.APRISM_BLD_FX) {
      fx = window.APRISM_BLD_FX;
      fx.init({
        THREE: THREE,
        renderer: renderer,
        scene: scene,
        camera: camera,
        view: view,
        F: F,
        FLOORS: FLOORS,
        isLight: isLight,
        state: function() {
          return {
            mode: mode,
            cur: cur,
            hot: hot
          };
        }
      });
    }
    buildLabels();
    resize();
    requestAnimationFrame(frame);
  }
  function surf(f, uv, lift) {
    var s = F[f], b = s.bounds;
    var longZ = s.size.z >= s.size.x;
    var x0 = b.min.x, x1 = b.max.x, z0 = b.min.z, z1 = b.max.z;
    var x = longZ ? x0 + uv[0] * (x1 - x0) : x0 + uv[1] * (x1 - x0);
    var z = longZ ? z0 + uv[1] * (z1 - z0) : z0 + uv[0] * (z1 - z0);
    return new THREE.Vector3(x, s.y + (lift || 0), z);
  }
  function seat() {
    var ray = new THREE.Raycaster;
    var down = new THREE.Vector3(0, -1, 0);
    function openAt(f, uv) {
      var p = surf(f, uv, 500);
      ray.set(p, down);
      var hitList = ray.intersectObjects(F[f].meshes, false);
      return hitList.length && hitList[0].object.userData.kind === "floor";
    }
    function fix(f, uv) {
      if (openAt(f, uv)) {
        return uv;
      }
      for (var r = 0.02; r < 0.3; r += 0.02) {
        for (var a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          var t = [ uv[0] + Math.cos(a) * r, uv[1] + Math.sin(a) * r ];
          if (t[0] < 0.02 || t[0] > 0.98 || t[1] < 0.02 || t[1] > 0.98) {
            continue;
          }
          if (openAt(f, t)) {
            return t;
          }
        }
      }
      return uv;
    }
    ROBOTS.forEach(function(r) {
      if (F[r.floor]) {
        r.uv = fix(r.floor, r.uv);
      }
    });
    ALERTS.forEach(function(a) {
      if (F[a.floor]) {
        a.uv = fix(a.floor, a.uv);
      }
    });
  }
  function stackY(f) {
    var i = FLOORS.indexOf(f);
    var h = F.B4 ? F.B4.size.y : 10;
    return (FLOORS.length - 1 - i) * (h + GAP * 100);
  }
  function layout(instant) {
    var targets = {};
    if (cam.pan) {
      cam.pan.set(0, 0, 0);
    }
    if (mode === "all") {
      FLOORS.forEach(function(f) {
        targets[f] = {
          y: stackY(f),
          op: 1,
          solid: 0
        };
      });
      var top = stackY(FLOORS[0]) + F[FLOORS[0]].size.y;
      animate(targets, new THREE.Vector3(0, top / 2, 0), 1, instant);
    } else {
      FLOORS.forEach(function(f) {
        var on = f === cur;
        var above = FLOORS.indexOf(f) < FLOORS.indexOf(cur);
        targets[f] = {
          y: on ? stackY(cur) : stackY(cur) + (above ? 80 : -80),
          op: on ? 1 : 0,
          solid: on ? 1 : 0
        };
      });
      var tgt = new THREE.Vector3(0, stackY(cur) + F[cur].size.y * 0.3, 0);
      if (V6 && floorView && window.APRISM_MINI) {
        tgt.y -= 4;
      }
      animate(targets, tgt, 1.5, instant);
    }
  }
  function animate(targets, t, z, instant) {
    var from = {};
    FLOORS.forEach(function(f) {
      from[f] = {
        y: F[f].y,
        op: F[f].op,
        solid: F[f].solid
      };
    });
    tween = {
      t0: performance.now(),
      dur: instant || reduce ? 0 : 700,
      from: from,
      to: targets,
      ct0: cam.target.clone(),
      ct1: t,
      cz0: cam.zoom,
      cz1: z
    };
  }
  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  var DIR = null;
  var tmpA = null, tmpB = null, tmpC = null;
  function step(now) {
    var pal = PAL[isLight() ? "light" : "dark"];
    if (tween) {
      var k = tween.dur ? Math.min(1, (now - tween.t0) / tween.dur) : 1;
      var e = ease(k);
      FLOORS.forEach(function(f) {
        var a = tween.from[f], b = tween.to[f], s = F[f];
        s.y = a.y + (b.y - a.y) * e;
        s.op = a.op + (b.op - a.op) * e;
        s.solid = a.solid + (b.solid - a.solid) * e;
      });
      cam.target.lerpVectors(tween.ct0, tween.ct1, e);
      cam.zoom = tween.cz0 + (tween.cz1 - tween.cz0) * e;
      if (k >= 1) {
        tween = null;
      }
    }
    var ghost = tmpA.setHex(pal.ghost);
    FLOORS.forEach(function(f) {
      var s = F[f];
      s.hot += ((hot === f && mode === "all" ? 1 : 0) - s.hot) * 0.2;
      s.holder.position.y = s.y;
      s.holder.visible = s.op > 0.01;
      var dim = hot && mode === "all" && hot !== f ? 0.4 : 1;
      KINDS.forEach(function(key) {
        var m = s.mats[key];
        if (!m) {
          return;
        }
        m.color.copy(ghost).lerp(tmpB.setHex(pal.hotFace), s.hot * (1 - s.solid)).lerp(tmpB.setHex(pal.face[key]), s.solid);
        m.emissive = m.emissive || new THREE.Color;
        m.emissive.setHex(pal.face[key]).multiplyScalar(pal.lift[key] * s.solid).add(tmpB.setHex(pal.ghost).multiplyScalar(pal.ghostLift * (1 - s.solid)));
        m.opacity = s.op;
        m.transparent = s.op < 0.999;
        m.depthWrite = s.op > 0.5;
      });
      s.lines.forEach(function(ls) {
        var base = ls.userData.kind === "floor" ? 0.35 : 0.8;
        ls.material.color.setHex(pal.edge).lerp(tmpB.setHex(pal.hotEdge), s.hot);
        ls.material.opacity = (base - (base - 0.4) * s.solid) * s.op * dim;
        if (V6 && ls.userData.kind === "stairs" && isLight()) {
          ls.material.color.setHex(0x959aa1);
          ls.material.opacity = 0.45 * s.op * dim;
        }
      });
    });
    camera.zoom = cam.zoom * cam.user;
    tmpC.copy(cam.target).add(cam.pan);
    camera.position.copy(tmpC).addScaledVector(DIR, 1500);
    camera.lookAt(tmpC);
    camera.updateProjectionMatrix();
  }
  function frame(now) {
    step(now || performance.now());
    if (fx) {
      fx.step(now || performance.now());
    }
    if (!(fx && fx.render())) {
      renderer.render(scene, camera);
    }
    placeLabels();
    requestAnimationFrame(frame);
  }
  function resize() {
    if (!renderer) {
      return;
    }
    var vw = view.clientWidth, vh = view.clientHeight;
    renderer.setSize(vw, vh, false);
    if (!ready) {
      return;
    }
    var vr = view.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    var cx = pr.left - vr.left + pr.width / 2;
    var cy = pr.top - vr.top + pr.height / 2;
    camera.position.set(0, 0, 0).addScaledVector(DIR, 1500);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    var inv = camera.matrixWorldInverse;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    FLOORS.forEach(function(f) {
      var b = F[f].bounds, y0 = stackY(f);
      [ b.min.x, b.max.x ].forEach(function(x) {
        [ y0, y0 + F[f].size.y ].forEach(function(y) {
          [ b.min.z, b.max.z ].forEach(function(z) {
            var p = new THREE.Vector3(x, y, z).applyMatrix4(inv);
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          });
        });
      });
    });
    var room = {
      w: pr.width - 200,
      h: pr.height - 120
    };
    unit = Math.max((maxX - minX) / room.w, (maxY - minY) / room.h);
    if (body.classList.contains("ver-7")) {
      if (vw !== tagShiftW) {
        tagShift = 0;
        tagShiftW = vw;
      }
      cx -= tagShift;
      tagChecked = false;
    }
    camera.left = -cx * unit;
    camera.right = (vw - cx) * unit;
    camera.top = cy * unit;
    camera.bottom = -(vh - cy) * unit;
    camera.updateProjectionMatrix();
  }
  var L = {};
  function buildLabels() {
    labels.textContent = "";
    FLOORS.forEach(function(f) {
      var list = alertsOn(f);
      var tag = el("button", "bld-ftag" + (document.body.classList.contains("ver-7") ? " ds-floor-tag" : ""));
      tag.type = "button";
      tag.setAttribute("data-floor", f);
      tag.setAttribute("aria-label", FNAME[f] + "으로 들어가기");
      tag.appendChild(el("span", "bld-ftag-line"));
      var txt = el("span", "bld-ftag-txt");
      var name = el("span", "bld-ftag-name");
      name.appendChild(el("b", "num", f));
      name.appendChild(el("span", "t-label-2", FNAME[f]));
      txt.appendChild(name);
      var sub = el("span", "t-caption bld-ftag-sub");
      sub.appendChild(document.createTextNode("로봇 " + robotsOn(f).length + "대"));
      if (V6) {
        sevParts(sub, list);
      } else if (list.length) {
        var sev = el("span", "bld-sev");
        sev.setAttribute("data-sev", topSev(list));
        sev.appendChild(el("span", "bld-sev-dot"));
        sev.appendChild(document.createTextNode(sevCount(list)));
        sub.appendChild(sev);
      }
      txt.appendChild(sub);
      tag.appendChild(txt);
      tag.addEventListener("mouseenter", function() {
        setHot(f, null, true);
      });
      tag.addEventListener("mouseleave", function() {
        setHot(null);
      });
      tag.addEventListener("click", function() {
        if (V3) {
          openFloor(f);
        } else {
          enter(f, missionFor(f));
        }
      });
      labels.appendChild(tag);
      L["tag" + f] = tag;
    });
    ALERTS.forEach(function(a, i) {
      var m = el("span", "bld-alert is-" + a.sev);
      m.setAttribute("aria-hidden", "true");
      m.appendChild(icon(a.sev === "critical" ? "error" : "warning"));
      if (V7B) {
        m.addEventListener("click", function(event) {
          if (!floorView) {
            return;
          }
          event.stopPropagation();
          enter(a.floor, a.mission, a);
        });
      }
      labels.appendChild(m);
      a.node = m;
    });
    ROBOTS.forEach(function(r) {
      var b = el("span", "bld-bot is-" + r.st);
      b.setAttribute("aria-hidden", "true");
      b.appendChild(el("i"));
      b.appendChild(el("span", "bld-bot-name num" + (document.body.classList.contains("ver-7") ? " ds-badge is-neutral is-num is-onmap" : ""), (r.n < 10 ? "0" : "") + r.n));
      if (V3 && r.mission) {
        var say = el("button", "bld-bot-say t-caption", r.mission);
        say.type = "button";
        say.setAttribute("aria-label", rname(r) + " · " + r.mission + " 으로 들어가기");
        say.addEventListener("click", function(event) {
          event.stopPropagation();
          enter(r.floor, r.mission);
        });
        b.removeAttribute("aria-hidden");
        b.appendChild(say);
      }
      if (V7B) {
        b.addEventListener("click", function(event) {
          if (!floorView) {
            return;
          }
          event.stopPropagation();
          if (r.mission) {
            enter(r.floor, r.mission);
          } else {
            flashBot(r);
          }
        });
      }
      labels.appendChild(b);
      r.node = b;
    });
  }
  function markRobot(r, on) {
    if (r.node) {
      r.node.classList.toggle("is-marked", on);
    }
  }
  function flashBot(r) {
    if (!r.node) {
      return;
    }
    setHot(r.floor, null, true);
    r.node.classList.remove("is-flash");
    void r.node.offsetWidth;
    r.node.classList.add("is-flash");
    setTimeout(function() {
      if (r.node) {
        r.node.classList.remove("is-flash");
      }
      setHot(null);
    }, 1600);
  }
  var proj = null;
  function toScreen(p) {
    proj.copy(p).project(camera);
    return [ (proj.x + 1) / 2 * view.clientWidth, (1 - proj.y) / 2 * view.clientHeight ];
  }
  function snap(v) {
    var d = window.devicePixelRatio || 1;
    return Math.round(v * d) / d;
  }
  function put(node, p, op) {
    var xy = toScreen(p);
    node.style.transform = "translate(" + snap(xy[0]) + "px," + snap(xy[1]) + "px)";
    node.style.opacity = op;
    node.style.pointerEvents = op > 0.5 ? "" : "none";
    node.classList.toggle("is-gone", op <= 0.5);
  }
  var tagShift = 0, tagShiftW = -1, tagChecked = true;
  function fitTags() {
    tagChecked = true;
    var rails = [];
    Array.prototype.forEach.call(panel.querySelectorAll(".map-tools, .bld-floors"), function(r) {
      var rr = r.getBoundingClientRect();
      if (rr.width) {
        rails.push(rr);
      }
    });
    var need = 0;
    FLOORS.forEach(function(f) {
      var t = L["tag" + f];
      if (!t) {
        return;
      }
      if (t.classList.contains("is-gone")) {
        tagChecked = false;
        return;
      }
      Array.prototype.forEach.call(t.querySelectorAll(".bld-ftag-name, .bld-ftag-sub"), function(line) {
        var rg = document.createRange();
        rg.selectNodeContents(line);
        var lr = rg.getBoundingClientRect();
        rails.forEach(function(r) {
          if (lr.bottom > r.top && lr.top < r.bottom) {
            need = Math.max(need, lr.right + 16 - r.left);
          }
        });
      });
    });
    if (need > 0.5) {
      tagShift += Math.ceil(need);
      resize();
    }
  }
  function placeLabels() {
    if (!ready) {
      return;
    }
    var vr = view.getBoundingClientRect(), hr = hit.getBoundingClientRect();
    labels.style.left = vr.left - hr.left + "px";
    labels.style.top = vr.top - hr.top + "px";
    FLOORS.forEach(function(f) {
      var s = F[f], b = s.bounds;
      var corner = new THREE.Vector3(b.max.x, s.y + s.size.y * 0.5, b.min.z);
      put(L["tag" + f], corner, mode === "all" ? s.op : 0);
      L["tag" + f].classList.toggle("is-hot", hot === f);
    });
    if (!tagChecked && mode === "all" && body.classList.contains("ver-7")) {
      fitTags();
    }
    ALERTS.forEach(function(a) {
      put(a.node, surf(a.floor, a.uv, F[a.floor].size.y + 1), F[a.floor].op);
    });
    ROBOTS.forEach(function(r) {
      if (r.moving && !reduce) {
        r.uv[1] = Math.min(0.86, r.uv[1] + 0.00003);
      }
      put(r.node, surf(r.floor, r.uv, F[r.floor].size.y * 0.15 + 1), F[r.floor].op);
    });
  }
  var ray = null, ndc = null;
  function pickFloor(event) {
    if (!ready) {
      return null;
    }
    var vr = view.getBoundingClientRect();
    ndc.set((event.clientX - vr.left) / vr.width * 2 - 1, -((event.clientY - vr.top) / vr.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var objs = [];
    FLOORS.forEach(function(f) {
      if (F[f].op > 0.5) {
        objs = objs.concat(F[f].meshes);
      }
    });
    var h = ray.intersectObjects(objs, false)[0];
    return h ? h.object.userData.floor : null;
  }
  function showTip(f, event) {
    var list = alertsOn(f), bots = robotsOn(f);
    var run = bots.filter(function(r) {
      return r.st === "run";
    }).length;
    tip.textContent = "";
    var head = el("p", "bld-tip-head");
    head.appendChild(el("b", "num", f));
    head.appendChild(el("span", "t-label-1", FNAME[f]));
    tip.appendChild(head);
    var rows = el("dl", "bld-tip-rows");
    function row(k, v, sev) {
      var d = el("div");
      d.appendChild(el("dt", "t-caption", k));
      var dd = el("dd", "t-label-2" + (sev !== undefined ? " bld-sev" : ""));
      if (sev) {
        dd.setAttribute("data-sev", sev);
      }
      if (sev !== undefined) {
        dd.appendChild(el("span", "bld-sev-dot"));
      }
      dd.appendChild(document.createTextNode(v));
      d.appendChild(dd);
      rows.appendChild(d);
    }
    row("로봇", bots.length + "대 · " + run + "대 수행중");
    row("미션", missionsOn(f).length + "건 지남");
    if (V6 && list.length) {
      var ar = el("div"), ad = el("dd", "t-label-2 bld-sev-row");
      ar.appendChild(el("dt", "t-caption", "알림"));
      sevParts(ad, list);
      ar.appendChild(ad);
      rows.appendChild(ar);
    } else {
      row("알림", list.length ? sevCount(list) : "없음", topSev(list));
    }
    tip.appendChild(rows);
    var go = el("p", "t-caption bld-tip-go");
    if (V3) {
      go.appendChild(el("span", null, !inScope(f) ? "이 미션은 이 층을 지나지 않아요" : scopeMission ? "누르면 이 층으로 들어가요" : "누르면 이 층만 펼쳐요"));
    } else {
      go.appendChild(el("span", null, "누르면 들어가요"));
      go.appendChild(el("b", "t-label-2", missionFor(f)));
    }
    tip.appendChild(go);
    tip.hidden = false;
    var hr = hit.getBoundingClientRect();
    var x = event.clientX - hr.left + 16, y = event.clientY - hr.top + 16;
    x = Math.min(x, hr.width - tip.offsetWidth - 8);
    y = Math.min(y, hr.height - tip.offsetHeight - 8);
    tip.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
  }
  function setHot(f, event, fromList) {
    if (mode !== "all" || busy) {
      return;
    }
    hot = f;
    hit.classList.toggle("is-pick", !!f && !fromList);
    $$("[data-bld-floor]").forEach(function(b) {
      b.classList.toggle("is-hover", b.getAttribute("data-bld-floor") === f);
    });
    if (f && event) {
      showTip(f, event);
    } else {
      tip.hidden = true;
    }
  }
  var drag = null;
  hit.addEventListener("pointermove", function(event) {
    if (mode !== "all" || busy || drag) {
      return;
    }
    var over = event.target.closest && event.target.closest(".bld-ftag, .map-tools, .bld-sum, .delta3");
    if (over) {
      if (!over.classList.contains("bld-ftag")) {
        setHot(null);
      }
      return;
    }
    setHot(pickFloor(event), event);
  });
  hit.addEventListener("pointerleave", function() {
    setHot(null);
  });
  hit.addEventListener("click", function(event) {
    if (mode !== "all" || event.target.closest && event.target.closest("button")) {
      return;
    }
    var f = pickFloor(event);
    if (f) {
      if (V3) {
        openFloor(f);
      } else {
        enter(f, missionFor(f));
      }
    }
  });
  function zoomBy(k) {
    cam.user = Math.max(0.6, Math.min(3, cam.user * k));
  }
  hit.addEventListener("wheel", function(event) {
    if (!V6) {
      if (mode !== "all") {
        return;
      }
      event.preventDefault();
      zoomBy(Math.pow(1.0015, -event.deltaY));
      return;
    }
    if (!ready || busy || mode !== "all" && !floorView) {
      return;
    }
    event.preventDefault();
    var vr = view.getBoundingClientRect();
    var nx = (event.clientX - vr.left) / vr.width * 2 - 1, ny = -((event.clientY - vr.top) / vr.height) * 2 + 1;
    var before = new THREE.Vector3(nx, ny, 0).unproject(camera);
    var u0 = cam.user;
    zoomBy(Math.pow(1.0015, -event.deltaY));
    if (cam.user === u0) {
      return;
    }
    camera.zoom = cam.zoom * cam.user;
    camera.updateProjectionMatrix();
    var after = new THREE.Vector3(nx, ny, 0).unproject(camera);
    cam.pan.add(before.sub(after));
  }, {
    passive: false
  });
  $$("[data-bld-zoom]").forEach(function(b) {
    b.addEventListener("click", function() {
      zoomBy(b.getAttribute("data-bld-zoom") === "in" ? 1.25 : 0.8);
    });
  });
  var home = $("[data-bld-home]");
  if (home) {
    home.addEventListener("click", function() {
      cam.user = 1;
      if (cam.pan) {
        cam.pan.set(0, 0, 0);
      }
    });
  }
  function enter(f, mission, alert) {
    if (busy) {
      return;
    }
    closeMenu();
    if (V6 && mission && stateOf(mission) === "idle") {
      location.href = (window.aprismHref || String)("mission-setup-v6.html?mission=" + encodeURIComponent(mission));
      return;
    }
    var to = mainUrl(mission, f) + (alert ? "&alert=" + encodeURIComponent(alert.time) + "&wp=" + (/WP-\d+/.exec(alert.where || "") || [ "" ])[0] : "");
    if (window.APRISM_SHELL) {
      window.APRISM_SHELL.open(to);
      return;
    }
    if (!ready) {
      location.href = to;
      return;
    }
    setHot(null);
    busy = true;
    mode = "one";
    cur = f;
    cam.user = 1;
    layout(false);
    tip.hidden = true;
    body.classList.add("is-entering");
    if (trigger) {
      trigger.querySelector(".t-title-2").textContent = mission;
    }
    $$("[data-bld-floor]").forEach(function(b) {
      b.classList.toggle("is-on", b.getAttribute("data-bld-floor") === f);
    });
    setTimeout(function() {
      location.href = to;
    }, reduce ? 0 : 760);
  }
  function markFloorBtns(f) {
    $$("[data-bld-floor]").forEach(function(b) {
      var on = b.getAttribute("data-bld-floor") === f;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function openFloor(f) {
    if (busy) {
      return;
    }
    if (scopeMission) {
      if (inScope(f)) {
        enter(f, scopeMission);
      }
      return;
    }
    closeMenu();
    setHot(null);
    tip.hidden = true;
    floorView = f;
    if (ready) {
      mode = "one";
      cur = f;
      cam.user = 1;
      layout(false);
    }
    body.classList.add("is-floor-view");
    markFloorBtns(f);
    renderLeft();
    renderRight();
    renderSum();
  }
  function closeFloor() {
    if (busy || !floorView) {
      return;
    }
    floorView = null;
    fleetFloor = "all";
    if (ready) {
      mode = "all";
      cur = null;
      cam.user = 1;
      layout(false);
    }
    body.classList.remove("is-floor-view");
    markFloorBtns("all");
    renderLeft();
    renderRight();
    renderSum();
  }
  window.addEventListener("pageshow", function(event) {
    if (!event.persisted || !ready) {
      return;
    }
    busy = false;
    mode = floorView ? "one" : "all";
    cur = floorView;
    body.classList.remove("is-entering");
    if (trigger) {
      trigger.querySelector(".t-title-2").textContent = scopeMission || (V3 ? "미션 선택" : (window.APRISM_MISSION ? APRISM_MISSION("m9") : "통합 순회") + " 현황");
    }
    markFloorBtns(floorView || "all");
    layout(true);
  });
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      setHot(null);
    }
  });
  var goCrit = $("[data-bld-go-critical]");
  if (goCrit) {
    goCrit.addEventListener("click", function() {
      var a = (floorView ? alertsOn(floorView) : ALERTS).filter(function(x) {
        return x.sev === "critical";
      })[0];
      if (a) {
        enter(a.floor, a.mission);
      }
    });
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function() {
      resize();
    }).observe(view);
  }
  if (body.classList.contains("ver-7") && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      resize();
    });
  }
  window.addEventListener("resize", resize);
  if (!window.APRISM_MAP_GLB || !canvas) {
    if (loading) {
      loading.textContent = "3D 맵을 표시할 수 없어요";
    }
    return;
  }
  Promise.all([ import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/utils/BufferGeometryUtils.js") ]).then(function(mods) {
    var T = mods[0];
    DIR = new T.Vector3(1, 0.95, 1).normalize();
    tmpA = new T.Color;
    tmpC = new T.Vector3;
    tmpB = new T.Color;
    proj = new T.Vector3;
    ray = new T.Raycaster;
    ndc = new T.Vector2;
    start(mods);
  }).catch(function(err) {
    if (loading) {
      loading.textContent = "이 브라우저에서는 3D 맵을 표시할 수 없어요";
    }
    if (window.console) {
      console.error(err);
    }
  });
})();
