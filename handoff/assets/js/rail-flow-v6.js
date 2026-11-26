(function() {
  "use strict";
  var tl = null, flow = null, raf = 0;
  function place() {
    raf = 0;
    tl = tl || document.querySelector("[data-timeline]");
    if (!tl) {
      return;
    }
    var hb = tl.getBoundingClientRect();
    tl.querySelectorAll(".timeline-item.is-done .rail-stub, .timeline-item.is-done .rail-line, .timeline-item.is-done .rail-mark").forEach(function(el) {
      var y = el.getBoundingClientRect().top - hb.top + tl.scrollTop;
      el.style.setProperty("--dy", (-((y % 6 + 6) % 6)).toFixed(2) + "px");
    });
    var run = tl.querySelector(".timeline-item.is-running"), prev = run && run.previousElementSibling;
    var a = prev && (prev.querySelector(".rail-mark") || prev.querySelector(".rail-capsule"));
    var b = run && run.querySelector(".rail-mark");
    if (!flow) {
      flow = document.createElement("span");
      flow.className = "rail-flow";
      flow.setAttribute("aria-hidden", "true");
    }
    if (!a || !b) {
      flow.hidden = true;
      return;
    }
    if (flow.parentNode !== tl) {
      tl.appendChild(flow);
    }
    var host = tl.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    var pd = prev.querySelector(".rail-dot"), top = (pd ? pd.getBoundingClientRect().bottom : ra.top + ra.height / 2) - host.top + tl.scrollTop, bottom = (run.querySelector(".rail-dot") || b).getBoundingClientRect().top - host.top + tl.scrollTop;
    var cx = rb.left + rb.width / 2 - host.left + tl.scrollLeft;
    flow.hidden = false;
    flow.style.top = top + "px";
    flow.style.height = Math.max(0, bottom - top) + "px";
    flow.style.left = cx - 5 + "px";
    flow.style.setProperty("--h", Math.max(0, bottom - top) + "px");
  }
  function later() {
    if (!raf) {
      raf = requestAnimationFrame(place);
    }
  }
  function start() {
    if (!document.body.classList.contains("ver-6")) {
      return;
    }
    tl = document.querySelector("[data-timeline]");
    if (!tl) {
      setTimeout(start, 300);
      return;
    }
    if (getComputedStyle(tl).position === "static") {
      tl.style.position = "relative";
    }
    new MutationObserver(later).observe(tl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [ "class" ]
    });
    window.addEventListener("resize", later);
    later();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
