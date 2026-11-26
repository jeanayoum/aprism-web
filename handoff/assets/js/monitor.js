(function() {
  "use strict";
  var body = document.body;
  if (!body.classList.contains("v2")) {
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
  function icon(name) {
    var node = el("span", "i i-16");
    node.style.setProperty("--i", "var(--ic-" + name + ")");
    node.setAttribute("aria-hidden", "true");
    return node;
  }
  var T0 = Date.now(), BASE = function() {
    if (!document.body.classList.contains("ver-7") || document.documentElement.lang === "en") {
      return null;
    }
    var m = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec((document.querySelector(".status-bar") || document.body).textContent || "");
    return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : null;
  }();
  function clock(date) {
    var d = date || (BASE ? new Date(BASE + Date.now() - T0) : new Date);
    return [ d.getHours(), d.getMinutes(), d.getSeconds() ].map(function(n) {
      return (n < 10 ? "0" : "") + n;
    }).join(":");
  }
  var WARNINGS = [ {
    sev: "warning",
    robot: 0,
    floor: "B4",
    wp: "WP-03",
    live: "discharge",
    where: "APRO 4F · WP-03 냉각수 배관 밸브",
    time: "10:11:19",
    title: "누출감지 · 냉각수 배관 밸브",
    detect: "누출감지",
    sum: "밸브 이음부에서 누출 패턴이 신뢰도 0.87 로 검출됐습니다. 임계 0.70 을 넘었고 연속 2프레임에서 나왔습니다.",
    lead: "밸브 이음부 현장 점검을 요청하세요.",
    fp: 15,
    fpLabel: "낮음",
    acts: [ {
      t: "현장 점검 요청",
      ai: true
    }, {
      t: "다음 순회 재측정"
    }, {
      t: "추이 관찰"
    } ]
  }, {
    sev: "warning",
    robot: 4,
    floor: "B3",
    wp: "WP-06",
    live: "discharge",
    where: "Robot 05 · WP-06 수배전반",
    time: "10:09:42",
    title: "부분방전 · 이상 점수 9.41",
    detect: "부분방전",
    sum: "이상 점수 9.41 로 임계 9.23 을 넘었습니다. PRPD 패턴이 코로나 방전 유형과 일치합니다.",
    lead: "재진단을 예약해 PRPD 패턴을 다시 확인하세요.",
    fp: 22,
    fpLabel: "보통",
    acts: [ {
      t: "재진단 예약",
      ai: true
    }, {
      t: "현장 점검 요청"
    }, {
      t: "추이 관찰"
    } ]
  }, {
    sev: "warning",
    robot: 4,
    floor: "B3",
    wp: "WP-12",
    live: "discharge",
    where: "Robot 05 · WP-12 냉각 펌프 P-2",
    time: "10:06:05",
    title: "진동 상승 · 냉각 펌프 P-2",
    detect: "진동감지",
    sum: "진동 RMS 4.8 mm/s 로 주의 기준 4.5 를 넘었습니다. 최근 3회 측정에서 계속 오르고 있습니다.",
    lead: "베어링 점검을 요청하세요.",
    fp: 18,
    fpLabel: "낮음",
    acts: [ {
      t: "베어링 점검 요청",
      ai: true
    }, {
      t: "다음 순회 재측정"
    }, {
      t: "추이 관찰"
    } ]
  }, {
    sev: "warning",
    robot: 4,
    floor: "B3",
    wp: "WP-02",
    live: "ppe",
    where: "Robot 05 · WP-02 발전기 베어링",
    time: "10:03:27",
    title: "과열 · 발전기 베어링 68.4℃",
    detect: "온도감지",
    sum: "베어링 표면 온도 68.4℃ 로 주의 기준 65℃ 를 넘었습니다. 주변 온도보다 31℃ 높습니다.",
    lead: "윤활 상태 점검을 요청하세요.",
    fp: 25,
    fpLabel: "보통",
    acts: [ {
      t: "윤활 상태 점검 요청",
      ai: true
    }, {
      t: "열화상 재촬영"
    }, {
      t: "추이 관찰"
    } ]
  }, {
    sev: "warning",
    robot: 4,
    floor: "B4",
    wp: "WP-13",
    live: "discharge",
    where: "Robot 05 · WP-13 공기 압축기 C-1",
    time: "10:01:12",
    title: "압력 편차 · 공기 압축기 C-1",
    detect: "계기인식",
    sum: "토출 압력 7.9 bar 로 정상 범위(8.2~8.8) 아래입니다. 흡입 필터가 막혔을 가능성이 있습니다.",
    lead: "흡입 필터 점검을 요청하세요.",
    fp: 30,
    fpLabel: "보통",
    acts: [ {
      t: "필터 점검 요청",
      ai: true
    }, {
      t: "재측정 예약"
    }, {
      t: "추이 관찰"
    } ]
  } ];
  var CRITICAL = {
    sev: "critical",
    robot: 0,
    floor: "B4",
    wp: "WP-04",
    live: "ppe",
    where: "터빈 2 / Unit 03 · WP-04 N₂ 배관 압력계",
    time: "10:12:40",
    title: "지하발전소 B3 터빈 2 NG 1건 발견",
    detect: "계기인식",
    sum: "Spiral Casing Pr. 측정값 90 이 기준값 87 을 넘었습니다. 최근 3회 측정이 잇달아 올라 NG 로 판정했습니다.",
    lead: "현장에 무전으로 작업 중지를 요청하세요.",
    fp: 8,
    fpLabel: "낮음",
    brief: [ "WP-04 압력계가 NG예요.", "작업 중지부터 요청하세요." ],
    acts: [ {
      t: "현장 무전 연락 · 작업 중지 요청",
      ai: true
    }, {
      t: "로봇 정지 · 현장 점검 요청",
      ai: true
    }, {
      t: "재측정 후 판단"
    } ]
  };
  if (body.classList.contains("v2-2")) {
    CRITICAL.title = "지하발전소 터빈 2 NG 1건 발견";
  }
  var V5 = body.classList.contains("ver-5");
  var R01_MORE = [];
  if (V5) {
    CRITICAL.sum = "N₂ 배관 압력 0.86 MPa 로 정상 범위(0.60 ~ 0.80)를 넘었습니다. 최근 3회 측정이 잇달아 올라 NG 로 판정했습니다.";
    if (body.classList.contains("ver-6")) {
      CRITICAL.lead = "현장 점검부터 요청하세요.";
      CRITICAL.brief = [ "WP-04 압력계가 NG예요.", "현장 점검부터 요청하세요." ];
      CRITICAL.acts = [ {
        t: "로봇 정지 · 현장 점검 요청",
        ai: true
      }, {
        t: "현장 무전 연락 · 작업 중지 요청",
        ai: true
      }, {
        t: "재측정 후 판단"
      } ];
    }
    WARNINGS[0].sum = "밸브 이음부에서 누출 의심도 62% 로 기준 55% 를 넘었습니다. 연속 2프레임에서 나왔습니다.";
    WARNINGS[0].lead = "구역 출입을 통제하고 설비팀에 밸브 확인을 요청하세요.";
    WARNINGS[0].acts = [ {
      t: "구역 출입 통제",
      ai: true
    }, {
      t: "설비팀 밸브 확인 요청",
      ai: true
    }, {
      t: "현장 확인"
    } ];
    R01_MORE = [ {
      sev: "warning",
      robot: 0,
      floor: "B4",
      wp: "WP-05",
      live: "discharge",
      where: "APRO 4F · WP-05 냉각 펌프 P-2",
      time: "10:13:52",
      title: "이상음향 · 냉각 펌프 P-2",
      detect: "이상음향",
      sum: "이상 점수 20.4 로 기준 19.0 을 넘었습니다. 저주파 대역 에너지가 늘어 베어링 마모 패턴과 비슷합니다.",
      lead: "진동 정밀 측정을 요청하세요.",
      fp: 20,
      fpLabel: "낮음",
      acts: [ {
        t: "진동 정밀 측정 요청",
        ai: true
      }, {
        t: "설비 정지 검토 요청"
      } ]
    }, {
      sev: "warning",
      robot: 0,
      floor: "B4",
      wp: "WP-05",
      live: "discharge",
      where: "APRO 4F · WP-05 냉각 펌프 P-2",
      time: "10:14:10",
      title: "온도감지 · 냉각 펌프 P-2 48.6℃",
      detect: "온도감지",
      sum: "펌프 하우징 최고 48.6℃ 로 기준 40℃ 를 넘었습니다. 평소 36.2℃ 보다 12.4℃ 높습니다.",
      lead: "부하를 줄이고 점검을 요청하세요.",
      fp: 18,
      fpLabel: "낮음",
      acts: [ {
        t: "부하 감소 요청",
        ai: true
      }, {
        t: "설비 점검 요청",
        ai: true
      }, {
        t: "현장 확인"
      } ]
    }, {
      sev: "warning",
      robot: 0,
      floor: "B4",
      wp: "WP-06",
      live: "discharge",
      where: "APRO 4F · WP-06 수배전반 MCC-1",
      time: "10:15:31",
      title: "부분방전 · CH1 이상 점수 9.05",
      detect: "부분방전",
      sum: "CH1 이상 점수 9.05 로 기준 8.60 을 넘었습니다. CH2 · CH3 은 정상 범위입니다.",
      lead: "절연 진단을 요청하세요.",
      fp: 22,
      fpLabel: "보통",
      acts: [ {
        t: "절연 진단 요청",
        ai: true
      }, {
        t: "감시 강화",
        ai: true
      } ]
    }, {
      sev: "critical",
      robot: 0,
      floor: "B4",
      wp: "WP-07",
      live: "ppe",
      where: "APRO 4F · WP-07 고소 작업 발판",
      time: "10:16:48",
      title: "안전감지 · 안전벨트 미착용 1명",
      detect: "안전감지",
      sum: "고소 작업 발판에서 안전벨트를 매지 않은 작업자 1명이 신뢰도 0.91 로 검출됐습니다.",
      lead: "작업자에게 즉시 착용을 안내하세요.",
      fp: 6,
      fpLabel: "낮음",
      brief: [ "WP-07 작업자가 안전벨트 미착용이에요.", "즉시 착용부터 안내하세요." ],
      acts: [ {
        t: "작업자 즉시 착용 안내",
        ai: true
      }, {
        t: "고소 작업 일시 중지",
        ai: true
      }, {
        t: "안전관리팀 전달"
      } ]
    } ];
  }
  var ROUTE_ALERTS = body.hasAttribute("data-route-rules") ? [ {
    sev: "critical",
    robot: 10,
    floor: "B3",
    wp: "WP-02",
    live: "ppe",
    where: "Robot 11 · WP-02 HEPA Filter 차압계",
    time: "09:44:18",
    title: "차압 NG · HEPA Filter 차압계",
    detect: "계기인식",
    sum: "차압 312 Pa 로 교체 기준 250 Pa 를 넘었습니다. 최근 3회 측정이 잇달아 올라 NG 로 판정했습니다.",
    lead: "필터 교체와 현장 점검을 요청하세요.",
    fp: 9,
    fpLabel: "낮음",
    brief: [ "WP-02 차압계가 NG예요.", "필터 교체부터 요청하세요." ],
    acts: [ {
      t: "필터 교체 요청",
      ai: true
    }, {
      t: "현장 점검 요청",
      ai: true
    }, {
      t: "재측정 후 판단"
    } ]
  }, {
    sev: "warning",
    robot: 10,
    floor: "B3",
    wp: "WP-04",
    live: "discharge",
    where: "Robot 11 · WP-04 N₂ 배관 압력계",
    time: "10:15:52",
    title: "압력 편차 · N₂ 배관 압력계",
    detect: "계기인식",
    sum: "압력 0.62 MPa 로 정상 범위(0.65~0.75) 아래입니다. 최근 2회 측정에서 조금씩 내려가고 있습니다.",
    lead: "배관 연결부 누설 점검을 요청하세요.",
    fp: 20,
    fpLabel: "낮음",
    acts: [ {
      t: "누설 점검 요청",
      ai: true
    }, {
      t: "다음 순회 재측정"
    }, {
      t: "추이 관찰"
    } ]
  } ] : [];
  if (V5) {
    [ [ CRITICAL, "N₂ 압력계", "기준 초과", {
      mname: "압력",
      val: "0.86",
      std: "0.80",
      next: "현장 점검부터 요청하세요.",
      btn: "현장 점검 요청",
      trend: "최근 3회 측정 계속 오름",
      hist: [ "0.77", "0.79", "0.86" ],
      cause: [ "감압 밸브 설정 이상", "하류 밸브 닫힘", "주변 온도 상승" ],
      fixFirst: "감압 밸브 설정부터 보는 게 가장 빨라요.",
      fix: [ "감압 밸브 설정값 확인(기준 0.80)", "하류 밸브 열림 확인", "계속 오르면 공급 밸브 잠금" ]
    } ], [ WARNINGS[0], "냉각수 밸브", "누출", {
      btn: "구역 출입 통제"
    } ], [ WARNINGS[1], "수배전반", "부분방전", {
      btn: "재진단 예약"
    } ], [ WARNINGS[2], "냉각 펌프", "진동 상승", {
      btn: "베어링 점검 요청"
    } ], [ WARNINGS[3], "발전기 베어링", "과열", {
      btn: "윤활 상태 점검 요청"
    } ], [ WARNINGS[4], "공기 압축기", "압력 낮음", {
      btn: "필터 점검 요청"
    } ], [ R01_MORE[0], "냉각 펌프", "이상음", {
      btn: "진동 정밀 측정 요청"
    } ], [ R01_MORE[1], "냉각 펌프", "과열", {
      btn: "부하 감소 요청"
    } ], [ R01_MORE[2], "수배전반", "부분방전", {
      btn: "절연 진단 요청"
    } ], [ R01_MORE[3], "작업 발판", "벨트 미착용", {
      mname: "미착용",
      val: "1명",
      std: "0명",
      next: "즉시 착용부터 안내하세요.",
      btn: "작업자 착용 안내",
      trend: "연속 2프레임에서 검출",
      cause: [ "고소 작업 중 벨트 미체결", "착용 안내 누락" ],
      fixFirst: "작업자 위치부터 확인하는 게 가장 빨라요.",
      fix: [ "작업자 위치 확인", "벨트 착용 안내", "착용 확인 뒤 작업 재개" ]
    } ], [ ROUTE_ALERTS[0], "HEPA 차압계", "기준 초과", {
      mname: "차압",
      val: "312 Pa",
      std: "250 Pa",
      next: "필터 교체부터 요청하세요.",
      btn: "필터 교체 요청",
      trend: "최근 3회 측정 계속 오름",
      hist: [ "268 Pa", "291 Pa", "312 Pa" ],
      cause: [ "필터 막힘", "흡입구 이물질", "팬 풍량 설정 변경" ],
      fixFirst: "필터 오염 상태부터 보는 게 가장 빨라요.",
      fix: [ "필터 오염 상태 확인", "흡입구 이물질 제거", "기준을 넘으면 필터 교체" ]
    } ], [ ROUTE_ALERTS[1], "N₂ 압력계", "압력 낮음", {
      btn: "누설 점검 요청"
    } ] ].forEach(function(r) {
      if (!r[0]) {
        return;
      }
      r[0].eq = r[1];
      r[0].phen = r[2];
      Object.keys(r[3]).forEach(function(k) {
        r[0][k] = r[3][k];
      });
    });
  }
  if (body.classList.contains("ver-6")) {
    var w12 = WARNINGS[2];
    w12.title = "이상음향 · 이상 점수 21.6";
    w12.detect = "이상음향";
    w12.sum = "이상 점수 21.6 으로 기준 19.0 을 넘었습니다. 저주파 대역 에너지가 늘어 베어링 마모 패턴과 비슷합니다.";
    w12.lead = "진동 정밀 측정을 요청하세요.";
    w12.acts = [ {
      t: "진동 정밀 측정 요청",
      ai: true
    }, {
      t: "설비 정지 검토 요청"
    }, {
      t: "추이 관찰"
    } ];
    w12.phen = "이상음";
    w12.btn = "진동 정밀 측정 요청";
    WARNINGS[3].time = "09:20:14";
    WARNINGS[1].time = "09:36:42";
    WARNINGS[2].time = "09:56:05";
  }
  if (window.APRISM_ALERTS7) {
    var S7 = window.APRISM_ALERTS7.forMonitor(body.hasAttribute("data-route-rules"));
    CRITICAL = S7.CRITICAL;
    WARNINGS = S7.WARNINGS;
    R01_MORE = S7.R01_MORE;
    ROUTE_ALERTS = S7.ROUTE_ALERTS;
  }
  var SETS = {
    normal: function() {
      return [];
    },
    few: function() {
      return [ CRITICAL, WARNINGS[0], WARNINGS[1] ];
    },
    warning: function() {
      return WARNINGS.concat(R01_MORE, ROUTE_ALERTS).filter(function(a) {
        return a.sev === "warning";
      });
    },
    critical: function() {
      return [ CRITICAL ].concat(WARNINGS, R01_MORE, ROUTE_ALERTS);
    }
  };
  var DELTA_MIN = 5;
  function missionOf(a) {
    return (window.APRISM_ROBOT_MISSIONS || [])[a.robot] || null;
  }
  function judge(all) {
    var crit = all.filter(function(a) {
      return a.sev === "critical";
    }).length;
    var warn = all.length - crit;
    var level = all.length < DELTA_MIN ? "normal" : crit ? "critical" : "warning";
    return {
      level: level,
      total: all.length,
      crit: crit,
      warn: warn,
      all: all
    };
  }
  var COPY = {
    sentence: function(j) {
      if (!j.total) {
        return {
          tag: "정기 순회 진행 중",
          line1: "안녕하세요. 홍길동 님",
          line2: "Robot 01 이 정기 순회를 진행하고 있어요. 지금은 특이사항이 없습니다."
        };
      }
      var mix = "위험 " + j.crit + " · 주의 " + j.warn;
      if (j.level === "normal") {
        return {
          tag: "알림 " + j.total + "건 관찰 중",
          line1: "안녕하세요. 홍길동 님",
          line2: "확인할 알림이 " + j.total + "건 있어요(" + mix + "). 왼쪽 목록에서 하나씩 살펴봐 주세요."
        };
      }
      if (j.level === "warning") {
        return {
          tag: "알림 " + j.total + "건 종합 · 주의",
          line1: "주의 알림이 " + j.total + "건 쌓였습니다.",
          line2: "여러 설비에서 이상징후가 겹칩니다. 개별 대응보다 전체 추세를 함께 보고 점검 순서를 정하는 것을 권합니다."
        };
      }
      return {
        tag: "알림 " + j.total + "건 종합 · 위험",
        line1: "위험 " + j.crit + "건을 포함해 알림이 " + j.total + "건 쌓였습니다.",
        line2: "위험 알림부터 조치하고, 겹치는 주의 알림은 한꺼번에 점검 계획을 세우는 것을 권합니다."
      };
    },
    keyword: function(j) {
      var copy = COPY.sentence(j);
      if (!j.total) {
        copy.line1 = "정기 순회 진행 중";
      } else if (j.level === "normal") {
        copy.line1 = "알림 " + j.total + "건 관찰 중";
      } else if (j.level === "warning") {
        copy.line1 = "주의 알림 " + j.total + "건 누적";
      } else {
        copy.line1 = "위험 " + j.crit + "건 포함 " + j.total + "건 누적";
      }
      return copy;
    },
    chat: function(j) {
      var copy = COPY.keyword(j);
      if (!j.total) {
        copy.line2 = "홍길동 님, Robot 01 과 정기 순회를 함께 보고 있어요. 지금까지는 특이사항이 없어요. 궁금한 게 있으면 편하게 물어보세요.";
      } else if (j.level === "normal") {
        copy.line2 = "알림이 " + j.total + "건 들어와 있어요. 아직 묶어서 볼 만큼은 아니라서, 왼쪽 목록에서 하나씩 확인해 보시면 돼요. 어떤 알림인지 같이 볼까요?";
      } else if (j.level === "warning") {
        copy.line2 = "주의 알림이 " + j.total + "건 쌓였어요. 여러 설비에서 비슷한 이상징후가 겹치고 있어서, 하나씩 보기보다 추세를 같이 보는 게 좋겠어요. 묶어서 한 번에 확인해 볼까요?";
      } else {
        copy.line2 = "위험 알림이 " + j.crit + "건 들어왔어요. 이것부터 먼저 보시는 게 좋겠어요." + (j.warn ? " 겹치는 주의 알림 " + j.warn + "건은 묶어서 한 번에 확인해 볼까요?" : " 어떤 알림인지 바로 설명해 드릴까요?");
      }
      return copy;
    }
  };
  function handleOrder(all, mine) {
    var here = function(a) {
      return mine.indexOf(a) >= 0;
    };
    var crit = function(a) {
      return a.sev === "critical";
    };
    all = all.slice().sort(function(a, b) {
      return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
    });
    return all.filter(function(a) {
      return here(a) && crit(a);
    }).concat(all.filter(function(a) {
      return !here(a) && crit(a);
    })).concat(all.filter(function(a) {
      return here(a) && !crit(a);
    })).concat(all.filter(function(a) {
      return !here(a) && !crit(a);
    }));
  }
  function euro(w) {
    var c = w.charCodeAt(w.length - 1), b = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0;
    return b && b !== 8 ? "으로" : "로";
  }
  function operatorName() {
    var slot = document.querySelector(".account-chip .t-label-2");
    return slot ? slot.textContent.trim() : "관제사";
  }
  var V6 = body.classList.contains("ver-6");
  COPY.brief = function(j) {
    var copy = COPY.keyword(j);
    var all = j.all || [], mine = j.mine || all;
    var es = all.filter(function(a) {
      return a.estop;
    })[0];
    var say;
    if (j.handover !== null && j.handover !== undefined && j.total) {
      say = {
        l: [ "어서오세요 " + j.handover + "님", (j.crit ? "위험 " + j.crit : "알림 " + j.total) + "건부터 보여 드릴까요?" ],
        clue: "인계 알림 " + j.total + "건",
        yes: "네, 보여 주세요",
        act: "shift"
      };
    } else if (es) {
      say = {
        l: es.brief,
        clue: "구동 차단됨"
      };
    } else if (body.classList.contains("ver-6") && $(".robot-strip .robot-card[aria-pressed='true'] .badge-normal")) {
      say = {
        l: [ "미션 완료.", "다음 미션 전에 잠깐 스트레칭 어떠세요?" ],
        clue: "수고하셨습니다.",
        calm: true
      };
    } else if (j.total) {
      var ord = handleOrder(all, mine), first = ord[0];
      var inMine = function(a) {
        return mine.indexOf(a) >= 0;
      };
      var sev = first.sev, word = sev === "critical" ? "위험" : "주의";
      if (!inMine(first)) {
        var om = missionOf(first);
        say = {
          l: [ "다른 미션에 " + word + " 단계 알림이 있어요!", "먼저 확인하는 것을 추천드릴게요." ],
          clue: om,
          scope: sev,
          yes: word + " 단계 미션으로 이동하기",
          act: {
            go: om
          }
        };
        if (V6 && om) {
          say.l[0] = om + "에 " + word + " 단계 알림이 있어요!";
          say.yes = "미션 이동하기";
          say.parts = {
            ko: [ [ {
              m: om
            }, "에 " + word + " 단계 알림이 있어요!" ], [ say.l[1] ] ],
            en: [ [ {
              m: om
            }, " has " + (sev === "critical" ? "critical" : "warning") + "-level alerts!" ], [ say.l[1] ] ]
          };
        }
      } else {
        var mc = all.filter(function(a) {
          return a.sev === sev && inMine(a);
        }).length;
        var oc = all.filter(function(a) {
          return a.sev === sev && !inMine(a);
        }).length;
        if (sev === "critical") {
          say = {
            l: [ "위험 " + j.crit + "건" + (j.warn ? ", 주의 " + j.warn + "건" : "") + "이 있어요.", (first.eq || first.title) + "부터 확인하세요." ],
            clue: [ "이 미션 위험 " + mc, oc ? "다른 미션 위험 " + oc : "" ].filter(Boolean).join(", "),
            scope: oc ? sev : "",
            yes: "처리 순서 보기",
            act: "order",
            open: "처리 순서 알려 줘"
          };
          if (V6) {
            var wpn = /\d+/.exec(first.wp || ""), wpName = first.eq || first.title;
            var wpTok = wpn ? [ {
              wp: parseInt(wpn[0], 10),
              sev: first.sev
            } ] : [];
            say.parts = {
              ko: [ [ say.l[0] ], wpTok.concat([ {
                wpName: wpName
              }, "부터 확인하세요." ]) ],
              en: [ [ say.l[0] ], [ "Check " ].concat(wpTok, [ {
                wpName: wpName
              }, " first." ]) ]
            };
          }
        } else {
          say = {
            l: [ "지금 미션에서 " + mc + "건" + (oc ? ", 다른 미션에서 " + oc + "건" : "") + "의 확인해야 할 주의 단계 알림이 있어요." ],
            clue: "먼저: " + (first.eq || first.title),
            yes: "처리 순서 보기",
            act: "order",
            open: "처리 순서 알려 줘"
          };
          if (V6) {
            var wn = /\d+/.exec(first.wp || ""), wName = first.eq || first.title;
            var wTok = wn ? [ {
              wp: parseInt(wn[0], 10),
              sev: first.sev
            } ] : [];
            say.l = [ "주의 " + j.warn + "건이 있어요.", wName + "부터 확인하세요." ];
            say.parts = {
              ko: [ [ say.l[0] ], wTok.concat([ {
                wpName: wName
              }, "부터 확인하세요." ]) ],
              en: [ [ say.l[0] ], [ "Check " ].concat(wTok, [ {
                wpName: wName
              }, " first." ]) ]
            };
          }
        }
      }
    } else {
      var card = $(".robot-strip .robot-card[aria-pressed='true']");
      var rn = card && card.querySelector(".robot-id") ? card.querySelector(".robot-id").textContent.trim() : "Robot 01";
      var done = !!(card && card.querySelector(".badge-normal"));
      say = {
        l: [ operatorName() + "님!", rn + josa(rn) + (done ? " 미션을 완료했어요!" : " 순회 중이에요.") ],
        clue: done ? "미션 완료" : "순회 경로 지켜보는 중"
      };
    }
    copy.line2 = say.l.join("\n");
    copy.say = say;
    return copy;
  };
  document.addEventListener("aprism:rr-mode", function() {
    render();
  });
  function josa(word) {
    var c = word.charCodeAt(word.length - 1);
    if (c >= 0xac00 && c <= 0xd7a3) {
      return (c - 0xac00) % 28 ? "이" : "가";
    }
    return /[013678LMNR]$/i.test(word) ? "이" : "가";
  }
  function deltaCopy(j) {
    var mode = body.getAttribute("data-delta-copy");
    return (COPY[mode] || COPY.sentence)(j);
  }
  function deltaActions(j) {
    if (j.level === "critical") {
      return [ "위험 " + j.crit + "건부터 조치", "주의 " + j.warn + "건 묶어서 확인", "현장 점검 한꺼번에 요청" ];
    }
    if (j.level === "warning") {
      return [ "주의 " + j.warn + "건 묶어서 확인", "추세 한 번에 보기", "현장 점검 한꺼번에 요청" ];
    }
    return [];
  }
  var DONE_BASE = [ {
    time: "10:29:10",
    title: "온도감지 · WP-03 펌프 하우징",
    how: "추이 관찰 · 다음 순회 재측정",
    who: "김현대"
  }, {
    time: "10:18:52",
    title: "소음 이상 · 변압기 TR-1",
    how: "현장 점검 요청 · 이상 없음",
    who: "김현대"
  }, {
    time: "10:02:31",
    title: "진동감지 · WP-02 터빈1 베어링",
    how: "추이 관찰 · 다음 순회 재측정",
    who: "홍길동"
  }, {
    time: "09:47:15",
    title: "온도감지 · WP-03 펌프 하우징",
    how: "현장 점검 요청 · 이상 없음",
    who: "홍길동"
  }, {
    time: "09:30:08",
    title: "누유 흔적 · 유압 유닛 HU-2",
    how: "청소 후 재측정 · 정상",
    who: "김현대"
  } ];
  if (body.classList.contains("ver-6")) {
    var DONE6 = [ "온도감지 · 최고 온도 44.2 ℃", "부분방전 · 이상 점수 8.92", "이상음향 · 이상 점수 19.6", "온도감지 · 최고 온도 41.5 ℃", "누출감지 · 누출 의심도 58%" ];
    var WP6 = [ "WP-03", "WP-11", "WP-02", "WP-03", "WP-09" ];
    DONE_BASE.forEach(function(d, i) {
      if (DONE6[i]) {
        d.title = DONE6[i];
        d.wp = WP6[i];
      }
    });
    DONE_BASE[0].time = "10:19:10";
  }
  var V7Q = body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  var DONE_ST = {
    wait: "현장 응답 대기",
    work: "현장 조치 중",
    done: "조치 완료"
  };
  if (V7Q) {
    DONE_BASE = [ {
      time: "10:08:30",
      title: "이상음향 점수 19.6",
      wp: "WP-02",
      how: "현장 점검 요청",
      who: "홍길동",
      st: "work",
      to: "설비팀 박지훈"
    }, {
      time: "10:05:12",
      title: "최고 온도 44.2 ℃",
      wp: "WP-01",
      how: "다음 순회 재측정",
      who: "홍길동",
      st: "done",
      to: "설비팀 박지훈",
      res: "정상"
    } ];
  }
  var DONE = DONE_BASE.slice();
  var RANK = {
    critical: 0,
    warning: 1
  };
  var list = $("[data-ah-list]");
  var doneList = $("[data-done-list]");
  var doneCount = $("[data-done-count]");
  var filters = $$("[data-ah-filter]");
  if (!list) {
    return;
  }
  var aiActions = $("[data-ai-actions]");
  function askDelta(text) {
    if (window.APRISM_DELTA) {
      window.APRISM_DELTA.ask(text);
    }
  }
  function setFilter(sev) {
    var b = $("[data-ah-filter='" + sev + "']");
    if (b && b.getAttribute("aria-pressed") !== "true") {
      b.click();
    }
  }
  function deltaAct(label) {
    if (/^위험/.test(label)) {
      var crit = items().filter(function(a) {
        return a.sev === "critical" && (!scoped || missionOf(a) === mission);
      });
      if (!crit.length) {
        crit = items().filter(function(a) {
          return a.sev === "critical";
        });
      }
      if (!crit.length) {
        return;
      }
      setFilter("all");
      if (picked !== crit[0]) {
        note.open(crit[0]);
      }
      return;
    }
    if (/^주의/.test(label)) {
      setFilter("warning");
      askDelta(label);
      return;
    }
    askDelta(label);
  }
  window.APRISM_DELTA_DO = function() {
    var s = window.APRISM_DELTA_SAY;
    if (!s || !s.act) {
      return false;
    }
    var said = null;
    var mineNow = function() {
      return items().filter(function(a) {
        return !scoped || missionOf(a) === mission;
      });
    };
    if (s.act.go) {
      if (window.APRISM_SCOPE_TO) {
        window.APRISM_SCOPE_TO(s.act.go);
      }
      var here = mineNow(), hc = here.filter(function(a) {
        return a.sev === "critical";
      }).length;
      said = {
        text: s.clue + euro(s.clue) + " 옮겼어요. " + (hc ? "위험이 " + hc + "건 있어요." : here.length ? "주의가 " + here.length + "건 있어요." : "확인할 알림은 없어요."),
        btn: here[0] ? {
          label: "알림 열기",
          act: function() {
            window.APRISM_OPEN_ALERT(here[0]);
          }
        } : null
      };
    } else if (s.act === "shift") {
      var anyCrit = items().some(function(a) {
        return a.sev === "critical";
      });
      setFilter(anyCrit ? "critical" : "all");
      said = {
        text: anyCrit ? "위험 알림만 목록에 걸렀어요." : "인계 알림을 목록에 펼쳤어요."
      };
    }
    if (said && window.APRISM_DELTA && window.APRISM_DELTA.log) {
      window.APRISM_DELTA.log(s.yes, said.text, said.btn);
    }
    return true;
  };
  window.APRISM_OPEN_ALERT = function(a) {
    setFilter("all");
    if (picked !== a) {
      note.open(a);
    }
  };
  if (aiActions) {
    aiActions.addEventListener("click", function(event) {
      var b = event.target.closest && event.target.closest("button");
      if (b) {
        deltaAct(b.textContent.trim());
      }
    });
  }
  var scoped = body.hasAttribute("data-mission-scope");
  var withReport = list.hasAttribute("data-ah-report");
  var mission = scoped ? missionOf({
    robot: 0
  }) : null;
  var level = "critical";
  var extra = [];
  var filter = "all";
  var picked = null;
  var pickedDone = null;
  var resolved = [];
  var cleared = [];
  var V7H = body.classList.contains("ver-7"), HKEY = "aprism-handled";
  function hRead() {
    try {
      return JSON.parse(sessionStorage.getItem(HKEY) || "[]") || [];
    } catch (e) {
      return [];
    }
  }
  function hWrite(list) {
    try {
      sessionStorage.setItem(HKEY, JSON.stringify(list));
    } catch (e) {}
  }
  function hSame(e, a) {
    var m = missionOf(a) || "";
    return !!m && !!e.mis && e.k === a.detect && e.wp === a.wp && (m.indexOf(e.mis) >= 0 || e.mis.indexOf(m) >= 0);
  }
  function hAdd(a, rec) {
    if (!V7H) {
      return;
    }
    var l = hRead().filter(function(e) {
      return !hSame(e, a);
    });
    l.push({
      mis: missionOf(a),
      k: a.detect,
      wp: a.wp,
      t: rec.time.slice(0, 5),
      acts: rec.how ? rec.how.split(" · ") : [],
      memo: rec.memo || "",
      st: "wait",
      src: "ctl"
    });
    hWrite(l);
  }
  function hDel(a) {
    if (V7H) {
      hWrite(hRead().filter(function(e) {
        return !hSame(e, a);
      }));
    }
  }
  function hRestore() {
    if (!V7H) {
      return;
    }
    var list = hRead();
    if (!list.length) {
      return;
    }
    var all = [ CRITICAL ].concat(WARNINGS, R01_MORE, ROUTE_ALERTS);
    list.forEach(function(e) {
      all.forEach(function(a) {
        if (!hSame(e, a) || resolved.indexOf(a) >= 0) {
          return;
        }
        resolved.push(a);
        cleared.push(a);
        DONE.unshift({
          wp: a.wp || "",
          time: e.t + ":00",
          title: window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(a.title) : a.title,
          how: (e.acts || []).join(" · ") || "현장 조치 요청",
          who: "홍길동",
          memo: e.memo || ""
        });
      });
    });
  }
  function items() {
    var base = (SETS[level] || SETS.critical)().filter(function(a) {
      return resolved.indexOf(a) < 0;
    });
    var SORT = window.APRISM_AH_SORT;
    return extra.concat(base).sort(function(a, b) {
      return RANK[a.sev] - RANK[b.sev] || (SORT ? SORT.time(a, b) : a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    });
  }
  function highest(all) {
    if (all.some(function(a) {
      return a.sev === "critical";
    })) {
      return "critical";
    }
    return all.length ? "warning" : "normal";
  }
  function wpPlace(a) {
    var m = /WP-\d+.*$/.exec(a.where || "");
    return m ? m[0] : a.where;
  }
  function item(a) {
    var node = el("button", "ah-item is-" + a.sev + (document.body.classList.contains("ver-7") ? " ds-list-item is-l" : ""));
    node.type = "button";
    node.setAttribute("role", "listitem");
    node.setAttribute("aria-pressed", a === picked ? "true" : "false");
    if (a.wp) {
      node.setAttribute("data-wp", a.wp);
    }
    var where = el("span", "ah-where t-caption");
    if (!scoped) {
      where.appendChild(icon("target"));
    }
    if (scoped && a.floor) {
      where.appendChild(el("span", "floor-tag num" + (document.body.classList.contains("ver-7") ? " ds-floor" : ""), a.floor));
    }
    var wpNo = scoped && document.body.classList.contains("ver-7") && /WP-(\d+)/.exec((a.wp || "") + " " + (a.where || ""));
    if (wpNo) {
      var wpPin = el("span", "mbt-pin is-plain ah-wp-pin" + (document.body.classList.contains("ver-7") ? " ds-wp is-s" : ""));
      wpPin.setAttribute("data-n", String(parseInt(wpNo[1], 10)));
      wpPin.setAttribute("role", "img");
      wpPin.setAttribute("aria-label", "WP-" + wpNo[1]);
      where.appendChild(wpPin);
    }
    var place = scoped ? wpPlace(a) : a.where;
    if (scoped && body.classList.contains("ver-6")) {
      place = String(place || "").replace(/^WP-\d+\s*/, "");
    }
    where.appendChild(el("span", "ah-wp", place));
    if (!scoped) {
      where.appendChild(el("span", "num", a.time));
    }
    var title = el("span", "ah-title t-label-2");
    title.appendChild(icon(a.sev === "critical" ? "error" : "warning"));
    var A6 = body.classList.contains("ver-6") && window.APRISM_ALERT6, r6 = A6 && A6.of(a.title);
    title.appendChild(el("span", null, A6 ? A6.title(a.title) : a.title));
    if (scoped) {
      var tm = el("span", "ah-time t-caption num");
      var hm = /^(\d{1,2}:\d{2})(:\d{2})$/.exec(a.time || "");
      if (hm && body.classList.contains("ver-6")) {
        tm.appendChild(document.createTextNode(hm[1]));
        tm.appendChild(el("span", "ah-time-s", hm[2]));
        tm.title = a.time;
      } else {
        tm.textContent = a.time;
      }
      title.appendChild(tm);
      node.appendChild(title);
      node.appendChild(where);
    } else {
      node.appendChild(where);
      node.appendChild(title);
    }
    node.addEventListener("click", function() {
      if (picked === a) {
        note.close();
      } else {
        note.open(a);
      }
    });
    if (!withReport) {
      return node;
    }
    var row = el("div", "ah-row");
    row.setAttribute("role", "listitem");
    node.removeAttribute("role");
    var v5 = body.classList.contains("ver-5"), report;
    if (v5) {
      report = el("a", "btn btn-ghost is-xs ah-report");
      var q = new URLSearchParams;
      var mis = missionOf(a);
      if (mis) {
        q.set("mission", mis);
      }
      if (a.detect) {
        q.set("detect", a.detect);
      }
      report.href = (body.classList.contains("ver-6") ? "./safety-v6.html?" : "./safety-v5.html?") + q.toString();
      report.title = "안전진단에서 이 알림의 감지 결과 보기";
    } else {
      report = el("button", "btn btn-ghost is-xs ah-report");
      report.type = "button";
      report.title = "안전진단 화면 준비 중";
    }
    report.setAttribute("aria-label", body.classList.contains("ver-6") ? "진단 상세" : "안전진단");
    report.appendChild(icon("shield"));
    report.appendChild(el("span", "ah-report-label", body.classList.contains("ver-6") ? "진단 상세" : "안전진단"));
    row.appendChild(node);
    row.appendChild(report);
    return row;
  }
  function doneItem(d) {
    var V6 = body.classList.contains("ver-6");
    var node = el(V6 ? "button" : "div", "done-item" + (body.classList.contains("ver-7") ? " ds-record" : ""));
    if (V6) {
      node.type = "button";
      node.setAttribute("aria-pressed", d === pickedDone ? "true" : "false");
      node.addEventListener("click", function() {
        if (pickedDone === d) {
          pickedDone = null;
          render();
          return;
        }
        note.close();
        pickedDone = d;
        if (d.wp) {
          document.dispatchEvent(new CustomEvent("aprism:waypoint", {
            detail: {
              id: d.wp,
              from: "panel",
              done: true
            }
          }));
        }
        render();
      });
    }
    node.setAttribute("role", "listitem");
    if (d.fresh) {
      node.classList.add("is-new");
    }
    var head = el("span", "done-title");
    head.appendChild(el("span", "t-label-2", window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(d.title) : d.title));
    head.appendChild(el("span", "t-caption num done-time", d.time));
    if (V7Q) {
      var rq = d.reqId && window.APRISM_ALERTS7 ? window.APRISM_ALERTS7.req.all()[d.reqId] : null;
      var st = rq && DONE_ST[rq.st] && rq.st || d.st || "wait";
      var line = el("span", "done-how done-stage t-caption is-" + st);
      var res = st === "done" ? rq && rq.res || d.res || "" : "";
      var stw = el("span", "done-st");
      stw.appendChild(el("span", "done-st-t", DONE_ST[st] + (res ? ", " + res : "")));
      line.appendChild(stw);
      line.appendChild(el("span", null, rq && rq.to || d.to || "현장 작업자"));
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
  var TONE = {
    normal: 0,
    warning: 1,
    critical: 2
  };
  var handover = null;
  if (window.APRISM_AH_SORT) {
    window.APRISM_AH_SORT.mount(function() {
      render();
    });
  }
  document.addEventListener("aprism:shift", function(event) {
    handover = event.detail && event.detail.name || "";
    render();
  });
  function tellAi(j, top) {
    window.APRISM_DELTA_COUNT = {
      crit: j.crit,
      warn: j.warn,
      total: j.total
    };
    var brief = body.getAttribute("data-delta-copy") === "brief";
    if (brief) {
      j.handover = handover;
    }
    var copy = brief ? COPY.brief(j) : handover === null ? deltaCopy(j) : {
      tag: "관제사 교대 · 인계",
      line1: "안녕하세요. " + handover + " 님",
      line2: body.getAttribute("data-delta-copy") === "brief" ? "인계 알림이 " + j.total + "건이에요.\n" + (j.crit ? "위험 " + j.crit + "건부터 보세요." : "목록에서 하나씩 보세요.") : "인계된 알림 " + j.total + "건과 진행 예정인 미션 1건이 있어요. 먼저 살펴볼까요?"
    };
    window.APRISM_DELTA_SAY = copy.say || null;
    var tone = TONE[j.level] > TONE[top] ? j.level : top;
    var calm = !!(copy.say && copy.say.calm);
    document.dispatchEvent(new CustomEvent("aprism:severity", {
      detail: {
        level: tone === "normal" || calm ? null : tone,
        glow: tone === "normal" ? null : tone,
        line1: copy.line1,
        line2: copy.line2,
        tag: copy.tag
      }
    }));
    if (!aiActions) {
      return;
    }
    var labels = deltaActions(j);
    aiActions.textContent = "";
    aiActions.hidden = !labels.length;
    labels.forEach(function(label, i) {
      var b = el("button", "btn is-md " + (i === 0 ? "btn-primary" : "btn-secondary"), label);
      b.type = "button";
      aiActions.appendChild(b);
    });
  }
  function sync7() {
    var S = window.APRISM_ALERTS7;
    if (!S) {
      return;
    }
    var R = S.req.all(), moved = false;
    [ CRITICAL ].concat(WARNINGS, R01_MORE, ROUTE_ALERTS).forEach(function(a) {
      var id = a && S.req.idOf(a);
      if (!id) {
        return;
      }
      var r = R[id], i = resolved.indexOf(a), di = -1;
      DONE.forEach(function(d, n) {
        if (d.reqId === id) {
          di = n;
        }
      });
      if (r) {
        if (i < 0) {
          resolved.push(a);
          moved = true;
        }
        if (cleared.indexOf(a) < 0) {
          cleared.push(a);
        }
        if (di < 0) {
          DONE.push({
            wp: a.wp || "",
            time: r.t,
            title: window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(a.title) : a.title,
            how: (r.how || []).join(" · "),
            who: r.who || "홍길동",
            memo: r.memo || "",
            reqId: id
          });
          moved = true;
        }
      } else if (di >= 0) {
        DONE.splice(di, 1);
        if (i >= 0) {
          resolved.splice(i, 1);
        }
        if (cleared.indexOf(a) >= 0) {
          cleared.splice(cleared.indexOf(a), 1);
        }
        moved = true;
      }
    });
    if (moved) {
      DONE.sort(function(x, y) {
        return x.time < y.time ? 1 : x.time > y.time ? -1 : 0;
      });
    }
  }
  var selfReq = false;
  document.addEventListener("aprism:requested", function() {
    if (!selfReq) {
      render();
    }
  });
  function render() {
    sync7();
    var all = items();
    if (picked && all.indexOf(picked) < 0) {
      picked = null;
    }
    var mine = all;
    if (scoped) {
      mine = all.filter(function(a) {
        return a.net || missionOf(a) === mission;
      });
      tellLevels(all);
    }
    var crit = mine.filter(function(a) {
      return a.sev === "critical";
    }).length;
    var warn = mine.length - crit;
    var shown = mine.filter(function(a) {
      return filter === "all" || a.sev === filter;
    });
    list.textContent = "";
    shown.forEach(function(a) {
      list.appendChild(item(a));
    });
    if (V7Q) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
        var f = btn.getAttribute("data-map-floor"), top = null;
        mine.forEach(function(a) {
          if (a.floor === f && top !== "critical") {
            top = a.sev === "critical" ? "critical" : top || "warning";
          }
        });
        var dot = btn.querySelector(":scope > .ds-dot.is-lv");
        if (!top) {
          if (dot) {
            dot.remove();
          }
          return;
        }
        if (!dot) {
          dot = document.createElement("span");
          dot.setAttribute("aria-hidden", "true");
          btn.appendChild(dot);
        }
        dot.className = "ds-dot is-lv " + (top === "critical" ? "is-crit" : "is-warn");
        btn.setAttribute("aria-label", f + (top === "critical" ? ", 위험 알림 있음" : ", 주의 알림 있음"));
      });
    }
    if (V7Q && !shown.length) {
      var em = el("p", "ah-empty t-body-3", filter === "critical" ? "위험 알림이 없어요" : filter === "warning" ? "주의 알림이 없어요" : "조치가 필요한 알림이 없어요");
      em.setAttribute("role", "status");
      list.appendChild(em);
    }
    $("[data-ah-count='all']").textContent = mine.length;
    $("[data-ah-count='critical']").textContent = crit;
    $("[data-ah-count='warning']").textContent = warn;
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
    }(mine);
    document.dispatchEvent(new CustomEvent("aprism:floor-counts", {
      detail: window.APRISM_FLOOR_COUNTS
    }));
    doneList.textContent = "";
    DONE.forEach(function(d) {
      doneList.appendChild(doneItem(d));
      d.fresh = false;
    });
    doneCount.textContent = DONE.length + "건";
    $$(".ah-box").forEach(shade);
    var top = highest(all);
    body.setAttribute("data-level", top);
    window.APRISM_DELTA_DETECTS = all.slice().sort(function(a, b) {
      return (a.sev === "critical" ? 0 : 1) - (b.sev === "critical" ? 0 : 1);
    }).map(function(a) {
      return a.detect || a.title || "";
    });
    var jd = judge(all);
    jd.mine = mine;
    window.APRISM_DELTA_ALERTS = {
      all: all,
      mine: mine,
      mission: mission,
      missionOf: missionOf,
      order: handleOrder(all, mine)
    };
    tellAi(jd, top);
    markWaypoints();
  }
  var WP_ALERT = {
    warning: "caution",
    critical: "danger"
  };
  function markWaypoints() {
    var rail = $("[data-timeline]");
    if (!rail) {
      return;
    }
    var robot = activeRobot();
    var hits = {};
    items().forEach(function(a) {
      if (a.robot !== robot || !a.wp) {
        return;
      }
      if (!hits[a.wp] || TONE[a.sev] > TONE[hits[a.wp]]) {
        hits[a.wp] = a.sev;
      }
    });
    var was = {};
    cleared.forEach(function(a) {
      if (a.robot === robot && a.wp) {
        was[a.wp] = true;
      }
    });
    $$("[data-waypoint]", rail).forEach(function(node) {
      var sev = hits[node.getAttribute("data-waypoint")];
      if (!sev && was[node.getAttribute("data-waypoint")]) {
        node.setAttribute("data-wp-cleared", "");
      } else {
        node.removeAttribute("data-wp-cleared");
      }
      if (sev) {
        node.setAttribute("data-wp-alert", WP_ALERT[sev]);
      } else {
        node.removeAttribute("data-wp-alert");
      }
      var done = node.getAttribute("data-wp-state") === "completed";
      if (done) {
        node.setAttribute("data-wp-result", sev ? WP_ALERT[sev] : "safe");
      }
    });
    document.dispatchEvent(new CustomEvent("aprism:wp-marks"));
  }
  document.addEventListener("aprism:mission", markWaypoints);
  function shade(box) {
    var inner = box && box.querySelector(".ah-list");
    if (!inner) {
      return;
    }
    box.classList.toggle("is-scrolled", inner.scrollTop > 0);
    box.classList.toggle("has-fade", inner.scrollHeight - inner.scrollTop - inner.clientHeight > 1);
  }
  $$(".ah-box").forEach(function(box) {
    var inner = box.querySelector(".ah-list");
    if (inner) {
      inner.addEventListener("scroll", function() {
        shade(box);
      }, {
        passive: true
      });
    }
  });
  filters.forEach(function(btn) {
    btn.addEventListener("click", function() {
      handover = null;
      filter = btn.getAttribute("data-ah-filter");
      filters.forEach(function(b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  var openAlert = window.APRISM_OPEN_ALERT;
  window.APRISM_OPEN_ALERT = function(mission, time, wp) {
    if (mission && typeof mission === "object") {
      openAlert(mission);
      return;
    }
    var tries = 0;
    (function go() {
      var d = window.APRISM_DELTA_ALERTS;
      if ((!d || d.mission !== mission || !document.querySelector(".rr-pin")) && tries++ < 50) {
        setTimeout(go, 200);
        return;
      }
      var list = d && d.mine || [];
      var a = list.filter(function(x) {
        return x.time === time;
      })[0] || list.filter(function(x) {
        return x.wp === wp;
      })[0];
      if (!a) {
        return;
      }
      if (filter !== "all") {
        var f = filters.filter(function(b) {
          return b.getAttribute("data-ah-filter") === "all";
        })[0];
        if (f) {
          f.click();
        }
      }
      if (picked !== a) {
        note.open(a);
      }
    })();
  };
  var askedAlert = /[?&]alert=([^&#]+)/.exec(location.search), askedMission = /[?&]mission=([^&#]+)/.exec(location.search);
  if (askedAlert && askedMission) {
    window.APRISM_OPEN_ALERT(decodeURIComponent(askedMission[1].replace(/\+/g, " ")), decodeURIComponent(askedAlert[1]), (/[?&]wp=(WP-\d+)/.exec(location.search) || [])[1]);
  }
  function tellLevels(all) {
    var lv = {};
    all.forEach(function(a) {
      var m = missionOf(a);
      if (m && (!lv[m] || TONE[a.sev] > TONE[lv[m]])) {
        lv[m] = a.sev;
      }
    });
    window.APRISM_ALERT_LEVELS = lv;
    document.dispatchEvent(new CustomEvent("aprism:alert-levels", {
      detail: lv
    }));
  }
  document.addEventListener("aprism:scope", function(event) {
    mission = event.detail.mission;
    if (picked && missionOf(picked) !== mission) {
      note.close();
    }
    render();
  });
  $$("[data-ah-all]").forEach(function(allBtn) {
    allBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      var tab = allBtn.getAttribute("data-ah-all") === "done" ? "?tab=done" : "";
      var url = (window.aprismHref || String)((document.body.classList.contains("ver-6") ? "./alert-center-v6.html" : document.body.classList.contains("ver-5") ? "./alert-center-v5.html" : document.body.classList.contains("ver-3") ? "./alert-center-v3.html" : "./alert-center.html") + tab);
      var name = "aprism-alert-center";
      if (!window.screen.isExtended || !window.getScreenDetails) {
        window.open(url, name);
        return;
      }
      window.getScreenDetails().then(function(details) {
        var other = details.screens.filter(function(s) {
          return s !== details.currentScreen;
        })[0];
        if (!other) {
          window.open(url, name);
          return;
        }
        window.open(url, name, "popup,left=" + other.availLeft + ",top=" + other.availTop + ",width=" + other.availWidth + ",height=" + other.availHeight);
      }).catch(function() {
        window.open(url, name);
      });
    });
  });
  document.addEventListener("aprism:net", function(event) {
    var down = event.detail && event.detail.state === "down";
    extra = extra.filter(function(x) {
      return !x.net;
    });
    if (down) {
      extra.unshift({
        sev: "critical",
        where: "관제 서버 · AI Server",
        time: clock(),
        title: "서버 연결 끊김 · AI Server",
        robot: null,
        wp: "",
        sum: "AI Server 가 3번 연속 응답하지 않았습니다. 화면의 값이 마지막으로 받은 값에서 멈춰 있을 수 있습니다.",
        acts: [ "서버 담당자 연락", "현장 무전으로 로봇 상태 확인" ],
        brief: [ "서버 연결이 끊겼어요.", "화면 값이 멈춰 있을 수 있어요." ],
        net: true
      });
    }
    render();
  });
  document.addEventListener("aprism:estop", function() {
    var chosen = $(".robot-strip .robot-card[aria-pressed='true'] .robot-id");
    var name = chosen ? chosen.textContent : "로봇";
    var a = {
      sev: "critical",
      where: name + " · 현재 위치",
      time: clock(),
      title: "비상정지 발동 · 로봇 구동 차단",
      robot: activeRobot(),
      wp: currentWp(),
      sum: "모터 전원이 차단되었습니다. 현장 안전을 확인한 뒤 해제 절차를 진행하세요.",
      acts: [ "현장 무전 연락 · 안전 확인", "해제 절차 진행", "로봇 회수 요청" ],
      brief: [ name + josa(name) + " 멈췄어요.", "현장 안전부터 확인하세요." ],
      estop: true
    };
    extra.unshift(a);
    render();
  });
  var simTimer = null;
  document.addEventListener("aprism:delta-sim", function(event) {
    var d = event.detail || {};
    clearTimeout(simTimer);
    level = SETS[d.from] ? d.from : "warning";
    extra = [];
    resolved = [];
    cleared = [];
    DONE = DONE_BASE.slice();
    hRestore();
    note.close();
    document.dispatchEvent(new CustomEvent("aprism:monitor-reset"));
    render();
    simTimer = setTimeout(function() {
      var a = {};
      Object.keys(CRITICAL).forEach(function(k) {
        a[k] = CRITICAL[k];
      });
      a.time = clock();
      document.dispatchEvent(new CustomEvent("aprism:delta-sim-alert", {
        detail: {
          alert: a
        }
      }));
      extra.unshift(a);
      render();
    }, d.after || 2000);
  });
  function activeRobot() {
    var on = $(".robot-strip .robot-card[aria-pressed='true'][data-robot]");
    return on ? Number(on.getAttribute("data-robot")) : 0;
  }
  function currentWp() {
    var t = $("[data-timeline]");
    return t && t.getAttribute("data-current-waypoint") || "WP-01";
  }
  var note = function() {
    var box = $("[data-map-alert]");
    var timeline = $("[data-timeline]");
    if (!box) {
      return {
        open: function() {},
        close: function() {}
      };
    }
    var sev = $("[data-ma-sev]", box);
    var title = $("[data-ma-title]", box);
    var stamp = $("[data-ma-stamp]", box);
    var snap = $(".ma-snap", box);
    var img = $("[data-ma-img]", box);
    var options = $("[data-ma-options]", box);
    var V7 = body.classList.contains("ver-7");
    if (V7 && stamp && snap) {
      snap.appendChild(stamp);
    }
    var reason7 = null, lead7 = $("[data-ma-lead]", box);
    var headTime7 = null, closeBtn7 = $("[data-ma-close]", box);
    if (V7 && closeBtn7) {
      headTime7 = document.createElement("span");
      headTime7.className = "ma-head-time num";
      closeBtn7.parentNode.insertBefore(headTime7, closeBtn7);
    }
    var deltaCard7 = $(".ma-delta", box);
    if (V7 && lead7 && deltaCard7) {
      reason7 = document.createElement("p");
      reason7.className = "ma-reason";
      reason7.hidden = true;
      deltaCard7.parentNode.insertBefore(reason7, deltaCard7);
    }
    var confirm = $("[data-ma-confirm]", box);
    var opening = false;
    var V3 = box.classList.contains("ma-v3");
    var docked = false;
    function placeOf(a) {
      var i = a.where.indexOf(a.wp);
      return i < 0 ? a.where : a.where.slice(i + a.wp.length).trim();
    }
    function stampOf(a) {
      if (body.classList.contains("ver-6")) {
        var wpm = /WP-\d+.*$/.exec(a.where || "");
        return (wpm ? wpm[0] : a.where || "") + " · " + a.time;
      }
      var utc = $(".utc-clock .num");
      var day = utc && (utc.textContent.match(/^\d{4}-\d{2}-\d{2}/) || [])[0] || "";
      return (day ? day + " " : "") + a.time + " 발생";
    }
    function chosen() {
      return $$("[aria-pressed='true'], [aria-checked='true']", options).map(function(chip) {
        return chip.getAttribute("data-act");
      });
    }
    function syncConfirm() {
      confirm.disabled = !chosen().length;
    }
    var RES6 = {
      "누출감지 · 냉각수 배관 밸브": [ "누출 의심도", "62%" ],
      "이상음향 · 냉각 펌프 P-2": [ "이상 점수", "20.4" ],
      "지하발전소 B3 터빈 2 NG 1건 발견": [ "압력", "0.86 MPa" ],
      "지하발전소 터빈 2 NG 1건 발견": [ "압력", "0.86 MPa" ],
      "차압 NG · HEPA Filter 차압계": [ "차압", "312 Pa" ],
      "압력 편차 · N₂ 배관 압력계": [ "압력", "0.62 MPa" ],
      "압력 편차 · 공기 압축기 C-1": [ "압력", "7.9 bar" ]
    };
    var LAB6 = {
      "누출감지": "누출 의심도",
      "온도감지": "최고 온도",
      "이상음향": "이상 점수",
      "부분방전": "이상 점수"
    };
    function maResult(a) {
      var r6 = window.APRISM_ALERT6 && window.APRISM_ALERT6.of(a.title);
      if (r6) {
        return [ r6.label, r6.value ];
      }
      if (RES6[a.title]) {
        return RES6[a.title];
      }
      var tail = String(a.title || "").split(" · ").slice(1).join(" · ");
      var all = tail.match(/(\d+(?:\.\d+)?)\s*(℃|%|MPa|kPa|Pa|bar|명|곳|건)?/g);
      if (!all) {
        return null;
      }
      var m = all[all.length - 1].match(/(\d+(?:\.\d+)?)\s*(℃|%|MPa|kPa|Pa|bar|명|곳|건)?/);
      var val = m[1] + (m[2] ? /^(%|명|곳|건)$/.test(m[2]) ? m[2] : " " + m[2] : "");
      var lab = LAB6[a.detect] || (a.detect === "계기인식" ? tail.split(/\s*-?\d/)[0].trim() || "측정값" : tail.replace(m[0], "").trim());
      return [ lab, val ];
    }
    function fill(a) {
      box.classList.toggle("is-critical", a.sev === "critical");
      var sevChip = $("[data-ma-badge]", box);
      if (sevChip) {
        sevChip.classList.toggle("is-crit", a.sev === "critical");
        sevChip.classList.toggle("is-warn", a.sev !== "critical");
      }
      sev.textContent = a.sev === "critical" ? "위험" : "주의";
      title.textContent = a.title;
      title.title = a.title;
      if (reason7) {
        reason7.textContent = "";
        reason7.hidden = true;
      }
      var kind = $("[data-ma-kind]", box);
      if (kind && body.classList.contains("ver-6")) {
        var rs = maResult(a);
        var r6k = window.APRISM_ALERT6 && window.APRISM_ALERT6.of(a.title);
        kind.textContent = r6k && r6k.detect || a.detect || "";
        if (rs) {
          title.textContent = "";
          title.appendChild(document.createTextNode(rs[0] + " "));
          var vb = document.createElement("b");
          vb.className = "ma-val";
          vb.textContent = rs[1];
          title.appendChild(vb);
          var vd = window.APRISM_VERDICT && window.APRISM_VERDICT(kind.textContent, rs[1]);
          if (reason7) {
            reason7.textContent = vd || "";
            reason7.hidden = !vd;
          } else if (vd) {
            var vs = document.createElement("span");
            vs.className = "ma-vd";
            vs.textContent = vd;
            title.appendChild(document.createTextNode(" "));
            title.appendChild(vs);
          }
          title.title = a.title;
        }
      }
      stamp.textContent = stampOf(a);
      if (body.classList.contains("ver-6") && a.wp) {
        var wn = parseInt(String(a.wp).replace(/\D+/g, ""), 10), ph = !isNaN(wn) && document.querySelector('.rr-pin-head[data-n="' + wn + '"]');
        var st6 = stampOf(a), cut = st6.lastIndexOf(" · "), where6 = cut < 0 ? st6 : st6.slice(0, cut), when6 = cut < 0 ? "" : st6.slice(cut + 3);
        if (where6.indexOf(a.wp) === 0) {
          where6 = where6.slice(a.wp.length).trim();
        }
        stamp.textContent = "";
        stamp.classList.add("ma-stamp6");
        var pin6 = document.createElement("span");
        pin6.className = "mbt-pin" + (document.body.classList.contains("ver-7") ? " ds-wp" : "");
        pin6.setAttribute("data-n", isNaN(wn) ? "" : String(wn));
        pin6.setAttribute("role", "img");
        pin6.setAttribute("aria-label", a.wp);
        if (ph) {
          pin6.setAttribute("style", ph.getAttribute("style") || "");
        } else {
          pin6.classList.add("is-plain");
        }
        var pl6 = document.createElement("span");
        pl6.className = "ma-st-place";
        pl6.textContent = where6;
        var tm6 = document.createElement("span");
        tm6.className = "ma-st-time num";
        tm6.textContent = when6;
        stamp.appendChild(pin6);
        stamp.appendChild(pl6);
        stamp.appendChild(tm6);
        if (headTime7) {
          headTime7.textContent = when6;
        }
      }
      $("[data-ma-wp]", box).textContent = a.wp || "";
      $("[data-ma-place]", box).textContent = placeOf(a);
      $("[data-ma-detect]", box).textContent = a.detect || "";
      var more = $("[data-ma-more]", box);
      if (more && body.classList.contains("ver-6")) {
        var mq = new URLSearchParams, mm = missionOf(a);
        if (mm) {
          mq.set("mission", mm);
        }
        if (a.detect) {
          mq.set("detect", a.detect);
        }
        more.href = "./safety-v6.html" + (mq.toString() ? "?" + mq.toString() : "");
      }
      if (V3) {
        box.classList.toggle("no-snap", !a.live);
        img.hidden = !a.live;
      } else {
        snap.hidden = !a.live;
      }
      $("[data-ma-zoom]", box).hidden = !a.live;
      var robotEl = $("[data-ma-robot]", box);
      if (robotEl) {
        robotEl.textContent = "R-" + ("0" + ((a.robot || 0) + 1)).slice(-2);
      }
      if (a.live) {
        img.src = liveSrc(a);
        img.alt = a.title + " — 검출 장면";
      }
      $("[data-ma-lead]", box).textContent = a.lead || a.sum;
      var fp = $("[data-ma-fp]", box);
      fp.style.setProperty("--ma-fp", (a.fp || 0) + "%");
      var meter = $("[data-ma-fp-meter]", box);
      if (meter) {
        meter.setAttribute("aria-label", "오탐 가능성 " + (a.fp || 0) + "퍼센트");
      }
      var fpVal = $(".ma-fp-value", box);
      if (fpVal) {
        fpVal.classList.toggle("is-mid", (a.fp || 0) >= 20 && (a.fp || 0) < 40);
        fpVal.classList.toggle("is-high", (a.fp || 0) >= 40);
      }
      $("[data-ma-fp-label]", box).textContent = a.fpLabel || "";
      $("[data-ma-fp-pct]", box).textContent = (a.fp || 0) + "%";
      options.textContent = "";
      if (V3) {
        var aiLeft = V7 ? 1 : Infinity;
        a.acts.slice().sort(function(x, y) {
          return (y.ai ? 1 : 0) - (x.ai ? 1 : 0);
        }).forEach(function(src) {
          var act = src;
          if (src.ai) {
            if (aiLeft > 0) {
              aiLeft--;
            } else {
              act = {
                t: src.t
              };
            }
          }
          var DS7 = document.body.classList.contains("ver-7");
          var row = el("button", "ma-check" + (DS7 ? " ds-act" : ""));
          row.type = "button";
          row.setAttribute("role", "checkbox");
          row.setAttribute("data-act", act.t);
          row.setAttribute("aria-checked", act.ai ? "true" : "false");
          var boxEl = el("span", "ma-check-box" + (DS7 ? " ds-act-box" : ""));
          var mark = el("span", "i");
          mark.style.setProperty("--i", "var(--ic-check)");
          mark.setAttribute("aria-hidden", "true");
          boxEl.appendChild(mark);
          row.appendChild(boxEl);
          var lab = el("span", "ma-check-label" + (DS7 ? " ds-act-text" : ""), act.t);
          if (DS7 && src.to) {
            lab.appendChild(el("small", null, src.to));
          }
          row.appendChild(lab);
          if (act.ai) {
            row.appendChild(el("span", "ma-check-tag" + (document.body.classList.contains("ver-7") ? " ds-badge is-neutral ds-i-delta" : ""), "AI 추천"));
          }
          options.appendChild(row);
        });
        memoReset();
        menuClose();
        syncConfirm();
        return;
      }
      a.acts.filter(function(act) {
        return act.ai;
      }).forEach(function(act) {
        var chip = el("button", "preset-chip");
        chip.type = "button";
        chip.setAttribute("data-act", act.t);
        chip.setAttribute("aria-pressed", "false");
        chip.appendChild(el("span", null, act.t));
        if (act.ai) {
          chip.setAttribute("data-delta", "");
        }
        options.appendChild(chip);
      });
      confirm.disabled = true;
    }
    options.addEventListener("click", function(event) {
      var row = event.target.closest(".ma-check");
      if (row) {
        row.setAttribute("aria-checked", row.getAttribute("aria-checked") === "true" ? "false" : "true");
        syncConfirm();
        return;
      }
      var chip = event.target.closest(".preset-chip");
      if (!chip) {
        return;
      }
      chip.setAttribute("aria-pressed", chip.getAttribute("aria-pressed") === "true" ? "false" : "true");
      syncConfirm();
    });
    var useDeid = body.classList.contains("v2-2");
    var SHOT = {
      "누출감지 · 냉각수 배관 밸브": "alert/wp03-leak.webp",
      "부분방전 · 이상 점수 9.41": "alert/wp06-pd-941.webp",
      "진동 상승 · 냉각 펌프 P-2": "alert/wp12-vib.webp",
      "이상음향 · 이상 점수 21.6": "alert/wp12-sound-216.webp",
      "과열 · 발전기 베어링 68.4℃": "alert/wp02-temp-684.webp",
      "압력 편차 · 공기 압축기 C-1": "alert/wp13-gauge-comp.webp",
      "지하발전소 B3 터빈 2 NG 1건 발견": "alert/wp04-gauge-spiral.webp",
      "지하발전소 터빈 2 NG 1건 발견": "alert/wp04-gauge-spiral.webp",
      "이상음향 · 냉각 펌프 P-2": "alert/wp05-sound.webp",
      "온도감지 · 냉각 펌프 P-2 48.6℃": "alert/wp05-temp-486.webp",
      "부분방전 · CH1 이상 점수 9.05": "alert/wp06-pd-905.webp",
      "안전감지 · 안전벨트 미착용 1명": "safety/safety_crit.jpg",
      "안전감지 · 안전모 미착용 1명": "alert/wp07-helmet.webp",
      "차압 NG · HEPA Filter 차압계": "alert/wp02-gauge-hepa.webp",
      "압력 편차 · N₂ 배관 압력계": "alert/wp04-gauge-n2.webp"
    };
    if (body.classList.contains("ver-6")) {
      SHOT["지하발전소 B3 터빈 2 NG 1건 발견"] = SHOT["지하발전소 터빈 2 NG 1건 발견"] = "safety/gauge_crit.jpg";
    }
    function liveSrc(a) {
      var S7 = body.classList.contains("ver-7") && window.APRISM_ALERTS7;
      var i7 = S7 && S7.img(a.detect || (S7.of(a.title) || [])[0]);
      if (i7) {
        return "../assets/img/" + i7;
      }
      if (SHOT[a.title]) {
        return "../assets/img/" + SHOT[a.title];
      }
      if (useDeid && a.live === "ppe") {
        return "../assets/img/alert-live-deid-grid.webp?v=12";
      }
      return "../assets/img/alert-live-" + a.live + ".webp";
    }
    var menuBtn = $("[data-ma-menu-btn]", box);
    var menu = $("[data-ma-menu]", box);
    var dockBtn = $("[data-ma-dock]", box);
    var infoBtn = $("[data-ma-info]", box);
    var memoBox = $("[data-ma-memo]", box);
    var memoBtn = $("[data-ma-memo-btn]", box);
    var memoField = $("[data-ma-memo-field]", box);
    function menuClose() {
      if (!menu || menu.hidden) {
        return;
      }
      menu.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
    }
    function setDock(on) {
      docked = on;
      box.classList.toggle("is-docked", on);
      if (dockBtn) {
        dockBtn.textContent = on ? "고정 풀기" : "패널에 고정";
      }
    }
    if (menuBtn && menu) {
      menuBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        var open = menu.hidden;
        menu.hidden = !open;
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          var first = $("button:not([hidden])", menu);
          if (first) {
            first.focus();
          }
        }
      });
      menu.addEventListener("click", function() {
        menuClose();
      });
      document.addEventListener("click", function(event) {
        if (!event.target.closest || !event.target.closest(".ma-more-box")) {
          menuClose();
        }
      });
      menu.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
          event.stopPropagation();
          menuClose();
          menuBtn.focus();
        }
      });
    }
    if (dockBtn) {
      dockBtn.addEventListener("click", function() {
        setDock(!docked);
      });
    }
    if (infoBtn) {
      var infoOn = function() {
        box.classList.add("is-info");
      };
      var infoOff = function() {
        box.classList.remove("is-info");
      };
      infoBtn.addEventListener("mouseenter", infoOn);
      infoBtn.addEventListener("mouseleave", infoOff);
      infoBtn.addEventListener("focus", infoOn);
      infoBtn.addEventListener("blur", infoOff);
    }
    function memoSet(open) {
      if (!memoBox) {
        return;
      }
      memoBox.classList.toggle("is-open", open);
      memoField.hidden = !open;
      memoBtn.setAttribute("aria-expanded", open ? "true" : "false");
      memoBtn.setAttribute("aria-label", open ? "메모 접기" : "메모 펼치기");
    }
    function memoReset() {
      if (memoField) {
        memoField.value = "";
      }
      memoSet(false);
    }
    if (memoBtn) {
      memoBtn.addEventListener("click", function() {
        var open = memoField.hidden;
        memoSet(open);
        if (open) {
          memoField.focus();
        }
      });
    }
    var zoomBox = $("[data-ma-zoom-box]");
    var zoomBtn = $("[data-ma-zoom]", box);
    var zoomImg = zoomBox && $("[data-ma-zoom-img]", zoomBox);
    var zoomClose = zoomBox && $("[data-ma-zoom-close]", zoomBox);
    function openZoom() {
      var a = picked;
      if (!zoomBox || !a || !a.live) {
        return;
      }
      zoomBox.classList.toggle("is-critical", a.sev === "critical");
      var zoomChip = $("[data-ma-zoom-badge]", zoomBox);
      if (zoomChip) {
        zoomChip.classList.toggle("is-crit", a.sev === "critical");
        zoomChip.classList.toggle("is-warn", a.sev !== "critical");
      }
      $("[data-ma-zoom-sev]", zoomBox).textContent = a.sev === "critical" ? "위험" : "주의";
      $("[data-ma-zoom-title]", zoomBox).textContent = a.title;
      $("[data-ma-zoom-time]", zoomBox).textContent = a.time;
      zoomImg.src = liveSrc(a);
      zoomImg.alt = a.title + " — 라이브 뷰";
      zoomBox.hidden = false;
      zoomClose.focus();
    }
    function closeZoom() {
      if (!zoomBox || zoomBox.hidden) {
        return false;
      }
      zoomBox.hidden = true;
      if (!box.hidden) {
        (V3 && menuBtn ? menuBtn : zoomBtn) && (V3 && menuBtn ? menuBtn : zoomBtn).focus();
      }
      return true;
    }
    if (zoomBox) {
      zoomBtn.addEventListener("click", openZoom);
      zoomClose.addEventListener("click", closeZoom);
      zoomBox.addEventListener("click", function(event) {
        if (event.target === zoomBox) {
          closeZoom();
        }
      });
      if (V7 && img) {
        img.addEventListener("click", openZoom);
        img.title = "크게 보기";
      }
    }
    function pointAt(wp) {
      var item = timeline && timeline.querySelector("[data-waypoint='" + wp + "']");
      if (item && timeline.getAttribute("data-selected-waypoint") !== wp) {
        item.click();
      } else {
        document.dispatchEvent(new CustomEvent("aprism:waypoint", {
          detail: {
            id: wp,
            from: "panel"
          }
        }));
      }
      if (item && item.scrollIntoView) {
        item.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
    function open(a) {
      if (V7 && reqBox7 !== undefined) {
        reqReset7();
      }
      opening = true;
      if (a.robot !== activeRobot()) {
        var card = $(".robot-strip .robot-card[data-robot='" + a.robot + "']");
        if (card) {
          card.click();
        }
      }
      picked = a;
      pickedDone = null;
      fill(a);
      box.setAttribute("data-wp", a.wp);
      box.hidden = false;
      if (V7) {
        maSlide(true);
      }
      pointAt(a.wp);
      opening = false;
      render();
    }
    function close() {
      if (V7 && reqBox7 !== undefined) {
        reqReset7();
      }
      closeZoom();
      if (box.hidden) {
        picked = null;
        return;
      }
      var wp = box.getAttribute("data-wp");
      box.hidden = true;
      picked = null;
      if (timeline && timeline.getAttribute("data-selected-waypoint") === wp) {
        var item = timeline.querySelector("[data-waypoint='" + wp + "']");
        if (item) {
          item.click();
        }
      }
      render();
    }
    var slow = window.matchMedia("(prefers-reduced-motion: reduce)");
    var toast = $("[data-ma-toast]");
    var toastMsg = $("[data-ma-toast-msg]");
    var undoBtn = $("[data-ma-undo]");
    var toastTimer = null;
    var lastDone = null;
    var busy = false;
    function showToast(a) {
      if (!toast) {
        return;
      }
      toastMsg.textContent = (window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(a.title) : a.title) + " 조치 요청됨";
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, 5000);
    }
    function hideToast() {
      clearTimeout(toastTimer);
      if (toast) {
        toast.hidden = true;
      }
      lastDone = null;
    }
    function measureDone(rec) {
      var ghost = doneItem(rec);
      ghost.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
      doneList.appendChild(ghost);
      var h = ghost.getBoundingClientRect().height;
      ghost.remove();
      return h;
    }
    function flyTo(from, to) {
      var dx = to.left + to.width / 2 - (from.left + from.width / 2);
      var dy = to.top + to.height / 2 - (from.top + from.height / 2);
      var sx = to.width / from.width;
      var sy = to.height / from.height;
      var horiz = Math.abs(dx) > Math.abs(dy);
      var mid = horiz ? "polygon(0% 34%,100% 0%,100% 100%,0% 66%)" : "polygon(0% 0%,100% 0%,64% 100%,36% 100%)";
      var end = horiz ? "polygon(0% 44%,100% 20%,100% 80%,0% 56%)" : "polygon(20% 0%,80% 0%,56% 100%,44% 100%)";
      return [ {
        transform: "none",
        clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)",
        opacity: 1,
        offset: 0
      }, {
        transform: "translate(" + dx * 0.25 + "px," + dy * 0.25 + "px) scale(.9,.9)",
        clipPath: mid,
        opacity: 1,
        offset: 0.45
      }, {
        transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")",
        clipPath: end,
        opacity: 0.2,
        offset: 1
      } ];
    }
    function commit(a, rec, quiet) {
      DONE.unshift(rec);
      if (extra.indexOf(a) >= 0) {
        extra.splice(extra.indexOf(a), 1);
      } else {
        resolved.push(a);
      }
      cleared.push(a);
      var S7r = window.APRISM_ALERTS7, id7 = S7r && S7r.req.idOf(a);
      if (id7) {
        rec.reqId = id7;
        selfReq = true;
        S7r.req.set(id7, {
          t: rec.time,
          how: rec.how ? rec.how.split(" · ") : [],
          memo: rec.memo || "",
          who: rec.who,
          to: S7r.req.to ? S7r.req.to(a).text : "현장 작업자",
          st: "wait",
          src: "ctl"
        });
        selfReq = false;
      } else {
        hAdd(a, rec);
      }
      lastDone = {
        a: a,
        rec: rec
      };
      render();
      if (!quiet) {
        showToast(a);
      }
      busy = false;
    }
    var maAnim = null;
    function maDrawerX() {
      var clip = box.closest(".two-col") || box.offsetParent, br = box.getBoundingClientRect();
      var off = clip ? br.left - clip.getBoundingClientRect().left : 40;
      return -(Math.max(0, Math.round(off)) + Math.round(br.width || box.offsetWidth || 370) + 8) + "px";
    }
    function mv(name, dflt) {
      var v = getComputedStyle(document.body).getPropertyValue(name).trim();
      if (!v) {
        return dflt;
      }
      var n = parseFloat(v);
      return /ms$|s$/.test(v) && !isNaN(n) ? /ms$/.test(v) ? n : n * 1000 : v;
    }
    function maSlide(enter, done) {
      if (maAnim) {
        maAnim.cancel();
        maAnim = null;
      }
      var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still || !box.animate || box.hidden) {
        if (done) {
          done();
        }
        return;
      }
      var out = enter ? "calc(-100% - 48px) 0" : maDrawerX() + " 0";
      maAnim = enter ? box.animate([ {
        translate: out
      }, {
        translate: "0 0"
      } ], {
        duration: mv("--ds-motion-enter", 420),
        easing: mv("--ds-ease-enter", "cubic-bezier(.22, 1, .36, 1)")
      }) : box.animate([ {
        translate: "0 0"
      }, {
        translate: out
      } ], {
        duration: mv("--ds-motion-exit", 300),
        easing: mv("--ds-ease-exit", "cubic-bezier(.55, 0, .8, .25)"),
        fill: "forwards"
      });
      var a = maAnim;
      a.onfinish = function() {
        if (maAnim === a) {
          maAnim = null;
        }
        if (done) {
          done();
        }
        if (!enter) {
          a.cancel();
        }
      };
    }
    var reqBox7 = null, reqTimer7 = 0, reqTick7 = 0, reqA7 = null;
    function reqReset7() {
      clearTimeout(reqTimer7);
      clearInterval(reqTick7);
      reqA7 = null;
      wvRun += 1;
      Array.prototype.forEach.call(box.querySelectorAll(".wv-old, .wv-front, .wv-rim, .wv-dot"), function(n) {
        n.remove();
      });
      box.style.minHeight = "";
      var lw = $(".ma-lower", box);
      if (lw) {
        lw.style.filter = "";
      }
      if (reqBox7) {
        reqBox7.style.animation = "";
      }
      box.classList.remove("is-requested");
      if (reqBox7) {
        reqBox7.hidden = true;
      }
      confirm.classList.remove("is-sent");
      confirm.textContent = "조치 요청";
    }
    function reqShow7(a, rec, picks) {
      if (!reqBox7) {
        reqBox7 = el("div", "ma-req");
        reqBox7.innerHTML = '<div class="ma-req-head ds-notice" role="status"><span class="i i-16" style="--i:var(--ic-check-circle)" aria-hidden="true"></span><span class="body"><p class="ma-req-to title"></p><ul class="ma-req-acts desc"></ul></span></div>' + '<div class="ma-req-actions"><button type="button" class="btn btn-secondary" data-req-undo></button><button type="button" class="btn btn-primary" data-req-ok>확인함</button></div>';
        $(".ma-lower", box).appendChild(reqBox7);
        $("[data-req-undo]", reqBox7).addEventListener("click", function() {
          var p = reqA7;
          undoLast();
          reqReset7();
          if (p) {
            picked = p;
            fill(p);
            syncConfirm();
            render();
          }
        });
        $("[data-req-ok]", reqBox7).addEventListener("click", function() {
          maSlide(false, function() {
            reqReset7();
            close();
          });
        });
      }
      var S7t = window.APRISM_ALERTS7, to = S7t && S7t.req.to ? S7t.req.to(a).text : "현장 작업자";
      $(".ma-req-to", reqBox7).textContent = to + "에게 조치 요청됨";
      var acts = $(".ma-req-acts", reqBox7);
      acts.textContent = "";
      picks.forEach(function(h) {
        String(h).split("·").forEach(function(t) {
          t = t.trim();
          if (!t) {
            return;
          }
          var li = el("li");
          li.textContent = t;
          acts.appendChild(li);
        });
      });
      if (rec.memo) {
        var mm = el("li", "is-memo");
        mm.textContent = "메모 " + rec.memo;
        acts.appendChild(mm);
      }
      var undo = $("[data-req-undo]", reqBox7);
      undo.hidden = false;
      var left = 5;
      var tick = function() {
        undo.textContent = "되돌리기 " + left;
      };
      tick();
      reqTick7 = setInterval(function() {
        left -= 1;
        if (left > 0) {
          tick();
        }
      }, 1000);
      reqTimer7 = setTimeout(function() {
        clearInterval(reqTick7);
        undo.hidden = true;
        lastDone = null;
      }, 5000);
      reqBox7.hidden = false;
      box.classList.add("is-requested");
    }
    var wvRun = 0;
    var WV = {
      disp: 0,
      dur: 820,
      band: 48,
      glow: 85,
      pull: 2.5,
      rim: 900,
      dots: 18
    };
    function wvDefs() {
      if (document.getElementById("wv-f")) {
        return;
      }
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.setAttribute("aria-hidden", "true");
      svg.style.position = "absolute";
      svg.innerHTML = [ "wv-f", "wv-f2" ].map(function(id, i) {
        return '<filter id="' + id + '" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' + '<feTurbulence type="fractalNoise" baseFrequency="0.010 0.030" numOctaves="2" seed="' + (i ? 9 : 4) + '" result="n"/>' + '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
      }).join("");
      document.body.appendChild(svg);
    }
    function wvPal(a) {
      var p = Math.round(a * 100);
      return [ "--ds-motion-done", "--ds-motion-done-2", "--ds-motion-done-3" ].map(function(n) {
        return "color-mix(in srgb, var(" + n + ") " + p + "%, transparent)";
      });
    }
    function wvRing(ox, oy, r, band, a) {
      var cols = wvPal(a), n = cols.length, st = [ "transparent " + Math.max(0, r - band) + "px" ];
      cols.forEach(function(c, i) {
        st.push(c + " " + (r - band + band * (i + 0.5) / n).toFixed(1) + "px");
      });
      st.push("transparent " + (r + band * 0.25).toFixed(1) + "px");
      return "radial-gradient(circle at " + ox + "px " + oy + "px, " + st.join(", ") + ")";
    }
    function wave7(after) {
      if (slow.matches) {
        after();
        return;
      }
      wvDefs();
      WV.dur = mv("--ds-motion-slow", 820);
      var W = box.offsetWidth, H = box.offsetHeight;
      var br = confirm.getBoundingClientRect(), pr = box.getBoundingClientRect();
      var ox = br.left + br.width / 2 - pr.left, oy = br.top + br.height / 2 - pr.top;
      var far = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) + WV.band;
      var old = box.cloneNode(true);
      old.removeAttribute("data-map-alert");
      Array.prototype.forEach.call(old.querySelectorAll("[id]"), function(n) {
        n.removeAttribute("id");
      });
      old.classList.add("wv-old");
      old.hidden = false;
      old.setAttribute("aria-hidden", "true");
      old.style.cssText = "position:absolute;left:0;top:0;margin:0;width:" + W + "px;height:" + H + "px;max-height:none;transform-origin:" + ox + "px " + oy + "px";
      after();
      if (reqBox7) {
        reqBox7.style.animation = "none";
      }
      var H2 = box.offsetHeight;
      box.style.minHeight = H + "px";
      box.appendChild(old);
      var front = el("div", "wv-front"), fi = el("i"), rim = el("div", "wv-rim");
      front.appendChild(fi);
      box.appendChild(front);
      box.appendChild(rim);
      var lower = $(".ma-lower", box);
      var dOld = null, dNew = null, fOld = document.getElementById("wv-f"), fNew = document.getElementById("wv-f2");
      dOld = fOld.querySelector("feDisplacementMap");
      dNew = fNew.querySelector("feDisplacementMap");
      var tOld = fOld.querySelector("feTurbulence"), tNew = fNew.querySelector("feTurbulence");
      if (WV.disp > 0) {
        old.style.filter = "url(#wv-f)";
        if (lower) {
          lower.style.filter = "url(#wv-f2)";
        }
      }
      var dots = [];
      for (var d = 0; d < WV.dots; d++) {
        var dot = el("span", "wv-dot");
        dot.style.background = wvPal(0.95)[d % 3];
        dots.push({
          el: dot,
          ang: -Math.PI * (0.15 + 0.7 * Math.random()) - (Math.random() < 0.3 ? Math.PI * 0.2 : 0),
          at: 0.15 + Math.random() * 0.55,
          life: 0.25 + Math.random() * 0.2,
          reach: 18 + Math.random() * 40
        });
        box.appendChild(dot);
      }
      var t0 = performance.now(), ANT = 0.14, run = wvRun;
      var ease = function(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      var tick = function(now) {
        if (run !== wvRun) {
          return;
        }
        var t = Math.min(1, (now - t0) / WV.dur);
        var pull = t < ANT ? Math.sin(t / ANT * Math.PI / 2) : Math.max(0, 1 - (t - ANT) / 0.35);
        old.style.transform = "scale(" + (1 - WV.pull / 100 * pull) + ")";
        var k = t < ANT ? 0 : ease((t - ANT) / (1 - ANT)), r = k * far;
        old.style.setProperty("--ox", ox + "px");
        old.style.setProperty("--oy", oy + "px");
        old.style.setProperty("--r", r + "px");
        old.style.setProperty("--feather", WV.band * 0.6 + "px");
        var swell = Math.sin(Math.min(1, k * 1.15) * Math.PI);
        dOld.setAttribute("scale", (WV.disp * (0.35 * pull + swell)).toFixed(2));
        dNew.setAttribute("scale", (WV.disp * 0.6 * Math.max(0, swell - 0.15) * (1 - k)).toFixed(2));
        var bf = (0.010 + 0.006 * k).toFixed(4) + " " + (0.030 - 0.010 * k).toFixed(4);
        tOld.setAttribute("baseFrequency", bf);
        tNew.setAttribute("baseFrequency", bf);
        var a = WV.glow / 100 * Math.min(1, k * 4) * (1 - Math.max(0, k - 0.75) / 0.25);
        fi.style.backgroundImage = wvRing(ox, oy, r, WV.band, a);
        dots.forEach(function(o) {
          var u = (k - o.at) / o.life;
          if (u <= 0 || u >= 1) {
            o.el.style.opacity = "0";
            return;
          }
          var rr = o.at * far + o.reach * u;
          o.el.style.left = ox + Math.cos(o.ang) * rr + "px";
          o.el.style.top = oy + Math.sin(o.ang) * rr + "px";
          o.el.style.opacity = String(1 - u);
        });
        box.style.minHeight = H + (H2 - H) * k + "px";
        if (t < 1 && !box.hidden) {
          requestAnimationFrame(tick);
          return;
        }
        old.remove();
        front.remove();
        dots.forEach(function(o) {
          o.el.remove();
        });
        if (lower) {
          lower.style.filter = "";
        }
        box.style.minHeight = "";
        dOld.setAttribute("scale", "0");
        dNew.setAttribute("scale", "0");
        if (box.hidden) {
          rim.remove();
          return;
        }
        var col = wvPal(0.85);
        rim.style.boxShadow = "inset 0 0 0 1.5px " + col[0] + ", inset 0 0 18px " + col[1] + ", 0 0 16px " + col[2];
        rim.animate([ {
          opacity: 1
        }, {
          opacity: 0
        } ], {
          duration: WV.rim,
          easing: "ease-out"
        }).finished.catch(function() {}).then(function() {
          rim.remove();
        });
      };
      requestAnimationFrame(tick);
    }
    function sent7(a, rec, picks) {
      confirm.classList.add("is-sent");
      confirm.disabled = true;
      confirm.innerHTML = '<span class="i i-16" style="--i:var(--ic-check)" aria-hidden="true"></span>요청됨';
      setTimeout(function() {
        commit(a, rec, true);
        var ds = doneList.closest("[data-done-sec]");
        if (ds && ds.classList.contains("is-folded") && !slow.matches) {
          ds.classList.remove("is-landed");
          void ds.offsetWidth;
          ds.classList.add("is-landed");
          setTimeout(function() {
            ds.classList.remove("is-landed");
          }, 700);
        }
        if (box.hidden || box.getAttribute("data-wp") !== (a.wp || "")) {
          reqReset7();
          return;
        }
        wave7(function() {
          reqShow7(a, rec, picks);
        });
        reqA7 = a;
      }, slow.matches ? 0 : 200);
    }
    confirm.addEventListener("click", function() {
      var a = picked;
      var picks = chosen();
      if (busy || !a || !picks.length) {
        return;
      }
      busy = true;
      hideToast();
      var rec = {
        wp: a.wp || "",
        time: clock(),
        title: window.APRISM_ALERT6 ? window.APRISM_ALERT6.title(a.title) : a.title,
        how: picks.join(" · "),
        who: "홍길동",
        fresh: true,
        memo: memoField ? memoField.value.trim() : ""
      };
      if (V7) {
        sent7(a, rec, picks);
        return;
      }
      var from = box.getBoundingClientRect();
      var flyer = box.cloneNode(true);
      flyer.removeAttribute("data-map-alert");
      flyer.removeAttribute("id");
      flyer.classList.add("ma-flyer");
      flyer.hidden = false;
      flyer.setAttribute("aria-hidden", "true");
      flyer.style.cssText = "left:" + from.left + "px;top:" + from.top + "px;" + "width:" + from.width + "px;height:" + from.height + "px;transform:none";
      document.body.appendChild(flyer);
      close();
      if (slow.matches) {
        flyer.animate([ {
          opacity: 1
        }, {
          opacity: 0
        } ], {
          duration: 150
        }).finished.catch(function() {}).then(function() {
          flyer.remove();
          commit(a, rec);
        });
        return;
      }
      var doneSec = doneList.closest("[data-done-sec]");
      if (doneSec && doneSec.classList.contains("is-folded")) {
        var badge = doneSec.querySelector(".done-count") || doneSec.querySelector("[data-done-head]");
        flyer.animate(flyTo(from, badge.getBoundingClientRect()), {
          duration: 480,
          easing: "cubic-bezier(.55,0,.75,.2)",
          fill: "forwards"
        }).finished.catch(function() {}).then(function() {
          flyer.remove();
          commit(a, rec);
          doneSec.classList.remove("is-landed");
          void doneSec.offsetWidth;
          doneSec.classList.add("is-landed");
          setTimeout(function() {
            doneSec.classList.remove("is-landed");
          }, 700);
        });
        return;
      }
      var slot = el("div", "done-slot");
      slot.setAttribute("aria-hidden", "true");
      doneList.insertBefore(slot, doneList.firstChild);
      var h = measureDone(rec);
      slot.animate([ {
        height: "0px"
      }, {
        height: h + "px"
      } ], {
        duration: 180,
        easing: "ease-out",
        fill: "forwards"
      }).finished.catch(function() {}).then(function() {
        var to = slot.isConnected ? slot.getBoundingClientRect() : doneList.getBoundingClientRect();
        return flyer.animate(flyTo(from, to), {
          duration: 480,
          easing: "cubic-bezier(.55,0,.75,.2)",
          fill: "forwards"
        }).finished;
      }).catch(function() {}).then(function() {
        flyer.remove();
        slot.remove();
        commit(a, rec);
      });
    });
    function undoLast() {
      if (!lastDone || busy) {
        return;
      }
      var a = lastDone.a, rec = lastDone.rec;
      var i = DONE.indexOf(rec);
      if (i >= 0) {
        DONE.splice(i, 1);
      }
      var r = resolved.indexOf(a);
      if (r >= 0) {
        resolved.splice(r, 1);
      } else {
        extra.unshift(a);
      }
      if (rec.reqId && window.APRISM_ALERTS7) {
        selfReq = true;
        window.APRISM_ALERTS7.req.clear(rec.reqId);
        selfReq = false;
      } else {
        hDel(a);
      }
      hideToast();
      render();
    }
    if (undoBtn) {
      undoBtn.addEventListener("click", undoLast);
    }
    document.addEventListener("aprism:monitor-reset", hideToast);
    var closeBtn = $("[data-ma-close]", box);
    if (closeBtn) {
      closeBtn.addEventListener("click", function() {
        if (V7) {
          maSlide(false, close);
        } else {
          close();
        }
      });
    }
    document.addEventListener("aprism:map-alert", function(event) {
      if (opening || event.detail && event.detail.open) {
        return;
      }
      picked = null;
      render();
    });
    document.addEventListener("keydown", function(event) {
      if (event.key !== "Escape") {
        return;
      }
      if (closeZoom()) {
        return;
      }
      if (box.hidden) {
        return;
      }
      close();
    });
    function syncDelta() {
      body.classList.toggle("has-map-alert", !box.hidden);
    }
    new MutationObserver(syncDelta).observe(box, {
      attributes: true,
      attributeFilter: [ "hidden" ]
    });
    syncDelta();
    return {
      open: open,
      close: close
    };
  }();
  document.addEventListener("aprism:waypoint", function(event) {
    var d = event.detail || {};
    if (d.from !== "map" && d.from !== "panel" || !d.id) {
      return;
    }
    if (d.done) {
      return;
    }
    if (d.from === "panel" && picked && picked.wp === d.id) {
      return;
    }
    var robot = activeRobot();
    var here = items().filter(function(a) {
      return a.wp === d.id && a.robot === robot;
    });
    if (!here.length) {
      return;
    }
    here.sort(function(x, y) {
      return (x.sev === "critical" ? 0 : 1) - (y.sev === "critical" ? 0 : 1) || (x.time < y.time ? -1 : x.time > y.time ? 1 : 0);
    });
    note.open(here[0]);
  });
  function fromHash() {
    var h = (location.hash || "").replace("#", "");
    var base = body.getAttribute("data-monitor-default");
    level = SETS[h] ? h : SETS[base] ? base : "critical";
    extra = [];
    resolved = [];
    cleared = [];
    DONE = DONE_BASE.slice();
    hRestore();
    note.close();
    document.dispatchEvent(new CustomEvent("aprism:monitor-reset"));
    render();
  }
  window.addEventListener("hashchange", fromHash);
  (function() {
    var box = $("[data-robot-carousel]");
    if (!box) {
      return;
    }
    var cards = $$(".robot-card[data-robot]", box);
    $$("[data-rc-step]", box).forEach(function(arrow) {
      arrow.addEventListener("click", function() {
        var dir = Number(arrow.getAttribute("data-rc-step"));
        var now = cards.findIndex(function(c) {
          return c.getAttribute("aria-pressed") === "true";
        });
        for (var n = 1; n <= cards.length; n++) {
          var next = cards[(now + dir * n + cards.length * n) % cards.length];
          if (!next.hasAttribute("data-robot-offline") && !next.hidden) {
            next.click();
            break;
          }
        }
      });
    });
  })();
  (function() {
    var open = $("[data-ai-ask-open]");
    var box = $("#ai-ask");
    if (!open || !box) {
      return;
    }
    var input = $("[data-ai-ask]", box);
    open.addEventListener("click", function() {
      var on = box.hidden;
      box.hidden = !on;
      open.setAttribute("aria-expanded", on ? "true" : "false");
      open.setAttribute("aria-label", on ? "Delta 에게 묻기 닫기" : "Delta 에게 묻기 열기");
      if (on && input) {
        input.focus();
      }
    });
  })();
  fromHash();
})();
