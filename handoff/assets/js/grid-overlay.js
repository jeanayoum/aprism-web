(function() {
  "use strict";
  var host = document.querySelector(".two-col");
  if (!host) {
    return;
  }
  var overlay = null;
  function columns() {
    var v = getComputedStyle(document.documentElement).getPropertyValue("--grid-columns");
    return parseInt(v, 10) || 12;
  }
  function show() {
    if (overlay) {
      return;
    }
    overlay = document.createElement("div");
    overlay.className = "grid-overlay";
    overlay.setAttribute("aria-hidden", "true");
    for (var i = 0, n = columns(); i < n; i++) {
      overlay.appendChild(document.createElement("i"));
    }
    host.appendChild(overlay);
  }
  function hide() {
    if (!overlay) {
      return;
    }
    host.removeChild(overlay);
    overlay = null;
  }
  if (/[?&]grid=1/.test(location.search)) {
    show();
  }
  document.addEventListener("keydown", function(event) {
    if (event.key !== "g" && event.key !== "G") {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    var el = event.target;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
      return;
    }
    if (overlay) {
      hide();
    } else {
      show();
    }
  });
})();
