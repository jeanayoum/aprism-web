(function() {
  "use strict";
  var bar = document.querySelector(".sb-tabs.is-fixed");
  if (!bar) {
    return;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".mp-stage .mp-scroll"), function(sc) {
    var mark = function() {
      sc.classList.toggle("is-scrolled", sc.scrollTop > 0);
      sc.classList.toggle("has-more", sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1);
    };
    sc.addEventListener("scroll", mark, {
      passive: true
    });
    window.addEventListener("resize", mark);
    mark();
  });
  var body = document.body;
  var tabs = Array.prototype.slice.call(bar.querySelectorAll(".sb-tab"));
  var nameInput = document.querySelector("input.field-box.is-readonly");
  var EN = window.APRISM_EN || {};
  function tabOf(name) {
    return tabs.filter(function(t) {
      var k = t.getAttribute("data-mission");
      return k === name || EN[k] === name;
    })[0];
  }
  var asked = /[?&]mission=([^&#]+)/.exec(window.location.search);
  var current = asked ? decodeURIComponent(asked[1]) : "";
  var saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("aprism-v6-tab-order") || "[]") || [];
  } catch (e) {}
  if (saved.length) {
    var pos = function(t, i) {
      var k = t.getAttribute("data-mission"), n = saved.indexOf(k);
      if (n < 0) {
        n = saved.indexOf(EN[k]);
      }
      return n >= 0 ? n : 1e3 + i;
    };
    tabs.filter(function(t) {
      return t.hasAttribute("data-mission");
    }).map(function(t, i) {
      return [ pos(t, i), t ];
    }).sort(function(a, b) {
      return a[0] - b[0];
    }).forEach(function(e) {
      bar.appendChild(e[1]);
    });
  }
  var mine = tabOf(current) || tabOf(window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검");
  current = mine ? mine.getAttribute("data-mission") : window.APRISM_MISSION ? APRISM_MISSION("m1") : "정기 순회 점검";
  if (mine) {
    mine.classList.add("is-on");
    mine.setAttribute("aria-current", "page");
  }
  if (mine) {
    Array.prototype.forEach.call(mine.querySelectorAll(".sb-tab-sev"), function(s) {
      s.remove();
    });
  }
  if (body.classList.contains("ver-7")) {
    tabs.forEach(function(t) {
      if (!t.hasAttribute("data-mission")) {
        return;
      }
      t.addEventListener("mouseenter", function() {
        var no = t.querySelector(".sb-tab-no"), nm = t.querySelector(".sb-tab-name");
        t.title = ((no ? no.textContent.trim() + " " : "") + (nm ? nm.textContent.trim() : "")).trim();
      });
    });
  }
  if (nameInput) {
    nameInput.value = window.APRISM_TR ? window.APRISM_TR(current) : current;
    nameInput.setAttribute("value", nameInput.value);
  }
  var monitor = body.getAttribute("data-monitor-href");
  if (monitor) {
    body.setAttribute("data-monitor-href", monitor.split("?")[0] + "?mission=" + encodeURIComponent(current));
  }
  var dirty = false;
  var form = document.querySelector("[data-stage-show='setup'] .mp-form");
  if (form) {
    form.addEventListener("input", function() {
      dirty = true;
    });
    form.addEventListener("change", function() {
      dirty = true;
    });
    form.addEventListener("click", function(event) {
      if (event.target.closest && event.target.closest(".field-option, .check-row, .switch")) {
        dirty = true;
      }
    });
  }
  var V7KO = body.classList.contains("ver-7") && document.documentElement.lang !== "en";
  var BUSY = "사전 점검 중이에요. 끝나면 이동할 수 있어요";
  var toastTimer = 0;
  function toast(msg) {
    Array.prototype.forEach.call(body.querySelectorAll(".toast.sb-toast"), function(t) {
      t.remove();
    });
    var t = document.createElement("div");
    t.className = "toast sb-toast";
    t.setAttribute("role", "status");
    var s = document.createElement("span");
    s.className = "t-label-2";
    s.textContent = msg;
    t.appendChild(s);
    body.appendChild(t);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function() {
      t.remove();
    }, 2600);
  }
  function go(name, href) {
    var scrim = document.querySelector("[data-modal='discard']");
    var opener = document.querySelector("[data-discard-open]");
    if (!dirty || !scrim || !opener) {
      window.location.href = href;
      return;
    }
    scrim.querySelector("[data-modal-confirm]").setAttribute("data-modal-confirm", href);
    var to = scrim.querySelector("[data-discard-to]");
    if (to.hasAttribute("data-josa")) {
      var c = name.charCodeAt(name.length - 1) - 0xac00, jong = c >= 0 && c < 11172 ? c % 28 : 0;
      to.textContent = name + (jong && jong !== 8 ? "으로" : "로");
    } else {
      to.textContent = name;
    }
    opener.click();
  }
  bar.addEventListener("click", function(event) {
    var tab = event.target.closest && event.target.closest(".sb-tab");
    if (!tab || tab.classList.contains("is-on")) {
      return;
    }
    var stage = body.getAttribute("data-stage");
    if (V7KO && stage === "precheck" && body.getAttribute("data-precheck") === "fail") {
      stage = "setup";
    }
    if (stage === "precheck") {
      toast(V7KO ? BUSY : "사전점검 진행중입니다.");
      return;
    }
    if (stage !== "setup") {
      return;
    }
    var mission = tab.getAttribute("data-mission");
    if (!mission) {
      go((window.APRISM_MISSION ? APRISM_MISSION("m9") : "통합 순회") + " 현황", "./building-v6.html");
      return;
    }
    var q = "?mission=" + encodeURIComponent(mission);
    if (tab.getAttribute("data-run") === "idle") {
      go(mission + " 미션 설정", "./mission-setup-v6.html" + q);
    } else {
      go(mission + " 관제", "./main-v6.html" + q);
    }
  });
  if (V7KO) {
    var rail = document.querySelector(".gnb-rail");
    if (rail) {
      rail.addEventListener("click", function(event) {
        var a = event.target.closest && event.target.closest("a.gnb-item");
        if (!a || a.getAttribute("aria-current") === "page") {
          return;
        }
        var st = body.getAttribute("data-stage");
        if (st === "precheck" && body.getAttribute("data-precheck") !== "fail") {
          event.preventDefault();
          toast(BUSY);
          return;
        }
        if (st !== "setup" && st !== "precheck") {
          return;
        }
        var href = a.getAttribute("href");
        if (!href || href === "#" || a.getAttribute("aria-current") === "page" || !dirty) {
          return;
        }
        event.preventDefault();
        go(a.textContent.trim() || "다른 화면", href);
      });
    }
  }
})();
