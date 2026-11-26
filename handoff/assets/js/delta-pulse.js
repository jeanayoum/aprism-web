(function() {
  "use strict";
  if (document.documentElement.getAttribute("data-delta") !== "glass") {
    return;
  }
  var body = document.body;
  var last = null;
  function surge() {
    body.classList.remove("is-surge");
    void body.offsetWidth;
    body.classList.add("is-surge");
  }
  function check() {
    var now = body.getAttribute("data-level");
    if (now === "critical" && last !== "critical") {
      surge();
    }
    last = now;
  }
  new MutationObserver(check).observe(body, {
    attributes: true,
    attributeFilter: [ "data-level" ]
  });
  document.addEventListener("aprism:estop", function() {
    setTimeout(surge, 0);
  });
  check();
})();
