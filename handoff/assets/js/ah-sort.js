(function() {
  "use strict";
  var KEY = "aprism-ah-sort";
  var LABEL = {
    old: "오래된 순",
    new: "최신 순"
  };
  var HINT = "위험 알림이 먼저, 같은 단계 안에서 시간 순서. 누르면 순서를 바꾼다";
  var mode = "old";
  try {
    if (localStorage.getItem(KEY) === "new") {
      mode = "new";
    }
  } catch (e) {}
  function time(a, b) {
    var d = a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
    return mode === "new" ? -d : d;
  }
  function mount(onChange) {
    var slot = document.querySelector(".ah-order");
    if (!slot || slot.hasAttribute("data-ah-sort")) {
      return;
    }
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ah-order ah-sort-btn ds-bleed t-caption";
    b.setAttribute("data-ah-sort", "");
    b.setAttribute("aria-label", "정렬 바꾸기");
    b.title = HINT;
    var ic = document.createElement("span");
    ic.className = "i i-16";
    ic.setAttribute("aria-hidden", "true");
    ic.style.setProperty("--i", "var(--ic-sort)");
    var label = document.createElement("span");
    b.appendChild(ic);
    b.appendChild(label);
    function sync() {
      label.textContent = LABEL[mode];
      b.setAttribute("data-mode", mode);
    }
    b.addEventListener("click", function() {
      mode = mode === "old" ? "new" : "old";
      try {
        localStorage.setItem(KEY, mode);
      } catch (e) {}
      sync();
      if (onChange) {
        onChange(mode);
      }
    });
    sync();
    slot.replaceWith(b);
  }
  window.APRISM_AH_SORT = {
    mount: mount,
    time: time,
    get: function() {
      return mode;
    }
  };
})();

(function() {
  "use strict";
  if (!document.body || !document.body.classList.contains("ver-6")) {
    return;
  }
  function attach(list) {
    var box = list.parentElement;
    if (!box || list.hasAttribute("data-ah-thumb")) {
      return;
    }
    list.setAttribute("data-ah-thumb", "");
    var t = document.createElement("span");
    t.className = "ah-thumb";
    t.setAttribute("aria-hidden", "true");
    t.hidden = true;
    box.appendChild(t);
    var th = 0;
    function update() {
      var h = list.clientHeight, sh = list.scrollHeight;
      if (sh <= h + 1 || !h) {
        t.hidden = true;
        return;
      }
      t.hidden = false;
      th = Math.max(24, Math.round(h * h / sh));
      t.style.height = th + "px";
      t.style.top = Math.round(list.offsetTop + (h - th) * list.scrollTop / (sh - h)) + "px";
    }
    list.addEventListener("scroll", update, {
      passive: true
    });
    if (window.ResizeObserver) {
      new ResizeObserver(update).observe(list);
    }
    new MutationObserver(update).observe(list, {
      childList: true,
      subtree: true
    });
    t.addEventListener("pointerdown", function(e) {
      e.preventDefault();
      var y0 = e.clientY, s0 = list.scrollTop;
      t.classList.add("is-drag");
      t.setPointerCapture(e.pointerId);
      function move(ev) {
        var h = list.clientHeight, sh = list.scrollHeight;
        list.scrollTop = s0 + (ev.clientY - y0) * (sh - h) / Math.max(1, h - th);
      }
      function up() {
        t.classList.remove("is-drag");
        t.removeEventListener("pointermove", move);
        t.removeEventListener("pointerup", up);
        t.removeEventListener("pointercancel", up);
      }
      t.addEventListener("pointermove", move);
      t.addEventListener("pointerup", up);
      t.addEventListener("pointercancel", up);
    });
    update();
  }
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(".ah-box > .ah-list"), attach);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
