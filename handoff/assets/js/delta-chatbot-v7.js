(function() {
  "use strict";
  var body = document.body;
  if (!body.classList.contains("d3-chat")) {
    return;
  }
  var win = document.querySelector("[data-delta3]");
  var toggle = win && win.querySelector("[data-ai-toggle]");
  var stage = win && win.parentElement;
  if (!win || !toggle || !stage) {
    return;
  }
  var dock = document.createElement("div");
  dock.className = "dchat";
  dock.innerHTML = '<div class="dchat-bubble" role="status">' + '<button type="button" class="dchat-bubble-body" aria-label="Delta 대화창 열기"><span class="dchat-l1"></span><span class="dchat-l2"></span></button>' + '<svg class="dchat-tail" viewBox="0 0 14 20" width="14" height="20" aria-hidden="true"><path class="f" d="M0 0C0 9 4 16.5 13.5 19.5C9 20 3.5 20 0 20Z"/><path class="s" d="M.5 0C.5 9 4.5 16.5 13.5 19.5C9 20 3.5 20 0 19.5"/></svg>' + '</div>' + '<button type="button" class="dchat-orb" aria-label="Delta 대화창 열기" aria-expanded="false"><span class="dchat-orb-in" aria-hidden="true"></span><span class="dchat-badge" hidden></span>' + '<span class="dchat-logo" role="img" aria-label="DELTA"></span></button>';
  stage.appendChild(dock);
  var bubble = dock.querySelector(".dchat-bubble"), l1 = dock.querySelector(".dchat-l1"), l2 = dock.querySelector(".dchat-l2");
  var orbBtn = dock.querySelector(".dchat-orb"), badge = dock.querySelector(".dchat-badge");
  var orb = null;
  function sev() {
    return win.classList.contains("is-critical") ? "critical" : win.classList.contains("is-warning") ? "warning" : win.classList.contains("is-safe") ? "safe" : "info";
  }
  if (window.PrismOrb) {
    orb = window.PrismOrb.mount(dock.querySelector(".dchat-orb-in"), {
      palette: sev()
    });
  }
  var lastKey = "", orbHoldT = 0;
  function brAfterFirst(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while (n = w.nextNode()) {
      var m = /[.?!](?=\s|$)/.exec(n.nodeValue);
      if (!m) {
        continue;
      }
      var r = document.createRange();
      r.setStart(n, m.index + 1);
      r.setEnd(root, root.childNodes.length);
      if (!r.toString().trim()) {
        return;
      }
      var rest = n.splitText(m.index + 1);
      rest.nodeValue = rest.nodeValue.replace(/^\s+/, "");
      n.parentNode.insertBefore(document.createElement("br"), rest);
      return;
    }
  }
  function sync() {
    var a = win.querySelector(".delta3-card .ai-line-1"), b = win.querySelector(".delta3-card .ai-line-2");
    var t1 = a ? a.textContent.trim() : "", t2 = b ? b.textContent.trim() : "";
    var key = t1 + "|" + t2;
    if (key !== lastKey) {
      lastKey = key;
      l1.textContent = t1;
      l2.innerHTML = b ? b.innerHTML : "";
      brAfterFirst(l2);
    }
    var s = sev();
    dock.setAttribute("data-sev", s);
    if (orb && orb.setPalette) {
      orb.setPalette(s);
    }
    var open = win.classList.contains("is-open");
    body.classList.toggle("dchat-open", open);
    var orbOff = open && (mode || "float") !== "window";
    if (orbOff !== body.classList.contains("dchat-orb-off")) {
      body.classList.toggle("dchat-orb-off", orbOff);
      clearTimeout(orbHoldT);
      if (orb && orb.pause) {
        if (orbOff) {
          orbHoldT = setTimeout(function() {
            orb.pause();
          }, 240);
        } else {
          orb.resume();
        }
      }
    }
    orbBtn.setAttribute("aria-expanded", String(open));
    orbBtn.setAttribute("aria-label", open ? "Delta 대화창 닫기" : "Delta 대화창 열기");
    bubble.hidden = open || !t1;
    badge.hidden = open || !bubble.hidden || s !== "critical" && s !== "warning";
  }
  new MutationObserver(sync).observe(win, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [ "class" ]
  });
  function openChat() {
    if (mode === "window" && pop && !pop.closed) {
      pop.focus();
      return;
    }
    if (!win.classList.contains("is-open")) {
      toggle.click();
    }
    sync();
  }
  dock.querySelector(".dchat-bubble-body").addEventListener("click", openChat);
  orbBtn.addEventListener("click", function() {
    if (mode === "window" && pop && !pop.closed) {
      pop.focus();
      return;
    }
    toggle.click();
    sync();
  });
  function place() {
    var sb = stage.getBoundingClientRect();
    var tools = document.querySelector(".map-canvas > .map-tools");
    var tb = tools && tools.getClientRects().length ? tools.getBoundingClientRect() : null;
    var panel = document.querySelector(".right-panel"), pb = panel && panel.getClientRects().length ? panel.getBoundingClientRect() : null;
    var pOut = panel && panel.parentElement, pob = pOut && pOut.getClientRects().length ? pOut.getBoundingClientRect() : null;
    if (pb && pob && pob.bottom > pb.bottom && pob.bottom <= sb.bottom) {
      pb = pob;
    }
    var r = tb ? Math.max(8, sb.right - tb.right) : 16;
    var b = pb ? Math.max(8, sb.bottom - pb.bottom) : 16;
    stage.style.setProperty("--dchat-r", Math.round(r) + "px");
    stage.style.setProperty("--dchat-b", Math.round(b) + "px");
    var sim = document.querySelector(".rsim"), sr = sim && !sim.classList.contains("is-folded") && sim.getClientRects().length ? sim.getBoundingClientRect() : null;
    var lift = sr ? Math.max(b, Math.round(sb.bottom - sr.top + 8)) : b;
    stage.style.setProperty("--dchat-lift", lift + "px");
    var orbL = sb.right - r - 56, ob = sr && sr.right > orbL && sr.left < sb.right - r ? lift : b;
    stage.style.setProperty("--dchat-ob", Math.round(ob) + "px");
    var abB = Math.max(ob, lift);
    var topLim = tb ? tb.bottom - sb.top + 12 : 16;
    var avail = Math.floor(sb.height - topLim - abB);
    var above = (mode || "float") === "float" && avail >= 320;
    body.classList.toggle("dchat-above", above);
    stage.style.setProperty("--dchat-ab", Math.round(abB) + "px");
    stage.style.setProperty("--dchat-sq", Math.min(460, Math.max(320, avail)) + "px");
    var fl = stage.querySelector(":scope > .floating"), mp = stage.querySelector(":scope > .map-panel");
    if (fl && mp && fl.getClientRects().length) {
      var fb = fl.getBoundingClientRect(), mb = mp.getBoundingClientRect();
      var gap = parseFloat(getComputedStyle(stage).columnGap) || 20;
      stage.style.setProperty("--dchat-gap", gap + "px");
      stage.style.setProperty("--dchat-dock-r", Math.round(sb.right - fb.left + gap) + "px");
      stage.style.setProperty("--dchat-dock-t", Math.round(mb.top - sb.top) + "px");
      stage.style.setProperty("--dchat-dock-b", Math.round(sb.bottom - mb.bottom) + "px");
    }
  }
  place();
  window.addEventListener("resize", place);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(place);
    ro.observe(stage);
    var mpEl = stage.querySelector(":scope > .map-panel");
    if (mpEl) {
      ro.observe(mpEl);
    }
  }
  setTimeout(place, 600);
  var simEl = document.querySelector(".rsim");
  if (simEl) {
    new MutationObserver(place).observe(simEl, {
      attributes: true,
      attributeFilter: [ "class", "hidden", "style" ]
    });
  }
  document.addEventListener("click", function() {
    setTimeout(place, 0);
  });
  var KEY_DOCK = "aprism.v7.dchat.dock", KEY_W = "aprism.v7.dchat.w", W_MIN = 320, W_MAX = 560;
  var mode = "float", pop = null, home = null;
  function load(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function save(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  }
  function setW(w) {
    w = Math.max(W_MIN, Math.min(W_MAX, Math.round(w)));
    stage.style.setProperty("--dchat-w", w + "px");
    return w;
  }
  setW(Number(load(KEY_W)) || 380);
  var SVG = {
    float: '<rect x="1.5" y="1.5" width="13" height="13" rx="2"/><rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="currentColor"/>',
    right: '<rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M10 2v12h3a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 13 2z" fill="currentColor"/>',
    window: '<path d="M9.5 1.5h5v5M14.5 1.5 8 8"/><path d="M12.5 9.5v3a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>'
  };
  var LABEL = {
    float: "떠 있기",
    right: "오른쪽에 붙이기",
    window: "새 창으로 열기"
  };
  var bar = document.createElement("span");
  bar.className = "dchat-dockbar";
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "대화창 자리");
  [ "float", "right", "window" ].forEach(function(m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dchat-dock";
    b.setAttribute("data-dock", m);
    b.setAttribute("aria-label", LABEL[m]);
    b.title = LABEL[m];
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SVG[m] + '</svg>';
    b.addEventListener("click", function(event) {
      event.stopPropagation();
      setMode(m);
    });
    bar.appendChild(b);
  });
  var closeBtn = win.querySelector("[data-delta3-close]");
  if (closeBtn) {
    closeBtn.parentNode.insertBefore(bar, closeBtn);
  }
  var edge = document.createElement("span");
  edge.className = "dchat-edge";
  edge.setAttribute("role", "separator");
  edge.setAttribute("aria-orientation", "vertical");
  edge.setAttribute("aria-label", "대화창 폭");
  win.appendChild(edge);
  var drag = null;
  edge.addEventListener("pointerdown", function(event) {
    drag = {
      x: event.clientX,
      w: win.getBoundingClientRect().width
    };
    edge.setPointerCapture(event.pointerId);
    body.classList.add("dchat-resizing");
    event.preventDefault();
  });
  edge.addEventListener("pointermove", function(event) {
    if (drag) {
      setW(drag.w + (drag.x - event.clientX));
    }
  });
  function endDrag() {
    if (!drag) {
      return;
    }
    drag = null;
    body.classList.remove("dchat-resizing");
    save(KEY_W, String(Math.round(win.getBoundingClientRect().width)));
    roomChanged();
  }
  edge.addEventListener("pointerup", endDrag);
  edge.addEventListener("pointercancel", endDrag);
  var roomT = 0;
  function roomChanged() {
    clearTimeout(roomT);
    roomT = setTimeout(function() {
      place();
      document.dispatchEvent(new CustomEvent("aprism:map-room"));
    }, 240);
  }
  function paintBar() {
    bar.querySelectorAll("[data-dock]").forEach(function(b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-dock") === mode));
    });
    body.classList.toggle("dchat-dock-right", mode === "right");
    body.classList.toggle("dchat-dock-window", mode === "window");
  }
  function setMode(m) {
    if (m === mode) {
      return;
    }
    if (m === "window") {
      if (!popOut()) {
        return;
      }
    } else if (mode === "window") {
      popIn(true);
    }
    mode = m;
    if (m !== "window") {
      save(KEY_DOCK, m);
    }
    paintBar();
    place();
    roomChanged();
    sync();
  }
  function popOut() {
    var r = win.getBoundingClientRect();
    var w = Math.max(360, Math.round(r.width) || 380), h = Math.max(520, (Math.round(r.height) || 560) + 40);
    var p = window.open("", "aprism-delta", "popup=yes,width=" + w + ",height=" + h);
    if (!p) {
      return false;
    }
    var d = p.document;
    d.open();
    d.write('<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Delta · APRISM</title></head><body></body></html>');
    d.close();
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"], style'), function(n) {
      var c = d.importNode(n, true);
      if (n.tagName === "LINK") {
        c.href = n.href;
      }
      d.head.appendChild(c);
    });
    var mirror = function() {
      Array.prototype.forEach.call(document.documentElement.attributes, function(a) {
        d.documentElement.setAttribute(a.name, a.value);
      });
      d.body.className = body.className.replace(/\bdchat-[\w-]+/g, "") + " dchat-popup";
    };
    mirror();
    var mo = new MutationObserver(mirror);
    mo.observe(document.documentElement, {
      attributes: true
    });
    mo.observe(body, {
      attributes: true,
      attributeFilter: [ "class" ]
    });
    home = {
      next: win.nextSibling,
      mo: mo
    };
    d.body.appendChild(d.adoptNode(win));
    if (!win.classList.contains("is-open")) {
      toggle.click();
    }
    pop = p;
    p.addEventListener("pagehide", function() {
      if (pop === p) {
        popIn(false);
      }
    });
    var watch = setInterval(function() {
      if (p.closed) {
        clearInterval(watch);
        if (pop === p) {
          popIn(false);
        }
      }
    }, 500);
    p.focus();
    return true;
  }
  function popIn(keep) {
    var p = pop;
    pop = null;
    if (home) {
      home.mo.disconnect();
      stage.insertBefore(document.adoptNode(win), home.next && home.next.parentNode === stage ? home.next : null);
      home = null;
    }
    if (p && !p.closed) {
      try {
        p.close();
      } catch (e) {}
    }
    if (!keep) {
      mode = "float";
      paintBar();
      if (win.classList.contains("is-open")) {
        toggle.click();
      }
      place();
      roomChanged();
      sync();
    }
  }
  window.addEventListener("pagehide", function() {
    if (pop && !pop.closed) {
      pop.close();
    }
  });
  var wasOpen = win.classList.contains("is-open");
  new MutationObserver(function() {
    var o = win.classList.contains("is-open");
    if (o !== wasOpen) {
      wasOpen = o;
      if (mode === "right") {
        roomChanged();
      }
    }
  }).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  if (load(KEY_DOCK) === "right") {
    mode = "right";
  }
  paintBar();
  place();
  sync();
})();
