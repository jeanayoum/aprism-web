(function() {
  "use strict";
  if (!document.body.classList.contains("ver-7")) {
    return;
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var DUR = 600;
  var timer = 0;
  function pct() {
    return document.querySelector("[data-progress-percent]");
  }
  function wpn() {
    return document.querySelector(".rr-wp-head .rr-wp-n");
  }
  function track() {
    return document.querySelector(".rc-box [data-progress-track]");
  }
  function target(el) {
    if (!el) {
      return null;
    }
    var t = el.textContent.trim(), m = /^(\d+)\s*(?:%|\/\s*(\d+))?$/.exec(t);
    if (!m) {
      return null;
    }
    if (m[2] !== undefined) {
      el.setAttribute("data-cu-total", m[2]);
    }
    return Number(m[1]);
  }
  function wrap(el) {
    var tn = el.firstChild;
    if (!tn || tn.nodeType !== 3 || !tn.nodeValue.trim()) {
      return false;
    }
    var sp = document.createElement("span");
    sp.className = "cu-raw";
    if (el.hasAttribute("data-cu-total")) {
      sp.setAttribute("data-cu-total", el.getAttribute("data-cu-total"));
    }
    el.insertBefore(sp, tn);
    sp.appendChild(tn);
    return true;
  }
  function unwrap(el) {
    Array.prototype.forEach.call(el.querySelectorAll(".cu-raw"), function(sp) {
      while (sp.firstChild) {
        sp.parentNode.insertBefore(sp.firstChild, sp);
      }
      sp.remove();
    });
    el.normalize();
  }
  function stop() {
    clearTimeout(timer);
    [ pct(), wpn() ].forEach(function(el) {
      if (el) {
        el.classList.remove("is-counting");
        el.style.removeProperty("--cu-n");
        unwrap(el);
      }
    });
    var tr = track();
    if (tr) {
      tr.classList.remove("cu-zero", "cu-run");
    }
  }
  function run() {
    if (reduce && reduce.matches) {
      return;
    }
    stop();
    var els = [ pct(), wpn() ].filter(function(el) {
      return el && target(el) && wrap(el);
    });
    var tr = track();
    if (!els.length) {
      return;
    }
    els.forEach(function(el) {
      el.style.setProperty("--cu-n", "0");
      el.classList.add("is-counting");
    });
    if (tr) {
      tr.classList.add("cu-zero");
    }
    void document.body.offsetWidth;
    els.forEach(function(el) {
      el.style.setProperty("--cu-n", String(target(el)));
    });
    if (tr) {
      tr.classList.remove("cu-zero");
      tr.classList.add("cu-run");
    }
    timer = setTimeout(stop, DUR + 80);
  }
  function follow(el) {
    if (!el) {
      return;
    }
    new MutationObserver(function() {
      if (!el.classList.contains("is-counting")) {
        return;
      }
      var n = target(el);
      if (n === null) {
        stop();
      } else {
        el.style.setProperty("--cu-n", String(n));
      }
    }).observe(el, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  function soon() {
    clearTimeout(timer);
    timer = setTimeout(run, 40);
  }
  document.addEventListener("aprism:mission", soon);
  window.addEventListener("load", function() {
    setTimeout(function() {
      follow(pct());
      run();
    }, 120);
  });
})();
