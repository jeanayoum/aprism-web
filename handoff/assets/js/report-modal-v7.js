(function() {
  "use strict";
  if (!document.body.classList.contains("ver-7") || document.documentElement.lang === "en") {
    return;
  }
  var frame = null, back = null;
  function close() {
    if (!frame) {
      return;
    }
    frame.remove();
    frame = null;
    if (back && back.isConnected) {
      back.focus();
    }
  }
  function open(from) {
    close();
    back = from;
    frame = document.createElement("iframe");
    frame.className = "rp-embed-frame";
    frame.title = "미션 보고서";
    frame.src = "./report-v7.html?embed=modal";
    frame.addEventListener("load", function() {
      try {
        frame.contentWindow.focus();
      } catch (e) {}
    });
    document.body.appendChild(frame);
  }
  document.addEventListener("click", function(e) {
    var a = e.target.closest && e.target.closest("[data-rr-report]");
    if (!a) {
      return;
    }
    e.preventDefault();
    open(a);
  }, true);
  window.addEventListener("message", function(e) {
    var d = e.data || {};
    if (d.aprism === "report-close") {
      close();
    }
    if (d.aprism === "report-menu") {
      location.href = "./report-v7.html";
    }
  });
})();
