(function() {
  "use strict";
  if (!document.body.classList.contains("v2-2")) {
    return;
  }
  var win = document.querySelector("[data-delta3]");
  if (!win) {
    return;
  }
  var stage = win.parentElement;
  var MIN = +win.getAttribute("data-d3-min") || 320;
  var START = +win.getAttribute("data-d3-start") || 395;
  var MAX = 720;
  var STEP = 16;
  var width = START;
  function isOpen() {
    return win.classList.contains("is-open");
  }
  function most() {
    return Math.max(MIN, Math.min(MAX, stage.clientWidth - 16));
  }
  function set(w, side) {
    w = Math.round(Math.max(MIN, Math.min(most(), w)));
    var left = win.offsetLeft;
    var right = left + win.offsetWidth;
    width = w;
    win.style.setProperty("--d3-w", w + "px");
    var nextLeft = side === "left" ? right - w : left;
    nextLeft = Math.max(8, Math.min(stage.clientWidth - w - 8, nextLeft));
    win.style.left = nextLeft + "px";
    grips.forEach(function(g) {
      g.setAttribute("aria-valuenow", String(w));
    });
  }
  var grips = [ "left", "right" ].map(function(side) {
    var g = document.createElement("div");
    g.className = "d3-grip is-" + side;
    g.tabIndex = 0;
    g.setAttribute("role", "separator");
    g.setAttribute("aria-orientation", "vertical");
    g.setAttribute("aria-label", "Delta 창 너비");
    g.setAttribute("aria-valuemin", String(MIN));
    g.setAttribute("aria-valuemax", String(MAX));
    g.setAttribute("aria-valuenow", String(START));
    g.title = "끌어서 너비 조절 · 두 번 눌러 처음 너비로";
    win.appendChild(g);
    var grab = null;
    g.addEventListener("pointerdown", function(event) {
      if (!isOpen() || event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      grab = {
        x: event.clientX,
        w: win.offsetWidth
      };
      win.classList.add("is-dragging", "is-resizing");
      try {
        g.setPointerCapture(event.pointerId);
      } catch (e) {}
    });
    g.addEventListener("pointermove", function(event) {
      if (!grab) {
        return;
      }
      var dx = event.clientX - grab.x;
      set(grab.w + (side === "left" ? -dx : dx), side);
    });
    function drop() {
      if (!grab) {
        return;
      }
      grab = null;
      win.classList.remove("is-dragging", "is-resizing");
      window.dispatchEvent(new Event("resize"));
    }
    g.addEventListener("pointerup", drop);
    g.addEventListener("pointercancel", drop);
    g.addEventListener("dblclick", function() {
      set(START, side);
      window.dispatchEvent(new Event("resize"));
    });
    g.addEventListener("keydown", function(event) {
      var d = event.key === "ArrowRight" ? STEP : event.key === "ArrowLeft" ? -STEP : 0;
      if (event.key === "Home") {
        set(START, side);
        event.preventDefault();
        return;
      }
      if (!d) {
        return;
      }
      event.preventDefault();
      set(win.offsetWidth + (side === "left" ? -d : d), side);
    });
    return g;
  });
  new MutationObserver(function() {
    if (isOpen() && width > most()) {
      win.style.setProperty("--d3-w", most() + "px");
    }
  }).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
})();
