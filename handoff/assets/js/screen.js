window.APRISM_TEXT = function() {
  "use strict";
  var DOT = /\s+\u00b7\s+/;
  function parts(text) {
    if (Array.isArray(text)) {
      return text.filter(function(p) {
        return p !== "" && p != null;
      }).map(String);
    }
    return String(text == null ? "" : text).split(DOT).filter(function(p) {
      return p !== "";
    });
  }
  function fill(node, text) {
    if (!node) {
      return node;
    }
    var list = parts(text);
    node.classList.toggle("t-split", list.length > 1);
    if (list.length < 2) {
      node.textContent = list[0] || "";
      return node;
    }
    node.textContent = "";
    list.forEach(function(p) {
      var span = document.createElement("span");
      span.className = "t-part";
      span.textContent = p;
      node.appendChild(span);
    });
    return node;
  }
  function plain(text, glue) {
    return parts(text).join(glue == null ? "\n" : glue);
  }
  return {
    fill: fill,
    parts: parts,
    plain: plain
  };
}();

(function() {
  "use strict";
  (function() {
    var panel = document.querySelector("[data-ai-panel]");
    var button = document.querySelector("[data-ai-toggle]");
    if (!panel || !button) {
      return;
    }
    var foldClosed = panel.querySelector(".ai-fold-closed");
    var foldOpen = panel.querySelector(".ai-fold-open");
    function apply(open) {
      panel.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "요약 접기" : "요약 펼치기");
      if (foldClosed) {
        foldClosed.inert = open;
      }
      if (foldOpen) {
        foldOpen.inert = !open;
      }
    }
    apply(false);
    button.addEventListener("click", function() {
      apply(!panel.classList.contains("is-open"));
    });
    function severity() {
      if (panel.classList.contains("is-critical")) {
        return "critical";
      }
      if (panel.classList.contains("is-warning")) {
        return "warning";
      }
      if (panel.classList.contains("is-safe")) {
        return "safe";
      }
      return "info";
    }
    var mark = panel.querySelector(".ai-delta-mark");
    var orb = mark && window.PrismOrb ? window.PrismOrb.mount(mark, {
      palette: severity()
    }) : null;
    var twoCol = panel.closest(".two-col");
    function setLines(one, two) {
      Array.prototype.slice.call(panel.querySelectorAll(".ai-line-1")).forEach(function(el) {
        el.textContent = one;
      });
      Array.prototype.slice.call(panel.querySelectorAll(".ai-line-2")).forEach(function(el) {
        el.textContent = two;
      });
    }
    function setTag(text) {
      var tag = panel.querySelector("[data-ai-tag-text]");
      if (tag) {
        tag.textContent = text;
      }
    }
    function setSeverity(level) {
      [ "is-warning", "is-critical", "is-safe" ].forEach(function(cls) {
        panel.classList.remove(cls);
        if (twoCol) {
          twoCol.classList.remove(cls);
        }
      });
      if (level) {
        panel.classList.add("is-" + level);
        if (twoCol) {
          twoCol.classList.add("is-" + level);
        }
      }
      if (orb) {
        orb.setPalette(severity());
      }
    }
    var ack = panel.querySelector("[data-ai-ack]");
    if (ack) {
      var NORMAL_LINE_1 = "안녕하세요, " + (window.APRISM_NAME ? APRISM_NAME("op1") : "홍길동") + " 님.";
      var NORMAL_LINE_2 = "인계된 알림 3건과 진행 예정인 미션 1건이 있어요. 먼저 살펴볼까요?";
      var NORMAL_TAG = "인계 알림 3건 · 예정 미션 1건";
      ack.addEventListener("click", function() {
        setSeverity(null);
        setLines(NORMAL_LINE_1, NORMAL_LINE_2);
        setTag(NORMAL_TAG);
      });
    }
    document.addEventListener("aprism:estop", function() {
      setSeverity("critical");
      setLines("비상정지 발동 — 로봇 구동이 차단되었습니다", "현장 안전을 확인한 뒤 해제 절차를 진행하세요.");
      setTag("비상정지 발동 · 해제 절차 필요");
    });
    document.addEventListener("aprism:severity", function(event) {
      var d = event.detail || {};
      setSeverity(d.level || null);
      if (d.glow !== undefined && twoCol) {
        [ "is-warning", "is-critical", "is-safe" ].forEach(function(cls) {
          twoCol.classList.remove(cls);
        });
        if (d.glow) {
          twoCol.classList.add("is-" + d.glow);
        }
      }
      if (d.line1 || d.line2) {
        setLines(d.line1 || "", d.line2 || "");
      }
      if (d.tag) {
        setTag(d.tag);
      }
    });
    panel.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        apply(false);
        button.focus();
      }
    });
  })();
  function runningRobots() {
    return document.querySelectorAll(".robot-strip .robot-card .badge-info").length;
  }
  function handOver(scrim) {
    var id = scrim.querySelector("[data-shift-id]");
    var name = id && id.value.trim() || (window.APRISM_NAME ? APRISM_NAME("op2") : "김현대");
    var chip = document.querySelector(".account-chip");
    if (chip) {
      var slots = chip.querySelectorAll(".t-label-2");
      if (slots[0]) {
        slots[0].textContent = name;
      }
    }
    var who = document.querySelector("[data-modal-user]");
    if (who) {
      window.APRISM_TEXT.fill(who, name + " · 관제운영");
    }
    if (id) {
      id.value = "";
    }
    var pw = scrim.querySelector("[data-shift-pw]");
    if (pw) {
      pw.value = "";
    }
    document.dispatchEvent(new CustomEvent("aprism:shift", {
      detail: {
        name: name
      }
    }));
  }
  (function() {
    var logout = document.querySelector("[data-logout-item]");
    var shift = document.querySelector("[data-shift-item]");
    if (!logout || !shift) {
      return;
    }
    var count = runningRobots();
    var slot = document.querySelector("[data-shift-count]");
    if (slot) {
      slot.textContent = count;
    }
    var busy = count > 0;
    logout.disabled = busy;
    logout.title = busy ? "수행 중인 로봇이 있어 로그아웃할 수 없습니다 — 관제사 교대를 쓰세요" : "";
    shift.hidden = !busy;
    var eye = document.querySelector("[data-shift-eye]");
    var pw = document.querySelector("[data-shift-pw]");
    if (eye && pw) {
      eye.addEventListener("click", function() {
        var shown = pw.type === "text";
        pw.type = shown ? "password" : "text";
        eye.querySelector(".i").style.setProperty("--i", shown ? "var(--ic-eye-off)" : "var(--ic-eye)");
        eye.setAttribute("aria-label", shown ? "비밀번호 보기" : "비밀번호 숨기기");
      });
    }
  })();
  (function() {
    var panel = document.getElementById("site-panel");
    var button = document.querySelector("[data-panel-toggle]");
    if (!panel || !button) {
      return;
    }
    button.addEventListener("click", function() {
      var collapsed = panel.classList.toggle("is-collapsed");
      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      button.setAttribute("aria-label", collapsed ? "사이트 패널 펼치기" : "사이트 패널 접기");
    });
  })();
  (function() {
    var menus = Array.prototype.slice.call(document.querySelectorAll("[data-status-menu]"));
    if (!menus.length) {
      return;
    }
    function set(menu, open) {
      var trigger = menu.querySelector("[data-menu-trigger]");
      var dropdown = menu.querySelector(".dropdown-menu");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      dropdown.hidden = !open;
    }
    function closeAll(except) {
      menus.forEach(function(menu) {
        if (menu !== except) {
          set(menu, false);
        }
      });
    }
    menus.forEach(function(menu) {
      var trigger = menu.querySelector("[data-menu-trigger]");
      trigger.addEventListener("click", function(event) {
        event.stopPropagation();
        var open = trigger.getAttribute("aria-expanded") === "true";
        closeAll(menu);
        set(menu, !open);
      });
      menu.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
          set(menu, false);
          trigger.focus();
        }
      });
    });
    document.addEventListener("click", function(event) {
      var inside = menus.some(function(menu) {
        return menu.contains(event.target);
      });
      if (!inside) {
        closeAll(null);
      }
    });
  })();
  (function() {
    var box = document.querySelector("[data-modal='robots']");
    if (!box) {
      return;
    }
    var picks = Array.prototype.slice.call(box.querySelectorAll("[data-robot-pick]"));
    picks.forEach(function(card) {
      card.addEventListener("click", function() {
        if (card.hasAttribute("data-robot-offline")) {
          return;
        }
        picks.forEach(function(other) {
          other.setAttribute("aria-pressed", other === card ? "true" : "false");
        });
      });
    });
    function panelCard(index) {
      return document.querySelector(".robot-strip .robot-card[data-robot='" + index + "']");
    }
    function syncFromPanel() {
      var current = document.querySelector(".robot-strip .robot-card[aria-pressed='true']");
      if (!current) {
        return;
      }
      var index = current.getAttribute("data-robot");
      picks.forEach(function(card) {
        card.setAttribute("aria-pressed", card.getAttribute("data-robot-pick") === index ? "true" : "false");
      });
    }
    var opener = document.querySelector("[data-robot-more]");
    if (opener) {
      opener.addEventListener("click", syncFromPanel);
    }
    var confirmButton = box.querySelector("[data-modal-confirm]");
    if (confirmButton) {
      confirmButton.addEventListener("click", function() {
        var picked = picks.filter(function(card) {
          return card.getAttribute("aria-pressed") === "true";
        })[0];
        if (!picked) {
          return;
        }
        var target = panelCard(picked.getAttribute("data-robot-pick"));
        if (!target) {
          return;
        }
        target.click();
        if (target.scrollIntoView) {
          target.scrollIntoView({
            block: "nearest",
            inline: "center"
          });
        }
      });
    }
    var search = box.querySelector("[data-robot-search]");
    var empty = box.querySelector("[data-robot-empty]");
    if (search) {
      search.addEventListener("input", function() {
        var q = search.value.trim().toLowerCase();
        var shown = 0;
        picks.forEach(function(card) {
          var name = card.querySelector(".robot-id");
          var text = (name ? name.textContent : "").toLowerCase();
          var hit = !q || text.indexOf(q) >= 0;
          card.hidden = !hit;
          if (hit) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown > 0;
        }
      });
    }
  })();
  (function() {
    var scrims = Array.prototype.slice.call(document.querySelectorAll("[data-modal]"));
    if (!scrims.length) {
      return;
    }
    var app = document.querySelector(".app");
    var open = null;
    var lastFocus = null;
    var tick = null;
    function stopTimer() {
      if (tick) {
        window.clearInterval(tick);
        tick = null;
      }
    }
    function close() {
      if (!open) {
        return;
      }
      stopTimer();
      open.hidden = true;
      open = null;
      if (app) {
        app.inert = false;
      }
      var back = lastFocus;
      if (back && back.offsetParent === null) {
        var owner = back.closest ? back.closest("[data-status-menu]") : null;
        back = owner ? owner.querySelector("[data-menu-trigger]") : null;
      }
      if (back && back.focus) {
        back.focus();
      }
      lastFocus = null;
    }
    function confirm(scrim) {
      var button = scrim.querySelector("[data-modal-confirm]");
      var to = button ? button.getAttribute("data-modal-confirm") : "";
      var then = button ? button.getAttribute("data-modal-then") : null;
      close();
      if (then === "recall") {
        var recall = document.querySelector("[data-recall-button]");
        if (recall) {
          recall.disabled = true;
        }
        document.dispatchEvent(new CustomEvent("aprism:recall"));
      }
      if (then === "estop") {
        document.dispatchEvent(new CustomEvent("aprism:estop"));
      }
      if (then === "logout" || /login\.html$/.test(to || "")) {
        try {
          window.sessionStorage.setItem("aprism.running", runningRobots() > 0 ? "1" : "0");
        } catch (e) {}
      }
      if (then === "shift") {
        handOver(scrim);
      }
      if (to) {
        window.location.href = to;
      }
    }
    function startTimer(scrim) {
      var el = scrim.querySelector("[data-modal-timer]");
      if (!el) {
        return;
      }
      var left = Number(el.getAttribute("data-modal-timer")) || 0;
      el.textContent = left + "s";
      tick = window.setInterval(function() {
        left -= 1;
        el.textContent = (left > 0 ? left : 0) + "s";
        if (left <= 0) {
          confirm(scrim);
        }
      }, 1000);
    }
    function fillUser(scrim) {
      var slot = scrim.querySelector("[data-modal-user]");
      var chip = document.querySelector(".account-chip");
      if (!slot || !chip) {
        return;
      }
      var parts = Array.prototype.slice.call(chip.querySelectorAll(".t-label-2")).map(function(el) {
        return el.textContent.trim();
      }).filter(function(t) {
        return t && t !== "|";
      });
      if (parts.length) {
        slot.textContent = parts.join(" · ");
      }
    }
    function fillRobot(scrim) {
      var slot = scrim.querySelector("[data-modal-robot]");
      var chosen = document.querySelector(".robot-strip .robot-card[aria-pressed='true']");
      var label = chosen && chosen.querySelector(".robot-id");
      if (!slot || !label) {
        return;
      }
      var name = label.textContent.trim();
      slot.textContent = name;
      var particle = scrim.querySelector("[data-modal-particle]");
      if (particle) {
        var last = name.slice(-1);
        particle.textContent = "2459".indexOf(last) >= 0 ? "를" : "을";
      }
    }
    function show(name) {
      var scrim = scrims.filter(function(s) {
        return s.getAttribute("data-modal") === name;
      })[0];
      if (!scrim || open) {
        return;
      }
      lastFocus = document.activeElement;
      Array.prototype.slice.call(document.querySelectorAll("[data-menu-trigger]")).forEach(function(trigger) {
        if (trigger.getAttribute("aria-expanded") !== "true") {
          return;
        }
        trigger.setAttribute("aria-expanded", "false");
        var owner = trigger.closest("[data-status-menu]");
        var dropdown = owner && owner.querySelector(".dropdown-menu");
        if (dropdown) {
          dropdown.hidden = true;
        }
      });
      fillUser(scrim);
      fillRobot(scrim);
      scrim.hidden = false;
      open = scrim;
      if (app) {
        app.inert = true;
      }
      var first = scrim.querySelector("[data-modal-dismiss]:not(.modal-close)") || scrim.querySelector("[data-modal-dismiss]");
      if (first) {
        first.focus();
      }
      startTimer(scrim);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-modal-open]")).forEach(function(trigger) {
      trigger.addEventListener("click", function(event) {
        event.preventDefault();
        show(trigger.getAttribute("data-modal-open"));
      });
    });
    scrims.forEach(function(scrim) {
      Array.prototype.slice.call(scrim.querySelectorAll("[data-modal-dismiss]")).forEach(function(b) {
        b.addEventListener("click", close);
      });
      var go = scrim.querySelector("[data-modal-confirm]");
      if (go) {
        go.addEventListener("click", function() {
          confirm(scrim);
        });
      }
      scrim.addEventListener("click", function(event) {
        if (event.target === scrim) {
          close();
        }
      });
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && open) {
        close();
      }
    });
  })();
  var V4_RR = document.body.hasAttribute("data-route-rules");
  var ROBOTS = [ {
    mission: "지하 4층 " + (window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검"),
    current: "N₂ 배관 압력 점검",
    steps: [ {
      title: "FFU-01 토출구",
      state: "done",
      time: "09:12 – 09:31",
      duration: "19분",
      result: "safe",
      read: "온도 61.8℃ · 진동 1.9 mm/s"
    }, {
      title: "HEPA Filter 차압계",
      state: "done",
      time: "09:31 – 09:52",
      duration: "21분",
      result: "caution",
      read: "온도 74.2℃ · 진동 3.4 mm/s"
    }, {
      title: "냉각수 배관 밸브",
      state: "done",
      time: "09:52 – 10:08",
      duration: "16분",
      result: "safe",
      read: "온도 63.1℃ · 진동 2.0 mm/s"
    }, {
      title: "N₂ 배관 압력계",
      act: "N₂ 배관 압력계 판독",
      state: "running",
      time: "10:08 – 10:24",
      duration: "16분",
      measuring: "압력 · 정상 범위 대비 편차",
      desc: "압력계 표시값을 자동 판독하고, 정상 운전범위 대비 압력 편차와 변화 추이를 확인합니다."
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "복귀 중",
    steps: [ {
      title: "waypoint name",
      state: "done",
      time: "08:40 – 08:58",
      duration: "18분",
      result: "safe",
      read: "온도 58.9℃ · 진동 1.4 mm/s"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:58 – 09:14",
      duration: "16분",
      result: "danger",
      read: "온도 91.6℃ · 진동 6.8 mm/s"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:14 – 09:37",
      duration: "23분",
      result: "caution",
      read: "온도 72.0℃ · 진동 3.1 mm/s"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:37 – 09:55",
      duration: "18분",
      result: "safe",
      read: "온도 60.4℃ · 진동 1.7 mm/s"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:55 – 10:11",
      duration: "16분",
      result: "safe",
      read: "온도 59.2℃ · 진동 1.5 mm/s"
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "대기 중",
    steps: [ {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "지하 4층 " + (window.APRISM_MISSION ? APRISM_MISSION("m6") : "야간 순회 점검"),
    current: "순회 완료",
    steps: [ {
      title: "waypoint name",
      state: "done",
      time: "07:20 – 07:38",
      duration: "18분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "07:38 – 07:59",
      duration: "21분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "07:59 – 08:14",
      duration: "15분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:14 – 08:33",
      duration: "19분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:33 – 08:47",
      duration: "14분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:47 – 09:06",
      duration: "19분"
    } ]
  }, {
    mission: "지하 3층 " + (window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검"),
    current: "발전기 베어링 진동 측정",
    steps: [ {
      title: "waypoint name",
      state: "done",
      time: "07:28 – 07:41",
      duration: "13분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "07:41 – 07:55",
      duration: "14분",
      result: "caution",
      read: "온도 68.4℃ · 진동 2.1 mm/s"
    }, {
      title: "waypoint name",
      state: "done",
      time: "07:55 – 08:09",
      duration: "14분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:09 – 08:22",
      duration: "13분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:22 – 08:37",
      duration: "15분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:37 – 08:50",
      duration: "13분",
      result: "caution",
      read: "이상 점수 9.41 · PRPD 코로나"
    }, {
      title: "waypoint name",
      state: "done",
      time: "08:50 – 09:03",
      duration: "13분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:03 – 09:17",
      duration: "14분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:17 – 09:30",
      duration: "13분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:30 – 09:44",
      duration: "14분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:44 – 09:57",
      duration: "13분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:57 – 10:10",
      duration: "13분",
      result: "caution",
      read: "진동 4.8 mm/s · 상승 추세"
    }, {
      title: "waypoint name",
      state: "done",
      time: "10:10 – 10:22",
      duration: "12분",
      result: "caution",
      read: "토출 7.9 bar · 정상 8.2~8.8"
    }, {
      title: "Generator Bearing Vibration",
      act: "발전기 베어링 진동 측정",
      state: "running",
      time: "10:22 – 10:36",
      duration: "14분",
      desc: "진동 스펙트럼을 모으는 중. 기준 대비 과대치를 찾습니다."
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "충전 중",
    steps: [ {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "지하 3층 " + (window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회"),
    current: "순회 완료",
    steps: [ {
      title: "waypoint name",
      state: "done",
      time: "06:05 – 06:24",
      duration: "19분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "06:24 – 06:41",
      duration: "17분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "06:41 – 07:02",
      duration: "21분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "07:02 – 07:16",
      duration: "14분"
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "대기 중",
    steps: [ {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "지하 4층 " + (window.APRISM_MISSION ? APRISM_MISSION("m8") : "유틸리티 순회"),
    current: "순회 완료",
    steps: [ {
      title: "waypoint name",
      state: "done",
      time: "05:10 – 05:29",
      duration: "19분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "05:29 – 05:46",
      duration: "17분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "05:46 – 06:03",
      duration: "17분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "06:03 – 06:20",
      duration: "17분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "06:20 – 06:41",
      duration: "21분"
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "대기 중",
    steps: [ {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "지하 3층 " + (window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검"),
    current: V4_RR ? "WP-08 케미컬 공급 캐비닛 CDS-02 판독" : "WP-04 로 이동 중",
    steps: V4_RR ? [ {
      title: "FFU-01 토출구",
      state: "done",
      time: "09:12 – 09:31",
      duration: "19분",
      desc: "토출 풍속과 필터 표면 오염 여부를 확인한다."
    }, {
      title: "HEPA Filter 차압계",
      state: "done",
      time: "09:31 – 09:52",
      duration: "21분",
      desc: "차압계 표시값을 자동으로 판독하고, 교체 기준 대비 차압 상승을 확인한다."
    }, {
      title: "냉각수 배관 밸브",
      state: "done",
      time: "09:52 – 10:08",
      duration: "16분",
      desc: "밸브 개폐 상태와 연결부 누수 흔적을 확인한다."
    }, {
      title: "N₂ 배관 압력계",
      state: "done",
      time: "10:08 – 10:24",
      duration: "16분",
      desc: "압력계 표시값을 자동으로 판독하고, 정상 운전범위 대비 압력 편차와 변화 추이를 확인한다."
    }, {
      title: "CDA 메인 레귤레이터",
      state: "done",
      time: "10:24 – 10:37",
      duration: "13분",
      desc: "2차 압력 설정값과 실제 출력값의 차이를 확인한다."
    }, {
      title: "배기 덕트 댐퍼",
      state: "done",
      time: "10:37 – 10:55",
      duration: "18분",
      desc: "댐퍼 개도 위치와 덕트 연결부 이격 여부를 확인한다."
    }, {
      title: "PCW 공급 유량계",
      state: "done",
      time: "10:55 – 11:09",
      duration: "14분",
      desc: "유량계 표시값을 판독하고, 설정 유량 대비 편차를 확인한다."
    }, {
      title: "케미컬 공급 캐비닛 CDS-02",
      state: "running",
      time: "11:09 – 11:26",
      duration: "17분",
      desc: "누액 센서 상태와 배관 연결부 온도를 열화상으로 확인하고, 캐비닛 내부 온도 편차를 점검한다."
    }, {
      title: "FFU-02 토출구",
      state: "pending",
      time: "11:26 – 11:40",
      duration: "14분",
      desc: "토출 풍속과 필터 표면 오염 여부를 확인한다."
    }, {
      title: "클린룸 파티클 카운터",
      state: "pending",
      time: "11:40 – 11:55",
      duration: "15분",
      desc: "구역별 파티클 농도를 측정하고, 청정도 등급 기준 초과 여부를 확인한다."
    }, {
      title: "UPW 공급 밸브",
      state: "pending",
      time: "11:55 – 12:08",
      duration: "13분",
      desc: "밸브 개폐 상태와 비저항 표시값을 확인한다."
    }, {
      title: "스크러버 배기 압력계",
      state: "pending",
      time: "12:08 – 12:24",
      duration: "16분",
      desc: "배기 압력을 판독하고, 정상 범위 대비 음압 유지 여부를 확인한다."
    }, {
      title: "가스 캐비닛 GC-03",
      state: "pending",
      time: "12:24 – 12:41",
      duration: "17분",
      desc: "가스 누출 감지기 상태와 실린더 압력 잔량을 확인한다."
    }, {
      title: "항온항습기 AHU-01",
      state: "pending",
      time: "12:41 – 12:59",
      duration: "18분",
      desc: "공급 온도와 습도가 설정값을 유지하는지 확인한다."
    }, {
      title: "진공 펌프 VP-04",
      state: "pending",
      time: "12:59 – 13:13",
      duration: "14분",
      desc: "펌프 표면 온도와 이상 진동 여부를 확인한다."
    }, {
      title: "분전반 MCC-02",
      state: "pending",
      time: "13:13 – 13:30",
      duration: "17분",
      desc: "차단기 단자부 발열을 열화상으로 확인한다."
    }, {
      title: "비상 샤워기",
      state: "pending",
      time: "13:30 – 13:39",
      duration: "9분",
      desc: "주변 적치물과 접근 동선 확보 상태를 확인한다."
    }, {
      title: "소화 설비 감지기",
      state: "pending",
      time: "13:39 – 13:52",
      duration: "13분",
      desc: "감지기 표시등 상태와 외관 손상 여부를 확인한다."
    }, {
      title: "FFU-03 토출구",
      state: "pending",
      time: "13:52 – 14:06",
      duration: "14분",
      desc: "토출 풍속과 필터 표면 오염 여부를 확인한다."
    }, {
      title: "도킹 스테이션 복귀",
      state: "pending",
      time: "14:06 – 14:15",
      duration: "9분",
      desc: "충전 위치로 복귀하고 점검 결과를 업로드한다."
    } ] : [ {
      title: "waypoint name",
      state: "done",
      time: "09:40 – 09:58",
      duration: "18분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "09:58 – 10:12",
      duration: "14분"
    }, {
      title: "waypoint name",
      state: "done",
      time: "10:12 – 10:29",
      duration: "17분"
    }, {
      title: "Switchgear Room Thermal Scan",
      act: "배전반 발열 스캔",
      state: "pending",
      desc: "배전반 발열을 훑습니다. 기준보다 높은 지점을 표시합니다."
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  }, {
    mission: "배정된 미션 없음",
    current: "충전 중",
    steps: [ {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    }, {
      title: "waypoint name",
      state: "pending"
    } ]
  } ];
  if (document.body.classList.contains("v2-2")) {
    ROBOTS.forEach(function(r) {
      if (r.mission) {
        r.mission = r.mission.replace(/^지하\s*\d+층\s+/, "");
      }
    });
    window.APRISM_MISSION_FLOORS = {
      [window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검"]: [ "B4" ],
      [window.APRISM_MISSION ? APRISM_MISSION("m6") : "야간 순회 점검"]: [ "B4" ],
      [window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검"]: [ "B3", "B4" ],
      [window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회"]: [ "B3" ],
      [window.APRISM_MISSION ? APRISM_MISSION("m8") : "유틸리티 순회"]: [ "B4" ],
      [window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검"]: [ "B3" ]
    };
    window.APRISM_ROBOT_FLOORS = [ "B4", "B4", "B4", "B4", "B4", "B4", "B3", "B3", "B4", "B3", "B3", "B3" ];
  }
  if (document.body.classList.contains("ver-6")) {
    ROBOTS[2].mission = window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검";
    ROBOTS[7].mission = window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검";
    if (window.APRISM_MISSION_FLOORS) {
      window.APRISM_MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검"] = [ "B4" ];
      window.APRISM_MISSION_FLOORS[window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검"] = [ "B3" ];
    }
  }
  window.APRISM_ROBOT_MISSIONS = ROBOTS.map(function(r) {
    return r.mission && r.mission !== "배정된 미션 없음" ? r.mission : null;
  });
  var WP_TOTAL = 20;
  if (V4_RR) {
    try {
      if (localStorage.getItem("rr-wp-total") === "60") {
        WP_TOTAL = 60;
      }
    } catch (e) {}
  }
  var WP_SPANS = [ 17, 14, 21, 16, 19, 15, 18, 22, 13, 20 ];
  function clockAt(mins) {
    mins = (mins % 1440 + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function padSteps(steps, total) {
    var out = steps.slice();
    var last = out[out.length - 1];
    var grow = last && last.state === "done" ? "done" : "pending";
    var clock = 0;
    if (grow === "done" && last.time) {
      var end = last.time.split("–")[1].trim().split(":");
      clock = +end[0] * 60 + +end[1];
    }
    for (var i = 0; out.length < total; i += 1) {
      if (grow === "pending") {
        out.push({
          title: "waypoint name",
          state: "pending"
        });
        continue;
      }
      var span = WP_SPANS[i % WP_SPANS.length];
      out.push({
        title: "waypoint name",
        state: "done",
        time: clockAt(clock) + " – " + clockAt(clock + span),
        duration: span + "분"
      });
      clock += span;
    }
    return out;
  }
  if (document.body.classList.contains("ver-5")) {
    var r01 = ROBOTS[0];
    r01.current = "WP-08 로 이동 중";
    r01.steps = r01.steps.slice(0, 3).concat([ {
      title: "N₂ 배관 압력계",
      state: "done",
      time: "10:11 – 10:13",
      duration: "2분",
      read: "압력 0.86 MPa"
    }, {
      title: "냉각 펌프 P-2",
      state: "done",
      time: "10:13 – 10:15",
      duration: "2분",
      read: "이상 점수 20.4 · 최고 48.6℃"
    }, {
      title: "수배전반 MCC-1",
      state: "done",
      time: "10:15 – 10:16",
      duration: "1분",
      read: "CH1 이상 점수 9.05"
    }, {
      title: "고소 작업 발판",
      state: "done",
      time: "10:16 – 10:18",
      duration: "2분",
      read: "안전벨트 미착용 1명"
    }, {
      title: "냉각수 열교환기 HX-1",
      act: "열교환기 출구 온도 측정",
      state: "running"
    } ]);
    r01.steps[2].time = "09:52 – 10:11";
    r01.steps[2].duration = "19분";
    r01.steps[0].read = "온도 29.8℃ · 이상음향 8.2";
    r01.steps[0].result = "safe";
    r01.steps[1].read = "온도 31.4℃ · 압력 0.71 MPa";
    r01.steps[1].result = "safe";
    r01.steps[2].read = "누출 의심도 62% · 온도 30.2℃";
    r01.steps[2].result = "caution";
  }
  ROBOTS.forEach(function(robot) {
    robot.steps = padSteps(robot.steps, WP_TOTAL).slice(0, WP_TOTAL);
  });
  var DETAILS = [ {
    where: "터빈 2 / Unit 01 · SPOT-DD-0206 · 192.168.10.59",
    dbm: -47,
    last: "10:24:02 (방금)",
    odom: "X 41.2 / Y 18.6",
    dock: "DOCK_Station_01",
    events: [ {
      text: "터빈2 순회 미션 시작",
      time: "10:04"
    }, {
      text: "Spiral Casing 판독 완료",
      time: "09:52"
    }, {
      text: "도킹 해제 · 자율주행 전환",
      time: "09:12"
    } ]
  }, {
    where: "터빈 2 / Unit 03 · SPOT-DD-0209 · 192.168.10.62",
    dbm: -78,
    last: "10:22:41 (2분 전)",
    odom: "X 12.8 / Y 44.1",
    dock: "DOCK_Station_02",
    notice: {
      title: "통신 불안정",
      desc: "RSSI −78dBm. 10:18부터 3회 재접속했습니다. 통신을 점검하기 전에는 새 미션을 배정할 수 없습니다."
    },
    events: [ {
      text: "재접속 3회 실패 · RSSI −78",
      time: "10:22",
      tone: "warning"
    }, {
      text: "신호 약함 감지 · 미션 일시정지",
      time: "10:18",
      tone: "warning"
    }, {
      text: "터빈2 순회 미션 시작",
      time: "10:04"
    } ]
  }, {
    where: "터빈 3 / Unit 02 · SPOT-DD-0211 · 192.168.10.64",
    dbm: -58,
    last: "10:23:19 (1분 전)",
    odom: "X 63.5 / Y 07.4",
    dock: "DOCK_Station_02",
    events: [ {
      text: "충전 시작 · 35%",
      time: "10:11"
    }, {
      text: "도킹 완료",
      time: "10:09"
    } ]
  }, {
    where: "터빈 1 / Unit 04 · SPOT-DD-0203 · 192.168.10.55",
    dbm: -51,
    last: "10:23:47 (1분 전)",
    odom: "X 08.1 / Y 22.9",
    dock: "DOCK_Station_01",
    events: [ {
      text: "순회 6구간 완료 · 이상 없음",
      time: "09:06"
    }, {
      text: "터빈1 순회 미션 시작",
      time: "07:20"
    } ]
  }, {
    where: "터빈 3 / Unit 01 · SPOT-DD-0214 · 192.168.10.67",
    dbm: -61,
    last: "10:24:05 (방금)",
    odom: "X 27.6 / Y 51.3",
    dock: "DOCK_Station_03",
    events: [ {
      text: "Generator Bearing 진동 수집 중",
      time: "10:17"
    }, {
      text: "터빈3 순회 미션 시작",
      time: "10:02"
    } ]
  }, {
    where: "터빈 4 / Unit 02 · SPOT-DD-0216 · 192.168.10.69",
    dbm: -74,
    last: "10:21:58 (3분 전)",
    odom: "X 55.0 / Y 33.7",
    dock: "DOCK_Station_03",
    notice: {
      title: "배터리 부족",
      desc: "잔량 8%. 충전이 끝날 때까지 미션을 배정할 수 없습니다."
    },
    events: [ {
      text: "저전압 경고 · 8%",
      time: "10:12",
      tone: "warning"
    }, {
      text: "충전 시작",
      time: "10:10"
    }, {
      text: "긴급 복귀 · 도킹",
      time: "10:07"
    } ]
  }, {
    where: "터빈 1 / Unit 02 · SPOT-DD-0201 · 192.168.10.53",
    dbm: -49,
    last: "10:23:52 (방금)",
    odom: "X 03.4 / Y 11.2",
    dock: "DOCK_Station_01",
    events: [ {
      text: "충전 96% · 대기 전환",
      time: "09:41"
    }, {
      text: "순회 4구간 완료",
      time: "07:16"
    } ]
  }, {
    where: "터빈 2 / Unit 05 · SPOT-DD-0210 · 192.168.10.63",
    dbm: -63,
    last: "10:23:30 (1분 전)",
    odom: "X 38.9 / Y 26.5",
    dock: "DOCK_Station_02",
    events: [ {
      text: "미션 배정 대기",
      time: "10:15"
    }, {
      text: "자가 점검 통과",
      time: "10:13"
    } ]
  }, {
    where: "터빈 3 / Unit 04 · SPOT-DD-0215 · 192.168.10.68",
    dbm: -53,
    last: "10:24:00 (방금)",
    odom: "X 71.2 / Y 48.0",
    dock: "DOCK_Station_03",
    events: [ {
      text: "순회 5구간 완료 · 이상 없음",
      time: "06:03"
    }, {
      text: "터빈3 순회 미션 시작",
      time: "05:10"
    } ]
  }, {
    where: "터빈 4 / Unit 05 · SPOT-DD-0218 · 192.168.10.71",
    dbm: null,
    last: "09:58:12 (26분 전)",
    odom: "X 84.7 / Y 19.3",
    dock: "DOCK_Station_04",
    events: [ {
      text: "연결 끊김 · 응답 없음",
      time: "09:58",
      tone: "critical"
    }, {
      text: "재접속 5회 실패",
      time: "09:56",
      tone: "warning"
    }, {
      text: "신호 약함 감지",
      time: "09:47",
      tone: "warning"
    } ]
  }, {
    where: "터빈 1 / Unit 01 · SPOT-DD-0200 · 192.168.10.52",
    dbm: -45,
    last: "10:24:07 (방금)",
    odom: "X 19.5 / Y 05.8",
    dock: "DOCK_Station_01",
    events: [ {
      text: "Switchgear Room 열화상 촬영 중",
      time: "10:19"
    }, {
      text: "터빈1 순회 미션 시작",
      time: "10:06"
    } ]
  }, {
    where: "터빈 4 / Unit 01 · SPOT-DD-0217 · 192.168.10.70",
    dbm: -60,
    last: "10:23:41 (1분 전)",
    odom: "X 47.3 / Y 60.1",
    dock: "DOCK_Station_04",
    events: [ {
      text: "충전 시작 · 55%",
      time: "10:20"
    }, {
      text: "도킹 완료",
      time: "10:18"
    } ]
  } ];
  var STATE = {
    done: {
      klass: "is-done",
      icon: "var(--ic-check-circle)"
    },
    running: {
      klass: "is-running",
      icon: "var(--ic-play-circle)"
    },
    pending: {
      klass: "is-pending",
      icon: null
    }
  };
  function el(tag, klass, text) {
    var node = document.createElement(tag);
    if (klass) {
      node.className = klass;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }
  var RAIL_DASH = 8;
  function phaseRails(timeline) {
    var lines = Array.prototype.slice.call(timeline.querySelectorAll(".is-running .rail-line, .is-pending .rail-line"));
    if (!lines.length) {
      return;
    }
    var base = timeline.getBoundingClientRect().top - timeline.scrollTop;
    var origin = null;
    lines.forEach(function(line) {
      var y = line.getBoundingClientRect().top - base;
      if (origin === null) {
        origin = y;
      }
      var shift = (y - origin) % RAIL_DASH;
      var pos = "0 " + (-shift).toFixed(2) + "px";
      line.style.maskPosition = pos;
      line.style.webkitMaskPosition = pos;
    });
  }
  var WP_STATE = {
    done: "completed",
    running: "current",
    pending: "upcoming"
  };
  function wpId(index) {
    return "WP-" + (index + 1 < 10 ? "0" : "") + (index + 1);
  }
  function minutesOf(text) {
    var m = String(text || "").match(/([0-9]+)\s*분/);
    return m ? Number(m[1]) : 0;
  }
  function nowMinutes() {
    var clock = document.querySelector(".utc-clock .num");
    var m = clock && clock.textContent.match(/[T ]([0-9]{2}):([0-9]{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  function timeLeft(robot) {
    var known = robot.steps.map(function(s) {
      return minutesOf(s.duration);
    }).filter(function(n) {
      return n > 0;
    });
    if (!known.length) {
      return "—";
    }
    var avg = Math.round(known.reduce(function(a, b) {
      return a + b;
    }, 0) / known.length);
    var left = 0;
    robot.steps.forEach(function(s) {
      if (s.state === "done") {
        return;
      }
      left += minutesOf(s.duration) || avg;
    });
    if (!left) {
      return "모든 지점 완료";
    }
    var span = left >= 60 ? "약 " + Math.floor(left / 60) + "시간 " + (left % 60 ? left % 60 + "분 " : "") + "남음" : "약 " + left + "분 남음";
    var now = nowMinutes();
    if (now === null) {
      return span;
    }
    var end = (now + left) % (24 * 60);
    var hh = ("0" + Math.floor(end / 60)).slice(-2);
    var mm = ("0" + end % 60).slice(-2);
    if (document.body.classList.contains("ver-7")) {
      window.APRISM_ETA_MIN = end;
      return document.documentElement.lang === "en" ? "Est. finish ~" + hh + ":" + mm : "약 " + hh + ":" + mm + " 종료 예정";
    }
    return span + " · " + hh + ":" + mm + " 종료 예상";
  }
  function railToRunning(timeline) {
    requestAnimationFrame(function() {
      var item = timeline.querySelector(".timeline-item.is-running");
      if (!item) {
        return;
      }
      var box = item.parentNode;
      while (box && box !== document.body) {
        var oy = getComputedStyle(box).overflowY;
        if ((oy === "auto" || oy === "scroll") && box.scrollHeight > box.clientHeight) {
          break;
        }
        box = box.parentNode;
      }
      if (!box || box === document.body) {
        return;
      }
      var prev = item.previousElementSibling;
      while (prev && !(prev.matches && prev.matches(".timeline-item:not(.rr-hide)"))) {
        prev = prev.previousElementSibling;
      }
      var top = (prev || item).getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - (parseFloat(getComputedStyle(box).paddingTop) || 0);
      box.scrollTop = Math.max(0, top);
    });
  }
  function stepNode(step, index) {
    var meta = STATE[step.state];
    var capsule = el("span", "rail-capsule");
    if (meta.icon) {
      capsule.appendChild(el("span", "rail-stub"));
      var mark = el("span", "rail-mark");
      mark.appendChild(el("span", "rail-dot"));
      capsule.appendChild(mark);
    }
    capsule.appendChild(el("span", "rail-line"));
    var metaRow = el("div", "step-meta-row");
    metaRow.appendChild(el("span", "step-no t-label-1" + (document.body.classList.contains("ver-7") ? " ds-wp" : ""), String(index + 1)));
    var times = el("span", "step-times");
    if (step.time) {
      times.appendChild(el("span", "t-caption step-time num", step.time));
      times.appendChild(el("span", "t-caption step-duration", step.duration));
    }
    metaRow.appendChild(times);
    var titleRow = el("div", "step-title-row");
    titleRow.appendChild(el("span", "t-label-1 step-title", step.title));
    var head = el("div", "step-head");
    var card = el("div", "step-card ds-card is-step");
    var v22 = document.body.classList.contains("v2-2");
    if (v22) {
      titleRow.insertBefore(metaRow.firstChild, titleRow.firstChild);
      head.appendChild(titleRow);
      card.appendChild(head);
      if (step.desc) {
        card.appendChild(el("p", "t-caption step-desc", step.desc));
      }
      if (step.time) {
        times.className = "step-times step-times-foot";
        card.appendChild(times);
      }
    } else {
      head.appendChild(metaRow);
      head.appendChild(titleRow);
      card.appendChild(head);
      if (step.desc) {
        card.appendChild(el("p", "t-caption step-desc", step.desc));
      }
    }
    var wrap = el("div", "step-wrap");
    wrap.appendChild(card);
    var kind = WP_STATE[step.state];
    var item = el("article", "timeline-item " + meta.klass);
    item.setAttribute("data-waypoint", wpId(index));
    item.setAttribute("data-wp-state", kind);
    if (step.time) {
      item.setAttribute("data-wp-time", step.time + (step.duration ? " · " + step.duration : ""));
    }
    if (kind === "completed") {
      item.setAttribute("data-wp-result", step.result || "safe");
      item.setAttribute("data-wp-read", step.read || "측정 6항목 · 기준 이내");
    } else if (kind === "current") {
      item.setAttribute("data-wp-read", step.measuring || "측정 항목 확인 중");
    }
    item.setAttribute("tabindex", "0");
    item.appendChild(capsule);
    item.appendChild(wrap);
    return item;
  }
  (function() {
    var timeline = document.querySelector("[data-timeline]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-robot]"));
    if (!timeline || !cards.length) {
      return;
    }
    var missionName = document.querySelector("[data-mission-name]");
    var title = document.querySelector("[data-progress-title]");
    var percent = document.querySelector("[data-progress-percent]");
    var track = document.querySelector("[data-progress-track]");
    var countSlot = document.querySelector("[data-progress-count]");
    var leftSlot = document.querySelector("[data-progress-left]");
    function render(index) {
      var robot = ROBOTS[index];
      if (!robot) {
        return;
      }
      var total = robot.steps.length;
      var done = robot.steps.filter(function(s) {
        return s.state === "done";
      }).length;
      var live = robot.steps.filter(function(s) {
        return s.state === "running";
      })[0];
      if (missionName) {
        missionName.textContent = robot.mission || robot.current;
      }
      if (title) {
        title.textContent = live && (live.act || live.title) || robot.current;
      }
      percent.textContent = Math.round(done / total * 100) + "%";
      if (leftSlot) {
        leftSlot.textContent = timeLeft(robot);
      }
      track.style.setProperty("--progress", (total ? done / total * 100 : 0) + "%");
      if (countSlot) {
        countSlot.textContent = done + "/" + total;
      }
      track.setAttribute("aria-label", total + "단계 중 " + done + "단계 완료");
      timeline.textContent = "";
      robot.steps.forEach(function(step, i) {
        timeline.appendChild(stepNode(step, i));
      });
      timeline.scrollTop = 0;
      if (document.body.classList.contains("ver-7")) {
        railToRunning(timeline);
      }
      phaseRails(timeline);
      var live = robot.steps.reduce(function(found, step, i) {
        return found || (step.state === "running" ? wpId(i) : null);
      }, null);
      timeline.setAttribute("data-current-waypoint", live || "");
      timeline.removeAttribute("data-selected-waypoint");
      paintPicked(null);
      document.dispatchEvent(new CustomEvent("aprism:mission", {
        detail: {
          current: live
        }
      }));
    }
    function paintPicked(id) {
      Array.prototype.forEach.call(timeline.querySelectorAll("[data-waypoint]"), function(item) {
        var on = id && item.getAttribute("data-waypoint") === id;
        item.classList.toggle("is-selected", !!on);
        if (on) {
          item.setAttribute("data-wp-selected", "true");
        } else {
          item.removeAttribute("data-wp-selected");
        }
      });
    }
    function pickWaypoint(id, from) {
      var same = timeline.getAttribute("data-selected-waypoint") === id;
      var next = same && from === "panel" ? null : id;
      if (next) {
        timeline.setAttribute("data-selected-waypoint", next);
      } else {
        timeline.removeAttribute("data-selected-waypoint");
      }
      paintPicked(next);
      if (next && from === "map") {
        var card = timeline.querySelector("[data-waypoint='" + next + "']");
        if (card && card.scrollIntoView) {
          card.scrollIntoView({
            block: "nearest",
            behavior: "smooth"
          });
        }
      }
      if (from !== "map") {
        document.dispatchEvent(new CustomEvent("aprism:waypoint", {
          detail: {
            id: next,
            from: "panel"
          }
        }));
      }
    }
    timeline.addEventListener("click", function(event) {
      var item = event.target.closest("[data-waypoint]");
      if (!item) {
        return;
      }
      pickWaypoint(item.getAttribute("data-waypoint"), "panel");
    });
    timeline.addEventListener("keydown", function(event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      var item = event.target.closest && event.target.closest("[data-waypoint]");
      if (!item) {
        return;
      }
      event.preventDefault();
      pickWaypoint(item.getAttribute("data-waypoint"), "panel");
    });
    document.addEventListener("aprism:waypoint", function(event) {
      if (!event.detail || event.detail.from !== "map") {
        return;
      }
      pickWaypoint(event.detail.id, "map");
    });
    if (window.ResizeObserver) {
      new ResizeObserver(function() {
        phaseRails(timeline);
      }).observe(timeline);
    }
    cards.forEach(function(card) {
      card.addEventListener("click", function() {
        if (card.hasAttribute("data-robot-offline")) {
          return;
        }
        cards.forEach(function(other) {
          other.setAttribute("aria-pressed", other === card ? "true" : "false");
        });
        render(Number(card.getAttribute("data-robot")));
      });
    });
    var initial = cards.filter(function(c) {
      return c.getAttribute("aria-pressed") === "true";
    })[0] || cards[0];
    initial.setAttribute("aria-pressed", "true");
    render(Number(initial.getAttribute("data-robot")));
  })();
  (function() {
    var drawer = document.querySelector("[data-robot-drawer]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".robot-strip [data-robot]"));
    if (!drawer || !cards.length) {
      return;
    }
    var slots = {};
    Array.prototype.slice.call(drawer.querySelectorAll("[data-rd]")).forEach(function(node) {
      slots[node.getAttribute("data-rd")] = node;
    });
    var nameSlot = drawer.querySelector("[data-rd-name]");
    var whereSlot = drawer.querySelector("[data-rd-where]");
    var notice = drawer.querySelector("[data-rd-notice]");
    var noticeTitle = drawer.querySelector("[data-rd-notice-title]");
    var noticeDesc = drawer.querySelector("[data-rd-notice-desc]");
    var eventList = drawer.querySelector("[data-rd-events]");
    var closeButton = drawer.querySelector("[data-rd-close]");
    var current = null;
    function card(index) {
      return document.querySelector(".robot-strip .robot-card[data-robot='" + index + "']");
    }
    function text(node) {
      return node ? node.textContent.trim() : "";
    }
    var STATES = {
      "수행중": "미션 수행 중",
      "수행 중": "미션 수행 중",
      "대기": "대기 중",
      "완료": "순회 완료",
      "끊김": "연결 끊김"
    };
    var SIGNALS = {
      Strong: "강함",
      Good: "보통",
      Weak: "약함",
      "끊김": "끊김"
    };
    function readCard(node) {
      var rows = node.querySelectorAll(".robot-row");
      var badge = text(node.querySelector(".badge"));
      var battery = rows[1] ? rows[1].querySelector(".battery") : null;
      var percent = text(rows[1] ? rows[1].querySelector(".num") : null);
      var level = text(rows[2] ? rows[2].querySelector(".t-caption:last-child") : null);
      var charging = !!(battery && battery.classList.contains("is-charging"));
      var number = parseInt(percent, 10);
      return {
        state: STATES[badge] || badge,
        battery: percent + (charging ? " · 충전 중" : number <= 30 ? " · 충전 필요" : ""),
        signal: SIGNALS[level] || level
      };
    }
    var clock = 10 * 60 + 24;
    function nextTime() {
      clock += 1;
      var h = Math.floor(clock / 60) % 24;
      var m = clock % 60;
      return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    }
    function fill(index) {
      var node = card(index);
      var detail = DETAILS[index] || {};
      var robot = ROBOTS[index] || {};
      if (!node) {
        return;
      }
      var read = readCard(node);
      nameSlot.textContent = text(node.querySelector(".robot-id"));
      whereSlot.textContent = detail.where || "";
      slots.state.textContent = read.state;
      slots.mission.textContent = read.state === "미션 수행 중" ? robot.current || "—" : "—";
      slots.battery.textContent = read.battery;
      slots.last.textContent = detail.last || "—";
      slots.signal.textContent = read.signal + (detail.dbm === null || detail.dbm === undefined ? "" : " · −" + Math.abs(detail.dbm) + "dBm");
      slots.odom.textContent = detail.odom || "—";
      slots.dock.textContent = detail.dock || "—";
      if (detail.notice) {
        notice.hidden = false;
        notice.classList.toggle("is-critical", detail.notice.tone === "critical");
        notice.classList.toggle("is-warning", detail.notice.tone !== "critical");
        noticeTitle.textContent = detail.notice.title;
        noticeDesc.textContent = detail.notice.desc;
      } else {
        notice.hidden = true;
      }
      eventList.textContent = "";
      (detail.events || []).slice().sort(function(a, b) {
        return a.time < b.time ? 1 : a.time > b.time ? -1 : 0;
      }).forEach(function(item) {
        var row = el("li", "rd-event" + (item.tone ? " is-" + item.tone : ""));
        row.appendChild(el("span", "t-caption rd-event-text", item.text));
        row.appendChild(el("span", "t-caption num rd-event-time", item.time));
        eventList.appendChild(row);
      });
    }
    function open(index) {
      var node = card(index);
      if (!node || node.hasAttribute("data-robot-offline")) {
        return;
      }
      fill(index);
      drawer.hidden = false;
      current = index;
      if (closeButton) {
        closeButton.focus();
      }
    }
    function close() {
      if (drawer.hidden) {
        return;
      }
      var back = current === null ? null : card(current);
      drawer.hidden = true;
      current = null;
      if (back && back.focus) {
        back.focus();
      }
    }
    cards.forEach(function(node) {
      var index = Number(node.getAttribute("data-robot"));
      node.addEventListener("dblclick", function(event) {
        event.preventDefault();
        open(index);
      });
      node.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        open(index);
      });
    });
    if (closeButton) {
      closeButton.addEventListener("click", close);
    }
    document.addEventListener("keydown", function(event) {
      if (event.key !== "Escape" || drawer.hidden) {
        return;
      }
      if (document.querySelector("[data-modal]:not([hidden])")) {
        return;
      }
      close();
    });
    function raise(next, item) {
      var chosen = document.querySelector(".robot-strip .robot-card[aria-pressed='true']");
      if (!chosen) {
        return;
      }
      var index = Number(chosen.getAttribute("data-robot"));
      var detail = DETAILS[index];
      if (!detail) {
        return;
      }
      detail.notice = next;
      detail.events = (detail.events || []).concat([ {
        text: item.text,
        time: nextTime(),
        tone: item.tone
      } ]);
      if (current === index) {
        fill(index);
      }
    }
    document.addEventListener("aprism:estop", function() {
      raise({
        tone: "critical",
        title: "비상정지 발동",
        desc: "모터 전원이 차단되었습니다. 자세·안전 점검을 마친 뒤에 해제할 수 있습니다."
      }, {
        text: "비상정지 발동 · 모터 전원 차단",
        tone: "critical"
      });
    });
    document.addEventListener("aprism:recall", function() {
      raise({
        tone: "warning",
        title: "자동복귀 중",
        desc: "진행 중이던 미션을 중단하고 도킹 스테이션으로 복귀합니다. 복귀가 끝나면 대기 상태가 됩니다."
      }, {
        text: "자동복귀 시작 · 도킹 스테이션 이동",
        tone: "warning"
      });
    });
  })();
  (function() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-goto]"));
    buttons.forEach(function(btn) {
      btn.addEventListener("click", function() {
        if (btn.disabled) {
          return;
        }
        window.location.href = btn.getAttribute("data-goto");
      });
    });
  })();
  (function() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.check-row[role="checkbox"]')).filter(function(row) {
      return !row.closest("[data-mp-plan]");
    });
    var countEl = document.querySelector(".check-group-head .count");
    function refreshCount() {
      if (!countEl) {
        return;
      }
      var n = rows.filter(function(row) {
        return row.getAttribute("aria-checked") === "true";
      }).length;
      countEl.textContent = n + "개 선택";
    }
    rows.forEach(function(row) {
      function toggle() {
        row.setAttribute("aria-checked", row.getAttribute("aria-checked") === "true" ? "false" : "true");
        refreshCount();
      }
      row.addEventListener("click", toggle);
      row.addEventListener("keydown", function(event) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          toggle();
        }
      });
    });
    Array.prototype.slice.call(document.querySelectorAll('.switch[role="switch"]')).forEach(function(sw) {
      sw.addEventListener("click", function() {
        sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
      });
    });
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-select]"));
    function closeSelects(except) {
      selects.forEach(function(sel) {
        if (sel === except) {
          return;
        }
        sel.removeAttribute("data-open");
        sel.querySelector("[data-select-trigger]").setAttribute("aria-expanded", "false");
        sel.querySelector(".field-menu").hidden = true;
      });
    }
    selects.forEach(function(sel) {
      var trigger = sel.querySelector("[data-select-trigger]");
      var menu = sel.querySelector(".field-menu");
      var valueEl = sel.querySelector("[data-select-value]");
      var options = Array.prototype.slice.call(sel.querySelectorAll(".field-option"));
      trigger.addEventListener("click", function(event) {
        event.stopPropagation();
        var open = sel.hasAttribute("data-open");
        closeSelects(sel);
        if (open) {
          sel.removeAttribute("data-open");
          trigger.setAttribute("aria-expanded", "false");
          menu.hidden = true;
        } else {
          sel.setAttribute("data-open", "");
          trigger.setAttribute("aria-expanded", "true");
          menu.hidden = false;
        }
      });
      options.forEach(function(opt) {
        opt.addEventListener("click", function() {
          valueEl.textContent = opt.textContent;
          options.forEach(function(o) {
            o.removeAttribute("aria-selected");
          });
          opt.setAttribute("aria-selected", "true");
          sel.removeAttribute("data-open");
          trigger.setAttribute("aria-expanded", "false");
          menu.hidden = true;
          document.dispatchEvent(new CustomEvent("aprism:select", {
            detail: {
              select: sel,
              value: opt.textContent.trim()
            }
          }));
        });
      });
      sel.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && sel.hasAttribute("data-open")) {
          sel.removeAttribute("data-open");
          trigger.setAttribute("aria-expanded", "false");
          menu.hidden = true;
          trigger.focus();
        }
      });
    });
    if (selects.length) {
      document.addEventListener("click", function(event) {
        var inside = selects.some(function(sel) {
          return sel.contains(event.target);
        });
        if (!inside) {
          closeSelects(null);
        }
      });
    }
  })();
  (function() {
    var list = document.querySelector("[data-precheck]");
    if (!list) {
      return;
    }
    var pending = Array.prototype.slice.call(list.querySelectorAll("[data-precheck-row]"));
    var tag = list.querySelector("[data-precheck-tag]");
    var startBtn = document.querySelector(".mp-actions [data-sian-go='monitor']");
    var STEP = parseFloat(getComputedStyle(list).getPropertyValue("--precheck-step")) || 1400;
    function complete(row) {
      row.classList.remove("is-running", "is-active", "is-pending");
      row.classList.add("is-done");
      var icon = row.querySelector(".i");
      if (icon) {
        icon.style.setProperty("--i", "var(--ic-check-circle)");
      }
      var meta = row.querySelector(".meta");
      if (meta) {
        meta.textContent = row.getAttribute("data-done-meta") || "";
        meta.classList.remove("is-plain");
      }
    }
    function tick() {
      var next = pending.shift();
      if (!next) {
        if (tag) {
          tag.textContent = "완료";
          if (document.body.classList.contains("ver-7") && window.ds) {
            tag.className = "tag-running " + window.ds.statusCls("done");
          }
        }
        if (startBtn) {
          startBtn.disabled = false;
        }
        window.setTimeout(function() {
          window.location.href = document.body.getAttribute("data-monitor-href") || "dashboard-home.html";
        }, 1600);
        return;
      }
      complete(next);
      if (pending[0]) {
        pending[0].classList.remove("is-pending");
        pending[0].classList.add("is-running", "is-active");
        var m = pending[0].querySelector(".meta");
        if (m) {
          m.textContent = "확인중..";
        }
      }
      window.setTimeout(tick, STEP);
    }
    window.setTimeout(tick, STEP);
  })();
})();
