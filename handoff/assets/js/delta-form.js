(function() {
  "use strict";
  if (!document.body.classList.contains("ver-3")) {
    return;
  }
  var KEY = "aprism.v3.deltaForm";
  var asked = new URLSearchParams(location.search).get("form");
  var form = null;
  if (document.body.classList.contains("ver-5")) {
    form = "widget";
  } else if (asked === "bar" || asked === "widget") {
    form = asked;
    try {
      localStorage.setItem(KEY, form);
    } catch (e) {}
  } else {
    try {
      form = localStorage.getItem(KEY);
    } catch (e) {
      form = null;
    }
  }
  var win = document.querySelector("[data-delta3]");
  if (form === "bar") {
    document.body.classList.add("d3-bar");
    if (win) {
      win.setAttribute("data-d3-start", "526");
      win.setAttribute("data-d3-min", "420");
    }
  }
  var box = document.getElementById("ai-ask");
  if (!win || !box) {
    return;
  }
  var input = box.querySelector("[data-ai-ask]");
  var body = win.querySelector(".delta3-body");
  var acts = win.querySelector("[data-ai-actions]");
  if (body) {
    if (acts && acts.parentElement !== body) {
      body.appendChild(acts);
    }
    if (box.parentElement !== body) {
      body.appendChild(box);
    }
  }
  if (input && !document.querySelector('script[src*="delta-chat"]')) {
    input.addEventListener("input", function() {
      box.classList.toggle("has-text", input.value.trim() !== "");
    });
  }
  var shown = win.classList.contains("is-open");
  if (shown) {
    box.hidden = false;
  }
  new MutationObserver(function() {
    var now = win.classList.contains("is-open");
    if (now === shown) {
      return;
    }
    shown = now;
    if (!now) {
      return;
    }
    box.hidden = false;
    if (input) {
      setTimeout(function() {
        input.focus({
          preventScroll: true
        });
      }, 300);
    }
  }).observe(win, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
})();
