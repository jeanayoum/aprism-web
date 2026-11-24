(function() {
  "use strict";
  var KEY = "aprism-morph";
  var go = false;
  var CARRY = "aprism-ma-carry";
  document.addEventListener("click", function(e) {
    var more = e.target.closest && e.target.closest("[data-ma-more]");
    if (!more) {
      return;
    }
    go = true;
    var box = more.closest(".map-alert") || document;
    var acts = Array.prototype.map.call(box.querySelectorAll(".ma-check"), function(row) {
      var l = row.querySelector(".ma-check-label");
      return {
        t: (l ? l.textContent : row.getAttribute("data-act") || "").trim(),
        on: row.getAttribute("aria-checked") === "true" || row.getAttribute("aria-pressed") === "true"
      };
    });
    var memo = box.querySelector("[data-ma-memo-field]");
    try {
      sessionStorage.setItem(CARRY, JSON.stringify({
        href: more.getAttribute("href"),
        acts: acts,
        memo: memo ? memo.value : ""
      }));
    } catch (err) {}
  }, true);
  function carryIn() {
    var c = null;
    try {
      c = JSON.parse(sessionStorage.getItem(CARRY) || "null");
      sessionStorage.removeItem(CARRY);
    } catch (err) {
      return;
    }
    if (!c) {
      return;
    }
    var dl = document.querySelector(".sf .dl");
    if (!dl) {
      return;
    }
    var cks = dl.querySelector(".cks");
    var rows = Array.prototype.slice.call(dl.querySelectorAll("label.c1x"));
    c.acts.forEach(function(a) {
      var hit = rows.filter(function(r) {
        var b = r.querySelector("b");
        return b && b.textContent.trim() === a.t;
      })[0];
      if (hit) {
        var inp = hit.querySelector("input");
        if (inp) {
          inp.checked = a.on;
        }
        return;
      }
      if (!a.on || !cks) {
        return;
      }
      var lab = document.createElement("label");
      lab.className = "c1x";
      var inp2 = document.createElement("input");
      inp2.type = "checkbox";
      inp2.checked = true;
      var sp = document.createElement("span");
      var b = document.createElement("b");
      b.textContent = a.t;
      var sm = document.createElement("small");
      sm.textContent = "관제 팝오버에서 고름";
      sp.appendChild(b);
      sp.appendChild(sm);
      lab.appendChild(inp2);
      lab.appendChild(sp);
      cks.appendChild(lab);
    });
    var memo = document.getElementById("sfMemo");
    if (memo && c.memo) {
      memo.value = c.memo;
    }
  }
  if (document.querySelector("[data-sf]") || /safety-v6/.test(location.pathname)) {
    document.addEventListener("DOMContentLoaded", carryIn);
  }
  window.addEventListener("pageswap", function(e) {
    if (!e.viewTransition) {
      return;
    }
    if (!go) {
      e.viewTransition.skipTransition();
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (err) {}
  });
  window.addEventListener("pagereveal", function(e) {
    var ok = false;
    try {
      ok = sessionStorage.getItem(KEY) === "1";
      sessionStorage.removeItem(KEY);
    } catch (err) {}
    if (e.viewTransition && !ok) {
      e.viewTransition.skipTransition();
    }
  });
})();
