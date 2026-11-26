(function() {
  "use strict";
  var left = document.querySelector(".status-bar-left");
  var MENU = "[data-scope-menu], [data-bld-menu], .sf-scope";
  if (!left || !document.querySelector(MENU)) {
    return;
  }
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
  if (logo && logo.nextSibling) {
    left.insertBefore(bar, logo.nextSibling);
  } else {
    left.appendChild(bar);
  }
  var MNO = [ window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검", window.APRISM_MISSION ? APRISM_MISSION("m2") : "발전기실 설비 점검", window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검", window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검", window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검", window.APRISM_MISSION ? APRISM_MISSION("m6") : "야간 순회 점검", window.APRISM_MISSION ? APRISM_MISSION("m7") : "공조 설비 순회", window.APRISM_MISSION ? APRISM_MISSION("m8") : "유틸리티 순회" ];
  var EN = window.APRISM_EN || {};
  var MNO_EN = MNO.map(function(k) {
    return EN[k];
  });
  var IDLE = [ window.APRISM_MISSION ? APRISM_MISSION("m4") : "소방 설비 점검", window.APRISM_MISSION ? APRISM_MISSION("m5") : "주간 설비 점검" ];
  var V7KO = document.body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  var FIT_GAP = 24;
  var SPARE = 40;
  var MORE_W = 80;
  if (V7KO) {
    var demoN = 0, qs = location.search;
    try {
      qs += (window.top || window).location.search;
    } catch (e) {}
    var mq = /[?&]missions=(\d+)/.exec(qs);
    try {
      if (mq) {
        sessionStorage.setItem("aprism.missions", mq[1]);
      }
      demoN = Number(sessionStorage.getItem("aprism.missions") || 0);
    } catch (e) {
      demoN = mq ? Number(mq[1]) : 0;
    }
    for (var di = MNO.length + 1; di <= Math.min(demoN, 30); di++) {
      var dn = "추가 순회 점검 " + di;
      MNO.push(dn);
      IDLE.push(dn);
    }
  }
  var NEWKEY = "aprism.newrisk";
  function newRisks() {
    try {
      return JSON.parse(sessionStorage.getItem(NEWKEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function setNewRisks(a) {
    try {
      sessionStorage.setItem(NEWKEY, JSON.stringify(a));
    } catch (e) {}
  }
  if (V7KO) {
    var nq = /[?&]newrisk=(\d)/.exec(qs);
    if (nq) {
      var seen = "";
      try {
        seen = sessionStorage.getItem("aprism.newrisk.q") || "";
      } catch (e) {
        seen = "";
      }
      if (seen !== nq[0]) {
        setNewRisks(nq[1] === "1" ? [ window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검" ] : []);
        var A7 = window.APRISM_ALERTS7;
        if (nq[1] === "1" && A7) {
          A7.list.forEach(function(a) {
            if (a.mission === (window.APRISM_MISSION ? APRISM_MISSION("m3") : "전기실 열화상 점검") && a.sev === "critical") {
              A7.req.clear(a.id);
            }
          });
        }
        try {
          sessionStorage.setItem("aprism.newrisk.q", nq[0]);
        } catch (e) {}
      }
    }
  }
  function riskHandled(name) {
    var A = window.APRISM_ALERTS7;
    if (!A) {
      return false;
    }
    var done = A.req.all();
    var crit = A.list.filter(function(a) {
      return a.mission === name && a.sev === "critical";
    });
    return crit.length > 0 && crit.every(function(a) {
      return !!done[a.id];
    });
  }
  function mno(name) {
    var i = MNO.indexOf(name);
    return i >= 0 ? i : MNO_EN.indexOf(name);
  }
  window.APRISM_MISSION_NO = function(name) {
    var i = mno(name);
    return i >= 0 ? "M" + (i + 1) : "";
  };
  document.dispatchEvent(new Event("aprism:mission-no"));
  function tab(tag, name, on) {
    var t = document.createElement(tag);
    t.className = "sb-tab" + (on ? " is-on" : "");
    if (tag === "button") {
      t.type = "button";
    }
    if (on) {
      t.setAttribute("aria-current", "page");
    }
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
    if (!menu) {
      return;
    }
    bar.textContent = "";
    var isBtn = !!(overview && overview.tagName === "BUTTON");
    var first = tab(isBtn ? "button" : onOverview ? "span" : "a", "전체 미션", onOverview);
    first.querySelector(".sb-tab-name").setAttribute("data-en", "All");
    if (isBtn) {
      var ov = overview;
      first.addEventListener("click", function() {
        if (!first.classList.contains("is-on")) {
          ov.click();
        }
      });
    } else if (!onOverview && overview) {
      first.href = overview.getAttribute("href") || "building-v6.html";
    }
    bar.appendChild(first);
    var saved = loadOrder();
    var items = Array.prototype.slice.call(menu.querySelectorAll(".scope-item")).filter(function(item) {
      return item.querySelector(".scope-name .t-label-2");
    });
    var RUN = {
      run: 0,
      idle: 1,
      done: 2
    };
    var at = function(item) {
      var i = saved.indexOf(item.querySelector(".scope-name .t-label-2").textContent);
      if (i >= 0) {
        return i;
      }
      var r = item.querySelector(".scope-run"), g = r ? RUN[r.getAttribute("data-run")] : 1;
      return 1e3 + (g == null ? 1 : g) * 100 + items.indexOf(item);
    };
    items.sort(function(a, b) {
      return at(a) - at(b);
    });
    items.forEach(function(item) {
      var nm = item.querySelector(".scope-name .t-label-2");
      var on = !onOverview && item.getAttribute("aria-checked") === "true";
      var t = tab("button", nm.textContent, on);
      var run = item.querySelector(".scope-run");
      if (run) {
        t.setAttribute("data-run", run.getAttribute("data-run") || "");
      }
      var sevEl = item.querySelector(".scope-sev");
      var sev = sevEl && sevEl.getAttribute("data-sev");
      var label = nm.textContent;
      if (mno(label) >= 0) {
        label = "M" + (mno(label) + 1) + " " + label;
      }
      if (sev) {
        var ic = document.createElement("span");
        ic.className = "i i-16 sb-tab-sev";
        ic.setAttribute("data-sev", sev);
        ic.style.setProperty("--i", "var(--ic-" + (sev === "critical" ? "error" : "warning") + ")");
        ic.setAttribute("aria-hidden", "true");
        t.appendChild(ic);
        label += " · " + (sev === "critical" ? "위험" : "주의") + " 알림 있음";
      }
      var nr = V7KO ? newRisks() : [], fresh = !!item.getAttribute("data-new");
      if (V7KO && nr.indexOf(nm.textContent) >= 0) {
        if (on || riskHandled(nm.textContent)) {
          setNewRisks(nr.filter(function(x) {
            return x !== nm.textContent;
          }));
        } else {
          fresh = true;
        }
      }
      if (fresh) {
        t.classList.add("is-new");
        var nd = document.createElement("i");
        nd.className = "sb-tab-new";
        nd.setAttribute("aria-hidden", "true");
        t.insertBefore(nd, t.firstChild);
        label += " · 새 위험";
      }
      t.title = label;
      t.setAttribute("aria-label", label);
      t.setAttribute("data-mission", nm.textContent);
      t.title = V7KO ? label : label + " — 끌어서 순서 바꾸기";
      t.addEventListener("click", function() {
        if (justDragged) {
          return;
        }
        item.click();
      });
      t.addEventListener("pointerdown", startDrag);
      t.addEventListener("keydown", keyMove);
      bar.appendChild(t);
    });
    IDLE.forEach(function(name) {
      if (bar.querySelector(".sb-tab[data-mission='" + name + "'], .sb-tab[data-mission='" + EN[name] + "']")) {
        return;
      }
      var t = tab("button", name, false);
      t.setAttribute("data-run", "idle");
      t.setAttribute("data-mission", name);
      t.title = "M" + (mno(name) + 1) + " " + name + (V7KO ? "" : " — 끌어서 순서 바꾸기");
      t.addEventListener("click", function() {
        if (justDragged) {
          return;
        }
        window.location.href = (window.aprismHref || String)("./mission-setup-v6.html?mission=" + encodeURIComponent(name));
      });
      t.addEventListener("pointerdown", startDrag);
      t.addEventListener("keydown", keyMove);
      bar.insertBefore(t, bar.querySelector(".sb-tab[data-run='done']"));
    });
    if (saved.length) {
      var pos = function(t) {
        var i = saved.indexOf(t.getAttribute("data-mission"));
        return i >= 0 ? i : 1e3;
      };
      missionTabs().map(function(t, i) {
        return [ pos(t), i, t ];
      }).sort(function(a, b) {
        return a[0] - b[0] || a[1] - b[1];
      }).forEach(function(e) {
        bar.appendChild(e[2]);
      });
    }
    fit();
  }
  var more = null, moreMenu = null, fitKey = "", fitCount = 0;
  function closeMore() {
    if (moreMenu) {
      moreMenu.remove();
      moreMenu = null;
    }
    if (more) {
      more.setAttribute("aria-expanded", "false");
    }
  }
  function fit() {
    if (!V7KO) {
      return;
    }
    closeMore();
    if (more) {
      more.remove();
      more = null;
    }
    var all = Array.prototype.slice.call(bar.querySelectorAll(".sb-tab[data-mission]"));
    all.forEach(function(t) {
      t.hidden = false;
    });
    if (!all.length) {
      return;
    }
    var br = bar.getBoundingClientRect();
    if (!br.width) {
      return;
    }
    var gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
    var x0 = all[0].getBoundingClientRect().left;
    var w = all.map(function(t) {
      return t.getBoundingClientRect().width + gap;
    });
    all.forEach(function(t) {
      t.hidden = true;
    });
    var right = document.querySelector(".status-bar-right");
    br = bar.getBoundingClientRect();
    var limit = right ? Math.min(br.right, right.getBoundingClientRect().left - FIT_GAP) : br.right - FIT_GAP;
    all.forEach(function(t) {
      t.hidden = false;
    });
    var sum = function(arr) {
      return arr.reduce(function(a, b) {
        return a + b;
      }, 0);
    };
    var ci = all.findIndex(function(t) {
      return t.classList.contains("is-on");
    });
    var key = window.innerWidth + "|" + all.length + "|" + (ci >= 0 ? all[ci].getAttribute("data-mission") : "");
    var same = key === fitKey;
    fitKey = key;
    var fitsAll = x0 + sum(w) - gap <= limit - (same ? 0 : SPARE);
    if (fitsAll && !(same && fitCount < all.length)) {
      fitCount = all.length;
      return;
    }
    var room = limit - x0 - MORE_W - (same ? 0 : SPARE);
    var keep = [], used = ci >= 0 ? w[ci] : 0, cap = same ? fitCount : Infinity;
    all.forEach(function(t, i) {
      if (i === ci) {
        keep.push(i);
        return;
      }
      if (keep.length < cap && used + w[i] <= room) {
        used += w[i];
        keep.push(i);
      } else {
        used = Infinity;
      }
    });
    fitCount = keep.length;
    var vis = all.filter(function(t, i) {
      return keep.indexOf(i) >= 0;
    });
    var hid = all.filter(function(t, i) {
      return keep.indexOf(i) < 0;
    });
    if (!hid.length) {
      return;
    }
    hid.forEach(function(t) {
      t.hidden = true;
    });
    more = document.createElement("button");
    more.type = "button";
    more.className = "sb-tab sb-tab-more";
    more.setAttribute("aria-haspopup", "menu");
    more.setAttribute("aria-expanded", "false");
    var lab = document.createElement("span");
    lab.className = "sb-tab-no t-label-1";
    lab.textContent = "+" + hid.length;
    more.appendChild(lab);
    var top = null;
    hid.forEach(function(t) {
      var ic = t.querySelector(".sb-tab-sev");
      if (ic && (!top || ic.getAttribute("data-sev") === "critical")) {
        top = ic;
      }
    });
    if (top) {
      more.appendChild(top.cloneNode(true));
    }
    var fresh = hid.some(function(t) {
      return t.classList.contains("is-new");
    });
    if (fresh) {
      more.classList.add("is-new");
      var nd = document.createElement("i");
      nd.className = "sb-tab-new";
      nd.setAttribute("aria-hidden", "true");
      more.insertBefore(nd, more.firstChild);
    }
    var say = "숨은 미션 " + hid.length + "개" + (top ? " · " + (top.getAttribute("data-sev") === "critical" ? "위험" : "주의") + " 알림 있음" : "") + (fresh ? " · 새 위험" : "");
    more.title = say;
    more.setAttribute("aria-label", say);
    more.addEventListener("click", function(event) {
      event.stopPropagation();
      if (moreMenu) {
        closeMore();
        return;
      }
      moreMenu = document.createElement("div");
      moreMenu.className = "dropdown-menu sb-more-menu";
      moreMenu.setAttribute("role", "menu");
      moreMenu.setAttribute("aria-label", "숨은 미션");
      hid.forEach(function(t) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "menu-item";
        b.setAttribute("role", "menuitem");
        var no = t.querySelector(".sb-tab-no"), nm = t.querySelector(".sb-tab-name"), ic = t.querySelector(".sb-tab-sev");
        if (no) {
          b.appendChild(no.cloneNode(true));
        }
        var n2 = document.createElement("span");
        n2.className = "t-label-2 sb-more-name";
        n2.textContent = nm ? nm.textContent : "";
        b.appendChild(n2);
        if (ic) {
          b.appendChild(ic.cloneNode(true));
        }
        b.setAttribute("aria-label", t.getAttribute("aria-label") || t.getAttribute("data-mission"));
        b.addEventListener("click", function() {
          closeMore();
          t.click();
        });
        moreMenu.appendChild(b);
      });
      var r = more.getBoundingClientRect();
      moreMenu.style.position = "fixed";
      moreMenu.style.top = Math.round(r.bottom + 4) + "px";
      moreMenu.style.left = Math.round(r.left) + "px";
      document.body.appendChild(moreMenu);
      more.setAttribute("aria-expanded", "true");
      var f = moreMenu.querySelector(".menu-item");
      if (f) {
        f.focus();
      }
    });
    bar.appendChild(more);
  }
  if (V7KO) {
    var lastW = -1, raf = 0;
    var refit = function() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function() {
        var wd = window.innerWidth;
        if (wd !== lastW && !drag) {
          lastW = wd;
          fit();
        }
      });
    };
    window.addEventListener("resize", refit);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        if (!drag) {
          fit();
        }
      });
    }
    document.addEventListener("click", function(event) {
      if (moreMenu && !moreMenu.contains(event.target)) {
        closeMore();
      }
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && moreMenu) {
        closeMore();
        if (more) {
          more.focus();
        }
      }
    });
  }
  var KEY = "aprism-v6-tab-order";
  function loadOrder() {
    if (V7KO) {
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]") || [];
    } catch (e) {
      return [];
    }
  }
  function saveOrder() {
    var names = Array.prototype.map.call(bar.querySelectorAll(".sb-tab[data-mission]"), function(t) {
      return t.getAttribute("data-mission");
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(names));
    } catch (e) {}
  }
  window.addEventListener("storage", function(event) {
    if (event.key === KEY) {
      build();
    }
  });
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var drag = null, justDragged = false, pending = false;
  function missionTabs() {
    return Array.prototype.slice.call(bar.querySelectorAll(".sb-tab[data-mission]:not([hidden])"));
  }
  function slide(moveFn, except) {
    var tabs = missionTabs().filter(function(t) {
      return t !== except;
    });
    var before = tabs.map(function(t) {
      return t.getBoundingClientRect().left;
    });
    moveFn();
    if (reduce) {
      return;
    }
    tabs.forEach(function(t, i) {
      var dx = before[i] - t.getBoundingClientRect().left;
      if (!dx) {
        return;
      }
      t.style.transition = "none";
      t.style.transform = "translateX(" + dx + "px)";
      requestAnimationFrame(function() {
        t.style.transition = "transform 180ms ease";
        t.style.transform = "";
      });
    });
  }
  function startDrag(event) {
    if (V7KO || event.button !== 0) {
      return;
    }
    var t = event.currentTarget;
    drag = {
      t: t,
      x0: event.clientX,
      moved: false,
      id: event.pointerId
    };
    t.addEventListener("pointermove", onDrag);
    t.addEventListener("pointerup", endDrag);
    t.addEventListener("pointercancel", endDrag);
  }
  function onDrag(event) {
    if (!drag) {
      return;
    }
    var t = drag.t, dx = event.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) {
        return;
      }
      drag.moved = true;
      try {
        t.setPointerCapture(drag.id);
      } catch (e) {}
      t.classList.add("is-dragging");
      bar.classList.add("is-sorting");
      t.style.transition = "none";
    }
    t.style.transform = "";
    var home = t.getBoundingClientRect();
    var tabs = missionTabs(), lo = tabs[0].getBoundingClientRect().left - home.left, hi = tabs[tabs.length - 1].getBoundingClientRect().right - home.right;
    var off = Math.max(lo, Math.min(hi, event.clientX - drag.x0));
    var cx = home.left + home.width / 2 + off;
    var prev = t.previousElementSibling, next = t.nextElementSibling;
    if (next && next.hasAttribute("data-mission") && cx > next.getBoundingClientRect().left + next.getBoundingClientRect().width / 2) {
      slide(function() {
        bar.insertBefore(next, t);
      }, t);
    } else if (prev && prev.hasAttribute("data-mission") && cx < prev.getBoundingClientRect().left + prev.getBoundingClientRect().width / 2) {
      slide(function() {
        bar.insertBefore(t, prev);
      }, t);
    }
    var shift = t.getBoundingClientRect().left - home.left;
    drag.x0 += shift;
    t.style.transform = "translateX(" + (off - shift) + "px)";
  }
  function endDrag() {
    if (!drag) {
      return;
    }
    var t = drag.t, moved = drag.moved;
    t.removeEventListener("pointermove", onDrag);
    t.removeEventListener("pointerup", endDrag);
    t.removeEventListener("pointercancel", endDrag);
    drag = null;
    if (!moved) {
      return;
    }
    t.style.transition = reduce ? "none" : "transform 160ms ease";
    t.style.transform = "";
    t.classList.remove("is-dragging");
    bar.classList.remove("is-sorting");
    justDragged = true;
    setTimeout(function() {
      justDragged = false;
    }, 0);
    saveOrder();
    if (pending) {
      pending = false;
      build();
    } else {
      fit();
    }
  }
  function keyMove(event) {
    if (V7KO || !event.altKey || event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    var t = event.currentTarget, sib = event.key === "ArrowLeft" ? t.previousElementSibling : t.nextElementSibling;
    if (!sib || !sib.hasAttribute("data-mission")) {
      return;
    }
    slide(function() {
      if (event.key === "ArrowLeft") {
        bar.insertBefore(t, sib);
      } else {
        bar.insertBefore(sib, t);
      }
    });
    t.focus();
    saveOrder();
    fit();
    t.focus();
  }
  build();
  if (V7KO) {
    document.addEventListener("aprism:requested", function() {
      if (newRisks().length && !(drag && drag.moved)) {
        build();
      }
    });
    window.addEventListener("storage", function(event) {
      if (event.key === NEWKEY && !(drag && drag.moved)) {
        build();
      }
    });
  }
  new MutationObserver(function(list) {
    if (list.every(function(r) {
      return bar.contains(r.target);
    })) {
      return;
    }
    if (drag && drag.moved) {
      pending = true;
    } else {
      build();
    }
  }).observe(left, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ "aria-checked", "class" ]
  });
})();
