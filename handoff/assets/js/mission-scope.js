(function() {
  "use strict";
  var body = document.body;
  if (!body.hasAttribute("data-mission-scope")) {
    return;
  }
  var MISSIONS = window.APRISM_ROBOT_MISSIONS || [];
  var menuBox = document.querySelector("[data-scope-menu-box]");
  var trigger = document.querySelector("[data-scope-trigger]");
  var nameSlot = document.querySelector("[data-scope-name]");
  var menu = document.querySelector("[data-scope-menu]");
  var countSlot = document.querySelector("[data-scope-count]");
  var runSlot = document.querySelector("[data-scope-running]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".robot-strip .robot-card[data-robot]"));
  if (!trigger || !menu || !cards.length) {
    return;
  }
  var current = MISSIONS[0] || null;
  var asked = /[?&]mission=([^&#]+)/.exec(location.search);
  if (asked) {
    try {
      var want = decodeURIComponent(asked[1].replace(/\+/g, " ")).replace(/^지하\s*\d+층\s+/, "");
      if (MISSIONS.indexOf(want) >= 0) {
        current = want;
      }
    } catch (e) {}
  }
  var askedFloor = (/[?&]floor=(B\d+)/.exec(location.search) || [])[1] || null;
  var keep = (location.search.match(/[?&](theme|palette|delta|glow)=[\w-]+/g) || []).map(function(q) {
    return q.slice(1);
  }).join("&");
  if (keep) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-building-link]"), function(a) {
      a.setAttribute("href", a.getAttribute("href").split("?")[0] + "?" + keep);
    });
  }
  var levels = window.APRISM_ALERT_LEVELS || {};
  function missionOf(card) {
    return MISSIONS[Number(card.getAttribute("data-robot"))] || null;
  }
  function names() {
    var list = [];
    MISSIONS.forEach(function(m) {
      if (m && list.indexOf(m) < 0) {
        list.push(m);
      }
    });
    return list;
  }
  var MFLOORS = window.APRISM_MISSION_FLOORS || {};
  var RFLOORS = window.APRISM_ROBOT_FLOORS || [];
  function floorsOf(m) {
    return MFLOORS[m] || [];
  }
  function robotFloor(card) {
    return card ? RFLOORS[Number(card.getAttribute("data-robot"))] || null : null;
  }
  var GROUPS = [ [ "run", "수행중" ], [ "idle", "대기" ], [ "done", "완료" ] ];
  var doneNow = {};
  document.addEventListener("aprism:mission-state", function(event) {
    if (!document.body.classList.contains("ver-7") || !current) {
      return;
    }
    if (event.detail && event.detail.done) {
      doneNow[current] = true;
    } else {
      delete doneNow[current];
    }
    buildMenu();
  });
  function stateOf(m) {
    if (doneNow[m]) {
      return "done";
    }
    var mine = cards.filter(function(c) {
      return missionOf(c) === m;
    });
    function is(c, k) {
      var b = c.querySelector(".robot-lists .badge");
      return !!b && (b.getAttribute("data-rr-orig") || b.className).indexOf(k) >= 0;
    }
    if (mine.some(function(c) {
      return is(c, "badge-info");
    })) {
      return "run";
    }
    if (mine.length && mine.every(function(c) {
      return is(c, "badge-normal");
    })) {
      return "done";
    }
    return "idle";
  }
  function closeMenu() {
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }
  function robotsOf(m) {
    return cards.filter(function(c) {
      return missionOf(c) === m;
    }).map(function(c) {
      var n = Number(c.getAttribute("data-robot")) + 1;
      return (n < 10 ? "0" : "") + n;
    }).join(" · ");
  }
  function menuHead() {
    var head = document.createElement("div");
    head.className = "scope-head t-caption";
    head.setAttribute("aria-hidden", "true");
    [ "수행", "미션", "층", "로봇" ].forEach(function(t) {
      var c = document.createElement("span");
      c.textContent = t;
      head.appendChild(c);
    });
    return head;
  }
  function span(cls, text) {
    var n = document.createElement("span");
    if (cls) {
      n.className = cls;
    }
    if (text != null) {
      n.textContent = text;
    }
    return n;
  }
  function buildMenu() {
    menu.textContent = "";
    menu.appendChild(menuHead());
    GROUPS.forEach(function(g) {
      names().filter(function(m) {
        return stateOf(m) === g[0];
      }).forEach(function(m) {
        var item = document.createElement("button");
        item.type = "button";
        item.className = "menu-item scope-item is-" + g[0];
        item.setAttribute("role", "menuitemradio");
        item.setAttribute("aria-checked", m === current ? "true" : "false");
        var run = span("scope-run");
        run.setAttribute("data-run", g[0]);
        run.title = g[1];
        item.appendChild(run);
        var name = span("scope-name");
        name.appendChild(span("t-label-2", m));
        if (levels[m]) {
          var sev = span("i i-16 scope-sev");
          sev.setAttribute("data-sev", levels[m]);
          sev.style.setProperty("--i", "var(--ic-" + (levels[m] === "critical" ? "error" : "warning") + ")");
          sev.title = levels[m] === "critical" ? "위험 알림 있음" : "주의 알림 있음";
          name.appendChild(sev);
        }
        item.appendChild(name);
        var fl = span("scope-floors");
        floorsOf(m).forEach(function(f) {
          fl.appendChild(span("floor-tag num" + (document.body.classList.contains("ver-7") ? " ds-floor" : ""), f));
        });
        item.appendChild(fl);
        item.appendChild(span("scope-robots num", robotsOf(m)));
        item.setAttribute("aria-label", m + " · " + g[1] + " · " + floorsOf(m).join(" → ") + " · Robot " + robotsOf(m) + (levels[m] ? " · " + (levels[m] === "critical" ? "위험" : "주의") + " 알림" : ""));
        item.addEventListener("click", function() {
          closeMenu();
          apply(m, false);
        });
        menu.appendChild(item);
      });
    });
  }
  function markFloors(m, here) {
    var on = floorsOf(m);
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
      var id = btn.getAttribute("data-map-floor");
      var out = !document.body.classList.contains("ver-3") && on.length > 0 && on.indexOf(id) < 0;
      btn.disabled = out;
      btn.classList.toggle("is-out", out);
      btn.title = out ? "이 미션이 지나지 않는 층" : "";
      btn.classList.toggle("has-robot", id === here);
    });
  }
  function pressedCard() {
    return cards.filter(function(c) {
      return c.getAttribute("aria-pressed") === "true";
    })[0] || null;
  }
  function apply(m, keepRobot) {
    current = m;
    nameSlot.textContent = m || "배정된 미션 없음";
    var shown = cards.filter(function(card) {
      var on = missionOf(card) === m;
      card.hidden = !on;
      return on;
    });
    if (countSlot) {
      countSlot.textContent = shown.length + "대 배정";
    }
    Array.prototype.forEach.call(document.querySelectorAll(".rc-nav"), function(nav) {
      nav.hidden = shown.length < 2;
    });
    if (runSlot) {
      runSlot.textContent = shown.filter(function(c) {
        return c.querySelector(".badge-info");
      }).length + "대 수행중";
    }
    if (!keepRobot) {
      var pressed = cards.filter(function(c) {
        return c.getAttribute("aria-pressed") === "true";
      })[0];
      if (!pressed || pressed.hidden) {
        var first = shown.filter(function(c) {
          return !c.hasAttribute("data-robot-offline");
        })[0];
        if (first) {
          first.click();
        }
      }
    }
    var card = pressedCard();
    var here = card && !card.hidden ? robotFloor(card) : null;
    var floor = here || floorsOf(m)[0] || null;
    if (askedFloor && floorsOf(m).indexOf(askedFloor) >= 0) {
      floor = askedFloor;
    }
    askedFloor = null;
    markFloors(m, here);
    if (floor) {
      window.APRISM_FLOOR_WANT = floor;
    }
    var floorBtn = floor && document.querySelector("[data-map-floor='" + floor + "']");
    if (floorBtn && floorBtn.getAttribute("aria-pressed") !== "true") {
      floorBtn.click();
    }
    buildMenu();
    Array.prototype.forEach.call(document.querySelectorAll(".gnb-item[href^='./safety-v5.html'], .gnb-item[href^='./safety-v6.html']"), function(a) {
      var sf = document.body.classList.contains("ver-6") ? "./safety-v6.html" : "./safety-v5.html";
      a.href = m ? sf + "?mission=" + encodeURIComponent(m) : sf + "#all";
    });
    document.dispatchEvent(new CustomEvent("aprism:scope", {
      detail: {
        mission: m
      }
    }));
  }
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
  document.addEventListener("click", function(event) {
    var card = event.target.closest && event.target.closest(".robot-strip .robot-card[data-robot]");
    if (card && card.hidden) {
      apply(missionOf(card), true);
    }
  }, true);
  document.addEventListener("click", function(event) {
    var card = event.target.closest && event.target.closest(".robot-strip .robot-card[data-robot]");
    if (card) {
      window.setTimeout(function() {
        markFloors(current, robotFloor(pressedCard()));
      }, 0);
    }
  });
  document.addEventListener("aprism:robot-floor", function(event) {
    var f = event.detail && event.detail.floor;
    if (f) {
      markFloors(current, f);
    }
  });
  document.addEventListener("aprism:alert-levels", function(event) {
    levels = event.detail || {};
    buildMenu();
  });
  apply(current, false);
  window.APRISM_SCOPE_TO = function(m) {
    closeMenu();
    apply(m, false);
  };
})();
