(function() {
  var sec = document.querySelector("[data-done-sec]");
  var head = document.querySelector("[data-done-head]");
  var btn = document.querySelector("[data-done-fold]");
  if (!sec || !head || !btn) {
    return;
  }
  var V7 = document.body.classList.contains("ver-7");
  var KEY = V7 ? "aprism.v7.doneFolded" : "aprism.v3.doneFolded";
  function set(folded) {
    sec.classList.toggle("is-folded", folded);
    btn.setAttribute("aria-expanded", folded ? "false" : "true");
    var name = (sec.querySelector("h3") || {}).textContent || "오늘 확인 완료";
    btn.setAttribute("aria-label", name + (folded ? " 펼치기" : " 접기"));
    try {
      window.localStorage.setItem(KEY, folded ? "1" : "0");
    } catch (e) {}
  }
  var start = V7;
  try {
    var kept = window.localStorage.getItem(KEY);
    if (kept !== null) {
      start = kept === "1";
    }
  } catch (e) {}
  sec.classList.add("no-motion");
  set(start);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      sec.classList.remove("no-motion");
    });
  });
  head.addEventListener("click", function() {
    set(!sec.classList.contains("is-folded"));
  });
})();

(function() {
  var win = document.querySelector("[data-delta3]");
  var out = win && win.querySelector(".delta3-clue-txt");
  if (!out) {
    return;
  }
  var body = document.body;
  function count(kind) {
    var c = window.APRISM_DELTA_COUNT;
    if (c) {
      return kind === "critical" ? c.crit : kind === "warning" ? c.warn : c.total;
    }
    var el = document.querySelector('[data-ah-count="' + (kind === "total" ? "all" : kind) + '"]');
    return el ? parseInt(el.textContent, 10) || 0 : 0;
  }
  function say() {
    if (win.classList.contains("is-thinking")) {
      return "답변 정리 중...";
    }
    var sd = window.APRISM_DELTA_SAY;
    if (sd && sd.calm) {
      return sd.clue;
    }
    var level = body.getAttribute("data-level");
    var total = count("total");
    if (level === "critical") {
      return "위험 " + count("critical") + "건 원인 분석 중...";
    }
    if (level === "warning") {
      return "주의 " + count("warning") + "건 추세 비교 중...";
    }
    if (total) {
      return "알림 " + total + "건 살펴보는 중...";
    }
    return "순회 경로 지켜보는 중...";
  }
  var clue = win.querySelector(".delta3-clue");
  var plus = win.querySelector("[data-ai-toggle]");
  var plusLabel = plus && plus.querySelector(".delta3-plus-label");
  var brief = body.getAttribute("data-delta-copy") === "brief";
  function said() {
    return brief ? window.APRISM_DELTA_SAY : null;
  }
  var V6 = body.classList.contains("ver-6");
  var EN = document.documentElement.lang === "en";
  var talk = null;
  if (brief && plus) {
    talk = document.createElement("button");
    talk.type = "button";
    talk.className = "delta3-talk";
    talk.setAttribute("aria-label", "Delta와 대화");
    talk.title = "Delta와 대화";
    talk.hidden = true;
    plus.insertAdjacentElement("afterend", talk);
    talk.addEventListener("click", function() {
      opening = true;
      plus.click();
      opening = false;
    });
  }
  var T = window.APRISM_DELTA_TOKEN = {
    no: function(name) {
      var tabs = document.querySelectorAll(".sb-tab[data-mission]");
      for (var i = 0; i < tabs.length; i++) {
        var dm = tabs[i].getAttribute("data-mission");
        if (dm === name || window.APRISM_EN && dm === window.APRISM_EN[name]) {
          var no = tabs[i].querySelector(".sb-tab-no");
          return no ? no.textContent.trim() : "";
        }
      }
      return "";
    },
    mission: function(name) {
      var m = document.createElement("span"), no = T.no(name);
      m.className = "dl-m";
      [ [ "dl-br", "[" ], [ "dl-no", no ? no + " " : "" ], [ null, name ], [ "dl-br", "]" ] ].forEach(function(k) {
        var c = document.createElement("span");
        if (k[0]) {
          c.className = k[0];
        }
        c.textContent = k[1];
        m.appendChild(c);
      });
      return m;
    },
    wp: function(n, sev) {
      var w = document.createElement("span");
      w.className = "dl-wp" + (document.body.classList.contains("ver-7") ? " ds-wp" : "");
      if (sev) {
        w.setAttribute("data-sev", sev);
      }
      w.textContent = n;
      w.setAttribute("aria-label", "waypoint " + n);
      return w;
    }
  };
  function update() {
    var s = said();
    var scope = window.APRISM_DELTA_SCOPE;
    var t = s && !V6 && !win.classList.contains("is-thinking") ? s.clue || "" : say();
    if (!s && scope && !win.classList.contains("is-thinking")) {
      t = scope + " " + t;
    }
    if (out.textContent !== t) {
      out.textContent = t;
    }
    if (clue) {
      clue.classList.toggle("is-said", !!s && !V6);
      clue.classList.toggle("is-scope", !!(s && s.scope) && !V6);
      clue.setAttribute("data-scope", s && s.scope && !V6 ? s.scope : "");
    }
    if (plusLabel && brief) {
      var yes = s && s.yes ? s.yes : "Delta와 대화";
      if (plusLabel.textContent !== yes) {
        plusLabel.textContent = yes;
      }
      plus.classList.toggle("is-answer", !!(s && s.yes));
      if (talk) {
        talk.hidden = !(s && s.yes);
      }
    }
    if (brief) {
      lines();
    }
  }
  function lines() {
    var p = win.querySelector(".delta3-body > .ai-line-2");
    if (!p) {
      return;
    }
    var s = said(), P = V6 && s && s.parts ? s.parts[EN ? "en" : "ko"] : null;
    if (P) {
      var key = JSON.stringify(P);
      if (p.getAttribute("data-parts") === key && p.querySelector(".dl")) {
        return;
      }
      p.setAttribute("data-parts", key);
      p.setAttribute("data-raw", (s.l || []).join("\n"));
      p.textContent = "";
      P.forEach(function(ln, i) {
        var e = document.createElement("span");
        e.className = "dl" + (P.length > 1 ? " dl" + (i + 1) : "");
        ln.forEach(function(x) {
          e.appendChild(part(x));
        });
        p.appendChild(e);
      });
      return;
    }
    p.removeAttribute("data-parts");
    if (p.textContent.indexOf("\n") < 0) {
      return;
    }
    var t = p.textContent.split("\n");
    p.setAttribute("data-raw", t.join("\n"));
    p.textContent = "";
    t.forEach(function(x, i) {
      var e = document.createElement("span");
      e.className = "dl dl" + (i + 1);
      e.textContent = x;
      p.appendChild(e);
    });
  }
  function part(x) {
    if (typeof x === "string") {
      return document.createTextNode(x);
    }
    if (x.m) {
      return T.mission(x.m);
    }
    if (x.wp) {
      return T.wp(x.wp, x.sev);
    }
    var n = document.createElement("span");
    n.className = "dl-wp-name";
    n.textContent = x.wpName;
    return n;
  }
  var opening = false;
  win.addEventListener("click", function(event) {
    if (opening || win.classList.contains("is-open")) {
      return;
    }
    var s = said();
    var b = event.target.closest && event.target.closest("[data-ai-toggle]");
    if (!b) {
      if (brief && plus && event.target.closest && event.target.closest(".delta3-body") && !event.target.closest("button, a, input")) {
        opening = true;
        plus.click();
        opening = false;
      }
      return;
    }
    if (!s || !s.yes || !window.APRISM_DELTA_DO) {
      return;
    }
    if (s.open) {
      setTimeout(function() {
        if (window.APRISM_DELTA) {
          window.APRISM_DELTA.ask(s.open);
        }
      }, 320);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    window.APRISM_DELTA_DO();
  }, true);
  update();
  new MutationObserver(update).observe(body, {
    attributes: true,
    attributeFilter: [ "data-level" ]
  });
  new MutationObserver(update).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  document.addEventListener("aprism:severity", function() {
    setTimeout(update, 0);
  });
})();

(function() {
  var note = document.querySelector("[data-floor-note]");
  var nameSlot = document.querySelector("[data-scope-name]");
  if (!note || !nameSlot) {
    return;
  }
  var text = note.querySelector("[data-floor-note-text]");
  var go = note.querySelector("[data-floor-note-go]");
  var floor = null;
  function now() {
    var on = document.querySelector("[data-map-floor][aria-pressed='true']");
    return floor || on && on.getAttribute("data-map-floor");
  }
  function update() {
    var m = nameSlot.textContent.trim();
    var fl = (window.APRISM_MISSION_FLOORS || {})[m] || [];
    var f = now();
    var off = !!f && fl.length > 0 && fl.indexOf(f) < 0;
    note.hidden = !off;
    if (!off) {
      return;
    }
    var robotBtn = document.querySelector("[data-map-floor].has-robot");
    var back = robotBtn && fl.indexOf(robotBtn.getAttribute("data-map-floor")) >= 0 ? robotBtn.getAttribute("data-map-floor") : fl[0];
    text.textContent = m + "은 " + f + "을 지나지 않아요";
    go.textContent = back + "로 돌아가기";
    go.onclick = function() {
      var b = document.querySelector("[data-map-floor='" + back + "']");
      if (b) {
        b.click();
      }
    };
  }
  document.addEventListener("aprism:floor", function(e) {
    floor = e.detail && e.detail.floor;
    update();
  });
  document.addEventListener("aprism:scope", function() {
    setTimeout(update, 0);
  });
  update();
})();

(function() {
  var box = document.querySelector("[data-clue-ics]");
  if (!box) {
    return;
  }
  var KINDS = [ {
    re: /계기|압력|NG|게이지/,
    icon: "gauge",
    name: "계기 판독"
  }, {
    re: /온도|과열|열화상/,
    icon: "thermometer",
    name: "온도"
  }, {
    re: /방전/,
    icon: "bolt",
    name: "부분방전"
  }, {
    re: /누출|누수/,
    icon: "eye",
    name: "누출"
  }, {
    re: /진동/,
    icon: "gauge",
    name: "진동"
  } ];
  function kindOf(t) {
    for (var i = 0; i < KINDS.length; i += 1) {
      if (KINDS[i].re.test(t)) {
        return KINDS[i];
      }
    }
    return {
      icon: "info",
      name: "기타"
    };
  }
  function paint() {
    var list = window.APRISM_DELTA_DETECTS || [];
    var seen = [], names = [];
    var icons = [];
    list.forEach(function(t) {
      var k = kindOf(t);
      if (names.indexOf(k.name) < 0) {
        names.push(k.name);
      }
      if (icons.indexOf(k.icon) < 0) {
        icons.push(k.icon);
        seen.push(k);
      }
    });
    if (!seen.length) {
      seen = [ {
        icon: "bot",
        name: "순회"
      } ];
      names = [ "순회" ];
    }
    box.textContent = "";
    seen.slice(0, 3).forEach(function(k) {
      var i = document.createElement("span");
      i.className = "i";
      i.style.setProperty("--i", "var(--ic-" + k.icon + ")");
      i.title = k.name;
      box.appendChild(i);
    });
    if (seen.length > 3) {
      var more = document.createElement("span");
      more.className = "delta3-clue-more num";
      more.textContent = "+" + (seen.length - 3);
      box.appendChild(more);
    }
    box.setAttribute("title", "근거 — " + names.join(" · "));
  }
  paint();
  document.addEventListener("aprism:severity", function() {
    setTimeout(paint, 0);
  });
})();

(function() {
  if (!document.body.classList.contains("ver-3")) {
    return;
  }
  if (document.body.getAttribute("data-delta-copy") === "brief") {
    return;
  }
  var win = document.querySelector("[data-delta3]");
  var box = win && win.querySelector(".delta3-body");
  var p = box && box.querySelector(".ai-line-2");
  if (!p) {
    return;
  }
  var words = [];
  var last = null;
  var LINE = 24;
  function off() {
    return win.classList.contains("is-open") || document.body.classList.contains("d3-bar");
  }
  function paint() {
    var top = box.getBoundingClientRect().top;
    box.classList.toggle("is-scrolled", box.scrollTop > 0);
    words.forEach(function(w) {
      if (off()) {
        w.style.transform = "";
        w.style.opacity = "";
        return;
      }
      var r = w.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, 1 + (r.top - top) / LINE));
      w.style.transform = k < 1 ? "scale(" + (0.86 + 0.14 * k).toFixed(3) + ")" : "";
      w.style.opacity = k < 1 ? (0.2 + 0.8 * k).toFixed(2) : "";
    });
  }
  function split() {
    var t = p.textContent;
    if (t === last) {
      return;
    }
    last = t;
    p.textContent = "";
    words = [];
    t.split(/(\s+)/).forEach(function(w) {
      if (!w) {
        return;
      }
      if (/^\s+$/.test(w)) {
        p.appendChild(document.createTextNode(w));
        return;
      }
      var s = document.createElement("span");
      s.className = "d3-w";
      s.textContent = w;
      p.appendChild(s);
      words.push(s);
    });
    box.scrollTop = 0;
    paint();
  }
  new MutationObserver(split).observe(p, {
    childList: true,
    characterData: true,
    subtree: true
  });
  new MutationObserver(function() {
    requestAnimationFrame(paint);
  }).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  box.addEventListener("scroll", function() {
    requestAnimationFrame(paint);
  }, {
    passive: true
  });
  split();
})();
