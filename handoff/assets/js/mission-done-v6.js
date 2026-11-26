(function() {
  "use strict";
  var left = document.querySelector(".status-bar-left");
  var head = document.querySelector(".right-panel .mission-header");
  if (!left || !head) {
    return;
  }
  var box = document.createElement("div");
  box.className = "md-actions";
  box.hidden = true;
  box.innerHTML = '<a class="btn is-xs btn-secondary" href="./report-v6.html" data-md-report>' + '<span class="i i-16" style="--i:var(--ic-document)" aria-hidden="true"></span>보고서 보기</a>' + '<a class="btn is-xs btn-secondary" href="./mission-setup-v6.html" data-md-again>다시 실행</a>';
  head.appendChild(box);
  var again = box.querySelector("[data-md-again]");
  function sync() {
    var on = left.querySelector(".sb-tab.is-on");
    var done = !!(on && on.getAttribute("data-run") === "done");
    box.hidden = !done;
    if (done) {
      again.href = "./mission-setup-v6.html?mission=" + encodeURIComponent(on.getAttribute("data-mission") || "");
    }
  }
  var downX = 0;
  left.addEventListener("pointerdown", function(event) {
    downX = event.clientX;
  }, true);
  left.addEventListener("click", function(event) {
    var tab = event.target.closest && event.target.closest(".sb-tab[data-run='idle']");
    if (!tab || Math.abs(event.clientX - downX) > 5) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    window.location.href = (window.aprismHref || String)("./mission-setup-v6.html?mission=" + encodeURIComponent(tab.getAttribute("data-mission") || ""));
  }, true);
  sync();
  new MutationObserver(sync).observe(left, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ "class" ]
  });
})();
