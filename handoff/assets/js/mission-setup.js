(function() {
  "use strict";
  var plan = document.querySelector("[data-mp-plan]");
  if (!plan) {
    return;
  }
  var list = plan.querySelector("[data-mp-list]");
  var countEl = plan.querySelector("[data-mp-count]");
  var resetBtn = plan.querySelector("[data-mp-reset]");
  var timeEl = document.querySelector("[data-mp-time]");
  var wpEl = document.querySelector("[data-mp-wp]");
  var batState = document.querySelector("[data-mp-bat-state]");
  var batBar = document.querySelector("[data-mp-bat-bar]");
  var batNow = document.querySelector("[data-mp-bat-now]");
  var batNote = document.querySelector("[data-mp-bat-note]");
  var cta = document.querySelector("[data-mp-cta]");
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  var METER = 2;
  var SPEED = 0.5;
  var RESERVE = 20;
  var MOVE_RATE = 1.3;
  var INSP_RATE = 0.3;
  var NODES = {
    D: [ 21.75, 20 ],
    n7: [ 27, 20 ],
    "WP-01": [ 12.75, 20 ],
    "WP-02": [ 4, 20.25 ],
    n2: [ 1.75, 20.25 ],
    "WP-03": [ 1.75, 12.5 ],
    "WP-04": [ 1.75, 8.5 ]
  };
  var LINKS = [ [ "n7", "D" ], [ "D", "WP-01" ], [ "WP-01", "WP-02" ], [ "WP-02", "n2" ], [ "n2", "WP-03" ], [ "WP-03", "WP-04" ] ];
  var ADJ = {};
  LINKS.forEach(function(pair) {
    var a = pair[0], b = pair[1];
    var d = Math.hypot(NODES[a][0] - NODES[b][0], NODES[a][1] - NODES[b][1]);
    (ADJ[a] = ADJ[a] || []).push([ b, d ]);
    (ADJ[b] = ADJ[b] || []).push([ a, d ]);
  });
  var SPAN = {};
  (function() {
    Object.keys(NODES).forEach(function(from) {
      var dist = {}, left = Object.keys(NODES).slice();
      dist[from] = 0;
      while (left.length) {
        var pick = -1;
        left.forEach(function(k, i) {
          if (dist[k] !== undefined && (pick < 0 || dist[k] < dist[left[pick]])) {
            pick = i;
          }
        });
        if (pick < 0) {
          break;
        }
        var u = left.splice(pick, 1)[0];
        (ADJ[u] || []).forEach(function(step) {
          var v = step[0], nd = dist[u] + step[1];
          if (dist[v] === undefined || nd < dist[v]) {
            dist[v] = nd;
          }
        });
      }
      SPAN[from] = dist;
    });
  })();
  function hm(min) {
    return min < 60 ? min + "분" : Math.floor(min / 60) + "시간" + (min % 60 ? " " + min % 60 + "분" : "");
  }
  function span(a, b) {
    return SPAN[a] && SPAN[a][b] || 0;
  }
  var ROBOTS = {
    "ROBOT 01": {
      bat: 96,
      at: "D"
    },
    "ROBOT 02": {
      bat: 31,
      at: "n7"
    },
    "ROBOT 03": {
      bat: 91,
      at: "D"
    }
  };
  var V7KO = document.body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  if (V7KO) {
    ROBOTS = {};
    ROBOTS["ROBOT 01"] = {
      bat: 78,
      at: "D"
    };
    ROBOTS["ROBOT 02"] = {
      bat: 18,
      at: "D"
    };
    ROBOTS["ROBOT 03"] = {
      bat: 35,
      at: "D"
    };
    ROBOTS["ROBOT 04"] = {
      bat: 92,
      at: "D"
    };
    ROBOTS["ROBOT 05"] = {
      bat: 64,
      at: "D"
    };
    ROBOTS["ROBOT 06"] = {
      bat: 8,
      at: "D"
    };
    ROBOTS["ROBOT 07"] = {
      bat: 96,
      at: "D"
    };
    ROBOTS["ROBOT 08"] = {
      bat: 47,
      at: "D"
    };
    ROBOTS["ROBOT 09"] = {
      bat: 88,
      at: "D"
    };
    ROBOTS["ROBOT 10"] = {
      bat: 29,
      at: "D"
    };
    ROBOTS["ROBOT 11"] = {
      bat: 71,
      at: "D"
    };
    ROBOTS["ROBOT 12"] = {
      bat: 55,
      at: "D"
    };
  }
  function robotNow() {
    var box = document.querySelector("[data-mp-robot]") || function() {
      var found = null;
      $$("[data-select]").forEach(function(sel) {
        var label = sel.querySelector("[data-select-trigger]");
        var id = label && label.getAttribute("aria-labelledby");
        if (id && /robot/i.test(id)) {
          found = sel;
        }
      });
      return found;
    }();
    var value = box && box.querySelector("[data-select-value]");
    var nm = value && value.querySelector(".field-option-name");
    var text = nm ? nm.textContent : value ? value.textContent : "";
    var key = (text.match(/ROBOT\s*\d+/i) || [ "ROBOT 01" ])[0].toUpperCase();
    return {
      key: key,
      spec: ROBOTS[key] || ROBOTS["ROBOT 04"] || ROBOTS["ROBOT 01"]
    };
  }
  var WPS = $$(".check-row", list).map(function(row) {
    return {
      id: row.getAttribute("data-wp"),
      dwell: Number(row.getAttribute("data-dwell")) || 0,
      text: row.querySelector("span").textContent.trim()
    };
  });
  var BY_ID = {};
  WPS.forEach(function(w) {
    BY_ID[w.id] = w;
  });
  var FIRST = WPS.map(function(w) {
    return w.id;
  });
  var order = FIRST.slice();
  var on = {};
  FIRST.forEach(function(id) {
    on[id] = true;
  });
  function chosen(ord) {
    return (ord || order).filter(function(id) {
      return on[id];
    });
  }
  function reordered() {
    return order.some(function(id, i) {
      return id !== FIRST[i];
    });
  }
  function trip(ids, spec) {
    var hops = [ "D" ].concat(ids).concat([ "D" ]);
    var units = 0;
    if (spec.at !== "D") {
      units += span(spec.at, "D");
    }
    if (ids.length) {
      for (var i = 0; i < hops.length - 1; i += 1) {
        units += span(hops[i], hops[i + 1]);
      }
    }
    var moveSec = units * METER / SPEED;
    if (V7KO && ids.length && window.APRISM_ROUTE && window.APRISM_ROUTE.measure) {
      var m = window.APRISM_ROUTE.measure(ids);
      if (m != null) {
        moveSec = m / SPEED;
      }
    }
    var inspSec = ids.reduce(function(sum, id) {
      return sum + BY_ID[id].dwell;
    }, 0);
    return {
      moveSec: moveSec,
      inspSec: inspSec,
      sec: moveSec + inspSec
    };
  }
  function power(ids, spec) {
    var t = trip(ids, spec);
    var use = t.moveSec / 60 * MOVE_RATE + t.inspSec / 60 * INSP_RATE;
    var left = spec.bat - use;
    return {
      use: use,
      left: left,
      state: left < RESERVE ? "no" : left < RESERVE + 10 ? "low" : "ok"
    };
  }
  var ICON_PIN = '<span class="i" style="--i:var(--ic-map-pin)" aria-hidden="true"></span>';
  var ICON_GRIP = '<span class="i" style="--i:var(--ic-grip)" aria-hidden="true"></span>';
  var ICON_CHECK = '<span class="i" style="--i:var(--ic-check)" aria-hidden="true"></span>';
  function drawList() {
    var nth = 0;
    list.innerHTML = order.map(function(id) {
      var w = BY_ID[id];
      var yes = on[id];
      if (yes) {
        nth += 1;
      }
      return '<div class="check-row ds-list-item is-s is-check" role="checkbox" aria-checked="' + (yes ? "true" : "false") + '" tabindex="0" data-wp="' + id + '" data-dwell="' + w.dwell + '">' + '<span class="check-ord' + (document.body.classList.contains("ver-7") ? " ds-wp is-s" : "") + '" title="방문 순서">' + (yes ? nth : "") + "</span>" + '<span class="check-text">' + w.text + "</span>" + '<span class="check-skip t-caption">건너뜀</span>' + '<button type="button" class="check-act" data-mp-locate aria-label="' + id + ' 지도에서 보기" title="지도에서 보기">' + ICON_PIN + "</button>" + '<button type="button" class="check-act check-grip" data-mp-grip aria-label="' + id + ' 순서 바꾸기. 위아래 화살표로 옮깁니다" title="끌어서 순서 바꾸기">' + ICON_GRIP + "</button>" + '<span class="check-box">' + ICON_CHECK + "</span>" + "</div>";
    }).join("");
  }
  function drawOrd() {
    var nth = 0;
    order.forEach(function(id) {
      if (on[id]) {
        nth += 1;
      }
      var row = list.querySelector('.check-row[data-wp="' + id + '"] .check-ord');
      if (row) {
        row.textContent = on[id] ? nth : "";
      }
    });
  }
  var lastMin = null, lastCount = null;
  function flash(node) {
    if (!node) {
      return;
    }
    node.classList.remove("is-changed");
    void node.offsetWidth;
    node.classList.add("is-changed");
  }
  function drawSummary() {
    var ids = chosen();
    var bot = robotNow();
    var n = ids.length;
    if (countEl) {
      countEl.textContent = n + "개 선택";
    }
    if (resetBtn) {
      resetBtn.hidden = !reordered();
    }
    var min = Math.round(trip(ids, bot.spec).sec / 60);
    var was = Math.round(trip(FIRST, bot.spec).sec / 60);
    if (timeEl) {
      timeEl.innerHTML = n ? (min !== was ? '<s class="was">' + hm(was) + "</s>" : "") + "약 " + hm(min) : "—";
      if (lastMin !== null && lastMin !== min) {
        flash(timeEl);
      }
    }
    lastMin = n ? min : null;
    if (wpEl) {
      wpEl.textContent = n + "개";
      if (lastCount !== null && lastCount !== n) {
        flash(wpEl);
      }
    }
    lastCount = n;
    drawBattery(ids, bot);
    if (cta) {
      var p = power(ids, bot.spec);
      var blocked = !n || p.state === "no";
      cta.disabled = blocked;
      cta.textContent = !n ? "점검항목 1개 이상 선택 필요" : p.state === "no" ? "배터리 부족으로 시작 불가" : "사전 점검 시작";
    }
  }
  function drawBattery(ids, bot) {
    if (!batBar) {
      return;
    }
    var spec = bot.spec;
    if (batNow) {
      batNow.textContent = "현재 " + (V7KO ? bot.key.replace(/^ROBOT/, "Robot") : bot.key) + " " + spec.bat + "%";
    }
    if (!ids.length) {
      if (batState) {
        batState.innerHTML = "—";
      }
      batBar.className = "mp-bat-bar";
      batBar.querySelector(".rest").style.width = spec.bat + "%";
      batBar.querySelector(".use").style.cssText = "left:" + spec.bat + "%;width:0%";
      batBar.querySelector(".mark").style.left = RESERVE + "%";
      if (batNote) {
        batNote.className = "mp-bat-note t-caption";
        batNote.innerHTML = "고른 점검항목 없음";
      }
      return;
    }
    var p = power(ids, spec);
    var left = Math.max(0, Math.min(spec.bat, p.left));
    var used = spec.bat - left;
    if (batState) {
      var word = {
        ok: "수행 가능",
        low: "여유 부족",
        no: "수행 불가"
      }[p.state];
      var tone = {
        ok: "badge-normal",
        low: "badge-warning",
        no: "badge-danger"
      }[p.state];
      var dsv = document.body.classList.contains("ver-7") && window.ds ? " " + window.ds.statusCls({
        ok: "avail",
        low: "low",
        no: "no"
      }[p.state]) : "";
      var batIc = document.querySelector(".sum-row.has-detail > .i, .sum-row.has-detail > .ds-battery");
      if (batIc && dsv && window.ds.battery) {
        batIc.outerHTML = window.ds.battery(spec.bat, {
          text: false
        });
      }
      batState.innerHTML = '<span class="badge ' + tone + ' t-caption' + dsv + '">' + '<span class="badge-dot" aria-hidden="true"></span>' + word + "</span>";
    }
    batBar.className = "mp-bat-bar" + (p.state === "ok" ? "" : " is-" + p.state);
    batBar.setAttribute("aria-label", "현재 " + spec.bat + "%, 이 미션 예상 소모 " + Math.round(p.use) + "%, 복귀 예비 " + RESERVE + "%");
    batBar.querySelector(".rest").style.width = left + "%";
    batBar.querySelector(".use").style.cssText = "left:" + left + "%;width:" + used + "%";
    batBar.querySelector(".mark").style.left = RESERVE + "%";
    if (batNote) {
      batNote.className = "mp-bat-note t-caption" + (p.state === "ok" ? "" : " is-" + p.state);
      batNote.innerHTML = p.state === "no" ? "복귀 예비 " + RESERVE + "%를 남기려면 약 <b>" + Math.ceil(RESERVE - p.left) + "%</b> 더 필요함. 점검항목을 줄이거나 다른 로봇 선택" : p.state === "low" ? "끝나면 약 <b>" + Math.round(p.left) + "%</b> 남음. 복귀 예비 " + RESERVE + "%에 가까워 여유 적음" : "예상 소모 약 <b>" + Math.round(p.use) + "%</b>, 끝나면 약 <b>" + Math.round(p.left) + "%</b> 남음";
    }
  }
  function inSetup() {
    var now = document.body.getAttribute("data-stage");
    if (V7KO && now === "precheck") {
      return true;
    }
    return !now || now === "setup";
  }
  function tellMap() {
    if (!inSetup()) {
      return;
    }
    var names = {};
    WPS.forEach(function(w) {
      names[w.id] = w.text;
    });
    document.dispatchEvent(new CustomEvent("aprism:mission-plan", {
      detail: {
        stops: chosen(),
        skip: order.filter(function(id) {
          return !on[id];
        }),
        names: names
      }
    }));
  }
  function draw() {
    drawList();
    drawSummary();
    tellMap();
  }
  function toggle(id) {
    on[id] = !on[id];
    draw();
  }
  list.addEventListener("click", function(event) {
    var act = event.target.closest("[data-mp-locate]");
    if (act) {
      var id = act.closest(".check-row").getAttribute("data-wp");
      document.dispatchEvent(new CustomEvent("aprism:waypoint", {
        detail: {
          id: id,
          from: "panel"
        }
      }));
      return;
    }
    if (event.target.closest("[data-mp-grip]")) {
      return;
    }
    var row = event.target.closest(".check-row");
    if (row) {
      toggle(row.getAttribute("data-wp"));
    }
  });
  function hover(id) {
    document.dispatchEvent(new CustomEvent("aprism:mission-hover", {
      detail: {
        id: id,
        from: "panel"
      }
    }));
  }
  list.addEventListener("pointerover", function(event) {
    if (drag) {
      return;
    }
    var row = event.target.closest(".check-row");
    hover(row ? row.getAttribute("data-wp") : null);
  });
  list.addEventListener("pointerleave", function() {
    if (!drag) {
      hover(null);
    }
  });
  list.addEventListener("focusin", function(event) {
    var row = event.target.closest(".check-row");
    if (row) {
      hover(row.getAttribute("data-wp"));
    }
  });
  document.addEventListener("aprism:mission-hover", function(event) {
    if (!event.detail || event.detail.from !== "map") {
      return;
    }
    var id = event.detail.id;
    $$(".check-row", list).forEach(function(row) {
      row.classList.toggle("is-hot", row.getAttribute("data-wp") === id);
    });
  });
  document.addEventListener("aprism:mission-pick", function(event) {
    var row = event.detail && list.querySelector('.check-row[data-wp="' + event.detail.id + '"]');
    if (!row) {
      return;
    }
    row.focus();
    if (row.scrollIntoView) {
      row.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  });
  list.addEventListener("keydown", function(event) {
    var grip = event.target.closest("[data-mp-grip]");
    if (grip && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      move(grip.closest(".check-row").getAttribute("data-wp"), event.key === "ArrowUp" ? -1 : 1, true);
      return;
    }
    if (grip) {
      return;
    }
    var row = event.target.closest(".check-row");
    if (row && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      toggle(row.getAttribute("data-wp"));
      var again = list.querySelector('.check-row[data-wp="' + row.getAttribute("data-wp") + '"]');
      if (again) {
        again.focus();
      }
    }
  });
  function move(id, step, keepFocus) {
    var i = order.indexOf(id), j = i + step;
    if (j < 0 || j >= order.length) {
      return;
    }
    order.splice(i, 1);
    order.splice(j, 0, id);
    draw();
    mark(id);
    if (keepFocus) {
      var grip = list.querySelector('.check-row[data-wp="' + id + '"] [data-mp-grip]');
      if (grip) {
        grip.focus();
      }
    }
  }
  function mark(id) {
    var row = list.querySelector('.check-row[data-wp="' + id + '"]');
    if (!row) {
      return;
    }
    row.classList.remove("is-moved");
    void row.offsetWidth;
    row.classList.add("is-moved");
  }
  var drag = null;
  list.addEventListener("pointerdown", function(event) {
    var grip = event.target.closest("[data-mp-grip]");
    if (!grip || event.button !== 0) {
      return;
    }
    event.preventDefault();
    var row = grip.closest(".check-row");
    var rows = $$(".check-row", list);
    drag = {
      row: row,
      rows: rows,
      from: rows.indexOf(row),
      to: rows.indexOf(row),
      h: row.offsetHeight,
      y0: event.clientY,
      id: row.getAttribute("data-wp"),
      base: order.slice()
    };
    try {
      grip.setPointerCapture(event.pointerId);
    } catch (err) {}
    list.classList.add("is-sorting");
    row.classList.add("is-dragging");
  });
  list.addEventListener("pointermove", function(event) {
    if (!drag) {
      return;
    }
    var top = -drag.from * drag.h;
    var bottom = (drag.rows.length - 1 - drag.from) * drag.h;
    var dy = Math.max(top, Math.min(bottom, event.clientY - drag.y0));
    drag.row.style.transform = "translateY(" + dy + "px)";
    var to = Math.max(0, Math.min(drag.rows.length - 1, Math.round(drag.from + dy / drag.h)));
    if (to === drag.to) {
      return;
    }
    drag.to = to;
    drag.rows.forEach(function(other, i) {
      if (other === drag.row) {
        return;
      }
      var shift = 0;
      if (drag.from < to && i > drag.from && i <= to) {
        shift = -drag.h;
      }
      if (drag.from > to && i < drag.from && i >= to) {
        shift = drag.h;
      }
      other.style.transform = shift ? "translateY(" + shift + "px)" : "";
    });
    var next = drag.base.slice();
    next.splice(next.indexOf(drag.id), 1);
    next.splice(to, 0, drag.id);
    order = next;
    drawOrd();
    drawSummary();
    tellMap();
  });
  function drop() {
    if (!drag) {
      return;
    }
    var id = drag.id;
    drag = null;
    list.classList.remove("is-sorting");
    draw();
    mark(id);
  }
  list.addEventListener("pointerup", drop);
  list.addEventListener("pointercancel", drop);
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      order = FIRST.slice();
      draw();
    });
  }
  document.addEventListener("aprism:select", function(event) {
    var box = event.detail && event.detail.select;
    if (V7KO && box && box.hasAttribute("data-mp-robot")) {
      var pick = box.querySelector('.field-option[aria-selected="true"]'), val = box.querySelector("[data-select-value]");
      if (pick && val) {
        val.innerHTML = pick.innerHTML;
      }
    }
    lastMin = null;
    drawSummary();
  });
  if (V7KO) {
    document.addEventListener("aprism:mission-route", function() {
      lastMin = null;
      drawSummary();
    });
  }
  if (window.MutationObserver) {
    new MutationObserver(function() {
      if (inSetup()) {
        tellMap();
      }
    }).observe(document.body, {
      attributes: true,
      attributeFilter: [ "data-stage" ]
    });
  }
  draw();
})();
