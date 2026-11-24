(function() {
  var STORAGE_KEY = "aprism-theme";
  var root = document.documentElement;
  var button = document.querySelector("[data-theme-toggle]");
  var label = document.querySelector("[data-theme-label]");
  function read() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }
  function save(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {}
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (button && button.classList.contains("theme-chip")) {
      button.setAttribute("aria-label", theme === "light" ? "다크 모드로 바꾸기" : "라이트 모드로 바꾸기");
      button.title = theme === "light" ? "다크 모드" : "라이트 모드";
    }
    if (label) {
      label.textContent = theme === "light" ? "Light" : "Dark";
    }
  }
  function forced() {
    var m = /[?&]theme=(light|dark)/.exec(location.search);
    return m ? m[1] : null;
  }
  apply(forced() || (read() === "light" ? "light" : "dark"));
  var palette = /[?&]palette=(neutral)/.exec(location.search);
  if (palette) {
    root.setAttribute("data-palette", palette[1]);
  }
  var delta = /[?&]delta=(glass|off)/.exec(location.search);
  if (delta && delta[1] === "off") {
    root.removeAttribute("data-delta");
  } else if (delta) {
    root.setAttribute("data-delta", delta[1]);
  }
  var glow = /[?&]glow=(top|off)/.exec(location.search);
  if (glow && glow[1] === "off") {
    root.removeAttribute("data-glow");
  } else if (glow) {
    root.setAttribute("data-glow", glow[1]);
  }
  if (button) {
    button.addEventListener("click", function() {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      save(next);
      if (forced() && window.history && history.replaceState) {
        history.replaceState(null, "", location.href.replace(/([?&]theme=)(light|dark)/, "$1" + next));
      }
    });
  }
})();

(function() {
  var HEIGHTS = [ 5, 8, 11, 14 ];
  function draw(b) {
    var d = window.devicePixelRatio || 1;
    var w = Math.round(3 * d), g = Math.round(2 * d);
    var hs = HEIGHTS.map(function(h) {
      return Math.round(h * d);
    });
    var W = 4 * w + 3 * g, H = hs[3];
    var raw = b.getAttribute("data-level");
    var level = raw === null || raw === "" ? 4 : Number(raw);
    if (isNaN(level)) {
      level = 4;
    }
    var svg = b.querySelector("svg.signal-svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "signal-svg");
      svg.setAttribute("aria-hidden", "true");
      b.appendChild(svg);
    }
    svg.setAttribute("width", String(W / d));
    svg.setAttribute("height", String(H / d));
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = hs.map(function(h, k) {
      return '<rect x="' + k * (w + g) + '" y="' + (H - h) + '" width="' + w + '" height="' + h + '" rx="' + w / 2 + '"' + (k < level ? ' fill="currentColor"' : ' class="off"') + "/>";
    }).join("");
    b.classList.add("is-svg");
    svg.style.transform = "";
    var r = svg.getBoundingClientRect();
    var ox = (Math.round(r.left * d) - r.left * d) / d;
    var oy = (Math.round(r.top * d) - r.top * d) / d;
    if (Math.abs(ox) > 0.001 || Math.abs(oy) > 0.001) {
      svg.style.transform = "translate(" + ox.toFixed(4) + "px," + oy.toFixed(4) + "px)";
    }
  }
  function all() {
    Array.prototype.forEach.call(document.querySelectorAll(".signal-bars"), draw);
  }
  var t = null;
  function later() {
    clearTimeout(t);
    t = setTimeout(all, 30);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", all);
  } else {
    all();
  }
  window.addEventListener("load", later);
  window.addEventListener("resize", later);
  if (window.matchMedia) {
    (function watch() {
      var mq = window.matchMedia("(resolution: " + (window.devicePixelRatio || 1) + "dppx)");
      var on = function() {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", on);
        } else {
          mq.removeListener(on);
        }
        all();
        watch();
      };
      if (mq.addEventListener) {
        mq.addEventListener("change", on);
      } else if (mq.addListener) {
        mq.addListener(on);
      }
    })();
  }
  if (window.MutationObserver) {
    new MutationObserver(function(ms) {
      for (var i = 0; i < ms.length; i += 1) {
        var m = ms[i];
        if (m.type === "attributes" && m.target.classList && m.target.classList.contains("signal-bars")) {
          draw(m.target);
        } else if (m.type === "childList") {
          later();
        }
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [ "data-level" ]
    });
  }
})();
