(function() {
  "use strict";
  var win = document.querySelector("[data-delta3]");
  if (!win) {
    return;
  }
  var stage = win.parentElement;
  var head = win.querySelector("[data-delta3-drag]");
  var close = win.querySelector("[data-delta3-close]");
  var toggle = document.querySelector("[data-ai-toggle]");
  var map = document.querySelector(".map-panel");
  var moved = null;
  function isOpen() {
    return win.classList.contains("is-open");
  }
  function clamp(left, top) {
    var sw = stage.clientWidth;
    var sh = stage.clientHeight;
    var w = win.offsetWidth;
    var h = win.offsetHeight;
    return {
      left: Math.max(8, Math.min(sw - w - 8, left)),
      top: Math.max(8, Math.min(sh - h - 8, top))
    };
  }
  function middle() {
    var box = (map || stage).getBoundingClientRect();
    var base = stage.getBoundingClientRect();
    return clamp(box.left - base.left + (box.width - win.offsetWidth) / 2, box.top - base.top + (box.height - win.offsetHeight) / 2);
  }
  function place(at) {
    win.style.left = at.left + "px";
    win.style.top = at.top + "px";
    light();
  }
  var openAt = (win.getAttribute("data-d3-open-at") || "").split(",").map(Number);
  function start() {
    return openAt.length === 2 && !isNaN(openAt[0]) && !isNaN(openAt[1]) ? clamp(openAt[0], openAt[1]) : middle();
  }
  function opened() {
    place(moved ? clamp(moved.left, moved.top) : start());
  }
  function closed() {
    win.style.left = "";
    win.style.top = "";
  }
  function light() {
    if (!isOpen()) {
      return;
    }
    var box = win.getBoundingClientRect();
    var base = stage.getBoundingClientRect();
    var dx = box.left - base.left + box.width / 2 - 22;
    var dy = box.top - base.top + box.height / 2 - 22;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / dist;
    var uy = dy / dist;
    var far = Math.sqrt(base.width * base.width + base.height * base.height) || 1;
    var power = Math.max(0.55, 1 - 0.45 * (dist / far));
    win.style.setProperty("--d3-ox", (-ux * 10).toFixed(1) + "px");
    win.style.setProperty("--d3-oy", (-uy * 10).toFixed(1) + "px");
    win.style.setProperty("--d3-ix", (-ux * 7).toFixed(1) + "px");
    win.style.setProperty("--d3-iy", (-uy * 7).toFixed(1) + "px");
    win.style.setProperty("--d3-ex", (ux * 4).toFixed(1) + "px");
    win.style.setProperty("--d3-ey", (uy * 4).toFixed(1) + "px");
    win.style.setProperty("--d3-power", power.toFixed(3));
  }
  var was = null;
  function morph() {
    if (!was || !win.animate) {
      was = null;
      return;
    }
    var to = win.getBoundingClientRect();
    if (!to.width || !was.width) {
      was = null;
      return;
    }
    var sx = was.width / to.width;
    var sy = was.height / to.height;
    var dx = was.left - to.left;
    var dy = was.top - to.top;
    was = null;
    win.animate([ {
      transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")"
    }, {
      transform: "none"
    } ], {
      duration: 280,
      easing: "cubic-bezier(.2,.9,.25,1)"
    });
    win.style.transformOrigin = "top left";
    var card = win.querySelector(".delta3-card");
    if (card) {
      card.animate([ {
        opacity: 0
      }, {
        opacity: 1
      } ], {
        duration: 260,
        easing: "ease-out"
      });
    }
  }
  document.addEventListener("click", function(event) {
    if (!event.target.closest("[data-ai-toggle], [data-delta3-close]")) {
      return;
    }
    was = win.getBoundingClientRect();
  }, true);
  var shown = isOpen();
  new MutationObserver(function() {
    if (isOpen() === shown) {
      return;
    }
    shown = !shown;
    if (shown) {
      opened();
    } else {
      closed();
    }
    light();
    morph();
  }).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  if (isOpen()) {
    opened();
    light();
  }
  var grab = null;
  head.addEventListener("pointerdown", function(event) {
    if (!isOpen() || event.target.closest("button")) {
      return;
    }
    grab = {
      x: event.clientX,
      y: event.clientY,
      left: win.offsetLeft,
      top: win.offsetTop
    };
    win.classList.add("is-dragging");
    head.setPointerCapture(event.pointerId);
  });
  head.addEventListener("pointermove", function(event) {
    if (!grab) {
      return;
    }
    moved = clamp(grab.left + event.clientX - grab.x, grab.top + event.clientY - grab.y);
    place(moved);
  });
  function drop() {
    grab = null;
    win.classList.remove("is-dragging");
  }
  head.addEventListener("pointerup", drop);
  head.addEventListener("pointercancel", drop);
  if (close && toggle) {
    close.addEventListener("click", function() {
      toggle.click();
    });
  }
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && isOpen() && toggle) {
      toggle.click();
    }
  });
  var dots = document.querySelector("[data-delta-dots]");
  if (dots) {
    new MutationObserver(function() {
      dots.classList.remove("is-enter");
      void dots.offsetWidth;
      dots.classList.add("is-enter");
    }).observe(document.body, {
      attributes: true,
      attributeFilter: [ "data-level" ]
    });
  }
  var lights = win.querySelectorAll(".delta3-light img");
  var tint = null;
  function tintLights() {
    var next = win.classList.contains("is-critical") ? "-critical" : win.classList.contains("is-warning") ? "-warning" : "";
    if (next === tint) {
      return;
    }
    tint = next;
    Array.prototype.forEach.call(lights, function(img) {
      img.src = img.src.replace(/(delta-light-[a-z0-9-]+?)(-critical|-warning)?\.svg/, "$1" + next + ".svg");
    });
  }
  new MutationObserver(tintLights).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  tintLights();
  window.addEventListener("resize", function() {
    if (!isOpen()) {
      return;
    }
    var at = clamp(win.offsetLeft, win.offsetTop);
    if (moved) {
      moved = at;
    }
    place(at);
  });
})();
