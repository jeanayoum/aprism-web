(function() {
  "use strict";
  var EN = /-en\.html$/.test(location.pathname);
  var VER = (/control-(v\d+)/.exec(location.pathname) || [ , "v6" ])[1];
  var SELF = "control-" + VER + (EN ? "-en" : "") + ".html";
  var BLD = "building-" + VER + (EN ? "-en" : "") + ".html";
  var MAIN = "main-" + VER + (EN ? "-en" : "") + ".html";
  var q = location.search;
  var keep = (q.match(/[?&](theme|palette|delta|glow)=[\w-]+/g) || []).map(function(s) {
    return s.slice(1);
  });
  function src(page, extra) {
    var a = keep.concat(extra || []);
    return page + (a.length ? "?" + a.join("&") : "");
  }
  var bld = document.getElementById("v-building"), main = document.getElementById("v-main");
  var mission = (/[?&]mission=([^&#]+)/.exec(q) || [])[1];
  var floor = (/[?&]floor=(B\d+)/.exec(q) || [])[1];
  var startMain = !!mission && !/[?&]view=building/.test(q);
  var LAST = "aprism-v7-last-view", REMEMBER = VER === "v7" && !EN;
  if (REMEMBER && /[?&]view=last/.test(q)) {
    var seen = null;
    try {
      seen = localStorage.getItem(LAST);
    } catch (e) {}
    if (seen && seen !== "building") {
      mission = seen;
      startMain = true;
    }
  }
  bld.src = src(BLD);
  main.src = src(MAIN, mission ? [ "mission=" + mission ].concat(floor ? [ "floor=" + floor ] : []) : []);
  function show(which) {
    bld.classList.toggle("is-on", which === "building");
    main.classList.toggle("is-on", which === "main");
    var on = which === "building" ? bld : main;
    try {
      document.title = on.contentDocument.title;
      on.contentWindow.focus();
    } catch (e) {}
    try {
      on.contentWindow.dispatchEvent(new Event("resize"));
    } catch (e) {}
  }
  function setUrl(extra) {
    history.replaceState(null, "", SELF + "?" + keep.concat(extra).join("&"));
    if (!REMEMBER) {
      return;
    }
    var v = extra[0] === "view=building" ? "building" : (/^mission=(.+)$/.exec(extra[0] || "") || [])[1];
    try {
      if (v) {
        localStorage.setItem(LAST, v);
      }
    } catch (e) {}
  }
  function toMain(url) {
    var m = (/[?&]mission=([^&#]+)/.exec(url) || [])[1];
    var f = (/[?&]floor=(B\d+)/.exec(url) || [])[1];
    var al = (/[?&]alert=([^&#]+)/.exec(url) || [])[1], wp = (/[?&]wp=(WP-\d+)/.exec(url) || [])[1];
    var name = m ? decodeURIComponent(m.replace(/\+/g, " ")) : null;
    var w = main.contentWindow;
    if (name && w && w.APRISM_SCOPE_TO) {
      w.APRISM_SCOPE_TO(name);
      if (f) {
        var b = w.document.querySelector('[data-map-floor="' + f + '"]');
        if (b && !b.classList.contains("is-on")) {
          b.click();
        }
      }
      if (al && w.APRISM_OPEN_ALERT) {
        w.APRISM_OPEN_ALERT(name, decodeURIComponent(al), wp);
      }
    } else if (name) {
      main.src = src(MAIN, [ "mission=" + m ].concat(f ? [ "floor=" + f ] : [], al ? [ "alert=" + al, "wp=" + wp ] : []));
    }
    show("main");
    setUrl(m ? [ "mission=" + m ].concat(f ? [ "floor=" + f ] : []) : []);
  }
  function toBuilding() {
    show("building");
    setUrl([ "view=building" ]);
  }
  function guard(frame) {
    var w = frame.contentWindow;
    w.APRISM_SHELL = {
      open: function(url) {
        route(new URL(url, w.location.href).href);
      }
    };
    if (!w.navigation) {
      return;
    }
    w.navigation.addEventListener("navigate", function(e) {
      if (!e.cancelable || e.hashChange || e.downloadRequest) {
        return;
      }
      var to = e.destination.url;
      if (to.split("#")[0] === w.location.href.split("#")[0]) {
        return;
      }
      e.preventDefault();
      route(to);
    });
  }
  function route(to) {
    if (VER !== "v6" && !EN) {
      to = to.replace(/(\/)(mission-setup|mission-precheck|building|main|control|alert-center|safety|report)-v6\.html/, "$1$2-" + VER + ".html");
    }
    var path = new URL(to).pathname;
    if (/\/main-v\d+(-en)?\.html$/.test(path)) {
      toMain(to);
    } else if (/\/building-v\d+(-en)?\.html$/.test(path)) {
      toBuilding();
    } else {
      location.href = to;
    }
  }
  bld.addEventListener("load", function() {
    guard(bld);
  });
  main.addEventListener("load", function() {
    guard(main);
    var d = main.contentDocument, last = "";
    var dict = main.contentWindow.APRISM_EN || {};
    function ko(n) {
      if (/[가-힣]/.test(n)) {
        return n;
      }
      for (var k in dict) {
        if (dict[k] === n) {
          return k;
        }
      }
      return n;
    }
    new MutationObserver(function() {
      var on = d.querySelector(".sb-tab.is-on[data-mission]");
      var m = on && ko(on.getAttribute("data-mission"));
      if (!m || m === last || !main.classList.contains("is-on")) {
        return;
      }
      last = m;
      setUrl([ "mission=" + encodeURIComponent(m) ]);
    }).observe(d.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [ "class" ]
    });
  });
  show(startMain ? "main" : "building");
})();
