(function() {
  "use strict";
  var view = document.querySelector("[data-map]");
  var hit = document.querySelector(".map-canvas");
  var canvas = view && view.querySelector("[data-map-scene]");
  if (!view || !hit || !canvas) {
    return;
  }
  var MAX_ZOOM = 8;
  var MIN_ZOOM = 0.3;
  var FIT_AIR = 1.08;
  var WHEEL_STEP = 1.0015;
  var BUTTON_STEP = 1.5;
  var HOME_YAW = Math.PI / 4;
  var HOME_PITCH = Math.asin(0.85 / Math.sqrt(1 + 0.85 * 0.85 + 1));
  var TOP_PITCH = 89 * Math.PI / 180;
  var LOW_PITCH = 6 * Math.PI / 180;
  var TURN = 0.006;
  var REACH = 3;
  var EYE = 9;
  var yaw = HOME_YAW;
  var pitch = HOME_PITCH;
  var dirV = null;
  var WORLD_UP = null;
  var PALETTE = {
    floor: {
      face: 0x18202e,
      line: 0.25,
      peak: 0.25,
      lift: 0
    },
    wall: {
      face: 0x3a475f,
      line: 0.7,
      peak: 0.9,
      lift: 0.55
    },
    equipment: {
      face: 0x41506a,
      line: 0.7,
      peak: 1,
      lift: 0.4
    },
    stairs: {
      face: 0x34405a,
      line: 0.32,
      peak: 0.5,
      lift: 0.45
    },
    other: {
      face: 0x36435a,
      line: 0.7,
      peak: 0.95,
      lift: 0.4
    }
  };
  function snapPx(v) {
    var d = window.devicePixelRatio || 1;
    return Math.round(v * d) / d + "px";
  }
  var OPT = {
    radius: 32,
    enter: 0.2,
    leave: 0.12,
    fadeTo: 0.35,
    fadeSoft: 0.35,
    samples: 48,
    topPitch: 75,
    robotTarget: true,
    routeGhost: true,
    stairTags: true,
    arriveOverview: true
  };
  var EDGE = 0x7b8fb4;
  var GHOST = 0x6a7890;
  var GRID = 0x1f2a3c;
  var LIGHT = {
    face: {
      floor: 0xbfc4cc,
      wall: 0xdfe2e6,
      equipment: 0xe1e4e8,
      stairs: 0xd8dbdf,
      other: 0xdfe2e6
    },
    edge: 0x868c93,
    ghost: 0xf2f4f5,
    grid: 0xc4c9d1,
    pickFace: 0xcfe0ff,
    pickLine: 0x1d5fd6,
    hoverLine: 0x5b6577
  };
  var LIGHT_LIFT = 0.18;
  var NEUTRAL = {
    face: {
      floor: 0x1f2022,
      wall: 0x464749,
      equipment: 0x4e5052,
      stairs: 0x3f4043,
      other: 0x414345
    },
    edge: 0x8d8f91,
    ghost: 0x76777a,
    grid: 0x292a2c,
    pickFace: 0xb5b7b9,
    pickLine: 0xe1e3e6,
    hoverLine: 0xd3d5d8
  };
  function isNeutral() {
    return THEMED && document.documentElement.getAttribute("data-palette") === "neutral";
  }
  var THEMED = document.body.classList.contains("v2-2");
  function isLight() {
    return THEMED && document.documentElement.getAttribute("data-theme") === "light";
  }
  var PICK_FACE = 0xafb7c8;
  var PICK_LINE = 0xe0e3e9;
  var HOVER_LINE = 0x9aa1ae;
  var FACE_SHARE = 0.01;
  var ROBOTS = [ {
    name: "ROBOT 01",
    at: 0.31,
    dock: [ 0.59, 0.66 ],
    stops: [ [ 0.10, 0.66 ], [ 0.05, 0.90 ], [ 0.10, 0.51 ], [ 0.47, 0.51 ], [ 0.15, 0.11 ], [ 0.64, 0.11 ] ],
    done: 0x89b9ed,
    left: 0x4990e0,
    dot: 0xc7ddf8
  }, {
    name: "ROBOT 02",
    at: 0.58,
    dock: [ 0.72, 0.06 ],
    stops: [ [ 0.60, 0.29 ], [ 0.30, 0.30 ], [ 0.15, 0.20 ] ],
    done: 0x34c759,
    left: 0x1da67f,
    dot: 0x72f494
  }, {
    name: "ROBOT 03",
    at: 0.18,
    dock: [ 0.30, 0.98 ],
    stops: [ [ 0.62, 0.88 ], [ 0.85, 0.88 ], [ 0.85, 0.70 ] ],
    done: 0xffcc00,
    left: 0xeeda6b,
    dot: 0xf8ebae
  } ];
  var PRESTART = document.body.classList.contains("ver-7") && document.documentElement.lang !== "en" && /^(setup|precheck)$/.test(document.body.getAttribute("data-stage") || "") && !!document.querySelector("[data-mp-plan]");
  if (PRESTART) {
    ROBOTS[0].at = 0;
  }
  function preName() {
    var n = document.querySelector("[data-mp-robot] [data-select-value] .field-option-name");
    return n ? n.textContent.trim() : "";
  }
  if (PRESTART) {
    document.addEventListener("aprism:select", function() {
      setTimeout(function() {
        var t = preName();
        if (!t) {
          return;
        }
        Array.prototype.forEach.call(document.querySelectorAll("[data-map-bot-name], [data-map-bot-title], [data-map-card-robot]"), function(e) {
          e.textContent = t;
        });
      }, 0);
    });
  }
  if (PRESTART && window.MutationObserver) {
    new MutationObserver(function() {
      if (typeof frame === "function") {
        frame();
      }
    }).observe(document.body, {
      attributes: true,
      attributeFilter: [ "data-precheck", "data-stage" ]
    });
  }
  ROBOTS[4] = {
    name: "ROBOT 05",
    at: 0.6,
    dock: [ 0.72, 0.06 ],
    stops: [ [ 0.60, 0.29 ], [ 0.30, 0.30 ], [ 0.15, 0.20 ] ],
    done: 0x89b9ed,
    left: 0x4990e0,
    dot: 0xc7ddf8
  };
  ROBOTS[3] = {
    name: "ROBOT 04",
    at: 1,
    floor: "B4",
    ended: true,
    dock: [ 0.86, 0.88 ],
    stops: [ [ 0.86, 0.45 ], [ 0.55, 0.45 ], [ 0.55, 0.88 ] ],
    done: 0x9ea8bb,
    left: 0x9ea8bb,
    dot: 0xffffff
  };
  ROBOTS[6] = {
    name: "ROBOT 07",
    at: 1,
    floor: "B3",
    ended: true,
    dock: [ 0.10, 0.92 ],
    stops: [ [ 0.30, 0.92 ], [ 0.30, 0.62 ], [ 0.10, 0.62 ] ],
    done: 0x9ea8bb,
    left: 0x9ea8bb,
    dot: 0xffffff
  };
  ROBOTS[8] = {
    name: "ROBOT 09",
    at: 1,
    floor: "B4",
    ended: true,
    dock: [ 0.76, 0.80 ],
    stops: [ [ 0.40, 0.80 ], [ 0.40, 0.60 ], [ 0.76, 0.60 ] ],
    done: 0x9ea8bb,
    left: 0x9ea8bb,
    dot: 0xffffff
  };
  ROBOTS[10] = {
    name: "ROBOT 11",
    at: 0.32,
    floor: "B3",
    walk: 7,
    dock: [ 0.12, 0.90 ],
    stops: [ [ 0.12, 0.55 ], [ 0.45, 0.55 ], [ 0.45, 0.20 ], [ 0.15, 0.20 ] ],
    done: 0x89b9ed,
    left: 0x4990e0,
    dot: 0xc7ddf8
  };
  var SPAN_UNITS = 120;
  var EASE = 0.08;
  var SETTLED = 0.002;
  var meshes = [];
  var raycaster = null;
  var ticking = false;
  var zoom = 1;
  var scene = null, camera = null, renderer = null;
  var target = null;
  var home = null;
  var baseSize = 1;
  var fitH = 1, fitV = 1;
  var right = null, upOnGround = null;
  var span = 1;
  var floorY = 0;
  var THREE = null;
  var merge = null;
  var Fat = null;
  var Bvh = null;
  var tally = 0;
  var picked = null;
  var pickPens = [];
  var hoverPens = [];
  var hovered = null;
  var card = document.querySelector("[data-map-card]");
  var cardName = card && card.querySelector("[data-map-card-name]");
  var botBox = document.querySelector("[data-map-bot]");
  var botTip = botBox && botBox.querySelector("[data-map-bot-tip]");
  var botName = botBox && botBox.querySelector("[data-map-bot-name]");
  var botTitle = botBox && botBox.querySelector("[data-map-bot-title]");
  var botRows = botBox && botBox.querySelector("[data-map-bot-rows]");
  var onLane = null;
  var gridMesh = null;
  var floors = [];
  var floorNow = "";
  var floorFade = {};
  var floorBusy = false;
  var floorNext = "";
  var ROBOT_ON = "B4";
  var tone = null;
  var PICKED = null, GHOSTC = null;
  function orient() {
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    dirV.set(cp * Math.sin(yaw), sp, cp * Math.cos(yaw)).normalize();
    right.crossVectors(WORLD_UP, dirV).normalize();
    upOnGround.crossVectors(dirV, right).normalize();
  }
  function across(u, size) {
    return Math.abs(u.x) * size.x + Math.abs(u.y) * size.y + Math.abs(u.z) * size.z;
  }
  function fitBase() {
    var cell = hit.clientWidth || view.clientWidth || 1;
    var h = view.clientHeight || 1;
    baseSize = Math.max(fitV, fitH * h / cell) * FIT_AIR;
  }
  var fx = null;
  var tickAt = -1, tickTail = 0;
  function frameTick(t) {
    if (t === tickAt) {
      if (!tickTail) {
        tickTail = window.requestAnimationFrame(function(t2) {
          tickTail = 0;
          frameTick(t2);
        });
      }
      return;
    }
    tickAt = t;
    frame();
  }
  var sizeW = 0, sizeH = 0, sizePr = 0;
  function frame() {
    if (!renderer) {
      return;
    }
    var w = view.clientWidth, h = view.clientHeight;
    if (!w || !h) {
      return;
    }
    if (w !== sizeW || h !== sizeH || renderer.getPixelRatio() !== sizePr) {
      renderer.setSize(w, h, false);
      sizeW = w;
      sizeH = h;
      sizePr = renderer.getPixelRatio();
    }
    aim();
    fatMats.forEach(function(mat) {
      mat.resolution.set(w, h);
    });
    syncDots();
    rrCamWatch();
    if (picked) {
      drawOutline(pickPens, picked);
    }
    if (hovered && hovered !== picked) {
      drawOutline(hoverPens, hovered);
    }
    rrDock();
    rrAlertPulse();
    if (RR.prune && !rrPruned && onLane && onLane.rr) {
      rrPrune(onLane);
    }
    rrPins();
    rrLabels();
    travelSync();
    rrRibbons();
    rrHalo();
    if (!(fx && fx.render(w, h))) {
      renderer.render(scene, camera);
    }
    rrDog();
    placeCard();
    placeBot();
    placeWp();
    if (planStale) {
      layPlan();
    }
    placePlan();
  }
  function aim() {
    var w = view.clientWidth, h = view.clientHeight;
    if (!camera || !w || !h) {
      return;
    }
    orient();
    fitBase();
    var halfH = baseSize / zoom / 2;
    var eye = span * EYE;
    camera.fov = 2 * Math.atan(halfH / eye) * 180 / Math.PI;
    camera.aspect = w / h;
    camera.near = Math.max(0.1, eye - span * 5);
    camera.far = eye + span * 5;
    camera.updateProjectionMatrix();
    var s = baseSize / zoom / h;
    var v = view.getBoundingClientRect();
    var c = hit.getBoundingClientRect();
    var dx = c.left + c.width / 2 - (v.left + v.width / 2);
    var dy = c.top + c.height / 2 - (v.top + v.height / 2);
    var look = target.clone().addScaledVector(right, -dx * s).addScaledVector(upOnGround, dy * s);
    camera.position.copy(look).addScaledVector(dirV, eye);
    camera.up.copy(upOnGround);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  }
  function perPixel() {
    var h = view.clientHeight || 1;
    return baseSize / zoom / h;
  }
  function clamp() {
    var reach = span * REACH;
    target.x = Math.min(home.x + reach, Math.max(home.x - reach, target.x));
    target.y = Math.min(home.y + reach, Math.max(home.y - reach, target.y));
    target.z = Math.min(home.z + reach, Math.max(home.z - reach, target.z));
  }
  function zoomAt(next, px, py) {
    next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (next === zoom) {
      return;
    }
    var w = view.clientWidth, h = view.clientHeight;
    var dx = px - w / 2;
    var dy = py - h / 2;
    var before = perPixel();
    zoom = next;
    var after = perPixel();
    var move = before - after;
    target.addScaledVector(right, dx * move);
    target.addScaledVector(upOnGround, -dy * move);
    clamp();
    plan();
    frame();
  }
  function focusPoint() {
    var v = view.getBoundingClientRect();
    var c = hit.getBoundingClientRect();
    return {
      x: c.left + c.width / 2 - v.left,
      y: c.top + c.height / 2 - v.top
    };
  }
  function local(event) {
    var r = view.getBoundingClientRect();
    return {
      x: event.clientX - r.left,
      y: event.clientY - r.top
    };
  }
  hit.addEventListener("wheel", function(event) {
    event.preventDefault();
    if (!renderer) {
      return;
    }
    var p = local(event);
    var d = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    var now = Date.now();
    if (now - wheelAt > WHEEL_GAP && d < 0) {
      setFocusAt(p.x, p.y);
    }
    wheelAt = now;
    zoomAt(zoom * Math.pow(WHEEL_STEP, -d), p.x, p.y);
  }, {
    passive: false
  });
  var down = [];
  var mode = "";
  var gap = 0;
  var mid = null;
  var from = null;
  var stirred = false;
  var NUDGE = 4;
  function seat(id) {
    for (var i = 0; i < down.length; i += 1) {
      if (down[i].id === id) {
        return i;
      }
    }
    return -1;
  }
  function spread() {
    var dx = down[0].x - down[1].x, dy = down[0].y - down[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function middle() {
    var r = view.getBoundingClientRect();
    return {
      x: (down[0].x + down[1].x) / 2 - r.left,
      y: (down[0].y + down[1].y) / 2 - r.top
    };
  }
  function paint() {
    hit.classList.toggle("is-turning", mode === "turn");
    hit.classList.toggle("is-panning", mode === "slide" || mode === "pinch");
  }
  hit.addEventListener("pointerdown", function(event) {
    if (event.target.closest(".map-tools, .map-card, .map-bot, .map-wp, .map-alert, .floor-note")) {
      return;
    }
    if (event.button > 2) {
      return;
    }
    if (seat(event.pointerId) >= 0) {
      return;
    }
    down.push({
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    });
    hit.setPointerCapture(event.pointerId);
    if (down.length === 1) {
      mode = event.shiftKey || event.button === 1 || event.button === 2 ? "slide" : "turn";
      from = {
        x: event.clientX,
        y: event.clientY,
        button: event.button
      };
      stirred = false;
    } else if (down.length === 2) {
      mode = "pinch";
      gap = spread();
      mid = middle();
      setFocusAt(mid.x, mid.y);
    } else {
      mode = "";
    }
    paint();
  });
  hit.addEventListener("pointermove", function(event) {
    var i = seat(event.pointerId);
    if (i < 0 || !renderer) {
      return;
    }
    var fromX = down[i].x, fromY = down[i].y;
    down[i].x = event.clientX;
    down[i].y = event.clientY;
    if (from && !stirred && Math.abs(event.clientX - from.x) + Math.abs(event.clientY - from.y) > NUDGE) {
      stirred = true;
    }
    if (mode === "pinch") {
      if (down.length < 2) {
        mode = down.length ? "turn" : "";
        paint();
        return;
      }
      var nextGap = spread();
      var nextMid = middle();
      if (gap > 0 && nextGap > 0) {
        var per = perPixel();
        target.addScaledVector(right, -(nextMid.x - mid.x) * per);
        target.addScaledVector(upOnGround, (nextMid.y - mid.y) * per);
        clamp();
        zoomAt(zoom * (nextGap / gap), nextMid.x, nextMid.y);
      }
      gap = nextGap;
      mid = nextMid;
      plan();
      frame();
      return;
    }
    var dx = event.clientX - fromX;
    var dy = event.clientY - fromY;
    if (mode === "slide") {
      var s = perPixel();
      target.addScaledVector(right, -dx * s);
      target.addScaledVector(upOnGround, dy * s);
      clamp();
    } else if (mode === "turn") {
      yaw -= dx * TURN;
      pitch = Math.min(TOP_PITCH, Math.max(LOW_PITCH, pitch + dy * TURN));
    } else {
      return;
    }
    plan();
    frame();
  });
  function lift(event) {
    var i = seat(event.pointerId);
    if (i < 0) {
      return;
    }
    down.splice(i, 1);
    if (hit.hasPointerCapture(event.pointerId)) {
      hit.releasePointerCapture(event.pointerId);
    }
    if (!down.length && from && !stirred && from.button === 0 && event.type === "pointerup") {
      var p = local(event);
      setFocusAt(p.x, p.y);
      var mark = wpAt(p.x, p.y);
      var item = mark ? null : pickAt(p.x, p.y);
      var hop = null;
      if (mark) {
        chooseWaypoint(mark.id === chosenWp ? null : mark.id, "map");
      } else if (!item && (hop = stairTo(p.x, p.y))) {
        goFloor(hop.floor, "stairs", hop.at);
      } else {
        choose(item);
      }
    }
    if (!down.length) {
      from = null;
      stirred = false;
    }
    mode = down.length === 1 ? "turn" : "";
    paint();
  }
  hit.addEventListener("pointermove", function(event) {
    if (down.length || !renderer) {
      return;
    }
    if (event.target.closest(".map-tools, .map-card, .map-bot, .map-wp, .map-alert, .floor-note")) {
      hit.classList.remove("is-picking");
      return;
    }
    var p = local(event);
    var mark = wpAt(p.x, p.y);
    rrHot(mark ? mark.id : null);
    var on = mark ? null : pickAt(p.x, p.y);
    hit.classList.toggle("is-picking", !!(mark || on || !on && stairTo(p.x, p.y)));
    if (on === hovered) {
      return;
    }
    hovered = on;
    drawOutline(hoverPens, hovered && hovered !== picked ? hovered : null);
    frame();
  });
  hit.addEventListener("pointerleave", function() {
    hit.classList.remove("is-picking");
    rrHot(null);
    hovered = null;
    drawOutline(hoverPens, null);
    frame();
  });
  if (card) {
    var shut = card.querySelector("[data-map-card-close]");
    if (shut) {
      shut.addEventListener("click", function() {
        choose(null);
      });
    }
  }
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && picked) {
      choose(null);
    }
    if (event.key === "Escape" && focus) {
      clearFocus();
      plan();
    }
  });
  hit.addEventListener("pointerup", lift);
  hit.addEventListener("pointercancel", lift);
  hit.addEventListener("contextmenu", function(event) {
    if (event.target.closest(".map-tools")) {
      return;
    }
    event.preventDefault();
  });
  var zoomOut = document.querySelector("[data-map-zoom-out]");
  if (zoomOut) {
    zoomOut.addEventListener("click", function() {
      var f = focusPoint();
      zoomAt(zoom / BUTTON_STEP, f.x, f.y);
    });
  }
  var zoomIn = document.querySelector("[data-map-zoom-in]");
  if (zoomIn) {
    zoomIn.addEventListener("click", function() {
      var f = focusPoint();
      if (!focus) {
        setFocusAt(f.x, f.y);
      }
      zoomAt(zoom * BUTTON_STEP, f.x, f.y);
    });
  }
  var trip = null;
  function glide(nextYaw, nextPitch, nextZoom, dest, duration) {
    if (!renderer) {
      return;
    }
    var glideMs = duration || 320;
    var from = {
      yaw: yaw,
      pitch: pitch,
      zoom: zoom,
      t: target.clone()
    };
    var began = window.performance && performance.now ? performance.now() : Date.now();
    trip = {};
    var mine = trip;
    function put(at) {
      var e = at < 0.5 ? 2 * at * at : 1 - Math.pow(-2 * at + 2, 2) / 2;
      yaw = from.yaw + (nextYaw - from.yaw) * e;
      pitch = from.pitch + (nextPitch - from.pitch) * e;
      zoom = from.zoom + (nextZoom - from.zoom) * e;
      if (dest) {
        target.lerpVectors(from.t, dest, e);
      }
      plan();
      frame();
    }
    (function step() {
      if (trip !== mine) {
        return;
      }
      var now = window.performance && performance.now ? performance.now() : Date.now();
      var at = Math.min(1, (now - began) / glideMs);
      put(at);
      if (at < 1) {
        window.requestAnimationFrame(step);
      } else {
        trip = null;
        placeWp();
      }
    })();
    window.setTimeout(function() {
      if (trip !== mine) {
        return;
      }
      put(1);
      trip = null;
    }, glideMs + 40);
  }
  function unwind(around) {
    yaw -= Math.round((yaw - around) / (Math.PI * 2)) * Math.PI * 2;
  }
  var TOP_FIT = 0.74;
  var reset = document.querySelector("[data-map-track]");
  if (reset) {
    reset.addEventListener("click", function() {
      clearFocus();
      if (document.body.classList.contains("ver-7") && pitch >= TOP_PITCH - 2 * Math.PI / 180) {
        unwind(0);
        glide(0, TOP_PITCH, TOP_FIT, home);
        return;
      }
      unwind(HOME_YAW);
      glide(HOME_YAW, HOME_PITCH, 1, home);
    });
  }
  var top = document.querySelector("[data-map-top]");
  if (top && !top.hasAttribute("data-map-dim")) {
    top.addEventListener("click", function() {
      unwind(0);
      glide(0, TOP_PITCH, zoom, null);
    });
  }
  var btn3d = document.querySelector("[data-map-3d]");
  if (top && btn3d) {
    var keep3d = null;
    var flatNow = function() {
      return pitch >= TOP_PITCH - 2 * Math.PI / 180;
    };
    var dimSync2 = function() {
      var flat = flatNow();
      if (top.getAttribute("aria-pressed") !== String(flat)) {
        top.setAttribute("aria-pressed", String(flat));
      }
      if (btn3d.getAttribute("aria-pressed") !== String(!flat)) {
        btn3d.setAttribute("aria-pressed", String(!flat));
      }
    };
    var press = function(flat) {
      top.setAttribute("aria-pressed", String(flat));
      btn3d.setAttribute("aria-pressed", String(!flat));
    };
    top.addEventListener("click", function() {
      if (flatNow()) {
        return;
      }
      keep3d = {
        yaw: yaw,
        pitch: pitch
      };
      press(true);
      unwind(0);
      glide(0, TOP_PITCH, zoom, null);
    });
    btn3d.addEventListener("click", function() {
      if (!flatNow()) {
        return;
      }
      var b3 = keep3d || {
        yaw: HOME_YAW,
        pitch: HOME_PITCH
      };
      keep3d = null;
      press(false);
      unwind(b3.yaw);
      glide(b3.yaw, b3.pitch, zoom, null);
    });
    setInterval(function() {
      if (!trip) {
        dimSync2();
      }
    }, 400);
    dimSync2();
  } else if (top && top.hasAttribute("data-map-dim")) {
    var dimTxt = top.querySelector("[data-map-dim-txt]");
    var EN_DIM = document.documentElement.lang === "en";
    var before3d = null;
    var isTop = function() {
      return pitch >= TOP_PITCH - 2 * Math.PI / 180;
    };
    var dimSync = function() {
      var flat = isTop();
      var next = flat ? "3D" : "2D";
      if (dimTxt && dimTxt.textContent !== next) {
        dimTxt.textContent = next;
      }
      var label = EN_DIM ? flat ? "View in 3D" : "View in 2D" : flat ? "3D로 보기" : "2D로 보기";
      if (top.getAttribute("aria-label") !== label) {
        top.setAttribute("aria-label", label);
        top.title = label;
      }
      top.setAttribute("aria-pressed", flat ? "true" : "false");
    };
    top.addEventListener("click", function() {
      if (isTop()) {
        var b = before3d || {
          yaw: HOME_YAW,
          pitch: HOME_PITCH
        };
        before3d = null;
        unwind(b.yaw);
        glide(b.yaw, b.pitch, zoom, null);
      } else {
        before3d = {
          yaw: yaw,
          pitch: pitch
        };
        unwind(0);
        glide(0, TOP_PITCH, zoom, null);
      }
      setTimeout(dimSync, 380);
    });
    setInterval(dimSync, 400);
    dimSync();
  }
  var toBot = document.querySelector("[data-map-robot]");
  if (toBot) {
    var goBot = function() {
      if (!onLane || !renderer || !onLane.here) {
        return;
      }
      setFocusWorld(onLane.here);
      glide(yaw, pitch, Math.max(zoom, 2.2), onLane.here.clone());
    };
    toBot.addEventListener("click", function() {
      var lane = onLane;
      if (!lane || !renderer) {
        return;
      }
      var fl = lane.floor || lane.bot && lane.bot.floor;
      if (fl && floors.length && fl !== floorNow) {
        goFloor(fl, "button");
        var tries = 0;
        (function wait() {
          tries += 1;
          if (floorBusy && tries < 60) {
            setTimeout(wait, 100);
            return;
          }
          setTimeout(goBot, 360);
        })();
        return;
      }
      goBot();
    });
  }
  function decode(b64) {
    var bin = window.atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i += 1) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }
  function layerKey(name) {
    var slug = String(name || "").toLowerCase().replace(/^[0-9]+[_\-\s]*/, "").split(/[\s\-–_]/)[0];
    return PALETTE[slug] ? slug : "other";
  }
  function floorId(name) {
    var m = String(name || "").match(/지하[\s_]*([0-9]+)[\s_]*층/);
    return m ? "B" + m[1] : "";
  }
  function floorLabel(id) {
    return id ? "지하 " + id.slice(1) + "층" : "";
  }
  function flatten(item, place) {
    item.updateWorldMatrix(true, true);
    var parts = [];
    item.traverse(function(node) {
      if (!node.isMesh || !node.geometry) {
        return;
      }
      var g = node.geometry.clone();
      g.deleteAttribute("uv");
      g.deleteAttribute("uv1");
      g.applyMatrix4(node.matrixWorld);
      g.applyMatrix4(place);
      parts.push(g);
    });
    if (parts.length < 2) {
      return parts;
    }
    var one = merge(parts, false);
    if (!one) {
      return parts;
    }
    parts.forEach(function(g) {
      g.dispose();
    });
    return [ one ];
  }
  function outfit(geo, key, fid) {
    var skin = PALETTE[key];
    var alpha = 1;
    var mat = new THREE.MeshStandardMaterial({
      color: skin.face,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: alpha,
      depthWrite: alpha >= 1,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    var edgeMat = new THREE.LineBasicMaterial({
      color: EDGE,
      transparent: true,
      opacity: skin.line
    });
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat));
    if (fid) {
      mat.onBeforeCompile = stairHoleFor(fid, key === "floor");
      edgeMat.onBeforeCompile = stairHoleFor(fid, key === "floor");
      mat.customProgramCacheKey = edgeMat.customProgramCacheKey = function() {
        return key === "floor" ? "stair-hole-slab" : "stair-hole";
      };
    }
    geo.computeBoundingBox();
    meshes.push({
      mesh: mesh,
      mat: mat,
      edgeMat: edgeMat,
      key: key,
      floor: fid || "",
      title: key === "equipment" ? "설비 " + ("0" + (tally += 1)).slice(-2) : "",
      base: new THREE.Color(skin.face),
      center: geo.boundingBox.getCenter(new THREE.Vector3),
      line: skin.line,
      peak: skin.peak,
      alpha: alpha,
      now: alpha,
      want: alpha,
      faded: false,
      cover: 0,
      edgeNow: skin.line,
      edgeWant: skin.line,
      glowNow: 0,
      glowWant: 0
    });
    return mesh;
  }
  function build(root) {
    root.updateWorldMatrix(true, true);
    var box = (new THREE.Box3).setFromObject(root);
    var size = box.getSize(new THREE.Vector3);
    var center = box.getCenter(new THREE.Vector3);
    var unit = SPAN_UNITS / Math.max(size.x, size.y, size.z, 1e-9);
    var place = (new THREE.Matrix4).makeTranslation(-center.x, -center.y, -center.z).premultiply((new THREE.Matrix4).makeScale(unit, unit, unit));
    var model = new THREE.Group;
    function layLayer(layer, fid) {
      var key = layerKey(layer.name);
      var items = layer.children.length ? layer.children.slice() : [ layer ];
      items.forEach(function(item) {
        flatten(item, place).forEach(function(geo) {
          model.add(outfit(geo, key, fid));
        });
      });
    }
    root.children.slice().forEach(function(top) {
      var fid = floorId(top.name);
      if (fid && top.children.length) {
        top.children.slice().forEach(function(layer) {
          layLayer(layer, fid);
        });
      } else {
        layLayer(top, "");
      }
    });
    return model;
  }
  function hideWallJoins() {
    var walls = meshes.filter(function(m) {
      return m.key === "wall";
    });
    if (walls.length < 2) {
      return;
    }
    var ray = new THREE.Raycaster;
    ray.firstHitOnly = true;
    var DIRS = [ [ 1, 0.013, 0.021 ], [ -1, 0.017, -0.011 ], [ 0.019, 1, 0.012 ], [ -0.014, -1, 0.018 ], [ 0.011, 0.016, 1 ], [ -0.021, 0.012, -1 ] ].map(function(d) {
      return new THREE.Vector3(d[0], d[1], d[2]).normalize();
    });
    var EPS = 0.12;
    var byFloor = {};
    var STEP = 0.1;
    walls.forEach(function(w) {
      (byFloor[w.floor] = byFloor[w.floor] || []).push(w);
      w.mat.side = THREE.DoubleSide;
      w.mesh.geometry.computeBoundingBox();
      w.box = w.mesh.geometry.boundingBox.clone().expandByScalar(EPS * 2);
      w.mesh.userData.rawBox = w.mesh.geometry.boundingBox.clone().expandByScalar(1e-3);
    });
    function clip(p0, p1, bx) {
      var t0 = 0, t1 = 1, ax = [ "x", "y", "z" ];
      for (var j = 0; j < 3; j += 1) {
        var c = ax[j], dd = p1[c] - p0[c];
        if (Math.abs(dd) < 1e-9) {
          if (p0[c] < bx.min[c] || p0[c] > bx.max[c]) {
            return null;
          }
          continue;
        }
        var ta = (bx.min[c] - p0[c]) / dd, tb = (bx.max[c] - p0[c]) / dd;
        if (ta > tb) {
          var tt = ta;
          ta = tb;
          tb = tt;
        }
        t0 = Math.max(t0, ta);
        t1 = Math.min(t1, tb);
        if (t0 > t1) {
          return null;
        }
      }
      return [ t0, t1 ];
    }
    var nrm = new THREE.Vector3;
    function inside(pt, list) {
      var near = [];
      for (var j = 0; j < list.length; j += 1) {
        if (list[j].userData.rawBox.containsPoint(pt)) {
          near.push(list[j]);
        }
      }
      if (!near.length) {
        return false;
      }
      for (var i = 0; i < DIRS.length; i += 1) {
        ray.set(pt, DIRS[i]);
        var hit = ray.intersectObjects(near, false)[0];
        if (hit && hit.face) {
          nrm.copy(hit.face.normal);
          if (nrm.dot(DIRS[i]) > 0) {
            return true;
          }
        }
      }
      return false;
    }
    var a = new THREE.Vector3, b = new THREE.Vector3, mid = new THREE.Vector3, d = new THREE.Vector3, u = new THREE.Vector3, v = new THREE.Vector3, pt = new THREE.Vector3, UP = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0);
    Object.keys(byFloor).forEach(function(fid) {
      var group = byFloor[fid], list = group.map(function(w) {
        return w.mesh;
      });
      list.forEach(function(m) {
        m.updateMatrixWorld(true);
      });
      group.forEach(function(w) {
        var lines = w.mesh.children.filter(function(c) {
          return c.isLineSegments;
        })[0];
        if (!lines) {
          return;
        }
        var pos = lines.geometry.getAttribute("position"), keep = [], dropped = 0;
        var others = group.filter(function(o) {
          return o !== w;
        }).map(function(o) {
          return o.box;
        });
        for (var i = 0; i < pos.count; i += 2) {
          a.fromBufferAttribute(pos, i);
          b.fromBufferAttribute(pos, i + 1);
          var len = a.distanceTo(b);
          d.subVectors(b, a).normalize();
          u.crossVectors(d, Math.abs(d.y) > 0.9 ? AX : UP).normalize();
          v.crossVectors(d, u).normalize();
          var spans = [];
          others.forEach(function(bx) {
            var c = clip(a, b, bx);
            if (c) {
              spans.push(c);
            }
          });
          if (!spans.length) {
            keep.push(a.x, a.y, a.z, b.x, b.y, b.z);
            continue;
          }
          var n = Math.max(1, Math.ceil(len / STEP)), cut = [];
          for (var k = 0; k < n; k += 1) {
            var t = (k + 0.5) / n;
            var near = spans.some(function(sp) {
              return t >= sp[0] && t <= sp[1];
            });
            if (!near) {
              cut.push(false);
              continue;
            }
            mid.lerpVectors(a, b, t);
            var inn = [ [ 1, 1 ], [ 1, -1 ], [ -1, -1 ], [ -1, 1 ] ].map(function(q) {
              pt.copy(mid).addScaledVector(u, q[0] * EPS).addScaledVector(v, q[1] * EPS);
              return inside(pt, list);
            });
            var cnt = inn.filter(Boolean).length;
            cut.push(cnt >= 3 || cnt === 2 && (inn[0] === inn[1] || inn[1] === inn[2]));
          }
          var k0 = -1;
          for (var k2 = 0; k2 <= n; k2 += 1) {
            if (k2 < n && !cut[k2]) {
              if (k0 < 0) {
                k0 = k2;
              }
              continue;
            }
            if (k0 >= 0) {
              pt.lerpVectors(a, b, k0 / n);
              mid.lerpVectors(a, b, k2 / n);
              keep.push(pt.x, pt.y, pt.z, mid.x, mid.y, mid.z);
              k0 = -1;
            }
            if (k2 < n) {
              dropped += 1;
            }
          }
        }
        if (dropped) {
          lines.geometry.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
        }
      });
    });
    walls.forEach(function(w) {
      w.mat.side = THREE.FrontSide;
    });
  }
  function pickAt(px, py) {
    if (!renderer || !camera || !meshes.length) {
      return null;
    }
    if (!raycaster) {
      raycaster = new THREE.Raycaster;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    raycaster.setFromCamera(new THREE.Vector2(px / w * 2 - 1, -(py / h) * 2 + 1), camera);
    var list = [];
    meshes.forEach(function(item) {
      if (item.floor && item.floor !== floorNow) {
        return;
      }
      if (item.key === "equipment") {
        list.push(item.mesh);
      }
    });
    var found = raycaster.intersectObjects(list, false);
    if (!found.length) {
      return null;
    }
    for (var i = 0; i < meshes.length; i += 1) {
      if (meshes[i].mesh === found[0].object) {
        return meshes[i];
      }
    }
    return null;
  }
  var books = {};
  function edgeBook(item) {
    if (books[item.mesh.uuid]) {
      return books[item.mesh.uuid];
    }
    var geo = item.mesh.geometry;
    var pos = geo.attributes.position;
    var idx = geo.index;
    var count = idx ? idx.count : pos.count;
    var P = 1e4, v, t, k;
    var spot = {}, seat = new Int32Array(pos.count);
    for (v = 0; v < pos.count; v += 1) {
      var h = Math.round(pos.getX(v) * P) + "," + Math.round(pos.getY(v) * P) + "," + Math.round(pos.getZ(v) * P);
      if (spot[h] === undefined) {
        spot[h] = v;
      }
      seat[v] = spot[h];
    }
    var faces = [], keys = [], tally = {};
    var e0 = new THREE.Vector3, e1 = new THREE.Vector3, e2 = new THREE.Vector3;
    var u = new THREE.Vector3, w = new THREE.Vector3;
    var trio = [];
    for (t = 0; t + 2 < count; t += 3) {
      var a = idx ? idx.getX(t) : t;
      var b = idx ? idx.getX(t + 1) : t + 1;
      var c = idx ? idx.getX(t + 2) : t + 2;
      e0.fromBufferAttribute(pos, a);
      e1.fromBufferAttribute(pos, b);
      e2.fromBufferAttribute(pos, c);
      var nrm = u.subVectors(e1, e0).cross(w.subVectors(e2, e0)).normalize().clone();
      var side = Math.round(nrm.x * 100) + "," + Math.round(nrm.y * 100) + "," + Math.round(nrm.z * 100);
      faces.push(nrm);
      keys.push(side);
      tally[side] = (tally[side] || 0) + 1;
      trio.push([ a, b, c ]);
    }
    var cut = Math.max(6, Math.round(faces.length * FACE_SHARE));
    var posts = [];
    Object.keys(tally).forEach(function(side) {
      if (tally[side] < cut) {
        return;
      }
      posts.push(faces[keys.indexOf(side)]);
    });
    var home = faces.map(function(nrm) {
      if (!posts.length) {
        return -1;
      }
      var best = 0, near = -2;
      for (var s = 0; s < posts.length; s += 1) {
        var d = nrm.dot(posts[s]);
        if (d > near) {
          near = d;
          best = s;
        }
      }
      return best;
    });
    var shelf = {}, list = [];
    for (t = 0; t < trio.length; t += 1) {
      var rim = [ [ trio[t][0], trio[t][1] ], [ trio[t][1], trio[t][2] ], [ trio[t][2], trio[t][0] ] ];
      for (k = 0; k < 3; k += 1) {
        var p = seat[rim[k][0]], q = seat[rim[k][1]];
        var key = p < q ? p + "_" + q : q + "_" + p;
        if (shelf[key]) {
          shelf[key].n2 = faces[t];
          shelf[key].fold = shelf[key].post >= 0 && home[t] >= 0 && shelf[key].post !== home[t];
        } else {
          shelf[key] = {
            a: rim[k][0],
            b: rim[k][1],
            n1: faces[t],
            n2: null,
            post: home[t],
            fold: false
          };
          list.push(shelf[key]);
        }
      }
    }
    books[item.mesh.uuid] = list;
    return list;
  }
  function silhouette(item) {
    var list = edgeBook(item);
    var pos = item.mesh.geometry.attributes.position;
    var out = [];
    for (var i = 0; i < list.length; i += 1) {
      var e = list[i];
      var lit1 = e.n1.dot(dirV) > 0;
      var lit2 = e.n2 ? e.n2.dot(dirV) > 0 : lit1;
      if (!lit1 && !lit2) {
        continue;
      }
      if (lit1 === lit2 && !e.fold) {
        continue;
      }
      out.push(pos.getX(e.a), pos.getY(e.a), pos.getZ(e.a), pos.getX(e.b), pos.getY(e.b), pos.getZ(e.b));
    }
    return out;
  }
  function outlinePen(width, color, alpha) {
    var geo = new Fat.LineSegmentsGeometry;
    var mat = new Fat.LineMaterial({
      color: color,
      linewidth: width,
      transparent: true,
      opacity: alpha,
      depthWrite: false,
      depthTest: true
    });
    mat.resolution.set(view.clientWidth || 1, view.clientHeight || 1);
    fatMats.push(mat);
    var pen = new Fat.LineSegments2(geo, mat);
    pen.frustumCulled = false;
    pen.renderOrder = 5;
    pen.visible = false;
    if (alpha > 0.5) {
      var ghostMat = mat.clone();
      ghostMat.depthTest = false;
      ghostMat.opacity = OUTLINE_GHOST;
      ghostMat.resolution.set(view.clientWidth || 1, view.clientHeight || 1);
      fatMats.push(ghostMat);
      var ghost = new Fat.LineSegments2(geo, ghostMat);
      ghost.frustumCulled = false;
      ghost.renderOrder = 4;
      pen.add(ghost);
    }
    scene.add(pen);
    return pen;
  }
  var OUTLINE_GHOST = 0.28;
  function drawOutline(pens, item) {
    if (!pens.length) {
      return;
    }
    if (!item) {
      pens.forEach(function(pen) {
        pen.visible = false;
      });
      return;
    }
    var line = silhouette(item);
    var nx = dirV.x * span * 0.01, ny = dirV.y * span * 0.01, nz = dirV.z * span * 0.01;
    for (var k = 0; k < line.length; k += 3) {
      line[k] += nx;
      line[k + 1] += ny;
      line[k + 2] += nz;
    }
    pens.forEach(function(pen) {
      if (!line.length) {
        pen.visible = false;
        return;
      }
      pen.geometry.setPositions(line);
      pen.computeLineDistances();
      pen.visible = true;
    });
  }
  function placeCard() {
    if (!card || !picked) {
      return;
    }
    var b = picked.mesh.geometry.boundingBox;
    var spot = new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2).project(camera);
    var v = view.getBoundingClientRect();
    var c = hit.getBoundingClientRect();
    var x = (spot.x * 0.5 + 0.5) * v.width + v.left - c.left;
    var y = (-spot.y * 0.5 + 0.5) * v.height + v.top - c.top;
    var half = card.offsetWidth / 2 || 84;
    var tall = card.offsetHeight + 10 || 90;
    x = Math.min(c.width - half - 8, Math.max(half + 8, x));
    y = Math.min(c.height - 8, Math.max(tall + 8, y));
    card.style.setProperty("--x", snapPx(x));
    card.style.setProperty("--y", snapPx(y));
  }
  function cardFacts(item) {
    if (!document.body.classList.contains("ver-7") || document.documentElement.lang === "en" || !card) {
      return;
    }
    var st = card.querySelector("[data-map-card-state]"), seen = card.querySelector("[data-map-card-seen]"), bot = card.querySelector("[data-map-card-robot]");
    var eq = meshes.filter(function(m) {
      return m.key === "equipment" && m.title && (!m.floor || m.floor === floorNow);
    }).map(function(m) {
      m.mesh.updateWorldMatrix(true, false);
      return {
        m: m,
        at: m.mesh.localToWorld(m.center.clone())
      };
    });
    var mine = null, md = Infinity;
    wpSpots.forEach(function(w) {
      if (w.floor && w.floor !== floorNow) {
        return;
      }
      var best = null, bd = Infinity;
      eq.forEach(function(e) {
        var d = e.at.distanceToSquared(w.spot);
        if (d < bd) {
          bd = d;
          best = e;
        }
      });
      if (best && best.m === item && bd < md) {
        md = bd;
        mine = w;
      }
    });
    var row = mine && document.querySelector('[data-timeline] .timeline-item[data-waypoint="' + mine.id + '"]');
    var s = row ? row.getAttribute("data-wp-state") : "", res = row ? row.getAttribute("data-wp-result") : "", read = row ? (row.getAttribute("data-wp-read") || "").split(" · ")[0] : "";
    var txt = "경로 밖", sev = "";
    if (row && s === "completed") {
      txt = res === "danger" ? "위험 · " + read : res === "caution" ? "주의 · " + read : "정상";
      sev = res === "danger" || res === "caution" ? res : "";
    } else if (row && s === "current") {
      txt = "측정 중";
    } else if (row) {
      txt = "점검 전";
    }
    if (st) {
      st.textContent = txt;
      if (sev) {
        st.setAttribute("data-sev", sev);
      } else {
        st.removeAttribute("data-sev");
      }
    }
    var tm = row && s === "completed" ? /–\s*(\d{1,2}:\d{2})/.exec(row.getAttribute("data-wp-time") || "") : null;
    if (seen) {
      seen.textContent = tm ? tm[1] : "—";
    }
    var rn = document.querySelector(".right-panel .robot-id");
    if (bot) {
      bot.textContent = row ? rn ? rn.textContent.trim() : "—" : "—";
    }
  }
  function choose(item) {
    var next = item && item === picked ? null : item;
    if (next === picked) {
      return;
    }
    picked = next;
    drawOutline(pickPens, picked);
    if (card) {
      card.hidden = !picked;
      if (picked && cardName) {
        cardName.textContent = picked.title;
        card.setAttribute("aria-label", "설비 " + picked.title);
      }
      if (picked) {
        cardFacts(picked);
      }
    }
    plan();
    frame();
  }
  function floorGrid(box, atY) {
    var size = box.getSize(new THREE.Vector3);
    var wide = Math.max(size.x, size.z);
    var cell = 10 / (typeof NAV !== "undefined" && NAV.unit || 1);
    var cells = Math.ceil(wide * 2.1 / cell / 2) * 2;
    var reach = cells * cell;
    var grid = new THREE.GridHelper(reach, cells, GRID, GRID);
    var base = atY === undefined ? box.min.y : atY;
    var cxg = box.min.x + Math.round(size.x / 2 / cell) * cell, czg = box.max.z - Math.round(size.z / 2 / cell) * cell;
    grid.position.set(cxg, base - wide * 0.004, czg);
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    grid.material.depthWrite = false;
    grid.renderOrder = -1;
    return grid;
  }
  var ROUTE_STEP = 0.9;
  var routeGrid;
  function mapFloor(box) {
    var minX = box.min.x, minZ = box.min.z;
    var cols = Math.ceil((box.max.x - minX) / ROUTE_STEP);
    var rows = Math.ceil((box.max.z - minZ) / ROUTE_STEP);
    if (cols < 6 || rows < 6) {
      return null;
    }
    var open = new Uint8Array(cols * rows).fill(1);
    var r, c, i;
    meshes.forEach(function(item) {
      if (item.key === "floor") {
        return;
      }
      if (item.floor && item.floor !== ROBOT_ON) {
        return;
      }
      var pos = item.mesh.geometry.attributes.position;
      var idx = item.mesh.geometry.index;
      var count = idx ? idx.count : pos.count;
      for (var t = 0; t + 2 < count; t += 3) {
        var lox = Infinity, hix = -Infinity, loz = Infinity, hiz = -Infinity;
        for (var k = 0; k < 3; k += 1) {
          var v = idx ? idx.getX(t + k) : t + k;
          var x = pos.getX(v), z = pos.getZ(v);
          if (x < lox) {
            lox = x;
          }
          if (x > hix) {
            hix = x;
          }
          if (z < loz) {
            loz = z;
          }
          if (z > hiz) {
            hiz = z;
          }
        }
        var c0 = Math.max(0, Math.floor((lox - minX) / ROUTE_STEP));
        var c1 = Math.min(cols - 1, Math.floor((hix - minX) / ROUTE_STEP));
        var r0 = Math.max(0, Math.floor((loz - minZ) / ROUTE_STEP));
        var r1 = Math.min(rows - 1, Math.floor((hiz - minZ) / ROUTE_STEP));
        for (var rr = r0; rr <= r1; rr += 1) {
          for (var cc = c0; cc <= c1; cc += 1) {
            open[rr * cols + cc] = 0;
          }
        }
      }
    });
    for (c = 0; c < cols; c += 1) {
      open[c] = 0;
      open[(rows - 1) * cols + c] = 0;
    }
    for (r = 0; r < rows; r += 1) {
      open[r * cols] = 0;
      open[r * cols + cols - 1] = 0;
    }
    var room = new Uint8Array(open);
    for (r = 1; r < rows - 1; r += 1) {
      for (c = 1; c < cols - 1; c += 1) {
        i = r * cols + c;
        if (!open[i]) {
          continue;
        }
        if (!open[i - 1] || !open[i + 1] || !open[i - cols] || !open[i + cols]) {
          room[i] = 0;
        }
      }
    }
    return {
      cols: cols,
      rows: rows,
      minX: minX,
      minZ: minZ,
      open: open,
      room: room
    };
  }
  function layRoute(box, stops) {
    if (routeGrid === undefined) {
      routeGrid = mapFloor(box);
    }
    if (!routeGrid) {
      return null;
    }
    var cols = routeGrid.cols, rows = routeGrid.rows;
    var minX = routeGrid.minX, minZ = routeGrid.minZ;
    var open = routeGrid.open, room = routeGrid.room;
    var i;
    function nearest(grid, fx, fz) {
      var wc = fx * (cols - 1), wr = fz * (rows - 1);
      var best = -1, near = Infinity;
      for (var k = 0; k < grid.length; k += 1) {
        if (!grid[k]) {
          continue;
        }
        var kc = k % cols, kr = (k - kc) / cols;
        var d = (kc - wc) * (kc - wc) + (kr - wr) * (kr - wr);
        if (d < near) {
          near = d;
          best = k;
        }
      }
      return best;
    }
    var STEPS = [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ], [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ];
    function walk(grid, from, to) {
      var prev = new Int32Array(grid.length).fill(-1);
      var seen = new Uint8Array(grid.length);
      var queue = [ from ];
      seen[from] = 1;
      for (var head = 0; head < queue.length && !seen[to]; head += 1) {
        var at = queue[head];
        var ac = at % cols, ar = (at - ac) / cols;
        for (var s = 0; s < STEPS.length; s += 1) {
          var nc = ac + STEPS[s][0], nr = ar + STEPS[s][1];
          if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) {
            continue;
          }
          var next = nr * cols + nc;
          if (seen[next] || !grid[next]) {
            continue;
          }
          if (STEPS[s][0] && STEPS[s][1] && (!grid[ar * cols + nc] || !grid[nr * cols + ac])) {
            continue;
          }
          seen[next] = 1;
          prev[next] = at;
          queue.push(next);
        }
      }
      if (!seen[to]) {
        return null;
      }
      var back = [];
      for (var w = to; w !== -1; w = prev[w]) {
        back.push(w);
      }
      return back.reverse();
    }
    function plot(grid) {
      var cells = [], k;
      for (k = 0; k < stops.length; k += 1) {
        var cell = nearest(grid, stops[k][0], stops[k][1]);
        if (cell < 0) {
          return null;
        }
        cells.push(cell);
      }
      var line = [];
      for (k = 0; k < cells.length - 1; k += 1) {
        var leg = walk(grid, cells[k], cells[k + 1]);
        if (!leg) {
          return null;
        }
        line = line.concat(line.length ? leg.slice(1) : leg);
      }
      return line.length >= 12 ? line : null;
    }
    var path = plot(room) || plot(open);
    if (!path) {
      return null;
    }
    var turns = [];
    var y = floorY + span * 0.005;
    for (i = 0; i < path.length; i += 1) {
      var keep = i === 0 || i === path.length - 1;
      if (!keep) {
        keep = path[i] - path[i - 1] !== path[i + 1] - path[i];
      }
      if (!keep) {
        continue;
      }
      var pc = path[i] % cols, pr = (path[i] - pc) / cols;
      turns.push(new THREE.Vector3(minX + (pc + 0.5) * ROUTE_STEP, y, minZ + (pr + 0.5) * ROUTE_STEP));
    }
    return turns.length >= 2 ? turns : null;
  }
  var ROUTE_ROUND = 1.6;
  var ROUND_STEPS = 7;
  function roundOff(turns) {
    var n = turns.length;
    if (n < 3) {
      return {
        line: turns.slice(),
        nodes: turns.slice()
      };
    }
    var shut = turns[0].distanceTo(turns[n - 1]) < 1e-6;
    var pts = shut ? turns.slice(0, n - 1) : turns;
    var m = pts.length;
    var line = [], nodes = [];
    var i, s;
    if (!shut) {
      line.push(pts[0].clone());
    }
    for (i = shut ? 0 : 1; i <= (shut ? m - 1 : m - 2); i += 1) {
      var a = pts[(i - 1 + m) % m], b = pts[i], c = pts[(i + 1) % m];
      var back = a.distanceTo(b), ahead = b.distanceTo(c);
      var r = Math.min(ROUTE_ROUND, back / 2, ahead / 2);
      if (r < 1e-3) {
        line.push(b.clone());
        nodes.push(b.clone());
        continue;
      }
      var p = b.clone().lerp(a, r / back);
      var q = b.clone().lerp(c, r / ahead);
      line.push(p);
      for (s = 1; s < ROUND_STEPS; s += 1) {
        var t = s / ROUND_STEPS, k = 1 - t;
        var bend = new THREE.Vector3(k * k * p.x + 2 * k * t * b.x + t * t * q.x, p.y, k * k * p.z + 2 * k * t * b.z + t * t * q.z);
        line.push(bend);
        if (s * 2 === ROUND_STEPS) {
          nodes.push(bend.clone());
        }
      }
      line.push(q);
      if (ROUND_STEPS % 2) {
        nodes.push(p.clone().lerp(q, 0.5).lerp(b, 0.5));
      }
    }
    line.push(shut ? line[0].clone() : pts[m - 1].clone());
    return {
      line: line,
      nodes: nodes
    };
  }
  var FAN_REACH = 0.17;
  var FAN_SPREAD = 100 * Math.PI / 180;
  var fanArt = null;
  function fanTexture() {
    if (fanArt) {
      return fanArt;
    }
    var size = 128;
    var pad = document.createElement("canvas");
    pad.width = size;
    pad.height = size;
    var ink = pad.getContext("2d");
    var wash = ink.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    wash.addColorStop(0, "rgba(255,255,255,1)");
    wash.addColorStop(0.6, "rgba(255,255,255,0.55)");
    wash.addColorStop(1, "rgba(255,255,255,0)");
    ink.fillStyle = wash;
    ink.fillRect(0, 0, size, size);
    fanArt = new THREE.CanvasTexture(pad);
    return fanArt;
  }
  function viewFan(bot, here, dx, dz) {
    var reach = span * FAN_REACH;
    var steps = 28;
    var pos = [ 0, 0, 0 ], uv = [ 0.5, 0.5 ], idx = [];
    var i, a, x, z;
    for (i = 0; i <= steps; i += 1) {
      a = -FAN_SPREAD / 2 + FAN_SPREAD * (i / steps);
      x = Math.sin(a) * reach;
      z = Math.cos(a) * reach;
      pos.push(x, 0, z);
      uv.push(0.5 + x / (2 * reach), 0.5 - z / (2 * reach));
    }
    for (i = 0; i < steps; i += 1) {
      idx.push(0, i + 1, i + 2);
    }
    var geo = new THREE.BufferGeometry;
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    var fan = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: bot.dot,
      map: fanTexture(),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    fan.position.copy(here);
    fan.position.y += span * 0.002;
    fan.rotation.y = Math.atan2(dx, dz);
    fan.renderOrder = 2;
    return fan;
  }
  var WAYPOINTS = 7;
  var stopArt = {};
  function alongRoute(turns, mile, far) {
    var at = 1;
    while (at < mile.length - 1 && mile[at] < far) {
      at += 1;
    }
    var leg = Math.max(1e-6, mile[at] - mile[at - 1]);
    return turns[at - 1].clone().lerp(turns[at], (far - mile[at - 1]) / leg);
  }
  function stopFill() {
    return isLight() ? "#eef0f3" : "#0a0f18";
  }
  var stopBacks = [];
  function stopTexture(kind) {
    if (stopArt[kind]) {
      return stopArt[kind];
    }
    var pad = document.createElement("canvas");
    pad.width = 64;
    pad.height = 64;
    drawStop(kind, pad);
    stopArt[kind] = new THREE.CanvasTexture(pad);
    return stopArt[kind];
  }
  function drawStop(kind, pad) {
    if (kind === "dock") {
      drawDock(pad);
      return;
    }
    var size = pad.width, mid = size / 2;
    var ink = pad.getContext("2d");
    ink.clearRect(0, 0, size, size);
    if (kind === "halo") {
      ink.beginPath();
      ink.arc(mid, mid, mid - 5, 0, Math.PI * 2);
      ink.lineWidth = 5;
      ink.strokeStyle = "#ffffff";
      ink.stroke();
      return;
    }
    if (kind === "disc") {
      ink.beginPath();
      ink.arc(mid, mid, mid - 9, 0, Math.PI * 2);
      ink.fillStyle = "#ffffff";
      ink.fill();
      return;
    }
    if (kind === "dash") {
      ink.beginPath();
      ink.setLineDash([ 7, 6 ]);
      ink.arc(mid, mid, mid - 9, 0, Math.PI * 2);
      ink.lineWidth = 5;
      ink.strokeStyle = "#ffffff";
      ink.stroke();
      ink.setLineDash([]);
      return;
    }
    if (kind === "tri") {
      ink.beginPath();
      ink.moveTo(mid, 8);
      ink.lineTo(size - 7, size - 12);
      ink.lineTo(7, size - 12);
      ink.closePath();
      ink.fillStyle = "#ffffff";
      ink.fill();
      ink.lineWidth = 4;
      ink.strokeStyle = "#0a0f18";
      ink.stroke();
      return;
    }
    var full = kind === "full";
    ink.beginPath();
    ink.arc(mid, mid, mid - 9, 0, Math.PI * 2);
    ink.lineWidth = full ? 9 : 6;
    ink.strokeStyle = "#ffffff";
    ink.stroke();
    if (full) {
      ink.beginPath();
      ink.arc(mid, mid, mid * 0.32, 0, Math.PI * 2);
      ink.fillStyle = "#ffffff";
      ink.fill();
    }
  }
  function dockTexture() {
    if (stopArt.dock) {
      return stopArt.dock;
    }
    var pad = document.createElement("canvas");
    pad.width = 64;
    pad.height = 64;
    drawStop("dock", pad);
    stopArt.dock = new THREE.CanvasTexture(pad);
    return stopArt.dock;
  }
  function drawDock(pad) {
    var size = pad.width, edge = 12, r = 9;
    var ink = pad.getContext("2d");
    ink.clearRect(0, 0, size, size);
    var x = edge, y = edge, w = size - edge * 2, h = size - edge * 2;
    ink.beginPath();
    ink.moveTo(x + r, y);
    ink.arcTo(x + w, y, x + w, y + h, r);
    ink.arcTo(x + w, y + h, x, y + h, r);
    ink.arcTo(x, y + h, x, y, r);
    ink.arcTo(x, y, x + w, y, r);
    ink.closePath();
    ink.fillStyle = stopFill();
    ink.fill();
    ink.lineWidth = 8;
    ink.strokeStyle = "#ffffff";
    ink.stroke();
  }
  function dockMark(spot, color) {
    var mark = new THREE.Points((new THREE.BufferGeometry).setFromPoints([ spot ]), new THREE.PointsMaterial({
      color: color,
      map: dockTexture(),
      size: 20,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      depthTest: false
    }));
    mark.renderOrder = 3;
    return mark;
  }
  function stopDots(spots, color, kind, size) {
    var dots = new THREE.Points((new THREE.BufferGeometry).setFromPoints(spots), new THREE.PointsMaterial({
      color: color,
      map: stopTexture(kind),
      size: size || 15,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      depthTest: false
    }));
    dots.renderOrder = 3;
    if (kind === "ring" || kind === "full") {
      var back = new THREE.Points(dots.geometry, new THREE.PointsMaterial({
        color: new THREE.Color(stopFill()),
        map: stopTexture("disc"),
        size: size || 15,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: false
      }));
      back.renderOrder = 2.9;
      back.raycast = function() {};
      stopBacks.push(back);
      dots.add(back);
    }
    return dots;
  }
  var _fsQ = null, _fsM = null, _fsP = null, _fsS = null;
  function floorPx(spot) {
    var d = camera.position.distanceTo(spot);
    return 2 * d * Math.tan(camera.fov * Math.PI / 360) / (camera.zoom || 1) / (view.clientHeight || 1);
  }
  function floorPlate(spots, color, tex, sizePx, order, opacity) {
    var geo = new THREE.PlaneGeometry(1, 1);
    geo.rotateX(-Math.PI / 2);
    var mat = new THREE.MeshBasicMaterial({
      color: color,
      map: tex,
      transparent: true,
      opacity: opacity == null ? 0.95 : opacity,
      depthWrite: false,
      depthTest: false
    });
    var m = new THREE.InstancedMesh(geo, mat, spots.length);
    _fsQ = _fsQ || new THREE.Quaternion;
    _fsM = _fsM || new THREE.Matrix4;
    _fsP = _fsP || new THREE.Vector3;
    _fsS = _fsS || new THREE.Vector3;
    var pz = Math.min(2.2, Math.max(0.8, Math.pow(zoom, 0.75)));
    spots.forEach(function(s, i) {
      var w = sizePx * pz * floorPx(s);
      _fsP.copy(s);
      _fsM.compose(_fsP, _fsQ, _fsS.set(w, 1, w));
      m.setMatrixAt(i, _fsM);
    });
    m.instanceMatrix.needsUpdate = true;
    m.renderOrder = order;
    m.frustumCulled = false;
    m.raycast = function() {};
    return m;
  }
  function floorStops(spots, color, kind, size) {
    if (!camera) {
      return stopDots(spots, color, kind, size);
    }
    var mark = floorPlate(spots, color, stopTexture(kind), size || 15, 3);
    if (kind === "ring" || kind === "full") {
      var back = floorPlate(spots, new THREE.Color(stopFill()), stopTexture("disc"), size || 15, 2.9);
      stopBacks.push(back);
      mark.add(back);
    }
    return mark;
  }
  var floorGlowTex = null;
  function floorGlow(spots, color, size) {
    if (!camera) {
      return new THREE.Group;
    }
    if (!floorGlowTex) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, "rgba(255,255,255,0.9)");
      r.addColorStop(0.35, "rgba(255,255,255,0.45)");
      r.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, 128, 128);
      floorGlowTex = new THREE.CanvasTexture(c);
    }
    return floorPlate(spots, color, floorGlowTex, size, 2.8, isLight() ? 0.45 : 0.6);
  }
  var WP_TINT = {
    safe: 0x34c759,
    caution: 0xffcc00,
    danger: 0xff383c,
    current: 0x4db2ff,
    upcoming: 0x8894aa,
    skipped: 0x4e576a
  };
  var WP_TINT_LIGHT = {
    safe: 0x14c552,
    caution: 0xf2a900,
    current: 0x138deb
  };
  function wpTint(tone) {
    return isLight() && WP_TINT_LIGHT[tone] || WP_TINT[tone] || WP_TINT.upcoming;
  }
  var WP_HALO = 0xffffff;
  var wpMarks = [];
  var wpSpots = [];
  var wpHalo = null;
  var chosenWp = null;
  var liveWp = null;
  var missionPlan = null;
  function readWaypoints() {
    if (missionPlan) {
      var pick = missionPlan.stops.map(function(id) {
        return {
          id: id,
          kind: "upcoming",
          tone: "upcoming",
          name: missionPlan.names[id] || id,
          read: ""
        };
      });
      return pick.concat(missionPlan.skip.map(function(id) {
        return {
          id: id,
          kind: "upcoming",
          tone: "skipped",
          name: missionPlan.names[id] || id,
          read: ""
        };
      }));
    }
    return railWaypoints();
  }
  function railWaypoints() {
    var rail = document.querySelector("[data-timeline]");
    if (!rail) {
      return [];
    }
    return Array.prototype.map.call(rail.querySelectorAll("[data-waypoint]"), function(item) {
      var kind = item.getAttribute("data-wp-state") || "upcoming";
      var title = item.querySelector(".step-title");
      return {
        id: item.getAttribute("data-waypoint"),
        kind: kind,
        tone: item.getAttribute("data-wp-alert") || (kind === "completed" ? item.getAttribute("data-wp-result") || "safe" : kind),
        name: title ? title.textContent : "",
        was: item.hasAttribute("data-wp-cleared"),
        read: item.getAttribute("data-wp-read") || "",
        time: item.getAttribute("data-wp-time") || ""
      };
    });
  }
  function clearWaypoints() {
    wpMarks.forEach(function(mark) {
      scene.remove(mark);
      if (mark.geometry) {
        mark.geometry.dispose();
      }
      if (mark.material) {
        mark.material.dispose();
      }
    });
    wpMarks = [];
    wpSpots = [];
    if (wpHalo) {
      scene.remove(wpHalo);
      wpHalo.geometry.dispose();
      wpHalo.material.dispose();
      wpHalo = null;
    }
  }
  var rrRay = null, rrCamKey = "", rrCamT = 0;
  function rrHidden(spot, force) {
    if (!RR.occl && !force) {
      return false;
    }
    if (!camera || !meshes.length || !spot) {
      return false;
    }
    rrRay = rrRay || new THREE.Raycaster;
    var lift = spot.clone();
    lift.y += span * 0.002;
    var ndc = lift.clone().project(camera);
    rrRay.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
    var list = [];
    meshes.forEach(function(item) {
      if (item.floor && item.floor !== floorNow) {
        return;
      }
      if (item.faded) {
        return;
      }
      if (item.key === "equipment" || item.key === "wall") {
        list.push(item.mesh);
      }
    });
    var hitAt = rrRay.intersectObjects(list, false)[0];
    return !!hitAt && hitAt.distance < rrRay.ray.origin.distanceTo(lift) - span * 0.004;
  }
  function rrCamWatch() {
    if (!camera) {
      return;
    }
    var k = camera.position.toArray().map(function(v) {
      return v.toFixed(2);
    }).join(",") + "|" + camera.zoom.toFixed(3);
    if (k === rrCamKey) {
      return;
    }
    rrCamKey = k;
    clearTimeout(rrCamT);
    rrCamT = setTimeout(function() {
      if (onLane && onLane.turns) {
        layWaypoints();
        frame();
      }
    }, 150);
  }
  var PH_NAME = /^waypoint name$/i, wpNameOf = {};
  function nameWps() {
    var rail = document.querySelector("[data-timeline]");
    if (!rail || !wpSpots.length) {
      return;
    }
    var eq = meshes.filter(function(m) {
      return m.key === "equipment" && m.title;
    }).map(function(m) {
      m.mesh.updateWorldMatrix(true, false);
      return {
        title: m.title,
        at: m.mesh.localToWorld(m.center.clone())
      };
    });
    if (!eq.length) {
      return;
    }
    var used = {};
    var near = function(w) {
      var best = null, bd = Infinity;
      eq.forEach(function(e) {
        if (used[e.title]) {
          return;
        }
        var d = e.at.distanceToSquared(w.spot);
        if (d < bd) {
          bd = d;
          best = e;
        }
      });
      return best;
    };
    wpSpots.forEach(function(w) {
      var row = rail.querySelector('.timeline-item[data-waypoint="' + w.id + '"] .step-title');
      if (row && !row.hasAttribute("data-ph-name") && !PH_NAME.test(row.textContent.trim())) {
        var b = near(w);
        if (b) {
          used[b.title] = true;
        }
      }
    });
    wpSpots.slice().sort(function(a, b) {
      return a.no - b.no;
    }).forEach(function(w) {
      var row = rail.querySelector('.timeline-item[data-waypoint="' + w.id + '"] .step-title');
      if (!row) {
        return;
      }
      var ph = row.hasAttribute("data-ph-name") || PH_NAME.test(row.textContent.trim());
      if (!ph) {
        return;
      }
      var best = near(w);
      if (!best) {
        return;
      }
      used[best.title] = true;
      wpNameOf[w.id] = best.title;
      if (row.getAttribute("data-ph-name") !== best.title) {
        row.setAttribute("data-ph-name", best.title);
        row.textContent = best.title;
      }
    });
  }
  function layWaypoints() {
    if (!scene) {
      return;
    }
    clearWaypoints();
    if (!onLane || !onLane.turns) {
      return;
    }
    var list = readWaypoints();
    if (!list.length) {
      return;
    }
    var book = onLane.book || onLane.plan;
    var segs = onLane.segs;
    function spotOf(id, i) {
      if (segs) {
        var k = onLane.split;
        var top = i < k;
        var seg = top ? segs[0] : segs[2];
        var n = top ? k : list.length - k;
        var j = top ? i : i - k;
        var p = pointAt(seg.pts, seg.mi, seg.len * (j + 0.5) / Math.max(1, n));
        p.userData = {
          floor: seg.floor
        };
        return p;
      }
      if (list.length > 20 && onLane.wps && onLane.wps.length) {
        if (onLane.endM == null) {
          var em = 0;
          onLane.wps.forEach(function(q) {
            em = nearMileFrom(onLane, q, em) + span * 0.002;
          });
          onLane.endM = em;
        }
        var endM = onLane.endM;
        return alongRoute(onLane.turns, onLane.mile, endM * (i + 1) / list.length);
      }
      if (book && book.names) {
        var k = book.names.indexOf(id);
        if (k > 0 && book.wpWorld && book.wpWorld[k - 1]) {
          return book.wpWorld[k - 1].clone();
        }
      }
      if (onLane.wps && onLane.wps[i]) {
        return onLane.wps[i].clone();
      }
      return alongRoute(onLane.turns, onLane.mile, onLane.total * (i / list.length));
    }
    var bucket = {};
    list.forEach(function(info, i) {
      var spot = spotOf(info.id, i);
      var fl = spot.userData && spot.userData.floor || "";
      var tri = info.tone === "caution" || info.tone === "danger", occ = !tri && rrHidden(spot);
      var homing = rrM(onLane) === "return" && !tri;
      var buried = !tri && rrHidden(spot, true);
      wpSpots.push({
        id: info.id,
        spot: spot,
        info: info,
        floor: fl,
        no: i + 1,
        occ: occ,
        off: homing,
        buried: buried
      });
      if (homing || buried) {
        return;
      }
      if (tri && rrM(onLane) === "alert" && info.id === rrAlertId) {
        return;
      }
      if (RR.pins !== "P0" && /upcoming|current|next|active|running/.test(info.tone)) {
        return;
      }
      var key = fl + "|" + info.tone + (occ ? "|o" : "");
      (bucket[key] = bucket[key] || []).push(spot);
    });
    nameWps();
    Object.keys(bucket).forEach(function(key) {
      var tone = key.split("|")[1];
      var wk = tone === "upcoming" ? "ring" : "full", ws = 15;
      if (RR.wpExcept && tone === "safe") {
        wk = "disc";
        ws = 7;
      }
      if (RR.wpExcept && (tone === "caution" || tone === "danger")) {
        wk = "tri";
        ws = 18;
      }
      var alertDot = document.body.classList.contains("ver-7") && (tone === "caution" || tone === "danger");
      if (alertDot) {
        wk = "disc";
        ws = 7;
      }
      if (RR.wpExcept && tone === "upcoming") {
        ws = 12;
      }
      if (RR.ahead === "C4" && tone === "upcoming") {
        wk = "disc";
        ws = 5;
      }
      if (tone === "skipped") {
        wk = "dash";
        ws = 11;
      }
      if (RR.wpExcept && tone === "safe" && rrM(onLane) === "done") {
        ws = 5;
      }
      if (key.split("|")[2] === "o") {
        wk = "dash";
        ws = tone === "safe" ? 9 : Math.max(ws, 12);
      }
      var wc = RR.wpExcept && tone === "safe" && onLane.bot ? rrM(onLane) === "done" ? RR_GRAY : onLane.bot.left : wpTint(tone);
      if (RR.ahead === "C4" && tone === "upcoming") {
        wc = isLight() ? 0xf2f4f7 : 0x141b27;
      }
      var mark = RR.floorMarks && wk !== "tri" ? floorStops(bucket[key], wc, wk, ws) : stopDots(bucket[key], wc, wk, ws);
      mark.userData.floor = key.split("|")[0];
      mark.userData.tone = wk === "disc" && !alertDot ? null : tone;
      scene.add(mark);
      wpMarks.push(mark);
      if (RR.floorMarks && key.split("|")[2] !== "o" && /current|next|active/.test(tone)) {
        var glow = floorGlow(bucket[key], wpTint(tone), 52);
        glow.userData.floor = mark.userData.floor;
        glow.userData.tone = glow.material ? tone : null;
        scene.add(glow);
        wpMarks.push(glow);
      }
    });
    wpFloorSync();
    haloWaypoint();
  }
  function wpFloorSync() {
    wpMarks.forEach(function(m) {
      if (m.userData.floor) {
        m.visible = m.userData.floor === floorNow;
      }
    });
    if (wpHalo && wpHalo.userData.floor) {
      wpHalo.visible = wpHalo.userData.floor === floorNow;
    }
  }
  function haloWaypoint() {
    if (wpHalo) {
      scene.remove(wpHalo);
      wpHalo.geometry.dispose();
      wpHalo.material.dispose();
      wpHalo = null;
    }
    var found = wpSpots.filter(function(w) {
      return w.id === chosenWp;
    });
    if (!found.length || !scene) {
      return;
    }
    wpHalo = (RR.floorMarks ? floorStops : stopDots)(found.map(function(w) {
      return w.spot;
    }), WP_HALO, "halo", 28);
    wpHalo.renderOrder = 4;
    wpHalo.userData.floor = found[0].floor || "";
    if (wpHalo.userData.floor) {
      wpHalo.visible = wpHalo.userData.floor === floorNow;
    }
    scene.add(wpHalo);
  }
  function wpAt(px, py) {
    if (!camera || !wpSpots.length) {
      return null;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    var near = null, best = 14 * 14;
    wpSpots.forEach(function(mark) {
      if (mark.floor && mark.floor !== floorNow) {
        return;
      }
      var p = mark.spot.clone().project(camera);
      var x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h;
      var gap = (x - px) * (x - px) + (y - py) * (y - py);
      if (gap < best) {
        best = gap;
        near = mark;
      }
    });
    if (near || !document.body.classList.contains("ver-7")) {
      return near;
    }
    var vr = view.getBoundingClientRect(), pinBest = Infinity;
    wpSpots.forEach(function(mark) {
      if (mark.floor && mark.floor !== floorNow) {
        return;
      }
      var el = mark.pinEl, head = el && !el.hidden && el.querySelector(".rr-pin-head");
      if (!head || !head.getClientRects().length) {
        return;
      }
      var hr = head.getBoundingClientRect();
      if (!hr.width) {
        return;
      }
      var l = hr.left - vr.left, t = hr.top - vr.top, r = hr.right - vr.left, b = hr.bottom - vr.top;
      var p = mark.spot.clone().project(camera), bx = (p.x * 0.5 + 0.5) * w, by = (-p.y * 0.5 + 0.5) * h;
      var onHead = px >= l - 4 && px <= r + 4 && py >= t - 4 && py <= b + 4;
      var onStem = Math.abs(px - bx) <= 6 && py >= b && py <= by;
      if (!onHead && !onStem) {
        return;
      }
      var cx = (l + r) / 2, cy = (t + b) / 2, d = (cx - px) * (cx - px) + (cy - py) * (cy - py);
      if (d < pinBest) {
        pinBest = d;
        near = mark;
      }
    });
    return near;
  }
  var fatMats = [];
  var ghosts = [];
  var DOT = {
    on: 2,
    off: 6,
    width: 2
  };
  var dotMats = [];
  var rrGhostMats = [];
  var chevMats = [];
  function rrChev(mat) {
    mat.onBeforeCompile = function(sh) {
      sh.fragmentShader = sh.fragmentShader.replace(/if \( mod\( (vLineDistance[^,]*), dashSize \+ gapSize \) > dashSize \) discard;/, "float rrP = mod( $1, dashSize ) / dashSize; float rrX = abs( vUv.x ); float rrF = rrP - 0.32 * ( 1.0 - rrX ); if ( rrX > 0.8 || rrF < 0.30 || rrF > 0.43 ) discard;");
    };
    mat.customProgramCacheKey = function() {
      return "rr-chev";
    };
  }
  function rrRoundDots(mat) {
    mat.userData.rrTilt = mat.userData.rrTilt || {
      value: 0.6
    };
    mat.onBeforeCompile = function(sh) {
      sh.uniforms.rrTilt = mat.userData.rrTilt;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vRrDir;").replace("dir = normalize( dir );", "dir = normalize( dir ); vRrDir = dir;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vRrDir;\nuniform float rrTilt;").replace(/if \( mod\( (vLineDistance[^,]*), dashSize \+ gapSize \) > dashSize \) discard;/, "float rrP = mod( $1, dashSize + gapSize ); if ( rrP > dashSize ) discard; float rrA = rrP / dashSize * 2.0 - 1.0; float rrS = max( 0.35, sqrt( vRrDir.y * vRrDir.y + rrTilt * rrTilt * vRrDir.x * vRrDir.x ) ); float rrX = vUv.x / rrS; if ( rrA * rrA + rrX * rrX > 1.0 ) discard;");
    };
    mat.customProgramCacheKey = function() {
      return "rr-round-dots-floor";
    };
  }
  function syncDots() {
    if (chevMats.length) {
      var cpp = perPixel(), ck = typeof RR !== "undefined" && RR && RR.k || 1;
      chevMats.forEach(function(m) {
        m.dashSize = 12 * cpp * ck;
        m.gapSize = 0;
      });
    }
    var gk = typeof RR !== "undefined" && RR && RR.k || 1, gp = rrGhostMats.length ? perPixel() : 0;
    rrGhostMats.forEach(function(o) {
      o.g.linewidth = o.p.linewidth || 1.2 * gk;
      o.g.dashSize = 3 * gp * gk;
      o.g.gapSize = 3 * gp * gk;
      o.g.color.copy(o.p.color);
      o.g.opacity = Math.min(0.4, Math.max(0.2, o.p.opacity * 0.45));
      if (!RR.occl) {
        o.g.opacity = 0;
      }
    });
    if (!dotMats.length) {
      return;
    }
    var pp = perPixel();
    var kk = typeof RR !== "undefined" && RR && RR.k || 1;
    var tilt = 0.6;
    if (camera) {
      var cdv = new THREE.Vector3;
      camera.getWorldDirection(cdv);
      tilt = Math.max(0.3, Math.abs(cdv.y));
    }
    dotMats.forEach(function(mat) {
      mat.dashSize = DOT.on * pp * kk;
      mat.gapSize = DOT.off * pp * kk;
      if (mat.userData.rrTilt) {
        mat.userData.rrTilt.value = tilt;
      }
    });
  }
  function rrLift(m) {
    m.polygonOffset = true;
    m.polygonOffsetFactor = -10;
    m.polygonOffsetUnits = -10;
    return m;
  }
  function strand(points, color, dashed) {
    var flat = [];
    points.forEach(function(p) {
      flat.push(p.x, p.y, p.z);
    });
    var geo = new Fat.LineGeometry;
    geo.setPositions(flat);
    var mat = new Fat.LineMaterial({
      color: color,
      linewidth: dashed ? THEMED ? DOT.width : 2.6 : 3.6,
      transparent: true,
      opacity: dashed ? 0.85 : 0.95,
      dashed: !!dashed,
      dashSize: span * 0.014,
      gapSize: span * 0.01,
      depthWrite: false
    });
    rrLift(mat);
    mat.resolution.set(view.clientWidth || 1, view.clientHeight || 1);
    fatMats.push(mat);
    if (THEMED && dashed) {
      dotMats.push(mat);
      rrRoundDots(mat);
    }
    var line = new Fat.Line2(geo, mat);
    line.computeLineDistances();
    line.renderOrder = dashed ? 2.5 : 2;
    var ghostMat = mat.clone();
    ghostMat.depthTest = true;
    ghostMat.depthFunc = THREE.GreaterDepth;
    ghostMat.polygonOffset = true;
    ghostMat.polygonOffsetFactor = -8;
    ghostMat.polygonOffsetUnits = -8;
    ghostMat.dashed = true;
    ghostMat.opacity = 0.8;
    ghostMat.resolution.copy(mat.resolution);
    fatMats.push(ghostMat);
    rrGhostMats.push({
      g: ghostMat,
      p: mat
    });
    var ghost = new Fat.Line2(geo, ghostMat);
    ghost.computeLineDistances();
    ghost.renderOrder = 1;
    ghost.visible = OPT.routeGhost;
    ghosts.push(ghost);
    line.add(ghost);
    return line;
  }
  var lanes = {};
  var lazyBots = {};
  function buildLane(bot, id) {
    tintRobot(bot, id);
    var planned = planRobot(bot, id);
    drawRoute(planned ? planned.world : layRoute(modelBox, [ bot.dock ].concat(bot.stops)), bot, id, planned);
    if (bot.floor && lanes[String(id)]) {
      lanes[String(id)].floor = bot.floor;
    }
  }
  function laneFor(key) {
    var bot = lazyBots[key];
    if (!bot || !scene) {
      return;
    }
    delete lazyBots[key];
    buildLane(bot, Number(key));
  }
  function showLane(index, keep) {
    var key = String(index);
    laneFor(key);
    onLane = null;
    window.setTimeout(walkStart, 0);
    Object.keys(lanes).forEach(function(id) {
      var on = id === key;
      lanes[id].parts.forEach(function(part) {
        part.visible = on;
      });
      if (on) {
        onLane = lanes[id];
      }
    });
    if (!keep) {
      chosenWp = null;
    }
    if (onLane && onLane.rr) {
      rrApply(onLane);
    }
    if (onLane && onLane.travel) {
      rrTravel(onLane);
    }
    layWaypoints();
    tellWaypoint();
    tellHeading();
    if (botBox) {
      botBox.hidden = !onLane;
      if (botTip) {
        botTip.hidden = true;
      }
      botBox.classList.remove("is-picked");
      if (onLane) {
        botBox.style.setProperty("--bot-tint", "#" + ("00000" + (onLane.bot.mark || onLane.bot.done).toString(16)).slice(-6));
        botBox.style.setProperty("--bot-route", "#" + ("00000" + onLane.bot.left.toString(16)).slice(-6));
        var bnm = PRESTART && preName() || onLane.bot.name;
        if (botName) {
          botName.textContent = bnm;
        }
        if (botTitle) {
          botTitle.textContent = bnm;
        }
      }
    }
    frame();
  }
  var toldHeading = null;
  function tellHeading() {
    var h = null;
    if (onLane) {
      h = Math.atan2(onLane.ahead.x - onLane.here.x, onLane.ahead.z - onLane.here.z);
    }
    if (h === toldHeading) {
      return;
    }
    toldHeading = h;
    document.dispatchEvent(new CustomEvent("aprism:robot-heading", {
      detail: {
        id: onLane ? onLane.id : null,
        heading: h
      }
    }));
  }
  var dog3 = null;
  var DOG_PX = 46;
  var DOG_MOTION = {
    run: "walk",
    alert: "idle",
    return: "walk",
    inspect: "idle",
    pause: "idle",
    lost: "idle",
    estop: "sit",
    done: "sit"
  };
  function robotKind(id) {
    var card = document.querySelector(".robot-strip .robot-card[data-robot='" + id + "']");
    return card && card.getAttribute("data-type") === "mobed" ? "wheel" : "spot";
  }
  var HALO_R = 0.77, HALO_G = "#3BE07A", HALO_GX = 0x3BE07A;
  var HALO_TINT = {
    alert: 0xff383c,
    estop: 0xff383c,
    return: 0x9ea8bb,
    pause: 0xffb020
  };
  var HALO_PAUSE = 0xffb020, HALO_TRACK = "#1F3328", MAP3D_HOME = 0x8894aa;
  var HALO_BREATH = 1800;
  var halo = null;
  function haloArt(light) {
    var R = 120, half = R * 1.22, k = 2, n = Math.round(half * 2 * k);
    function pad() {
      var c = document.createElement("canvas");
      c.width = c.height = n;
      var g = c.getContext("2d");
      g.setTransform(k, 0, 0, k, half * k, half * k);
      return {
        c: c,
        g: g
      };
    }
    function arcPath(g, a, halfDeg, r) {
      g.beginPath();
      g.arc(0, 0, r, (a - halfDeg) * Math.PI / 180, (a + halfDeg) * Math.PI / 180);
    }
    var base = pad(), g = base.g;
    g.globalAlpha = 1;
    g.strokeStyle = "#fff";
    g.lineWidth = 12;
    g.lineCap = "round";
    [ -90, 90, 180 ].forEach(function(a) {
      arcPath(g, a, 32, R - 10);
      g.stroke();
    });
    var ring = pad();
    g = ring.g;
    g.lineWidth = 12;
    g.strokeStyle = light ? "rgba(23,128,74,.25)" : HALO_TRACK;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 0.12;
    g.strokeStyle = HALO_G;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    var front = pad();
    g = front.g;
    g.strokeStyle = "#fff";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.shadowColor = "#fff";
    g.shadowBlur = 12 * k;
    arcPath(g, 0, 44, R - 10);
    g.stroke();
    var duo = pad();
    g = duo.g;
    g.strokeStyle = "#fff";
    g.globalAlpha = 0.45;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
    g.lineWidth = 10;
    g.shadowColor = "#fff";
    g.shadowBlur = 10 * k;
    g.beginPath();
    g.arc(0, 0, R * 0.72, 0, Math.PI * 2);
    g.stroke();
    var brk = pad();
    g = brk.g;
    g.strokeStyle = "#fff";
    g.lineCap = "round";
    [ 90, -90 ].forEach(function(a) {
      g.globalAlpha = 0.45;
      g.lineWidth = 3;
      g.shadowBlur = 0;
      arcPath(g, a, 58, R);
      g.stroke();
      g.globalAlpha = 1;
      g.lineWidth = 10;
      g.shadowColor = "#fff";
      g.shadowBlur = 10 * k;
      arcPath(g, a, 58, R * 0.72);
      g.stroke();
    });
    return {
      base: base.c,
      ring: ring.c,
      front: front.c,
      duo: duo.c,
      brk: brk.c,
      size: half / R
    };
  }
  function haloLayer(cv, order) {
    var tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    var geo = new THREE.PlaneGeometry(1, 1);
    geo.rotateX(-Math.PI / 2);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      depthTest: false
    }));
    m.renderOrder = 900 + order;
    return m;
  }
  function rrHalo() {
    if (!THREE || !scene) {
      return;
    }
    var light = isLight();
    if (!halo || halo.light !== light) {
      if (halo) {
        scene.remove(halo.g);
        halo.g.traverse(function(o) {
          if (o.material) {
            o.material.map.dispose();
            o.material.dispose();
            o.geometry.dispose();
          }
        });
      }
      var art = haloArt(light);
      halo = {
        light: light,
        size: art.size,
        g: new THREE.Group,
        base: haloLayer(art.base, 1),
        ring: haloLayer(art.ring, 1),
        front: haloLayer(art.front, 2),
        duo: haloLayer(art.duo, 2),
        brk: haloLayer(art.brk, 2)
      };
      halo.g.add(halo.base, halo.ring, halo.front, halo.duo, halo.brk);
      halo.g.visible = false;
      scene.add(halo.g);
    }
    var st = botBox && botBox.getAttribute("data-rr") || "run";
    var ov = window.APRISM_KISTA_OV;
    if (ov && onLane && botBox && !botBox.hidden && robotKind(onLane.id) === "spot") {
      if (onLane.fan && ov.fan === false) {
        onLane.fan.visible = false;
      }
      halo.g.visible = !!ov.show;
      if (!ov.show) {
        return;
      }
      halo.duo.visible = halo.brk.visible = false;
      halo.base.visible = ov.base > 0;
      halo.front.visible = ov.front > 0;
      halo.ring.visible = ov.ring > 0;
      halo.base.material.color.setHex(ov.color);
      halo.front.material.color.setHex(ov.color);
      halo.base.material.opacity = Math.min(1, ov.base);
      halo.front.material.opacity = Math.min(1, ov.front);
      halo.ring.material.opacity = Math.min(1, ov.ring);
      halo.front.rotation.y = ov.sway || 0;
      var osz = DOG_PX * baseSize / (view.clientHeight || 1);
      halo.g.position.set(onLane.here.x, onLane.here.y + span * 0.0006, onLane.here.z);
      halo.g.scale.setScalar(osz * HALO_R * halo.size * 2 * (ov.scale || 1));
      var odx = onLane.ahead.x - onLane.here.x, odz = onLane.ahead.z - onLane.here.z;
      if (odx * odx + odz * odz > 1e-10) {
        halo.g.rotation.y = Math.atan2(-odz, odx);
      }
      return;
    }
    var show = !!(onLane && botBox && !botBox.hidden && botBox.style.visibility !== "hidden" && !botBox.hasAttribute("data-rr-docked")) && (robotKind(onLane.id) === "spot" || document.body.classList.contains("ver-7")) && st !== "lost";
    if (PRESTART && document.body.getAttribute("data-precheck") !== "done") {
      show = false;
    }
    halo.g.visible = show;
    if (!show) {
      return;
    }
    var wait = st === "done", scan = st === "inspect", hold = st === "pause";
    var arc4 = document.body.classList.contains("ver-7") && !wait;
    halo.base.visible = halo.front.visible = scan || arc4;
    halo.duo.visible = !wait && !scan && !hold && !arc4;
    halo.brk.visible = hold && !arc4;
    halo.ring.visible = wait;
    halo.base.material.opacity = 0.3;
    halo.ring.material.opacity = 1;
    var walk = DOG_MOTION[st] === "walk", now = performance.now();
    var tint = HALO_TINT[st] || HALO_GX;
    halo.base.material.color.setHex(tint);
    halo.front.material.color.setHex(tint);
    halo.duo.material.color.setHex(tint);
    halo.brk.material.color.setHex(tint);
    halo.duo.material.opacity = walk ? 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(now / 2400 * Math.PI * 2)) : 1;
    var look = st === "inspect" && !rrReduce;
    halo.front.rotation.y = look ? Math.sin(now / 650) * 0.42 : 0;
    halo.front.material.opacity = look ? 0.45 + 0.55 * (0.5 - 0.5 * Math.cos(now / HALO_BREATH * Math.PI * 2)) : arc4 && walk && !rrReduce ? 0.35 + 0.65 * (0.5 - 0.5 * Math.cos(now / 2400 * Math.PI * 2)) : 1;
    var sz = DOG_PX * baseSize / (view.clientHeight || 1);
    halo.g.position.set(onLane.here.x, onLane.here.y + span * 0.0006, onLane.here.z);
    halo.g.scale.setScalar(sz * HALO_R * halo.size * 2 * (robotKind(onLane.id) === "wheel" ? 0.9 : 1));
    var dx = onLane.ahead.x - onLane.here.x, dz = onLane.ahead.z - onLane.here.z;
    if (dx * dx + dz * dz > 1e-10) {
      halo.g.rotation.y = Math.atan2(-dz, dx);
    }
  }
  function rrDog() {
    if (!THREE || !renderer || !camera || !window.APRISM_SPOT) {
      return;
    }
    var show = !!(onLane && botBox && !botBox.hidden && botBox.style.visibility !== "hidden");
    if (!show) {
      if (dog3) {
        dog3.turn.visible = false;
      }
      return;
    }
    if (!dog3) {
      var sc = new THREE.Scene;
      sc.add(new THREE.HemisphereLight(0xffffff, 0x50586a, 1.6));
      var key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(-1.5, 4, 1.2);
      sc.add(key);
      var rim = new THREE.DirectionalLight(0xffffff, 0.5);
      rim.position.set(2, 1.5, -2);
      sc.add(rim);
      var turn = new THREE.Group;
      sc.add(turn);
      dog3 = {
        scene: sc,
        turn: turn,
        models: {},
        cur: null,
        last: 0,
        raf: 0
      };
    }
    var kind = robotKind(onLane.id);
    if (!dog3.models[kind]) {
      dog3.models[kind] = window.APRISM_SPOT(THREE, kind);
    }
    if (dog3.cur !== dog3.models[kind]) {
      if (dog3.cur) {
        dog3.turn.remove(dog3.cur.group);
      }
      dog3.cur = dog3.models[kind];
      dog3.turn.add(dog3.cur.group);
    }
    var g = dog3.turn;
    g.visible = true;
    g.position.copy(onLane.here);
    var dx = onLane.ahead.x - onLane.here.x, dz = onLane.ahead.z - onLane.here.z;
    if (dx * dx + dz * dz > 1e-10) {
      g.rotation.y = Math.atan2(dx, dz) + Math.PI;
    }
    var sz = DOG_PX * baseSize / (view.clientHeight || 1);
    g.scale.setScalar(sz);
    var st = botBox && botBox.getAttribute("data-rr") || "run";
    dog3.freeze = st === "lost";
    if (!dog3.freeze) {
      dog3.motion = window.APRISM_KISTA_OV && window.APRISM_KISTA_OV.motion || DOG_MOTION[st] || "idle";
    }
    if (PRESTART && !dog3.freeze) {
      var seated = document.body.getAttribute("data-precheck") !== "done";
      dog3.motion = seated ? "sit" : "idle";
      if (onLane && onLane.fan) {
        onLane.fan.visible = !seated;
      }
    }
    var ac = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clearDepth();
    var ghost = st === "lost";
    dogGhost(dog3.cur.group, ghost);
    if (ghost) {
      if (!dog3.depth) {
        dog3.depth = new THREE.MeshBasicMaterial({
          colorWrite: false
        });
      }
      dog3.scene.overrideMaterial = dog3.depth;
      renderer.render(dog3.scene, camera);
      dog3.scene.overrideMaterial = null;
    }
    renderer.render(dog3.scene, camera);
    renderer.autoClear = ac;
    if (!dog3.raf) {
      dog3.raf = window.requestAnimationFrame(function tick(t) {
        dog3.raf = 0;
        if (!dog3.turn.visible || document.hidden) {
          dog3.last = 0;
          return;
        }
        var dt = dog3.last ? Math.min(0.1, (t - dog3.last) / 1000) : 0;
        dog3.last = t;
        if (!dog3.freeze) {
          dog3.cur.update(dt, dog3.motion);
        }
        frameTick(t);
      });
    }
  }
  var DOG_GHOST = 0.4;
  function dogGhost(root, on) {
    if (root.userData.ghost === on) {
      return;
    }
    root.userData.ghost = on;
    root.traverse(function(o) {
      if (!o.material) {
        return;
      }
      (Array.isArray(o.material) ? o.material : [ o.material ]).forEach(function(m) {
        if (!m.userData.solid) {
          m.userData.solid = {
            t: m.transparent,
            o: m.opacity
          };
        }
        m.transparent = on || m.userData.solid.t;
        m.opacity = m.userData.solid.o * (on ? DOG_GHOST : 1);
        m.needsUpdate = true;
      });
    });
  }
  function placeBot() {
    if (!botBox || !onLane || botBox.hidden) {
      return;
    }
    var away = onLane.floor && onLane.floor !== "stair" && floors.length && onLane.floor !== floorNow;
    botBox.style.visibility = away ? "hidden" : "";
    if (away) {
      return;
    }
    var v = view.getBoundingClientRect();
    var c = hit.getBoundingClientRect();
    var a = onLane.here.clone().project(camera);
    var b = onLane.ahead.clone().project(camera);
    var ax = (a.x * 0.5 + 0.5) * v.width + v.left - c.left;
    var ay = (-a.y * 0.5 + 0.5) * v.height + v.top - c.top;
    var bx = (b.x * 0.5 + 0.5) * v.width + v.left - c.left;
    var by = (-b.y * 0.5 + 0.5) * v.height + v.top - c.top;
    var dx = bx - ax, dy = by - ay;
    if (dx * dx + dy * dy > 0.01) {
      botBox.style.setProperty("--flip", dx < 0 ? "-1" : "1");
      botBox.style.setProperty("--bot-ang", (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1) + "deg");
    }
    botBox.style.setProperty("--x", snapPx(ax));
    botBox.style.setProperty("--y", snapPx(ay));
    botBox.style.setProperty("--bot-zoom", Math.min(2.8, Math.max(1, Math.pow(zoom, 0.7))).toFixed(2));
  }
  function botFacts(card) {
    var out = [];
    Array.prototype.forEach.call(card.querySelectorAll(".robot-row"), function(row) {
      var caps = row.querySelectorAll(".t-caption");
      if (caps.length < 2) {
        return;
      }
      out.push([ caps[0].textContent.trim(), caps[caps.length - 1].textContent.trim() ]);
    });
    return out;
  }
  var botNowTimer = 0;
  function botNow(card) {
    var en = document.documentElement.lang === "en";
    var rail = document.querySelector("[data-timeline]");
    var ban = document.querySelector(".progress-meta > .rr-banner .rr-state");
    var ttl = document.querySelector("[data-progress-title]"), left = document.querySelector("[data-progress-left]");
    var run = rail && rail.querySelector(".timeline-item[data-waypoint].is-running");
    var dones = rail ? rail.querySelectorAll(".timeline-item[data-waypoint].is-done") : [];
    var from = dones.length ? dones[dones.length - 1].getAttribute("data-waypoint") : "";
    var to = run ? run.getAttribute("data-waypoint") : "";
    var eta = run && run.querySelector('[data-rr="eta"]'), pct = run && run.querySelector('[data-rr="pct"]');
    var measuring = !!(run && run.querySelector(".rr-note.is-measure"));
    var esc = function(t) {
      return String(t).replace(/[&<>"]/g, function(c) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;"
        }[c];
      });
    };
    var pinOf = function(wp) {
      var n = parseInt(String(wp).replace(/\D+/g, ""), 10), h = !isNaN(n) && document.querySelector('.rr-pin-head[data-n="' + n + '"]');
      return h ? '<span class="mbt-pin' + (document.body.classList.contains("ver-7") ? " ds-wp is-s" : "") + '" role="img" aria-label="' + esc(wp) + '" data-n="' + n + '" style="' + esc(h.getAttribute("style") || "") + '"></span>' : esc(wp);
    };
    var arrow = '<span class="mbt-arrow" aria-hidden="true">→</span>';
    var route = !to ? "" : measuring ? pinOf(to) + '<span class="mbt-meta">' + (en ? "Measuring" : "측정 중") + "</span>" : (from ? pinOf(from) + arrow : "") + pinOf(to) + (eta && eta.textContent.trim() ? '<span class="mbt-meta">' + esc(eta.textContent.trim()) + "</span>" : "");
    var actHtml = function(t) {
      var name = run && run.querySelector(".step-title") ? run.querySelector(".step-title").textContent.trim() : "";
      var m = !en && /^(.+?)(으로|로) (이동 중)$/.exec(t);
      if (m) {
        return esc(m[1] + m[2]) + ' <span class="mbt-nw">' + m[3] + "</span>";
      }
      if (name && t.indexOf(name + " ") === 0) {
        return esc(name) + ' <span class="mbt-nw">' + esc(t.slice(name.length + 1)) + "</span>";
      }
      return esc(t);
    };
    var html = "";
    if (ban) {
      var tone = (ban.parentNode.className.match(/rr-tone-\S+/) || [ "" ])[0], is = (ban.parentNode.className.match(/(^|\s)is-\S+/) || [ "" ])[0].trim();
      html += '<p class="mbt-act rr-banner ' + is + " " + tone + '">' + ban.outerHTML + "</p>";
      var why = left && left.textContent.trim();
      if (why) {
        html += '<p class="mbt-sub">' + esc(why) + "</p>";
      }
      if (route && !/is-(done|lost|estop)/.test(is)) {
        html += '<p class="mbt-sub mbt-route num">' + route + "</p>";
      }
    } else {
      if (ttl) {
        html += '<p class="mbt-act">' + actHtml(ttl.textContent.trim()) + "</p>";
      }
      if (route) {
        html += '<p class="mbt-sub mbt-route num">' + route + "</p>";
      }
    }
    var warn = [];
    botFacts(card).forEach(function(f) {
      var k = f[0].toLowerCase(), v = f[1];
      if (/battery|배터리/.test(k)) {
        var b = parseInt(v, 10);
        if (!isNaN(b) && b <= 20) {
          warn.push((en ? "Battery " : "배터리 ") + b + "%");
        }
      }
      if (/signal|신호/.test(k) && /^(Weak|약함)$/i.test(v)) {
        warn.push(en ? "Weak signal" : "신호 약함");
      }
    });
    if (warn.length) {
      html += '<p class="mbt-warn"><span class="i i-14" style="--i:var(--ic-warning)" aria-hidden="true"></span>' + esc(warn.join(" · ")) + "</p>";
    }
    return html;
  }
  function tellBot(on) {
    if (!botTip) {
      return;
    }
    clearInterval(botNowTimer);
    if (!on || !onLane) {
      botTip.hidden = true;
      botBox.classList.remove("is-picked");
      return;
    }
    var card = document.querySelector(".robot-strip .robot-card[data-robot='" + onLane.id + "']");
    var mine = card && card.getAttribute("aria-pressed") === "true" && document.body.classList.contains("ver-6");
    if (mine && botRows) {
      var paint = function() {
        var h = botNow(card);
        if (botRows.getAttribute("data-now") !== h) {
          botRows.setAttribute("data-now", h);
          botRows.innerHTML = h;
        }
      };
      botRows.classList.add("is-now");
      paint();
      botNowTimer = setInterval(function() {
        if (botTip.hidden) {
          clearInterval(botNowTimer);
          return;
        }
        paint();
      }, 400);
    } else if (card && botRows) {
      botRows.classList.remove("is-now");
      botRows.removeAttribute("data-now");
      botRows.textContent = "";
      botFacts(card).forEach(function(fact) {
        var line = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = fact[0];
        window.APRISM_TEXT.fill(dd, fact[1]);
        line.appendChild(dt);
        line.appendChild(dd);
        botRows.appendChild(line);
      });
    }
    var bn = botTip.querySelector("[data-map-bot-title]");
    if (bn) {
      botTip.setAttribute("aria-label", "로봇 " + bn.textContent.trim());
    }
    botTip.hidden = false;
    botBox.classList.add("is-picked");
  }
  var wpBox = document.querySelector("[data-map-wp]");
  var wpChip = wpBox && wpBox.querySelector("[data-map-wp-chip]");
  var wpName = wpBox && wpBox.querySelector("[data-map-wp-name]");
  var wpRead = wpBox && wpBox.querySelector("[data-map-wp-read]");
  var alertBox = document.querySelector("[data-map-alert]");
  var V7MA = document.body.classList.contains("ver-7");
  function v7Room(W, H) {
    var box = hit.getBoundingClientRect();
    var toolsEl = document.querySelector(".map-canvas > .map-tools"), deltaEl = document.querySelector(".delta3");
    var right = toolsEl && toolsEl.offsetParent ? toolsEl.getBoundingClientRect().left - box.left - 12 : W - 12;
    var dr = deltaEl && deltaEl.getClientRects().length ? deltaEl.getBoundingClientRect() : null;
    var chat7 = document.body.classList.contains("d3-chat");
    if (chat7) {
      dr = null;
    }
    var simEl = document.querySelector(".rsim"), sr = simEl && simEl.getClientRects().length ? simEl.getBoundingClientRect() : null;
    var panelEl = document.querySelector(".right-panel"), pr = panelEl && panelEl.getClientRects().length ? panelEl.getBoundingClientRect() : null;
    var panelOut = panelEl && panelEl.parentElement, po = panelOut && panelOut.getClientRects().length ? panelOut.getBoundingClientRect() : null;
    if (pr && po && po.bottom > pr.bottom && po.bottom <= box.bottom) {
      pr = po;
    }
    var gap = pr ? Math.max(0, box.bottom - pr.bottom) : 16;
    var floor = H - gap;
    if (sr && !simEl.classList.contains("is-folded")) {
      floor = Math.min(floor, sr.top - box.top - 8);
    }
    var edge = chat7 && pr ? Math.max(8, Math.round(pr.top - box.top)) : 16;
    return {
      center: right / 2,
      top: dr ? Math.max(8, dr.top - box.top) : edge,
      left: dr ? Math.max(8, dr.left - box.left) : edge,
      below: dr ? dr.bottom - box.top + 8 : edge,
      floor: floor
    };
  }
  var reqTopY = null;
  var MA_FOLD = 330;
  var alertSide = "";
  var alertAim = false;
  function alertOn() {
    return !!(alertBox && !alertBox.hidden && chosenWp && alertBox.getAttribute("data-wp") === chosenWp);
  }
  var wpEtaTimer = 0;
  var WP_WORD = {
    safe: "정상",
    caution: "주의",
    danger: "위험",
    current: "측정 중",
    upcoming: "예정"
  };
  var WP_ST = {
    wait: "현장 응답 대기",
    work: "현장 조치 중",
    done: "조치 완료"
  };
  function wpProgress(info, dl) {
    var box = wpBox.querySelector(".mwp-prog");
    var S7 = window.APRISM_ALERTS7, all = S7 ? S7.req.all() : {}, rb = +activeRobot();
    var hits = S7 ? S7.list.filter(function(a) {
      return a.wp === info.id && a.robot === rb && all[a.id];
    }) : [];
    if (!hits.length) {
      if (box) {
        box.hidden = true;
      }
      return;
    }
    if (!box) {
      box = document.createElement("div");
      box.className = "mwp-prog";
      wpBox.appendChild(box);
    }
    box.textContent = "";
    hits.forEach(function(a) {
      var r = all[a.id], st = WP_ST[r.st] ? r.st : "wait";
      var vd = window.APRISM_VERDICT && window.APRISM_VERDICT(a.detect, a.value) || "기준 위반";
      var ol = document.createElement("ol");
      ol.className = "mwp-steps is-" + st;
      var li1 = document.createElement("li");
      li1.className = "is-past";
      li1.innerHTML = '<i aria-hidden="true"></i><div><span class="ms-l"></span><ul class="ms-acts"></ul></div>';
      li1.querySelector(".ms-l").textContent = vd;
      (r.how || []).forEach(function(h) {
        var x = document.createElement("li");
        x.textContent = h;
        li1.querySelector(".ms-acts").appendChild(x);
      });
      var li2 = document.createElement("li");
      li2.className = "is-now";
      li2.setAttribute("aria-current", "step");
      li2.innerHTML = '<i aria-hidden="true"></i><div><span class="ms-l"></span><span class="ms-t num"></span></div>';
      li2.querySelector(".ms-l").textContent = WP_ST[st];
      li2.querySelector(".ms-t").textContent = ((st === "done" ? r.t3 : st === "work" ? r.t2 : r.t) || "").slice(0, 5);
      ol.appendChild(li1);
      ol.appendChild(li2);
      box.appendChild(ol);
    });
    box.hidden = false;
    if (wpRead) {
      wpRead.hidden = true;
    }
    if (dl) {
      dl.hidden = true;
    }
  }
  document.addEventListener("aprism:requested", function() {
    if (V7MA && wpBox && !wpBox.hidden) {
      tellWaypoint();
    }
  });
  function tellWaypoint() {
    if (alertBox && !alertBox.hidden && alertBox.getAttribute("data-wp") !== chosenWp) {
      alertBox.hidden = true;
      document.dispatchEvent(new CustomEvent("aprism:map-alert", {
        detail: {
          open: false
        }
      }));
    }
    if (!wpBox) {
      return;
    }
    var found = wpSpots.filter(function(w) {
      return w.id === chosenWp;
    })[0];
    if (!found) {
      wpBox.hidden = true;
      return;
    }
    if (alertOn()) {
      wpBox.hidden = true;
      placeWp();
      return;
    }
    var info = found.info;
    wpBox.setAttribute("data-result", info.tone);
    if (wpChip) {
      wpChip.textContent = WP_WORD[info.tone] || "예정";
    }
    if (wpName) {
      window.APRISM_TEXT.fill(wpName, [ info.id, info.name || "waypoint" ]);
    }
    if (document.body.classList.contains("ver-6") && wpName) {
      var n6 = found.no, ph6 = document.querySelector('.rr-pin-head[data-n="' + n6 + '"]');
      var row6 = document.querySelector('[data-timeline] .timeline-item[data-waypoint="' + info.id + '"] .step-title');
      var nm6 = row6 && row6.textContent.trim() || wpNameOf[info.id] || info.name || info.id;
      var pin6 = wpBox.querySelector(".map-wp-pin");
      if (!pin6) {
        pin6 = document.createElement("span");
        pin6.className = "mbt-pin map-wp-pin" + (document.body.classList.contains("ver-7") ? " ds-wp" : "");
        pin6.setAttribute("role", "img");
        wpName.parentNode.insertBefore(pin6, wpName);
      }
      pin6.setAttribute("data-n", String(n6));
      pin6.setAttribute("aria-label", info.id);
      pin6.setAttribute("style", ph6 ? ph6.getAttribute("style") || "" : "");
      pin6.classList.toggle("is-plain", !ph6);
      wpName.textContent = nm6;
      wpBox.setAttribute("aria-label", "웨이포인트 " + info.id + " " + nm6 + ", " + (WP_WORD[info.tone] || "예정"));
      var more6 = wpBox.querySelector("[data-map-wp-more]");
      if (more6) {
        more6.hidden = true;
      }
      if (wpRead) {
        var runRow = document.querySelector('[data-timeline] .timeline-item[data-waypoint="' + info.id + '"]');
        var meas6 = !!(runRow && runRow.querySelector(".rr-note.is-measure"));
        var core6 = info.tone === "safe" ? "" : /current|next|active|running/.test(info.tone) ? meas6 ? "측정 항목 확인 중" : "로봇이 오는 중" : info.kind === "upcoming" || info.tone === "upcoming" ? "아직 가지 않은 자리입니다." : info.read || "";
        wpRead.textContent = core6;
        wpRead.hidden = !core6;
        clearInterval(wpEtaTimer);
        if (core6 === "로봇이 오는 중") {
          var etaEl = document.createElement("span");
          etaEl.className = "mbt-meta";
          wpRead.appendChild(etaEl);
          var etaPaint = function() {
            var e = runRow && runRow.querySelector('[data-rr="eta"]'), t = e ? e.textContent.trim() : "";
            if (etaEl.textContent !== t) {
              etaEl.textContent = t;
            }
          };
          etaPaint();
          wpEtaTimer = setInterval(function() {
            if (wpBox.hidden || !etaEl.isConnected) {
              clearInterval(wpEtaTimer);
              return;
            }
            etaPaint();
          }, 400);
        }
        if (wpChip && /current|next|active|running/.test(info.tone)) {
          wpChip.textContent = meas6 ? "측정 중" : "다음 지점";
        }
        wpRead.classList.add("mbt-core");
        var rows6 = [];
        if (info.tone === "safe") {
          String(info.read || "").split(/\s*·\s*/).forEach(function(part) {
            var m = /^(.*?)\s*(-?\d[\d.,]*\s*\S*)$/.exec(part.trim());
            if (m && m[1]) {
              rows6.push([ m[1], m[2] ]);
            }
          });
          if (info.time) {
            var tm = String(info.time).split(/\s*·\s*/);
            rows6.push([ "측정 시각", tm[0] + (tm[1] ? " (" + tm[1] + ")" : "") ]);
          }
        }
        var dl6 = wpBox.querySelector(".mbt-wp-rows");
        if (!dl6) {
          dl6 = document.createElement("dl");
          dl6.className = "map-card-rows mbt-wp-rows";
          wpRead.parentNode.insertBefore(dl6, wpRead.nextSibling);
        }
        dl6.textContent = "";
        rows6.forEach(function(r) {
          var d = document.createElement("div"), t = document.createElement("dt"), v = document.createElement("dd");
          t.textContent = r[0];
          v.textContent = r[1];
          d.appendChild(t);
          d.appendChild(v);
          dl6.appendChild(d);
        });
        dl6.hidden = !rows6.length;
        var tEl = wpBox.querySelector("[data-map-wp-time]");
        if (tEl) {
          tEl.hidden = true;
        }
        if (V7MA) {
          wpProgress(info, dl6);
        }
      }
    }
    if (wpRead && !document.body.classList.contains("ver-6")) {
      window.APRISM_TEXT.fill(wpRead, info.read || (info.kind === "upcoming" ? "아직 가지 않은 자리입니다." : "측정 항목 확인 중"));
    }
    var wpTime = wpBox.querySelector("[data-map-wp-time]");
    if (wpTime) {
      wpTime.textContent = info.time || "";
      wpTime.hidden = !info.time || document.body.classList.contains("ver-6");
    }
    wpBox.hidden = false;
    placeWp();
  }
  function placeWp() {
    if (!camera) {
      return;
    }
    maPinSync();
    var showAlert = alertOn();
    if (!showAlert) {
      alertSide = "";
    }
    if (!showAlert && (!wpBox || wpBox.hidden)) {
      return;
    }
    var found = wpSpots.filter(function(w) {
      return w.id === chosenWp;
    })[0];
    if (!found) {
      return;
    }
    var p = found.spot.clone().project(camera);
    var v = view.getBoundingClientRect();
    var c = hit.getBoundingClientRect();
    var x = (p.x * 0.5 + 0.5) * v.width + v.left - c.left;
    var y = (-p.y * 0.5 + 0.5) * v.height + v.top - c.top;
    if (showAlert) {
      placeAlert(x, y, c.width, c.height);
      return;
    }
    var half = wpBox.offsetWidth / 2 || 88;
    var tall = wpBox.offsetHeight + 12 || 96;
    x = Math.min(c.width - half - 8, Math.max(half + 8, x));
    y = Math.min(c.height - 8, Math.max(tall + 8, y));
    wpBox.style.setProperty("--x", snapPx(x));
    wpBox.style.setProperty("--y", snapPx(y));
  }
  function placeAlert(x, y, W, H) {
    var w = alertBox.offsetWidth, h = alertBox.offsetHeight;
    if (V7MA && !alertBox.classList.contains("is-docked")) {
      var rm = v7Room(W, H);
      var hb0 = hit.getBoundingClientRect(), op = alertBox.offsetParent ? alertBox.offsetParent.getBoundingClientRect() : hb0;
      var room = Math.floor(rm.floor - rm.below);
      alertBox.style.setProperty("--ma-max", room + "px");
      alertBox.classList.toggle("is-folded", room < MA_FOLD);
      w = alertBox.offsetWidth;
      h = alertBox.offsetHeight;
      var dEl = document.body.classList.contains("d3-chat") ? null : document.querySelector(".delta3.is-open") || document.querySelector(".delta3 .delta3-card") || document.querySelector(".delta3"), dRect = dEl && dEl.getClientRects().length ? dEl.getBoundingClientRect() : null;
      var opEl = alertBox.offsetParent;
      var ccx = (dRect ? dRect.left : hb0.left + rm.left) - op.left - (opEl ? opEl.clientLeft : 0) + w / 2;
      var cardTop = rm.floor - h + (hb0.top - op.top);
      if (alertBox.classList.contains("is-requested") && document.body.classList.contains("d3-chat")) {
        if (reqTopY === null) {
          var py = parseFloat(alertBox.style.getPropertyValue("--y"));
          reqTopY = isNaN(py) ? cardTop : py;
        }
        cardTop = Math.min(reqTopY, cardTop);
      } else {
        reqTopY = null;
      }
      alertBox.classList.remove("is-side-r", "is-side-l", "is-below");
      alertBox.classList.add("is-fixed", "is-no-tail");
      alertBox.style.setProperty("--x", snapPx(ccx));
      alertBox.style.setProperty("--y", snapPx(cardTop));
      maLabelAt(x, y, W, H);
      return;
    }
    var half = w / 2;
    var tall = h + 16;
    var box = hit.getBoundingClientRect();
    var toolsEl = document.querySelector(".map-canvas > .map-tools"), deltaEl = document.querySelector(".delta3");
    var right = toolsEl && toolsEl.offsetParent ? toolsEl.getBoundingClientRect().left - box.left - 8 : W - 8;
    var dr = deltaEl && deltaEl.getClientRects().length ? deltaEl.getBoundingClientRect() : null;
    var simEl = document.querySelector(".rsim"), sr = simEl && simEl.getClientRects().length ? simEl.getBoundingClientRect() : null;
    var floorY = sr ? Math.min(H - 8, sr.top - box.top - 8) : H - 8;
    var dL = dr ? dr.left - box.left : 0, dR = dr ? dr.right - box.left : 0, dT = dr ? dr.top - box.top : 0, dB = dr ? dr.bottom - box.top : 0;
    var below = y - tall < 8 && y + tall <= H - 8;
    var cx = Math.min(right - half, Math.max(half + 8, x));
    var tail = Math.max(-(half - 24), Math.min(half - 24, x - cx));
    var cy = below ? Math.max(-8, Math.min(y, H - tall - 8)) : Math.min(H + 8, Math.max(tall + 8, y));
    var top = below ? cy + 16 : cy - tall, lft = cx - half;
    var fits = y - tall >= 8 || y + tall <= floorY;
    var onDelta = !!dr && lft < dR && lft + w > dL && top < dB && top + h > dT;
    var onSim = !!sr && lft < sr.right - box.left && lft + w > sr.left - box.left && top + h > sr.top - box.top;
    var edge = dr ? dR + 8 : 8;
    if (!alertSide && !alertAim && !trip && !floorBusy && !alertBox.classList.contains("is-docked") && (!fits || onDelta || onSim)) {
      alertSide = right - (x + 16) >= x - 16 - edge ? "r" : "l";
    }
    alertBox.classList.toggle("is-side-r", alertSide === "r");
    alertBox.classList.toggle("is-side-l", alertSide === "l");
    if (alertSide) {
      alertBox.classList.remove("is-below");
      var want = alertSide === "r" ? x + 16 : x - 16;
      var sx = alertSide === "r" ? Math.max(edge, Math.min(want, right - w)) : Math.min(right, Math.max(want, edge + w));
      var sy = Math.max(h / 2 + 8, Math.min(floorY - h / 2, y));
      var ty = Math.max(-(h / 2 - 24), Math.min(h / 2 - 24, y - sy));
      alertBox.classList.toggle("is-no-tail", x < 0 || x > W || y < 0 || y > H || Math.abs(sx - want) > 1 || Math.abs(y - sy - ty) > 1);
      alertBox.style.setProperty("--x", snapPx(sx));
      alertBox.style.setProperty("--y", snapPx(sy));
      alertBox.style.setProperty("--tail-y", snapPx(ty));
      return;
    }
    alertBox.classList.toggle("is-no-tail", x < 0 || x > W || y < 0 || y > H);
    alertBox.classList.toggle("is-below", below);
    alertBox.style.setProperty("--x", snapPx(cx));
    alertBox.style.setProperty("--y", snapPx(cy));
    alertBox.style.setProperty("--tail", snapPx(tail));
  }
  function aimAt(spot, z) {
    if (!alertOn() || !upOnGround) {
      return spot;
    }
    var lift = (alertBox.offsetHeight + 16) / 2;
    if (V7MA) {
      var hb = hit.getBoundingClientRect(), rm = v7Room(hb.width, hb.height);
      var want = hb.height / 2 - 30;
      lift = want - hb.height / 2;
    }
    var s = baseSize / z / (view.clientHeight || 1);
    return spot.clone().addScaledVector(upOnGround, lift * s);
  }
  function chooseWaypoint(id, from) {
    chosenWp = id || null;
    alertSide = "";
    alertAim = !!(chosenWp && from === "panel");
    haloWaypoint();
    tellWaypoint();
    if (chosenWp && from === "panel") {
      var found = wpSpots.filter(function(w) {
        return w.id === chosenWp;
      })[0];
      if (found && renderer) {
        var go = function() {
          var z = Math.max(zoom, 2.4);
          setFocusWorld(found.spot);
          glide(yaw, pitch, z, aimAt(found.spot, z));
          placeWp();
          window.setTimeout(function() {
            alertAim = false;
            placeWp();
          }, 380);
        };
        if (found.floor && found.floor !== floorNow) {
          goFloor(found.floor, "button");
          var wait = function() {
            if (floorBusy) {
              window.setTimeout(wait, 60);
            } else {
              go();
            }
          };
          window.setTimeout(wait, 60);
        } else {
          go();
        }
      }
    }
    if (from !== "panel") {
      document.dispatchEvent(new CustomEvent("aprism:waypoint", {
        detail: {
          id: chosenWp,
          from: "map"
        }
      }));
    }
    frame();
  }
  document.addEventListener("aprism:wp-marks", function() {
    if (!scene) {
      return;
    }
    layWaypoints();
    if (wpBox && !wpBox.hidden) {
      tellWaypoint();
    }
    frame();
  });
  document.addEventListener("aprism:mission", function(event) {
    liveWp = event.detail && event.detail.current || null;
    chosenWp = null;
    layWaypoints();
    tellWaypoint();
    frame();
  });
  document.addEventListener("aprism:waypoint", function(event) {
    if (!event.detail || event.detail.from !== "panel") {
      return;
    }
    chooseWaypoint(event.detail.id, "panel");
  });
  if (wpBox) {
    var shutWp = wpBox.querySelector("[data-map-wp-close]");
    if (shutWp) {
      shutWp.addEventListener("click", function() {
        chooseWaypoint(null, "map");
      });
    }
  }
  function activeRobot() {
    var on = document.querySelector(".robot-strip .robot-card[aria-pressed='true'][data-robot]");
    return on ? on.getAttribute("data-robot") : "0";
  }
  var BOT_TINT = {
    "수행중": {
      done: 0x9ea8bb,
      left: 0x4db2ff,
      dot: 0xffffff,
      mark: 0xf7f8fa
    },
    "완료": {
      done: 0x34c759,
      left: 0x1da67f,
      dot: 0x72f494
    },
    "대기": {
      done: 0x8894aa,
      left: 0x5d6675,
      dot: 0xaeb8c8
    },
    "끊김": {
      done: 0x667085,
      left: 0x4e576a,
      dot: 0x8894aa
    }
  };
  var BOT_TINT_LIGHT = {
    "수행중": {
      done: 0x4b5563,
      left: 0x138deb,
      dot: 0x2b2f36,
      mark: 0x2b2f36
    },
    "완료": {
      done: 0x1da67f,
      left: 0x34c759,
      dot: 0x1da67f
    },
    "대기": {
      done: 0x5d6675,
      left: 0x8894aa,
      dot: 0x5d6675
    },
    "끊김": {
      done: 0x4e576a,
      left: 0x667085,
      dot: 0x4e576a
    }
  };
  function botState(id) {
    var badge = document.querySelector(".robot-strip .robot-card[data-robot='" + id + "'] .badge");
    return badge ? badge.textContent.replace(/\s+/g, "") : "";
  }
  function tintRobot(bot, id) {
    var tint = (isLight() ? BOT_TINT_LIGHT : BOT_TINT)[botState(id)];
    if (!tint) {
      return bot;
    }
    bot.done = tint.done;
    bot.left = tint.left;
    bot.dot = tint.dot;
    bot.mark = tint.mark || tint.done;
    if (bot.ended) {
      var run = (isLight() ? BOT_TINT_LIGHT : BOT_TINT)["수행중"];
      bot.done = run.done;
      bot.left = run.done;
      bot.dot = run.dot;
      bot.mark = run.mark;
    }
    return bot;
  }
  document.addEventListener("click", function(event) {
    var picked = event.target.closest && event.target.closest(".robot-strip .robot-card[data-robot]");
    if (!picked || picked.hasAttribute("data-robot-offline")) {
      return;
    }
    showLane(picked.getAttribute("data-robot"));
    if (onLane && renderer) {
      setFocusWorld(onLane.here);
      glide(yaw, pitch, Math.max(zoom, 2.2), onLane.here);
    }
  });
  if (botBox) {
    var open = botBox.querySelector("[data-map-bot-open]");
    var shutBot = botBox.querySelector("[data-map-bot-close]");
    if (open) {
      open.addEventListener("click", function() {
        tellBot(botTip.hidden);
      });
    }
    if (shutBot) {
      shutBot.addEventListener("click", function() {
        tellBot(false);
      });
    }
  }
  function drawRoute(corners, bot, id, plan) {
    if (!corners || corners.length < 2) {
      return;
    }
    var was = lanes[String(id)];
    var parts = [];
    var soft = plan ? {
      line: corners.map(function(q) {
        return q.clone();
      })
    } : roundOff(corners);
    var turns = soft.line;
    var mile = [ 0 ], total = 0, i;
    for (i = 1; i < turns.length; i += 1) {
      total += turns[i].distanceTo(turns[i - 1]);
      mile.push(total);
    }
    var back = !plan && bot.at > 0.5;
    var trip = plan ? bot.at : back ? (1 - bot.at) * 2 : bot.at * 2;
    var mark = total * Math.max(0, Math.min(1, trip));
    var at = 1;
    while (at < mile.length - 1 && mile[at] < mark) {
      at += 1;
    }
    var leg = Math.max(1e-6, mile[at] - mile[at - 1]);
    var here = turns[at - 1].clone().lerp(turns[at], (mark - mile[at - 1]) / leg);
    parts.push(strand(turns.slice(0, at).concat([ here ]), bot.done, false));
    parts.push(strand([ here ].concat(turns.slice(at)), bot.left, true));
    parts[0].userData.tone = "done";
    parts[1].userData.tone = "left";
    if (bot.ended) {
      parts[0].material.opacity *= 0.4;
      parts[0].children.forEach(function(ch) {
        if (ch.material) {
          ch.material.opacity *= 0.4;
        }
      });
    }
    if (!bot.ended) {
      parts[0].material.color.setHex(bot.left);
      parts[0].userData.tone = "left";
      parts[0].material.opacity = RR.doneAlpha;
      parts[0].material.linewidth = 3 * RR.k;
      parts[1].material.linewidth = 2 * RR.k;
      parts[1].children.forEach(function(ch) {
        if (ch.material) {
          ch.material.linewidth = 2 * RR.k;
        }
      });
      parts[0].children.forEach(function(ch) {
        if (ch.material) {
          ch.material.color.setHex(bot.left);
          ch.material.opacity = RR.doneAlpha * 0.3;
          ch.material.linewidth = 3 * RR.k;
        }
      });
      parts[1].material.color.setHex(bot.left);
      parts[1].material.opacity = 0.8;
      parts[1].children.forEach(function(ch) {
        if (ch.material) {
          ch.material.color.setHex(bot.left);
          ch.material.opacity = 0.24;
        }
      });
      parts[1].userData.tone = "left";
    }
    parts.forEach(function(part) {
      part.visible = false;
      scene.add(part);
    });
    var step = back ? at - 1 : at;
    var ahead = turns[Math.max(0, Math.min(step, turns.length - 1))];
    while (ahead.distanceTo(here) < span * 0.002 && step > 0 && step < turns.length - 1) {
      step += back ? -1 : 1;
      ahead = turns[Math.max(0, Math.min(step, turns.length - 1))];
    }
    var fan = viewFan(bot, here, ahead.x - here.x, ahead.z - here.z);
    fan.visible = false;
    scene.add(fan);
    if (!bot.ended) {
      parts.push(fan);
    }
    lanes[String(id)] = {
      id: String(id),
      bot: bot,
      parts: parts,
      turns: turns,
      mile: mile,
      total: total,
      here: here.clone(),
      ahead: ahead.clone(),
      plan: plan || null,
      wps: plan ? plan.wpWorld : null,
      dock: turns[0].clone(),
      book: was && was.book || (plan && plan.names ? plan : null),
      fan: fan
    };
    if (bot.walk && plan && plan.wpWorld) {
      walkSetup(lanes[String(id)], bot.walk);
    }
    if (!lanes[String(id)].rr) {
      if (bot.ended) {
        var lnE = lanes[String(id)];
        parts[0].geometry.setPositions(rrFlat(turns));
        parts[0].computeLineDistances();
        rrSplit(lnE, total);
      } else if (!back) {
        rrSplit(lanes[String(id)], mark);
      }
    }
  }
  var RR = {
    doneAlpha: 0.38,
    wpExcept: true,
    k: 2.85,
    lanes: "stack",
    occl: false,
    prune: false,
    ahead: "A",
    pins: "P0",
    pastNo: "on",
    flow: "floor",
    thin: "on",
    floorMarks: true
  };
  var RR_N = 14, rrReduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var rrOn = false, rrLast = 0, rrPh = 0, rrPrev = 0;
  function rrFlat(pts) {
    var f = [];
    pts.forEach(function(q) {
      f.push(q.x, q.y, q.z);
    });
    return f;
  }
  function rrMask(ln) {
    if (ln.rtMask && ln.rtMask.total === ln.total) {
      return ln.rtMask;
    }
    var st = span * 0.004, n = Math.ceil(ln.total / st) + 1, raw = [], w = [];
    for (var i = 0; i < n; i += 1) {
      raw.push(rrRetraced(ln, Math.min(ln.total, i * st)) ? 1 : 0);
    }
    for (var j = 0; j < n; j += 1) {
      var sum = 0, c = 0;
      for (var k = j - 5; k <= j + 5; k += 1) {
        if (k >= 0 && k < n) {
          sum += raw[k];
          c += 1;
        }
      }
      w.push(sum / c);
    }
    ln.rtMask = {
      total: ln.total,
      st: st,
      w: w
    };
    return ln.rtMask;
  }
  function rrAt(ln, m) {
    if (RR.lanes !== "side") {
      return alongRoute(ln.turns, ln.mile, m);
    }
    var p = alongRoute(ln.turns, ln.mile, m), mk = rrMask(ln), w = mk.w[Math.max(0, Math.min(mk.w.length - 1, Math.round(m / mk.st)))];
    if (!w) {
      return p;
    }
    var e = span * 0.002, q = alongRoute(ln.turns, ln.mile, Math.min(ln.total, m + e)), r = alongRoute(ln.turns, ln.mile, Math.max(0, m - e));
    var dx = q.x - r.x, dz = q.z - r.z, L = Math.hypot(dx, dz) || 1, off = span * 0.011 * w;
    p.x += -dz / L * off;
    p.z += dx / L * off;
    return p;
  }
  function rrBetween(ln, a, b) {
    var hi = Math.max(a, b), st = span * 0.004, pts = [ rrAt(ln, a) ];
    for (var m = a + st; m < hi; m += st) {
      pts.push(rrAt(ln, m));
    }
    pts.push(rrAt(ln, hi));
    return pts;
  }
  function rrNext(ln, s) {
    if (!ln.wps || !ln.wps.length) {
      return ln.total;
    }
    var best = null;
    (wpSpots.length ? wpMiles(ln) : ln.wps.map(function(p) {
      return nearMile(ln, p);
    })).forEach(function(m) {
      if (m > s + span * 0.004 && (best === null || m < best)) {
        best = m;
      }
    });
    return best === null ? ln.total : best;
  }
  function rrLastWp(ln) {
    if (!ln.wps || !ln.wps.length) {
      return ln.total;
    }
    var last = 0;
    (wpSpots.length ? wpMiles(ln) : ln.wps.map(function(p) {
      return nearMile(ln, p);
    })).forEach(function(m) {
      last = Math.max(last, m);
    });
    return last;
  }
  function rrSplit(ln, s) {
    if (!ln || !ln.parts || !scene) {
      return;
    }
    var n = rrNext(ln, s), on = !!(ln.parts[0] && ln.parts[0].visible);
    var last = Math.max(n, rrLastWp(ln));
    ln.rr = {
      s: s,
      n: n
    };
    var left = ln.parts[1];
    if (left && left.geometry) {
      left.geometry.setPositions(rrFlat(rrBetween(ln, n, last)));
      left.computeLineDistances();
    }
    if (!ln.home) {
      ln.home = strand(rrBetween(ln, last, ln.total), MAP3D_HOME, true);
      ln.home.material.opacity = 0.6;
      ln.home.material.linewidth = 2 * RR.k;
      ln.home.children.forEach(function(ch) {
        if (ch.material) {
          ch.material.linewidth = 2 * RR.k;
        }
      });
      ln.home.visible = on;
      scene.add(ln.home);
      ln.parts.push(ln.home);
    } else {
      ln.home.geometry.setPositions(rrFlat(rrBetween(ln, last, ln.total)));
      ln.home.computeLineDistances();
    }
    if (!ln.cur) {
      ln.cur = strand(rrBetween(ln, s, n), ln.bot.left, false);
      ln.cur.material.linewidth = 4 * RR.k;
      ln.cur.children.forEach(function(ch) {
        if (ch.material) {
          ch.material.linewidth = 4 * RR.k;
        }
      });
      ln.cur.material.opacity = 1;
      ln.cur.userData.tone = "left";
      ln.cur.visible = on;
      scene.add(ln.cur);
      ln.parts.push(ln.cur);
    } else {
      ln.cur.geometry.setPositions(rrFlat(rrBetween(ln, s, n)));
      ln.cur.computeLineDistances();
    }
    if (!ln.comet && !rrReduce) {
      var g = new Fat.LineGeometry, pos = [], col = [];
      for (var k = 0; k < RR_N; k += 1) {
        pos.push(0, 0, 0);
        col.push(1, 1, 1);
      }
      g.setPositions(pos);
      g.setColors(col);
      var m = new Fat.LineMaterial({
        color: 0xffffff,
        linewidth: 4 * RR.k,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false
      });
      rrLift(m);
      m.resolution.set(view.clientWidth || 1, view.clientHeight || 1);
      fatMats.push(m);
      ln.comet = new Fat.Line2(g, m);
      ln.comet.renderOrder = 3;
      ln.comet.visible = on;
      scene.add(ln.comet);
      ln.parts.push(ln.comet);
      rrStart();
    }
  }
  function rrRibbon(ln, pos, col) {
    var on = RR.flow === "floor" && ln.comet && ln.comet.visible;
    if (ln.comet) {
      ln.comet.material.visible = !on;
    }
    if (!on || !pos.length) {
      if (ln.ribbon) {
        ln.ribbon.visible = false;
      }
      return;
    }
    var n = pos.length / 3;
    if (ln.ribbon && ln.ribbon.geometry.attributes.position.count !== n * 2) {
      scene.remove(ln.ribbon);
      ln.ribbon.geometry.dispose();
      ln.ribbon = null;
    }
    if (!ln.ribbon) {
      var g = new THREE.BufferGeometry;
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3));
      g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 8), 4));
      var idx = [];
      for (var i = 0; i < n - 1; i += 1) {
        var a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      g.setIndex(idx);
      ln.ribbon = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      ln.ribbon.renderOrder = 3;
      ln.ribbon.frustumCulled = false;
      scene.add(ln.ribbon);
      ln.parts.push(ln.ribbon);
    }
    var P = ln.ribbon.geometry.attributes.position.array, Cc = ln.ribbon.geometry.attributes.color.array;
    var hw = 2 * RR.k * RIB_K * perPixel();
    var cam = camera.position, up = span * 0.001, pull = span * 0.0025;
    for (var k = 0; k < n; k += 1) {
      var k0 = Math.max(0, k - 1), k1 = Math.min(n - 1, k + 1);
      var dx = pos[k1 * 3] - pos[k0 * 3], dz = pos[k1 * 3 + 2] - pos[k0 * 3 + 2], L = Math.hypot(dx, dz) || 1, nx = -dz / L * hw, nz = dx / L * hw;
      var x = pos[k * 3], y = pos[k * 3 + 1] - up, z = pos[k * 3 + 2];
      P[k * 6] = x + nx;
      P[k * 6 + 1] = y;
      P[k * 6 + 2] = z + nz;
      P[k * 6 + 3] = x - nx;
      P[k * 6 + 4] = y;
      P[k * 6 + 5] = z - nz;
      for (var e = 0; e < 2; e += 1) {
        var o3 = k * 6 + e * 3, vx = cam.x - P[o3], vy = cam.y - P[o3 + 1], vz = cam.z - P[o3 + 2], vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
        P[o3] += vx / vl * pull;
        P[o3 + 1] += vy / vl * pull;
        P[o3 + 2] += vz / vl * pull;
      }
      var f = k / (n - 1), al = 0.15 + 0.85 * f;
      for (var q = 0; q < 2; q += 1) {
        var o = k * 8 + q * 4;
        Cc[o] = col[k * 3];
        Cc[o + 1] = col[k * 3 + 1];
        Cc[o + 2] = col[k * 3 + 2];
        Cc[o + 3] = al;
      }
    }
    ln.ribbon.geometry.attributes.position.needsUpdate = true;
    ln.ribbon.geometry.attributes.color.needsUpdate = true;
    ln.ribbon.geometry.computeBoundingSphere();
    ln.ribbon.visible = true;
  }
  function rrStart() {
    if (rrOn || rrReduce) {
      return;
    }
    rrOn = true;
    window.requestAnimationFrame(rrTick);
  }
  function rrTick(t) {
    window.requestAnimationFrame(rrTick);
    if (t - rrLast < 33) {
      return;
    }
    rrLast = t;
    var ln = onLane;
    if (ln && ln.ribbon && ln.ribbon.visible && (!ln.comet || !ln.comet.visible || RR.flow !== "floor")) {
      ln.ribbon.visible = false;
      frame();
    }
    if (ln && ln.fan && ln.fanBase !== undefined && ln.fan.visible && RRS.mode === "inspect" && renderer && !document.hidden) {
      ln.fan.rotation.y = ln.fanBase + Math.sin(t / 650) * (rrReduce ? 0 : 0.42);
      frameTick(t);
    }
    if (ln && ln.rr && RRS.mode === "return" && RRS.lane === ln.id && ln.parts[0] && ln.parts[0].visible && renderer && !document.hidden) {
      rrReturnTick(ln, t);
      frameTick(t);
      return;
    }
    if (ln && ln.rr && ln.comet && RRS.mode === "done" && RRS.lane === ln.id && renderer && !document.hidden) {
      var on0 = !!(ln.parts[0] && ln.parts[0].visible), e0 = (t - RRS.at) / 3200, Cs = span * 0.07, Ds = ln.total;
      ln.comet.visible = on0 && e0 < 1;
      if (ln.comet.visible) {
        var hs = e0 * (Ds + Cs), ps = [], cs = [], bs = new THREE.Color(ln.bot.left), ws2 = new THREE.Color(0xffffff), cc = new THREE.Color;
        for (var j = 0; j < RR_N; j += 1) {
          var fj = j / (RR_N - 1), mj = Math.max(0, Math.min(Ds, hs - Cs + Cs * fj)), pj = rrAt(ln, mj);
          ps.push(pj.x, pj.y + span * 0.001, pj.z);
          cc.copy(bs).lerp(ws2, fj * fj);
          cs.push(cc.r, cc.g, cc.b);
        }
        ln.comet.geometry.setPositions(ps);
        ln.comet.geometry.setColors(cs);
        rrRibbon(ln, ps, cs);
      }
      if (!ln.comet.visible) {
        rrRibbon(ln, [], []);
      }
      if (e0 < 1.2) {
        frameTick(t);
      }
      return;
    }
    if (!ln || !ln.comet || !ln.rr || !ln.comet.visible || !renderer || document.hidden) {
      return;
    }
    var back = RRS.mode === "return", a0 = ln.rr.s, b0 = back ? 0 : ln.rr.n, dir = b0 >= a0 ? 1 : -1;
    var C = span * 0.07, V = span * 0.11, D = Math.max(0.0001, Math.abs(b0 - a0));
    var cyc = (D + C) / V + 0.4;
    rrPh += rrPrev ? Math.min(0.1, (t - rrPrev) / 1000) : 0;
    rrPrev = t;
    if (rrPh > cyc) {
      rrPh = 0;
    }
    var head = Math.min(rrPh * V, D + C);
    var pos = [], col = [], base = new THREE.Color(back ? rrNeutral() : ln.bot.left), white = new THREE.Color(0xffffff), c = new THREE.Color;
    for (var k = 0; k < RR_N; k += 1) {
      var f = k / (RR_N - 1), mm = a0 + dir * Math.max(0, Math.min(D, head - C + C * f));
      var p = rrAt(ln, mm);
      pos.push(p.x, p.y + span * 0.001, p.z);
      c.copy(base).lerp(white, f * f);
      col.push(c.r, c.g, c.b);
    }
    ln.comet.geometry.setPositions(pos);
    ln.comet.geometry.setColors(col);
    rrRibbon(ln, pos, col);
    frameTick(t);
  }
  var RRS = {
    mode: "run",
    s: null,
    lane: null,
    at: 0
  };
  var rrMoved = [];
  function rrNeutral() {
    return isLight() ? 0x2b3445 : 0xe4e8ef;
  }
  var RR_GRAY = 0x9ea8bb, RR_NEUTRAL = 0xe4e8ef;
  function rrUnder() {
    return isLight() ? 0xd3d9e1 : 0x181d28;
  }
  function rrAheadA() {
    return isLight() ? 0.7 : RR.doneAlpha;
  }
  function rrMix(color, op, under) {
    return new THREE.Color(color).lerp(new THREE.Color(under == null ? rrUnder() : under), 1 - op).getHex();
  }
  function rrStyle(part, color, op, lw, under) {
    if (!part || !part.material) {
      return;
    }
    part.material.color.setHex(op < 1 ? rrMix(color, op, under) : color);
    part.material.opacity = 1;
    if (lw) {
      lw *= RR.k;
      part.material.linewidth = lw;
    }
    part.children.forEach(function(ch) {
      if (!ch.userData.rrKeep && ch.material && ch.material.color) {
        ch.material.color.setHex(color);
        ch.material.opacity = op * 0.3;
        if (lw) {
          ch.material.linewidth = lw;
        }
      }
    });
  }
  function rrForm(part, dotted) {
    if (!part || !part.material) {
      return;
    }
    var mat = part.material;
    if (dotted && dotMats.indexOf(mat) < 0) {
      dotMats.push(mat);
      rrRoundDots(mat);
      mat.needsUpdate = true;
      syncDots();
    }
    if (mat.dashed !== dotted) {
      mat.dashed = dotted;
      mat.needsUpdate = true;
      part.computeLineDistances();
    }
    part.renderOrder = dotted ? 2.5 : 2;
  }
  function rrAhead(ln, m) {
    var left = ln.parts[1];
    if (!left || !left.material || !Fat) {
      return;
    }
    var c4 = RR.ahead === "C4", light = isLight(), run = m !== "pause" && m !== "estop" && m !== "lost" && m !== "return" && m !== "done";
    if (left.material.dashed === c4) {
      left.material.dashed = !c4;
      left.material.needsUpdate = true;
    }
    var grooveHex = light ? rrMix(0x8a93a1, 0.9) : rrMix(0x05080d, 0.9);
    if (c4 && run) {
      rrStyle(left, RR_GRAY, 0.6, null, grooveHex);
    }
    if (c4 && !ln.groove) {
      var gm = new Fat.LineMaterial({
        color: 0x05080d,
        linewidth: 2 * RR.k + 2.5,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
      rrLift(gm);
      gm.resolution.copy(left.material.resolution);
      fatMats.push(gm);
      ln.groove = new Fat.Line2(left.geometry, gm);
      ln.groove.renderOrder = 1;
      ln.groove.userData.rrKeep = true;
      left.add(ln.groove);
      var cm = new Fat.LineMaterial({
        color: 0x141b27,
        linewidth: 2 * RR.k,
        transparent: true,
        opacity: 1,
        dashed: true,
        dashSize: 1,
        gapSize: 0,
        depthWrite: false
      });
      cm.resolution.copy(left.material.resolution);
      fatMats.push(cm);
      rrChev(cm);
      chevMats.push(cm);
      ln.chev = new Fat.Line2(left.geometry, cm);
      ln.chev.renderOrder = 3;
      ln.chev.userData.rrKeep = true;
      left.add(ln.chev);
      syncDots();
    }
    if (ln.groove) {
      ln.groove.visible = c4;
      if (ln.chev) {
        ln.chev.visible = false;
      }
      ln.groove.material.color.setHex(grooveHex);
      ln.groove.material.opacity = 1;
      if (ln.chev) {
        ln.chev.material.color.setHex(light ? 0xffffff : 0x0a0f18);
      }
    }
  }
  var ribs = [];
  var RIB_K = 1.35;
  function ribPoints(part) {
    var g = part.geometry, st = g && g.attributes && g.attributes.instanceStart;
    if (!st || !g.instanceCount && !st.count) {
      return [];
    }
    var n = st.count, pts = [], a = st.data.array, stride = st.data.stride, i;
    for (i = 0; i < n; i++) {
      pts.push(new THREE.Vector3(a[i * stride], a[i * stride + 1], a[i * stride + 2]));
    }
    if (n) {
      pts.push(new THREE.Vector3(a[(n - 1) * stride + 3], a[(n - 1) * stride + 4], a[(n - 1) * stride + 5]));
    }
    return pts.filter(function(p, k) {
      return k === 0 || p.distanceToSquared(pts[k - 1]) > 1e-10;
    });
  }
  function ribGeo(pts, half, lift) {
    var n = pts.length, pos = new Float32Array(n * 6), idx = [], nrm = [], k;
    for (k = 0; k < n - 1; k++) {
      var dx = pts[k + 1].x - pts[k].x, dz = pts[k + 1].z - pts[k].z, l = Math.sqrt(dx * dx + dz * dz);
      nrm.push(l > 1e-9 ? [ -dz / l, dx / l ] : null);
    }
    for (k = 0; k < n - 1; k++) {
      if (!nrm[k]) {
        nrm[k] = nrm[k - 1] || null;
      }
    }
    for (k = n - 2; k >= 0; k--) {
      if (!nrm[k]) {
        nrm[k] = nrm[k + 1] || [ 1, 0 ];
      }
    }
    for (k = 0; k < n; k++) {
      var a = nrm[Math.max(0, k - 1)], b = nrm[Math.min(n - 2, k)];
      var mx = a[0] + b[0], mz = a[1] + b[1], ml = Math.sqrt(mx * mx + mz * mz), s = half;
      if (ml > 1e-6) {
        mx /= ml;
        mz /= ml;
        var d = mx * a[0] + mz * a[1];
        s = half / Math.max(0.5, d);
      } else {
        mx = a[0];
        mz = a[1];
      }
      var p = pts[k];
      pos.set([ p.x + mx * s, p.y, p.z + mz * s, p.x - mx * s, p.y, p.z - mz * s ], k * 6);
      if (k < n - 1) {
        var i0 = k * 2;
        idx.push(i0, i0 + 1, i0 + 2, i0 + 1, i0 + 3, i0 + 2);
      }
    }
    var c = camera.position;
    for (k = 0; k < n * 2; k++) {
      var vx = c.x - pos[k * 3], vy = c.y - pos[k * 3 + 1], vz = c.z - pos[k * 3 + 2], vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      pos[k * 3] += vx / vl * lift;
      pos[k * 3 + 1] += vy / vl * lift;
      pos[k * 3 + 2] += vz / vl * lift;
    }
    var g = new THREE.BufferGeometry;
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }
  function ribMesh(order) {
    var m = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    }));
    m.renderOrder = order;
    m.frustumCulled = false;
    m.raycast = function() {};
    scene.add(m);
    return m;
  }
  function ribAdd(part, kind) {
    if (!part || !part.material || !scene) {
      return null;
    }
    for (var i = 0; i < ribs.length; i++) {
      if (ribs[i].part === part) {
        return ribs[i];
      }
    }
    var r = {
      part: part,
      kind: kind,
      main: ribMesh(kind === "band" ? 1.8 : 2),
      edge: ribMesh(1.9),
      key: ""
    };
    if (kind === "solid") {
      part.material.visible = false;
    }
    ribs.push(r);
    return r;
  }
  function ribDrop(r) {
    [ r.main, r.edge ].forEach(function(m) {
      if (m) {
        scene.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      }
    });
  }
  function rrRibbons() {
    if (!ribs.length) {
      return;
    }
    var pp = perPixel();
    ribs = ribs.filter(function(r) {
      var p = r.part, alive = !!p.parent;
      if (!alive) {
        ribDrop(r);
        return false;
      }
      var kind = p.material.dashed ? "band" : "solid";
      if (r.kind !== kind) {
        r.kind = kind;
        r.main.renderOrder = kind === "band" ? 1.8 : 2;
        p.material.visible = kind === "band";
      }
      var on = p.visible && p.parent.visible !== false && (r.kind !== "band" || p.material.dashed && p.userData.ribBand !== false);
      r.main.visible = on;
      if (r.edge) {
        r.edge.visible = on && r.kind === "solid" && p.userData.ribEdge !== false;
      }
      if (!on) {
        return true;
      }
      var st = p.geometry.attributes.instanceStart, lw = p.material.linewidth || 2;
      var key = (st ? st.data.array.length + ":" + st.data.array[0] + ":" + st.data.array[st.data.array.length - 1] + ":" + st.data.version : "") + "|" + pp.toPrecision(5) + "|" + lw + "|" + camera.position.x.toFixed(2) + "," + camera.position.y.toFixed(2) + "," + camera.position.z.toFixed(2);
      if (key !== r.key) {
        r.key = key;
        var pts = ribPoints(p), lift = span * 0.0025;
        if (pts.length >= 2) {
          r.main.geometry.dispose();
          r.main.geometry = ribGeo(pts, lw / 2 * RIB_K * pp, lift);
          if (r.edge) {
            r.edge.geometry.dispose();
            r.edge.geometry = ribGeo(pts, (lw / 2 * RIB_K + 1.2) * pp, lift);
          }
        } else {
          r.main.visible = false;
          if (r.edge) {
            r.edge.visible = false;
          }
        }
      }
      if (r.kind === "band") {
        r.main.material.color.setHex(p.userData.ribBandHex || 0x444444);
      } else {
        r.main.material.color.copy(p.material.color);
        r.main.material.opacity = p.material.opacity;
        if (r.edge) {
          r.edge.material.color.setHex(p.userData.ribEdgeHex || 0xffffff);
        }
      }
      return true;
    });
  }
  function rrPolish(ln, m) {
    var gray = m === "done" || m === "return", under = rrUnder();
    [ ln.parts[0], ln.cur, ln.parts[1], ln.home ].forEach(function(p) {
      if (!ribAdd(p, p && p.material && p.material.dashed ? "band" : "solid")) {
        return;
      }
      p.userData.ribEdge = !gray;
      p.userData.ribEdgeHex = rrMix(0xffffff, p === ln.cur ? 0.9 : 0.55, under);
    });
    [ ln.parts[1], ln.home, ln.parts[0] ].forEach(function(p) {
      if (!p || !p.material) {
        return;
      }
      p.userData.ribBandHex = isLight() ? 0xe6e9ee : 0x343e53;
    });
  }
  function rrM(ln) {
    return ln && ln.bot && ln.bot.ended ? "done" : RRS.mode;
  }
  function rrApply(ln) {
    if (!ln || !ln.rr) {
      return;
    }
    var on = !!(ln.parts[0] && ln.parts[0].visible), m = rrM(ln), blue = ln.bot.left;
    function show(part, v) {
      if (part) {
        part.visible = on && v;
      }
    }
    if (m === "done") {
      rrStyle(ln.parts[0], RR_GRAY, 0.6, 2);
      show(ln.parts[1], false);
      show(ln.cur, false);
      show(ln.home, false);
      show(ln.comet, false);
      show(ln.fan, false);
    } else if (m === "return") {
      rrStyle(ln.parts[0], rrNeutral(), 0.75, 3.4);
      show(ln.parts[1], true);
      show(ln.cur, false);
      show(ln.home, false);
      show(ln.comet, false);
      show(ln.fan, true);
    } else if (m === "pause" || m === "estop" || m === "lost") {
      rrStyle(ln.parts[0], blue, 0.8, 2);
      rrStyle(ln.cur, RR_GRAY, m === "lost" ? 0.35 : 0.55, 4);
      rrStyle(ln.parts[1], RR_GRAY, 0.45, 4);
      show(ln.parts[1], true);
      show(ln.cur, true);
      show(ln.home, true);
      show(ln.comet, false);
      show(ln.fan, m === "pause");
    } else {
      rrStyle(ln.parts[0], blue, 0.8, 2);
      rrStyle(ln.cur, blue, 1, 4);
      rrStyle(ln.parts[1], blue, rrAheadA(), 4);
      show(ln.parts[1], true);
      show(ln.cur, true);
      show(ln.home, true);
      show(ln.comet, m !== "inspect");
      show(ln.fan, true);
    }
    rrAhead(ln, m);
    rrForm(ln.parts[0], m !== "return");
    rrForm(ln.parts[1], false);
    if (ln.home && ln.parts[1] && ln.parts[1].material) {
      var hm = ln.home.material, am = ln.parts[1].material;
      hm.color.copy(am.color);
      hm.opacity = am.opacity;
      hm.linewidth = am.linewidth;
      if (hm.dashed !== am.dashed) {
        hm.dashed = am.dashed;
        hm.needsUpdate = true;
      }
    }
    rrPolish(ln, m);
    if (ln.fan && !ln.fanEdge && Fat && ln.fan.geometry && ln.fan.geometry.attributes.position) {
      var fp = ln.fan.geometry.attributes.position.array, fe = [];
      for (var fi = 0; fi < fp.length; fi += 3) {
        fe.push(fp[fi], fp[fi + 1], fp[fi + 2]);
      }
      fe.push(0, 0, 0);
      var fg = new Fat.LineGeometry;
      fg.setPositions(fe);
      var fm = new Fat.LineMaterial({
        color: blue,
        linewidth: 1.2 * RR.k,
        transparent: true,
        opacity: 0.7,
        dashed: true,
        depthWrite: false,
        depthTest: true
      });
      fm.depthFunc = THREE.GreaterDepth;
      fm.polygonOffset = true;
      fm.polygonOffsetFactor = -8;
      fm.polygonOffsetUnits = -8;
      fm.resolution.set(view.clientWidth || 1, view.clientHeight || 1);
      fatMats.push(fm);
      rrGhostMats.push({
        g: fm,
        p: {
          color: fm.color.clone(),
          opacity: 0.7
        },
        fan: ln.fan
      });
      ln.fanEdge = new Fat.Line2(fg, fm);
      ln.fanEdge.computeLineDistances();
      ln.fanEdge.renderOrder = 1;
      ln.fan.add(ln.fanEdge);
    }
    var fanHex = robotKind(ln.id) === "spot" ? m === "alert" ? 0xff383c : m === "pause" ? HALO_PAUSE : m === "return" ? HALO_TINT["return"] : HALO_GX : m === "pause" ? RR_GRAY : m === "return" ? rrNeutral() : blue;
    if (ln.fanEdge) {
      var fo = rrGhostMats.filter(function(o) {
        return o.fan === ln.fan;
      })[0];
      if (fo) {
        fo.p.color.setHex(fanHex);
      }
    }
    if (ln.fan && ln.fan.material) {
      ln.fan.material.color.setHex(fanHex);
      ln.fan.material.opacity = robotKind(ln.id) === "spot" ? m === "pause" ? 0.45 : 0.55 : 0.9;
    }
    if (botBox) {
      var was = botBox.getAttribute("data-rr");
      botBox.setAttribute("data-rr", m);
      if (was !== m && (was === "done" || m === "done")) {
        setTimeout(function() {
          document.dispatchEvent(new CustomEvent("aprism:rr-mode", {
            detail: {
              mode: m
            }
          }));
        }, 0);
      }
    }
    var cl = rrChevLayer();
    if (cl) {
      cl.style.display = m === "return" && on ? "" : "none";
      if (m !== "return") {
        cl.textContent = "";
      }
    }
  }
  var rrChev = null;
  function rrChevLayer() {
    if (rrChev || !hit) {
      return rrChev;
    }
    rrChev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    rrChev.setAttribute("class", "rr-chev");
    rrChev.setAttribute("aria-hidden", "true");
    rrChev.style.display = "none";
    hit.appendChild(rrChev);
    return rrChev;
  }
  function rrReturnTick(ln, t) {
    var A = ln.rr.s, k = rrReduce ? 1 : Math.min(1, (t - RRS.at) / 1800), drawn = A * (1 - Math.pow(1 - k, 3));
    var road = ln.parts[0];
    if (road && road.geometry) {
      road.geometry.setPositions(rrFlat(rrBetween(ln, Math.max(0, A - drawn), Math.max(A, 1e-4))));
      road.computeLineDistances();
    }
    var layer = rrChevLayer();
    if (!layer) {
      return;
    }
    var r = hit.getBoundingClientRect();
    layer.setAttribute("viewBox", "0 0 " + Math.max(1, r.width) + " " + Math.max(1, r.height));
    layer.textContent = "";
    var ppx = perPixel(), z = 1.3, dash = ppx * 8 * z, period = ppx * 14 * z;
    var off = rrReduce ? 0 : t / 1000 * ppx * 31 * z % period;
    var col = isLight() ? "#eef0f3" : "#0a0f18", wdt = (3 * z).toFixed(1);
    for (var d = off; d < drawn - dash * 0.5; d += period) {
      var m0 = A - d, m1 = Math.max(A - drawn, m0 - dash), pts = [];
      for (var q = 0; q <= 3; q += 1) {
        var P = onCanvas(alongRoute(ln.turns, ln.mile, m0 + (m1 - m0) * q / 3));
        pts.push(P.x.toFixed(1) + " " + P.y.toFixed(1));
      }
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M" + pts.join(" L"));
      path.setAttribute("stroke", col);
      path.setAttribute("stroke-width", wdt);
      path.setAttribute("stroke-linecap", "butt");
      path.setAttribute("opacity", "0.7");
      layer.appendChild(path);
    }
  }
  function rrPlace(ln, s, dir) {
    s = Math.max(0, Math.min(ln.total, s));
    var e = span * 0.01, here = rrAt(ln, s);
    var a2 = Math.max(0, Math.min(ln.total, s + dir * e)), ahead;
    if (Math.abs(a2 - s) < 1e-6) {
      var b2 = rrAt(ln, Math.max(0, Math.min(ln.total, s - dir * e)));
      ahead = here.clone().multiplyScalar(2).sub(b2);
    } else {
      ahead = rrAt(ln, a2);
    }
    ln.here.copy(here);
    ln.ahead.copy(ahead);
    var done = ln.parts[0];
    if (done && done.geometry && RRS.mode !== "return") {
      done.geometry.setPositions(rrFlat(rrBetween(ln, 0, Math.max(s, 1e-4))));
      done.computeLineDistances();
    }
    rrSplit(ln, s);
    if (ln.fan) {
      ln.fan.position.copy(here);
      ln.fan.position.y += span * 0.002;
      ln.fan.rotation.y = Math.atan2(ahead.x - here.x, ahead.z - here.z);
      ln.fanBase = ln.fan.rotation.y;
    }
    if (typeof tellHeading === "function") {
      tellHeading();
    }
  }
  var rrPlanT = 0, rrPlanQ = null;
  function rrPlanSoon() {
    var now = performance.now();
    if (now - rrPlanT > 150) {
      rrPlanT = now;
      plan();
      return;
    }
    clearTimeout(rrPlanQ);
    rrPlanQ = setTimeout(function() {
      rrPlanT = performance.now();
      plan();
      frame();
    }, 160);
  }
  var rrRunning = null;
  function rrSyncRail(ln, s) {
    var rail = document.querySelector("[data-timeline]");
    if (!rail || !wpSpots.length) {
      return;
    }
    var m = RRS.mode, eps = span * 0.004;
    var miles = wpMiles(ln), list = wpSpots.map(function(w, i) {
      return {
        id: w.id,
        mile: miles[i]
      };
    });
    var nextId = null, best = Infinity, atId = null;
    list.forEach(function(w) {
      if (w.mile > s + eps && w.mile < best) {
        best = w.mile;
        nextId = w.id;
      }
      if (Math.abs(w.mile - s) <= eps * 1.5) {
        atId = w.id;
      }
    });
    var lastDone = null, lastMile = -1, runItem = null, lastSpot = null;
    list.forEach(function(w) {
      var item = rail.querySelector('[data-waypoint="' + w.id + '"]');
      if (!item) {
        return;
      }
      var st;
      if (m === "done") {
        st = "done";
      } else if (m === "inspect" && w.id === atId) {
        st = "running";
      } else if (w.mile <= s + eps) {
        st = "done";
      } else if (w.id === nextId && m !== "return" && m !== "lost" && !(m === "inspect" && atId)) {
        st = "running";
      } else {
        st = "pending";
      }
      item.classList.remove("is-done", "is-running", "is-pending", "is-active");
      var cap = item.querySelector(".rail-capsule");
      if (cap && !cap.querySelector(".rail-mark")) {
        var stub = document.createElement("span");
        stub.className = "rail-stub rr-mark";
        var mk = document.createElement("span");
        mk.className = "rail-mark rr-mark";
        mk.innerHTML = '<span class="rail-dot"></span>';
        cap.insertBefore(mk, cap.firstChild);
        cap.insertBefore(stub, mk);
      }
      item.classList.add("is-" + st);
      if (st === "running") {
        item.classList.add("is-active");
        runItem = item;
      }
      item.setAttribute("data-wp-state", st === "done" ? "completed" : st === "running" ? "current" : m === "return" ? "skipped" : "upcoming");
      if (item.getAttribute("data-rr-alert")) {
        item.removeAttribute("data-wp-alert");
        item.removeAttribute("data-rr-alert");
      }
      var hold = st !== "done" || m === "inspect" && w.id === atId;
      if (hold && item.hasAttribute("data-wp-alert")) {
        item.setAttribute("data-rr-hold", item.getAttribute("data-wp-alert"));
        item.removeAttribute("data-wp-alert");
      } else if (!hold && item.hasAttribute("data-rr-hold")) {
        item.setAttribute("data-wp-alert", item.getAttribute("data-rr-hold"));
        item.removeAttribute("data-rr-hold");
      }
      if (st === "done" && w.mile > lastMile) {
        lastMile = w.mile;
        lastDone = item;
        lastSpot = w.id;
      }
    });
    if (m === "alert" && lastDone && !lastDone.getAttribute("data-wp-alert")) {
      lastDone.setAttribute("data-wp-alert", "danger");
      lastDone.setAttribute("data-rr-alert", "1");
    }
    rrAlertId = m === "alert" ? lastSpot : null;
    if (runItem && runItem !== rrRunning) {
      rrRunning = runItem;
      try {
        rrRailTo(runItem);
      } catch (err) {}
    }
    layWaypoints();
  }
  function rrRailTo(item) {
    var behavior = rrReduce ? "auto" : "smooth";
    if (!document.body.classList.contains("ver-7")) {
      item.scrollIntoView({
        block: "center",
        behavior: behavior
      });
      return;
    }
    var box = item.parentNode;
    while (box && box !== document.body) {
      var oy = getComputedStyle(box).overflowY;
      if ((oy === "auto" || oy === "scroll") && box.scrollHeight > box.clientHeight) {
        break;
      }
      box = box.parentNode;
    }
    if (!box || box === document.body) {
      item.scrollIntoView({
        block: "start",
        behavior: behavior
      });
      return;
    }
    var prev = item.previousElementSibling;
    while (prev && !(prev.matches && prev.matches(".timeline-item:not(.rr-hide)"))) {
      prev = prev.previousElementSibling;
    }
    var top = (prev || item).getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - (parseFloat(getComputedStyle(box).paddingTop) || 0);
    box.scrollTo({
      top: Math.max(0, top),
      behavior: behavior
    });
  }
  var wpTog = null, wpHead = null, wpNum = null, wpMini = null, wpView = "list";
  var WP_MIS = {
    0: "정기 순회 점검",
    3: "야간 순회 점검",
    4: "발전기실 설비 점검",
    6: "공조 설비 순회",
    8: "유틸리티 순회",
    10: "전기실 열화상 점검"
  };
  function wpMiniDraw() {
    if (!wpMini || wpView !== "map" || !window.APRISM_MINI) {
      return;
    }
    var rail = document.querySelector(".right-panel [data-timeline]");
    var items = rail ? Array.prototype.slice.call(rail.querySelectorAll(".timeline-item[data-waypoint]")) : [];
    var flBtn = document.querySelector(".map-floor[aria-pressed='true']"), fl = flBtn ? flBtn.getAttribute("data-map-floor") : "B4";
    var mis = WP_MIS[activeRobot()] || "", R = window.APRISM_MINI_ROUTES && window.APRISM_MINI_ROUTES[mis];
    if (R && !R[fl]) {
      fl = Object.keys(R)[0];
    }
    var part = R && R[fl] ? items.slice(R[fl].n0 - 1, R[fl].n0 - 1 + R[fl].sAt.length) : items;
    var marks = {}, done = 0;
    part.forEach(function(it, j) {
      var al = it.getAttribute("data-wp-alert");
      if (al) {
        marks[j] = /danger|crit/.test(al) ? "crit" : "warn";
      }
      if (it.classList.contains("is-done")) {
        done = j + 1;
      }
    });
    var run = part.filter(function(it) {
      return it.classList.contains("is-running");
    }).length > 0;
    var cur = -1, names = [], nos = [];
    part.forEach(function(it, j) {
      if (it.classList.contains("is-running")) {
        cur = j;
      }
      var t = it.querySelector(".step-title");
      names.push(t ? t.textContent.trim() : "");
      nos.push((R && R[fl] ? R[fl].n0 : 1) + j);
    });
    var draw = window.APRISM_MINI.svgHQ || window.APRISM_MINI.svg;
    wpMini.innerHTML = draw({
      mission: mis,
      floor: fl,
      n: part.length,
      done: done,
      robot: run,
      marks: marks,
      dots: true,
      cur: cur,
      names: names,
      nos: nos,
      h: Math.max(240, wpMini.clientHeight - 16),
      kind: activeRobot() === "4" ? "wheel" : "spot",
      w: Math.max(200, wpMini.clientWidth - 16),
      label: (mis ? mis + " " : "") + fl + " 웨이포인트 지도"
    });
  }
  function wpViewSet(v) {
    wpView = v;
    document.body.classList.toggle("rr-wp-map", v === "map");
    if (wpHead) {
      Array.prototype.forEach.call(wpHead.querySelectorAll("[data-wpv]"), function(b) {
        b.setAttribute("aria-selected", String(b.getAttribute("data-wpv") === v));
      });
    }
    if (wpMini) {
      wpMini.hidden = v !== "map";
    }
    wpMiniDraw();
  }
  function wpPlace() {
    var rail = document.querySelector(".right-panel [data-timeline]");
    if (!rail || !wpTog) {
      return;
    }
    var host = rail.parentNode, meta = host.querySelector(".mission-header .progress-meta") || document.querySelector(".right-panel .mission-header .progress-meta");
    Array.prototype.forEach.call(host.children, function(n) {
      if (n.classList.contains("rr-banner") && meta) {
        meta.insertBefore(n, meta.firstChild);
      }
    });
    var node = wpHead || wpTog;
    if (node.nextElementSibling !== rail) {
      host.insertBefore(node, rail);
    }
    if (wpMini && wpMini.previousElementSibling !== rail) {
      rail.after(wpMini);
    }
  }
  function wpToggleSync() {
    var rail = document.querySelector(".right-panel [data-timeline]");
    if (!rail) {
      return;
    }
    if (!wpTog) {
      wpTog = document.createElement("button");
      wpTog.type = "button";
      wpTog.className = "rr-wp-toggle ds-bleed";
      wpTog.addEventListener("click", function() {
        wpTog.setAttribute("aria-expanded", String(!document.body.classList.toggle("rr-wp-closed")));
      });
      if (document.body.classList.contains("ver-7")) {
        wpHead = document.createElement("div");
        wpHead.className = "rr-wp-head";
        wpHead.appendChild(wpTog);
        var seg = document.createElement("div");
        seg.className = document.body.classList.contains("ver-7") ? "rr-wp-seg ds-seg" : "rr-wp-seg";
        seg.setAttribute("role", "tablist");
        [ [ "map", "지도" ], [ "list", "목록" ] ].forEach(function(o) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("role", "tab");
          b.setAttribute("data-wpv", o[0]);
          b.textContent = o[1];
          if (document.body.classList.contains("ver-7")) {
            b.className = "ds-tab";
          }
          b.addEventListener("click", function() {
            wpViewSet(o[0]);
          });
          seg.appendChild(b);
        });
        wpHead.appendChild(seg);
        wpMini = document.createElement("div");
        wpMini.className = "rr-wp-mini";
        wpMini.hidden = true;
        if (window.ResizeObserver) {
          var wpMiniW = 0;
          new ResizeObserver(function() {
            var k = wpMini.clientWidth + "x" + wpMini.clientHeight;
            if (k !== wpMiniW) {
              wpMiniW = k;
              wpMiniDraw();
            }
          }).observe(wpMini);
        }
        new MutationObserver(function() {
          wpMiniDraw();
        }).observe(rail, {
          subtree: true,
          attributes: true,
          attributeFilter: [ "class", "data-wp-alert" ]
        });
        document.addEventListener("click", function(e) {
          if (e.target.closest && e.target.closest(".map-floor, .robot-card")) {
            setTimeout(wpMiniDraw, 0);
          }
        });
      }
      new MutationObserver(wpPlace).observe(rail.parentNode, {
        childList: true
      });
      if (wpHead) {
        wpViewSet("list");
      }
    }
    wpPlace();
    wpTog.textContent = "지점 " + rail.querySelectorAll(".timeline-item[data-waypoint]").length + "곳";
    if (document.body.classList.contains("ver-7")) {
      var cnt = document.querySelector("[data-progress-count]"), ct = cnt ? cnt.textContent.trim() : "";
      if (/^\d+\/\d+$/.test(ct)) {
        wpTog.textContent = "";
        var t1 = document.createElement("span");
        t1.className = "rr-wp-t";
        t1.textContent = document.documentElement.lang === "en" ? "Waypoints" : "웨이포인트";
        var t2 = document.createElement("span");
        t2.className = "rr-wp-n num";
        t2.textContent = ct;
        wpTog.appendChild(t1);
        wpTog.appendChild(t2);
      }
    }
    wpTog.setAttribute("aria-expanded", String(!document.body.classList.contains("rr-wp-closed")));
  }
  document.addEventListener("aprism:rr-mode", function(event) {
    document.body.classList.toggle("rr-wp-closed", !!(event.detail && event.detail.mode === "done"));
    wpToggleSync();
  });
  document.addEventListener("aprism:mission", function() {
    setTimeout(wpToggleSync, 0);
  });
  setTimeout(wpToggleSync, 0);
  if (document.body.classList.contains("ver-7")) {
    var ptEl = document.querySelector("[data-progress-title]"), ppEl = document.querySelector("[data-progress-percent]"), pcEl = document.querySelector("[data-progress-count]");
    var ptSplit = function() {
      if (!ptEl || ptEl.querySelector(".pt-act")) {
        return;
      }
      var t = ptEl.textContent.replace(/\s+/g, " ").trim();
      if (!t) {
        return;
      }
      var head = "", act = "", m = /^(.+?(?:으로|로)) (이동 중)$/.exec(t);
      if (m) {
        head = m[1];
        act = m[2];
      } else {
        var runT = document.querySelector("[data-timeline] .timeline-item[data-waypoint].is-running .step-title");
        var nm = runT ? runT.textContent.trim() : "";
        if (nm && t.indexOf(nm + " ") === 0) {
          head = nm;
          act = t.slice(nm.length + 1);
        } else if (m = /^(.+?,) (.+)$/.exec(t)) {
          head = m[1];
          act = m[2];
        }
      }
      if (!head) {
        var DOCK = {
          "충전 중": 0,
          "대기 중": 0,
          "대기": 0,
          "순회 완료": 0,
          "복귀 중": 1,
          "자동복귀 중": 1,
          "도킹 스테이션 복귀": 2,
          Charging: 3,
          Standby: 3,
          "Patrol complete": 3,
          Returning: 4,
          "Auto returning": 4,
          "Return to Docking Station": 5
        };
        var k = DOCK[t];
        if (k === 0 || k === 1) {
          head = k ? "도킹 스테이션으로" : "도킹 스테이션";
          act = t;
        } else if (k === 2) {
          head = "도킹 스테이션으로";
          act = "복귀 중";
        } else if (k === 3 || k === 4) {
          head = k === 4 ? "To docking station" : "Docking station";
          act = t;
        } else if (k === 5) {
          head = "To docking station";
          act = "Returning";
        }
      }
      if (!head) {
        return;
      }
      ptEl.textContent = "";
      var h = document.createElement("span");
      h.className = "pt-head";
      var pm = /^(.+?)(으로|로)$/.exec(head);
      if (pm) {
        var hn = document.createElement("span");
        hn.className = "pt-nm";
        hn.textContent = pm[1];
        var hp = document.createElement("span");
        hp.className = "pt-pp";
        hp.textContent = pm[2];
        h.appendChild(hn);
        h.appendChild(hp);
      } else {
        h.textContent = head;
      }
      var a = document.createElement("span");
      a.className = "pt-act";
      a.textContent = act;
      ptEl.appendChild(h);
      ptEl.appendChild(document.createTextNode(" "));
      ptEl.appendChild(a);
    };
    var ppSplit = function() {
      if (!ppEl || ppEl.querySelector(".pp-unit")) {
        return;
      }
      var m = /^(\d+)\s*%$/.exec(ppEl.textContent.trim());
      if (!m) {
        return;
      }
      ppEl.textContent = m[1];
      var u = document.createElement("span");
      u.className = "pp-unit";
      u.textContent = "%";
      ppEl.appendChild(u);
    };
    var watch = function(el, fn) {
      if (el) {
        new MutationObserver(fn).observe(el, {
          childList: true,
          characterData: true,
          subtree: true
        });
        fn();
      }
    };
    watch(ptEl, ptSplit);
    watch(ppEl, ppSplit);
    var rCounts = document.querySelector(".robot-list .robot-counts"), rStrip = document.querySelector(".robot-strip");
    if (rCounts && rStrip) {
      var rName = document.createElement("span");
      rName.className = "robot-head-name t-label-1";
      rCounts.appendChild(rName);
      var rSync = function() {
        var id = rStrip.querySelector(".robot-card[aria-pressed='true'] .robot-id") || rStrip.querySelector(".robot-card .robot-id");
        var t = id ? id.textContent.trim() : "";
        if (rName.textContent !== t) {
          rName.textContent = t;
        }
      };
      new MutationObserver(rSync).observe(rStrip, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [ "aria-pressed" ]
      });
      rSync();
    }
    watch(pcEl, function() {
      if (wpTog) {
        wpToggleSync();
      }
    });
  }
  var simWp = null;
  function rsimPress(m) {
    var b = document.querySelector(".rsim-chips [data-m='" + m + "']");
    if (b) {
      b.click();
    }
  }
  document.addEventListener("aprism:delta-sim", function() {
    var api = window.APRISM_RR;
    simWp = null;
    if (!api || !api.ready() || !onLane || !document.querySelector(".rsim.is-ready")) {
      return;
    }
    var miles = api.stops(), s = api.get();
    var at = wpSpots.map(function(w) {
      return w.id;
    }).indexOf(CRIT_WP);
    if (at < 0 || miles[at] === undefined) {
      at = miles.findIndex(function(x) {
        return x > s + 1e-6;
      });
    }
    if (at < 0) {
      at = 0;
    }
    simWp = wpSpots[at] || null;
    if (miles[at] !== undefined) {
      api.set(miles[at] - api.total() * 0.0005);
    }
    rsimPress("inspect");
  });
  var CRIT_WP = "WP-04";
  document.addEventListener("aprism:delta-sim-alert", function(event) {
    var a = event.detail && event.detail.alert;
    if (!a || !simWp || !window.APRISM_RR || !window.APRISM_RR.ready()) {
      return;
    }
    var card = document.querySelector(".robot-strip .robot-card[aria-pressed='true'][data-robot]");
    if (card) {
      a.robot = Number(card.getAttribute("data-robot"));
    }
    if (a.wp !== simWp.id) {
      var head = String(a.where || "").split(/WP-\d+/)[0];
      a.where = head + simWp.id + " " + (simWp.info && simWp.info.name || "");
      a.wp = simWp.id;
    }
    a.floor = simWp.floor || onLane && onLane.floor || a.floor;
    setTimeout(function() {
      rsimPress("alert");
    }, 0);
  });
  window.APRISM_RR = {
    ready: function() {
      return !!(onLane && onLane.rr);
    },
    debugOffset: function() {
      var ln = onLane;
      if (!ln) {
        return null;
      }
      var mk = rrMask(ln), on = mk.w.filter(function(x) {
        return x > 0.5;
      }).length, first = mk.w.findIndex(function(x) {
        return x > 0.5;
      });
      return {
        n: mk.w.length,
        on: on,
        from: Math.round(first * mk.st),
        total: Math.round(ln.total),
        off: +(span * 0.011).toFixed(2),
        span: Math.round(span)
      };
    },
    debugRetrace: function() {
      var ln = onLane;
      if (!ln) {
        return [];
      }
      var ms = wpMiles(ln);
      return wpSpots.map(function(w, i) {
        return [ w.no, Math.round(ms[i]), rrRetraced(ln, ms[i]) ];
      });
    },
    total: function() {
      return onLane ? onLane.total : 0;
    },
    get: function() {
      if (!onLane) {
        return 0;
      }
      if (RRS.lane !== onLane.id || RRS.s === null) {
        return onLane.rr ? onLane.rr.s : 0;
      }
      return RRS.s;
    },
    getMode: function() {
      return RRS.mode;
    },
    lanes: function(v) {
      if (v) {
        RR.lanes = v;
        this.set(this.get());
      }
      return RR.lanes;
    },
    ahead: function(v) {
      if (v) {
        RR.ahead = v;
        layWaypoints();
        this.set(this.get());
      }
      return RR.ahead;
    },
    flow: function(v) {
      if (v) {
        RR.flow = v;
        if (onLane) {
          rrRibbon(onLane, [], []);
        }
        this.set(this.get());
      }
      return RR.flow;
    },
    thin: function(v) {
      if (v) {
        RR.thin = v;
        this.set(this.get());
      }
      return RR.thin;
    },
    pastNo: function(v) {
      if (v) {
        RR.pastNo = v;
        this.set(this.get());
      }
      return RR.pastNo;
    },
    pins: function(v) {
      if (v) {
        RR.pins = v;
        layWaypoints();
        this.set(this.get());
      }
      return RR.pins;
    },
    set: function(s) {
      var ln = onLane;
      if (!ln || !ln.rr) {
        return;
      }
      if (ln.bot.ended) {
        rrApply(ln);
        frame();
        return;
      }
      ln.walk = null;
      if (ln.rrHome === undefined) {
        ln.rrHome = ln.rr.s;
      }
      if (rrMoved.indexOf(ln) < 0) {
        rrMoved.push(ln);
      }
      RRS.lane = ln.id;
      RRS.s = Math.max(0, Math.min(ln.total, s));
      rrPlace(ln, RRS.s, RRS.mode === "return" ? -1 : 1);
      rrPlanSoon();
      rrApply(ln);
      rrSyncRail(ln, RRS.s);
      frame();
    },
    mode: function(m) {
      if (m !== RRS.mode) {
        RRS.at = performance.now();
      }
      RRS.mode = m;
      this.set(this.get());
    },
    reset: function() {
      RRS.mode = "run";
      RRS.s = null;
      RRS.lane = null;
      RRS.at = performance.now();
      rrMoved.splice(0).forEach(function(ln) {
        ln.rr.s = ln.rrHome;
        rrPlace(ln, ln.rr.s, 1);
      });
      function settle() {
        if (onLane) {
          rrApply(onLane);
        }
        if (botBox && botBox.getAttribute("data-rr") === "done" && onLane && !onLane.bot.ended) {
          botBox.setAttribute("data-rr", "run");
          document.dispatchEvent(new CustomEvent("aprism:rr-mode", {
            detail: {
              mode: "run"
            }
          }));
        }
        frame();
      }
      settle();
      setTimeout(settle, 120);
    },
    ended: function() {
      return !!(onLane && onLane.bot && onLane.bot.ended);
    },
    stops: function() {
      var ln = onLane;
      if (!ln) {
        return [];
      }
      return wpMiles(ln).sort(function(a, b) {
        return a - b;
      });
    }
  };
  var rrDockBox = null, rrPulse = null, rrAlertId = null, rrNumBox = null, rrNumKey = "";
  var rrPinBox = null, rrPinKey = "", rrBadge = {}, rrFadeSig = "", rrFadeT = 0;
  var rrOk = {}, rrToneWas = {}, RR_OK_MS = 1400;
  var RR_LABEL_ZOOM = 1.35, rrLabBox = null, rrLabKey = "";
  function rrLabels() {
    if (!hit || !meshes.length) {
      return;
    }
    if (!rrLabBox) {
      rrLabBox = document.createElement("div");
      rrLabBox.className = "rr-labels";
      rrLabBox.setAttribute("aria-hidden", "true");
      hit.appendChild(rrLabBox);
    }
    var list = meshes.filter(function(it) {
      return it.key === "equipment" && it.title;
    });
    var key = list.length + "|" + floorNow;
    if (key !== rrLabKey) {
      rrLabKey = key;
      rrLabBox.textContent = "";
      list.forEach(function(it) {
        var n = document.createElement("span");
        n.className = "rr-label";
        n.textContent = it.title;
        var b = it.mesh.geometry.boundingBox;
        it.labelAt = new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2);
        it.labelEl = n;
        rrLabBox.appendChild(n);
      });
    }
    var on = zoom >= RR_LABEL_ZOOM && !floorBusy;
    rrLabBox.classList.toggle("is-on", on);
    if (!on) {
      return;
    }
    list.forEach(function(it) {
      if (!it.labelEl) {
        return;
      }
      var vis = (!it.floor || it.floor === floorNow) && it.mesh.visible !== false;
      it.labelEl.hidden = !vis;
      if (vis) {
        put(it.labelEl, it.labelAt);
      }
    });
  }
  function rrBadgeUri(n, fill, ring, txt) {
    var k = [ n, fill, ring, txt ].join("|");
    if (rrBadge[k]) {
      return rrBadge[k];
    }
    var two = String(n).length > 1;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="' + fill + '" stroke="' + ring + '" stroke-width="3.4"/>' + '<text x="20" y="' + (two ? 25 : 26) + '" text-anchor="middle" font-family="SUIT, Pretendard, Malgun Gothic, system-ui, sans-serif" font-weight="800" font-size="' + (two ? 15 : 17) + '" fill="' + txt + '">' + n + "</text></svg>";
    return rrBadge[k] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function rrPins() {
    if (!hit) {
      return;
    }
    if (!rrPinBox) {
      rrPinBox = document.createElement("div");
      rrPinBox.className = "rr-pins";
      rrPinBox.setAttribute("aria-hidden", "true");
      rrPinBox.addEventListener("dragstart", function(e) {
        e.preventDefault();
      });
      hit.appendChild(rrPinBox);
    }
    var on = !!(onLane && onLane.parts && onLane.parts[0] && onLane.parts[0].visible) && !floorBusy;
    rrPinBox.hidden = !on;
    var fsig = meshes.map(function(it) {
      return it.faded ? 1 : 0;
    }).join("");
    if (fsig !== rrFadeSig) {
      rrFadeSig = fsig;
      clearTimeout(rrFadeT);
      rrFadeT = setTimeout(function() {
        if (onLane && onLane.turns) {
          layWaypoints();
          frame();
        }
      }, 120);
    }
    rrPinBox.style.setProperty("--pz", Math.min(2.2, Math.max(0.8, Math.pow(zoom, 0.75))).toFixed(3));
    rrPinBox.setAttribute("data-pv", RR.pins);
    rrPinBox.setAttribute("data-past", RR.pastNo);
    if (camera) {
      var cdv = new THREE.Vector3;
      camera.getWorldDirection(cdv);
      rrPinBox.style.setProperty("--tilt", Math.max(0.25, Math.abs(cdv.y)).toFixed(3));
    }
    if (!on) {
      return;
    }
    var light = isLight(), blue = "#" + new THREE.Color(onLane.bot ? onLane.bot.left : 0x4db2ff).getHexString();
    var C = {
      up: light ? "#63686F" : "#8894AA",
      bg: light ? "#F2F4F5" : "#0A0F18",
      cau: light ? "#F2A900" : "#FFCC00",
      dan: "#FF383C",
      gray: "#9EA8BB"
    };
    var now = performance.now();
    wpSpots.forEach(function(w) {
      var prev = rrToneWas[w.id];
      if (prev && /current|next|active/.test(prev) && w.info.tone === "safe" && !w.info.was && rrM(onLane) !== "done") {
        rrOk[w.id] = now + RR_OK_MS;
        setTimeout(function() {
          rrPinKey = "";
          frame();
        }, RR_OK_MS + 50);
      }
      rrToneWas[w.id] = w.info.tone;
    });
    var key = wpSpots.map(function(w) {
      return w.id + w.info.tone + (w.info.was ? "w" : "") + (rrOk[w.id] > now ? "k" : "") + (w.buried ? "b" : "") + (w.off ? "x" : "");
    }).join(",") + rrM(onLane) + light + blue;
    if (key !== rrPinKey || wpSpots.some(function(w) {
      return !w.pinEl;
    })) {
      rrPinKey = key;
      rrPinBox.textContent = "";
      wpSpots.forEach(function(w) {
        var t = w.info.tone, next = t === "current" || t === "next" || t === "active", past = t === "safe", cau = t === "caution", dan = t === "danger";
        var was = !!w.info.was && !cau && !dan && !next;
        var col = was ? C.gray : cau ? C.cau : dan ? C.dan : past ? rrM(onLane) === "done" ? C.gray : blue : next ? blue : C.up;
        var solid = past || cau || dan || next;
        var el = document.createElement("div");
        var ok = past && !was && rrOk[w.id] > now;
        var measuring = next && rrM(onLane) === "inspect";
        var quiet = !cau && !dan && !next && !was && !ok && t !== "skipped" && !document.body.classList.contains("sian");
        el.className = "rr-pin" + (w.buried ? " is-buried" : "") + (past ? " is-past" : "") + (next ? " is-next" : "") + (quiet ? " is-quiet" : "") + (cau || dan ? " is-alert" : "") + (w.id === rrHotId ? " is-hot" + (rrHotPoint ? " is-point" : "") : "") + (ok ? " is-ok" : "") + (measuring ? " is-measuring" : "");
        el.style.setProperty("--pin", col);
        var head = document.createElement("span");
        head.className = "rr-pin-head";
        head.setAttribute("data-n", String(w.no));
        if (ok) {
          head.style.background = "#34C759";
          head.style.borderColor = C.bg;
          head.style.color = "#0A0F18";
          el.style.animationDelay = -Math.round(now - (rrOk[w.id] - RR_OK_MS)) + "ms";
        } else if (was && document.body.classList.contains("ver-7")) {
          head.style.background = light ? "#FFFFFF" : "#0A0F18";
          head.style.borderColor = col;
          head.style.color = light ? "#5E6675" : col;
        } else if (was) {
          head.style.background = col;
          head.style.borderColor = C.bg;
          head.style.color = "#0A0F18";
        } else if (measuring) {
          head.style.background = col;
          head.style.borderColor = "#FFFFFF";
          head.style.color = "#FFFFFF";
        } else if (next) {
          head.style.background = "#FFFFFF";
          head.style.borderColor = col;
          head.style.color = col;
        } else if (past) {
          head.style.background = C.bg;
          head.style.borderColor = col;
          head.style.color = col;
        } else if ((cau || dan) && document.body.classList.contains("ver-7")) {
          head.style.background = light ? "#FFFFFF" : "#0A0F18";
          head.style.borderColor = col;
          head.style.color = light && cau ? "#8A6100" : col;
        } else if (cau || dan) {
          head.style.background = col;
          head.style.borderColor = C.bg;
          head.style.color = cau ? "#1A1300" : "#FFFFFF";
        } else if (document.body.classList.contains("ver-7")) {
          head.style.background = C.bg;
          head.style.borderColor = "var(--pin-plain)";
          head.style.color = "var(--text-secondary)";
          el.style.setProperty("--pin", "var(--pin-plain)");
        } else {
          head.style.background = C.bg;
          head.style.borderColor = light ? "rgb(11 14 19 / 24%)" : "#AFB7C8";
          head.style.color = light ? "#494E54" : "#E4E8EF";
        }
        el.appendChild(head);
        if (w.off) {
          el.hidden = true;
        }
        w.pinEl = el;
        rrPinBox.appendChild(el);
      });
    }
    var placed = [], cand = [], pz = Math.min(2.2, Math.max(0.8, Math.pow(zoom, 0.75))), gap = 26 * pz, lastNo = 0;
    wpSpots.forEach(function(w) {
      if (!w.off) {
        lastNo = Math.max(lastNo, w.no);
      }
    });
    wpSpots.forEach(function(w) {
      if (!w.pinEl || w.off) {
        return;
      }
      var vis = !w.floor || w.floor === floorNow;
      w.pinEl.hidden = !vis;
      if (vis) {
        put(w.pinEl, w.spot);
        rrPinEdge(w, pz);
        var quiet = w.pinEl.classList.contains("is-quiet"), hot = w.id === rrHotId;
        if (RR.thin === "on" && !w.pinEl.classList.contains("is-alert") && (!quiet || hot)) {
          var q = onCanvas(w.spot);
          cand.push({
            w: w,
            x: q.x,
            y: q.y,
            p: hot ? -1 : rrPinRank(w, lastNo)
          });
        } else {
          w.pinEl.classList.remove("is-thin");
        }
      }
    });
    cand.sort(function(a, b) {
      return a.p - b.p || a.w.no - b.w.no;
    });
    cand.forEach(function(c) {
      var hit2 = placed.some(function(o) {
        return Math.abs(o.x - c.x) < gap && Math.abs(o.y - c.y) < gap;
      });
      c.w.pinEl.classList.toggle("is-thin", hit2);
      if (!hit2) {
        placed.push(c);
      }
    });
  }
  function rrPinEdge(w, pz) {
    var el = w.pinEl, q = onCanvas(w.spot), W = hit.clientWidth, H = hit.clientHeight, m = 4;
    el.style.removeProperty("--hx");
    el.style.removeProperty("--stem");
    el.classList.remove("is-low");
    el.style.removeProperty("opacity");
    var s = 20 * pz, st = (el.classList.contains("is-buried") ? 44 : 20) * pz;
    if (q.x < 0 || q.x > W) {
      el.style.opacity = "0";
      return;
    }
    if (q.y < 0 || q.y > H) {
      return;
    }
    var over = Math.max(m - (q.x - s / 2), q.x + s / 2 - (W - m), 0);
    if (over > 0) {
      el.style.opacity = Math.max(0, 1 - over / (s / 2)).toFixed(2);
    }
    var top = q.y - st - s + 2 * pz;
    if (top < m) {
      var ns = q.y - m - s + 2 * pz;
      if (ns < 0) {
        el.classList.add("is-low");
        ns = Math.max(-s - 2 * pz, ns);
      }
      el.style.setProperty("--stem", ns.toFixed(1) + "px");
    }
  }
  var rrHotId = null, rrHotPoint = false;
  var rrHov = null, rrHovPt = false, maPinId = null;
  function rrHot(id, point) {
    rrHov = id || null;
    rrHovPt = !!point;
    rrHotApply();
  }
  function maPinSync() {
    if (!V7MA) {
      return;
    }
    var mp = alertOn() ? chosenWp : null;
    if (mp !== maPinId) {
      maPinId = mp;
      rrHotApply();
      if (!mp && maLabel) {
        maLabel.hidden = true;
      }
    }
    document.body.classList.toggle("ma-on", !!mp);
  }
  var maLabel = null;
  function maLabelAt(x, y, W, H) {
    if (!hit) {
      return;
    }
    if (!maLabel) {
      maLabel = document.createElement("div");
      maLabel.className = "ma-wp-label";
      maLabel.setAttribute("aria-hidden", "true");
      maLabel.innerHTML = '<span class="mwl-place"></span><span class="mwl-meta"></span>';
      hit.appendChild(maLabel);
    }
    var pl = alertBox.querySelector(".ma-st-place"), tm = alertBox.querySelector(".ma-st-time");
    var place = pl ? pl.textContent.trim() : "", meta = tm ? tm.textContent.trim() : "";
    var a = maLabel.firstChild, b = maLabel.lastChild;
    if (a.textContent !== place) {
      a.textContent = place;
    }
    if (b.textContent !== meta) {
      b.textContent = meta;
    }
    maLabel.hidden = !place || x < 0 || x > W || y < 0 || y > H || floorBusy;
    maLabel.style.setProperty("--x", snapPx(x));
    maLabel.style.setProperty("--y", snapPx(y));
  }
  if (V7MA && alertBox) {
    new MutationObserver(maPinSync).observe(alertBox, {
      attributes: true,
      attributeFilter: [ "hidden", "data-wp" ]
    });
  }
  if (V7MA && alertBox) {
    var maDelta = document.querySelector(".delta3");
    if (maDelta && window.ResizeObserver) {
      new ResizeObserver(function() {
        if (alertOn()) {
          frame();
        }
      }).observe(maDelta);
    }
    alertBox.addEventListener("click", function(event) {
      if (!alertBox.classList.contains("is-folded") || !event.target.closest(".ma-head") || event.target.closest("button, a")) {
        return;
      }
      var dw = document.querySelector(".delta3.is-open [data-ai-toggle], [data-ai-toggle][aria-expanded='true']");
      if (dw) {
        dw.click();
      }
    });
  }
  function rrHotApply() {
    var id = rrHov, point = !!(id && rrHovPt);
    if (!id && maPinId) {
      id = maPinId;
      point = true;
    }
    if (id === rrHotId && point === rrHotPoint) {
      return;
    }
    rrHotId = id;
    rrHotPoint = point;
    wpSpots.forEach(function(w) {
      if (w.pinEl) {
        w.pinEl.classList.toggle("is-hot", w.id === id);
        w.pinEl.classList.toggle("is-point", point && w.id === id);
      }
    });
    if (rrPinBox) {
      rrPinBox.classList.toggle("has-point", point && wpSpots.some(function(w) {
        return w.id === id && w.pinEl && !w.pinEl.hidden;
      }));
    }
    frame();
  }
  document.addEventListener("pointerover", function(event) {
    var it = event.target.closest && event.target.closest(".ah-item[data-wp]");
    if (it) {
      rrHot(it.getAttribute("data-wp"), true);
    }
  });
  document.addEventListener("pointerout", function(event) {
    var it = event.target.closest && event.target.closest(".ah-item[data-wp]");
    if (it && !(event.relatedTarget && it.contains(event.relatedTarget))) {
      rrHot(null);
    }
  });
  document.addEventListener("pointerover", function(event) {
    var row = event.target.closest && event.target.closest("[data-timeline] [data-waypoint]");
    if (row) {
      rrHot(row.getAttribute("data-waypoint"));
    }
  });
  document.addEventListener("pointerout", function(event) {
    var row = event.target.closest && event.target.closest("[data-timeline] [data-waypoint]");
    if (row && !(event.relatedTarget && row.contains(event.relatedTarget))) {
      rrHot(null);
    }
  });
  document.addEventListener("focusin", function(event) {
    var row = event.target.closest && event.target.closest("[data-timeline] [data-waypoint]");
    rrHot(row ? row.getAttribute("data-waypoint") : null);
  });
  function rrPinRank(w, lastNo) {
    var t = w.info.tone;
    if (/current|next|active|running/.test(t)) {
      return 0;
    }
    if (t === "danger" || t === "caution") {
      return 1;
    }
    if (t === "safe") {
      return 7;
    }
    if (w.no === lastNo) {
      return 2;
    }
    if (w.no % 10 === 0) {
      return 3;
    }
    if (w.no % 5 === 0) {
      return 4;
    }
    return 5;
  }
  function rrWpNums() {
    if (!hit) {
      return;
    }
    if (!rrNumBox) {
      rrNumBox = document.createElement("div");
      rrNumBox.className = "rr-wpnums";
      rrNumBox.setAttribute("aria-hidden", "true");
      rrNumBox.addEventListener("selectstart", function(e) {
        e.preventDefault();
      });
      rrNumBox.addEventListener("dragstart", function(e) {
        e.preventDefault();
      });
      hit.appendChild(rrNumBox);
    }
    var on = !!(onLane && onLane.parts && onLane.parts[0] && onLane.parts[0].visible) && !floorBusy;
    var key = wpSpots.map(function(w) {
      return w.id + w.info.tone + (w.occ ? "o" : "") + (w.off ? "x" : "");
    }).join(",") + RRS.mode;
    if (key !== rrNumKey) {
      rrNumKey = key;
      rrNumBox.textContent = "";
      wpSpots.forEach(function(w) {
        var n = document.createElement("span");
        n.className = "rr-wpnum";
        n.setAttribute("data-tone", w.info.tone);
        if (w.occ) {
          n.setAttribute("data-occ", "1");
        }
        if (w.off) {
          n.hidden = true;
        }
        n.textContent = w.no;
        w.numEl = n;
        rrNumBox.appendChild(n);
      });
    }
    rrNumBox.hidden = !on;
    if (!on) {
      return;
    }
    wpSpots.forEach(function(w) {
      if (!w.numEl || w.off) {
        return;
      }
      var vis = !w.floor || w.floor === floorNow;
      w.numEl.hidden = !vis;
      if (vis) {
        put(w.numEl, w.spot);
      }
    });
  }
  function rrAlertPulse() {
    if (!rrPulse) {
      rrPulse = document.createElement("div");
      rrPulse.className = "rr-alert-pulse";
      rrPulse.setAttribute("aria-hidden", "true");
      hit.appendChild(rrPulse);
    }
    var w = rrAlertId && wpSpots.filter(function(x) {
      return x.id === rrAlertId;
    })[0];
    var show = !!w && RRS.mode === "alert" && (!w.floor || w.floor === floorNow) && !!(onLane && onLane.parts[0] && onLane.parts[0].visible);
    rrPulse.hidden = true;
    alertRing(show ? w.spot : null);
  }
  var alertRingG = null;
  function alertRingArt() {
    var n = 256, R = 100, c = document.createElement("canvas");
    c.width = c.height = n;
    var g = c.getContext("2d");
    g.translate(n / 2, n / 2);
    var wash = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R);
    wash.addColorStop(0, "rgba(255,56,60,0)");
    wash.addColorStop(1, "rgba(255,56,60,.22)");
    g.fillStyle = wash;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#ff383c";
    g.lineWidth = 6;
    g.shadowColor = "#ff383c";
    g.shadowBlur = 16;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    return {
      c: c,
      size: n / 2 / R
    };
  }
  function alertRing(spot) {
    if (!THREE || !scene) {
      return;
    }
    if (!alertRingG) {
      var art = alertRingArt(), tex = new THREE.CanvasTexture(art.c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      var geo = new THREE.PlaneGeometry(1, 1);
      geo.rotateX(-Math.PI / 2);
      var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      mesh.renderOrder = 898;
      mesh.visible = false;
      scene.add(mesh);
      alertRingG = {
        mesh: mesh,
        size: art.size
      };
    }
    var mesh = alertRingG.mesh;
    mesh.visible = !!spot;
    if (!spot) {
      return;
    }
    var sz = DOG_PX * baseSize / (view.clientHeight || 1);
    mesh.position.set(spot.x, spot.y + span * 0.0005, spot.z);
    mesh.scale.setScalar(sz * HALO_R * 0.8 * alertRingG.size * 2);
    mesh.material.opacity = rrReduce ? 1 : 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(performance.now() / 1600 * Math.PI * 2));
  }
  function rrDock() {
    var ln = onLane;
    if (!rrDockBox) {
      rrDockBox = document.createElement("div");
      rrDockBox.className = "rr-dock";
      rrDockBox.setAttribute("aria-hidden", "true");
      rrDockBox.innerHTML = '<svg viewBox="-11 -11 22 22" width="22" height="22"><rect class="rr-dock-pulse" x="-9" y="-9" width="18" height="18" rx="5"/>' + '<g class="rr-dock-solo"><rect class="rr-dock-box" x="-7" y="-7" width="14" height="14" rx="4"/><path class="rr-dock-bolt" d="M1.25 -4.4 L-2.5 0.6 H-0.15 L-1.25 4.4 L2.5 -0.6 H0.15 Z"/></g>' + '<g class="rr-dock-with"><rect class="rr-dock-slot" x="-17" y="-11" width="34" height="22" rx="7"/>' + '<rect class="rr-dock-bot" x="-9" y="-5" width="17" height="10" rx="3.4"/>' + '<circle class="rr-dock-badge" cx="15" cy="-10" r="6.5"/><path class="rr-dock-badge-bolt" transform="translate(15 -10) scale(.85)" d="M1.25 -4.4 L-2.5 0.6 H-0.15 L-1.25 4.4 L2.5 -0.6 H0.15 Z"/></g></svg>';
      hit.appendChild(rrDockBox);
    }
    var show = !!(ln && ln.dock) && (ln.floor || ROBOT_ON) === floorNow && !floorBusy;
    rrDockBox.hidden = !show;
    if (!show) {
      if (dockPadG) {
        dockPadG.mesh.visible = false;
      }
      return;
    }
    rrDockBox.setAttribute("data-rr", ln.bot && ln.bot.ended ? "done" : RRS.lane === ln.id ? RRS.mode : "run");
    var inDock = ln.bot && ln.bot.ended || RRS.lane === ln.id && (RRS.mode === "done" || RRS.s !== null && RRS.s <= ln.total * 0.006 && RRS.mode !== "return");
    rrDockBox.classList.toggle("is-docked", inDock);
    if (botBox) {
      if (inDock) {
        botBox.setAttribute("data-rr-docked", "1");
      } else {
        botBox.removeAttribute("data-rr-docked");
      }
    }
    put(rrDockBox, ln.dock);
    dockPad(ln, inDock);
  }
  var dockPadG = null;
  function dockPadArt(light) {
    var n = 256, c = document.createElement("canvas");
    c.width = c.height = n;
    var g = c.getContext("2d"), m = 24, w = n - m * 2, r = 34, ink = "#fff";
    g.beginPath();
    g.moveTo(m + r, m);
    g.arcTo(m + w, m, m + w, m + w, r);
    g.arcTo(m + w, m + w, m, m + w, r);
    g.arcTo(m, m + w, m, m, r);
    g.arcTo(m, m, m + w, m, r);
    g.closePath();
    g.fillStyle = light ? "rgba(255,255,255,.35)" : "rgba(12,16,22,.78)";
    g.fill();
    g.shadowColor = ink;
    g.shadowBlur = 18;
    g.lineWidth = 7;
    g.strokeStyle = ink;
    g.stroke();
    g.shadowBlur = 8;
    g.fillStyle = ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "italic 800 52px SUIT, 'SUIT Variable', sans-serif";
    g.fillText("DOCK", n / 2, n / 2 + 2);
    return c;
  }
  var DOCK_ON = {
    dark: 0x3be07a,
    light: 0x1fa35a
  }, DOCK_OFF = {
    dark: 0x9ea8bb,
    light: 0x8a94a6
  };
  function dockPad(ln, inDock) {
    if (!THREE || !scene) {
      return;
    }
    var light = isLight();
    if (!dockPadG || dockPadG.light !== light) {
      if (dockPadG) {
        scene.remove(dockPadG.mesh);
        dockPadG.mesh.material.map.dispose();
        dockPadG.mesh.material.dispose();
        dockPadG.mesh.geometry.dispose();
      }
      var cv = dockPadArt(light), tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      var geo = new THREE.PlaneGeometry(1, 1);
      geo.rotateX(-Math.PI / 2);
      var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        depthTest: false
      }));
      mesh.renderOrder = 899;
      mesh.visible = false;
      scene.add(mesh);
      dockPadG = {
        light: light,
        mesh: mesh
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          if (dockPadG && dockPadG.mesh === mesh) {
            tex.image = dockPadArt(light);
            tex.needsUpdate = true;
            frame();
          }
        });
      }
    }
    var mesh = dockPadG.mesh;
    var show = !!(ln && ln.dock) && !rrDockBox.hidden;
    mesh.material.color.setHex((inDock ? DOCK_ON : DOCK_OFF)[light ? "light" : "dark"]);
    mesh.visible = show;
    if (!show) {
      return;
    }
    var sz = DOG_PX * baseSize / (view.clientHeight || 1);
    mesh.position.set(ln.dock.x, ln.dock.y + span * 0.0005, ln.dock.z);
    mesh.scale.setScalar(sz * HALO_R * 1.35);
    var nx = ln.turns && ln.turns[1] ? ln.turns[1] : null;
    var dx = nx ? nx.x - ln.dock.x : 1, dz = nx ? nx.z - ln.dock.z : 0;
    if (dx * dx + dz * dz < 1e-10) {
      dx = 1;
      dz = 0;
    }
    if (camera) {
      var a = ln.dock.clone().project(camera), b = ln.dock.clone().add(new THREE.Vector3(dx, 0, dz).normalize()).project(camera);
      if (b.x < a.x) {
        dx = -dx;
        dz = -dz;
      }
    }
    mesh.rotation.y = Math.atan2(-dz, dx);
  }
  var WALK_SECONDS = 14;
  var walkLast = 0, walkOn = false;
  function nearMileFrom(ln, p, min) {
    var best = null, bd = Infinity, ab = new THREE.Vector3, ap = new THREE.Vector3, q = new THREE.Vector3;
    for (var i = 1; i < ln.turns.length; i += 1) {
      if (ln.mile[i] < min) {
        continue;
      }
      var a = ln.turns[i - 1], b = ln.turns[i];
      ab.subVectors(b, a);
      ap.subVectors(p, a);
      var len2 = ab.lengthSq(), seg = ln.mile[i] - ln.mile[i - 1];
      var t0 = seg > 0 ? Math.max(0, (min - ln.mile[i - 1]) / seg) : 0;
      var t = len2 > 0 ? Math.max(t0, Math.min(1, ap.dot(ab) / len2)) : t0;
      q.copy(a).addScaledVector(ab, t);
      var d = q.distanceTo(p);
      if (d < bd) {
        bd = d;
        best = ln.mile[i - 1] + seg * t;
      }
    }
    return best === null ? nearMile(ln, p) : best;
  }
  function rrRetraced(ln, m) {
    var here = alongRoute(ln.turns, ln.mile, m), gap = span * 0.06, tol = span * 0.012, step = span * 0.004;
    for (var x = 0; x < m - gap; x += step) {
      if (alongRoute(ln.turns, ln.mile, x).distanceTo(here) < tol) {
        return true;
      }
    }
    return false;
  }
  var rrPruned = false;
  function rrPrune(ln) {
    if (rrPruned || !ln || !ln.turns || !wpSpots.length) {
      return;
    }
    rrPruned = true;
    var ms = wpMiles(ln), gone = {};
    wpSpots.forEach(function(w, i) {
      if (rrRetraced(ln, ms[i])) {
        gone[w.id] = true;
      }
    });
    var rail = document.querySelector("[data-timeline]");
    if (!rail || !Object.keys(gone).length) {
      return;
    }
    Array.prototype.forEach.call(rail.querySelectorAll("[data-waypoint]"), function(item) {
      if (gone[item.getAttribute("data-waypoint")]) {
        item.remove();
      }
    });
    Array.prototype.forEach.call(rail.querySelectorAll(".timeline-item[data-waypoint]"), function(item, i) {
      var no = item.querySelector(".step-no");
      if (no) {
        no.textContent = String(i + 1);
      }
    });
    layWaypoints();
    if (ln.rr) {
      rrSplit(ln, ln.rr.s);
    }
  }
  function wpMiles(ln) {
    var prev = 0;
    return wpSpots.map(function(w) {
      var m = nearMileFrom(ln, w.spot, prev);
      prev = m + span * 0.002;
      return m;
    });
  }
  function nearMile(ln, p) {
    var best = 0, bd = Infinity, ab = new THREE.Vector3, ap = new THREE.Vector3, q = new THREE.Vector3;
    for (var i = 1; i < ln.turns.length; i += 1) {
      var a = ln.turns[i - 1], b = ln.turns[i];
      ab.subVectors(b, a);
      ap.subVectors(p, a);
      var len2 = ab.lengthSq();
      var t = len2 > 0 ? Math.max(0, Math.min(1, ap.dot(ab) / len2)) : 0;
      q.copy(a).addScaledVector(ab, t);
      var d = q.distanceTo(p);
      if (d < bd) {
        bd = d;
        best = ln.mile[i - 1] + (ln.mile[i] - ln.mile[i - 1]) * t;
      }
    }
    return best;
  }
  function walkSetup(ln, n) {
    var a = ln.wps[n - 1], b = ln.wps[n];
    if (!a || !b) {
      return;
    }
    var m0 = nearMile(ln, a), m1 = nearMile(ln, b);
    if (!(m1 > m0)) {
      return;
    }
    ln.walk = {
      from: m0 + (m1 - m0) * 0.12,
      to: m1 - (m1 - m0) * 0.06,
      s: m0 + (m1 - m0) * 0.12,
      rest: 0
    };
    walkPlace(ln);
  }
  function walkPlace(ln) {
    var w = ln.walk, s = w.s;
    var at = 1;
    while (at < ln.mile.length - 1 && ln.mile[at] < s) {
      at += 1;
    }
    var here = alongRoute(ln.turns, ln.mile, s);
    var ahead = alongRoute(ln.turns, ln.mile, Math.min(ln.total, s + span * 0.01));
    ln.here.copy(here);
    ln.ahead.copy(ahead);
    function flat(pts) {
      var f = [];
      pts.forEach(function(q) {
        f.push(q.x, q.y, q.z);
      });
      return f;
    }
    var done = ln.parts[0], left = ln.parts[1];
    if (done && done.geometry) {
      done.geometry.setPositions(flat(ln.turns.slice(0, at).concat([ here ])));
      done.computeLineDistances();
    }
    if (left && left.geometry) {
      left.geometry.setPositions(flat([ here ].concat(ln.turns.slice(at))));
      left.computeLineDistances();
    }
    if (!ln.bot.ended) {
      rrSplit(ln, s);
    }
    if (ln.fan) {
      ln.fan.position.copy(here);
      ln.fan.position.y += span * 0.002;
      ln.fan.rotation.y = Math.atan2(ahead.x - here.x, ahead.z - here.z);
    }
  }
  function walkTick(t) {
    var ln = onLane;
    if (!ln || !ln.walk || !renderer) {
      walkOn = false;
      return;
    }
    var dt = Math.min(0.1, (t - (walkLast || t)) / 1000);
    walkLast = t;
    var w = ln.walk;
    if (w.rest > 0) {
      w.rest -= dt;
      if (w.rest <= 0) {
        w.s = w.from;
      }
    } else {
      w.s += (w.to - w.from) / WALK_SECONDS * dt;
      if (w.s >= w.to) {
        w.s = w.to;
        w.rest = 2.5;
      }
    }
    walkPlace(ln);
    frameTick(t);
    window.requestAnimationFrame(walkTick);
  }
  function walkStart() {
    if (walkOn || !onLane || !onLane.walk) {
      return;
    }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    walkOn = true;
    walkLast = 0;
    window.requestAnimationFrame(walkTick);
  }
  var focus = null;
  var wheelAt = 0;
  var WHEEL_GAP = 450;
  var diskCache = null;
  function currentDeck() {
    var f = floorOf(floorNow);
    return f ? f.deck : floorY;
  }
  function groundAt(px, py) {
    if (!renderer || !camera) {
      return null;
    }
    if (!raycaster) {
      raycaster = new THREE.Raycaster;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    raycaster.setFromCamera(new THREE.Vector2(px / w * 2 - 1, -(py / h) * 2 + 1), camera);
    var list = [];
    meshes.forEach(function(item) {
      if (item.floor && item.floor !== floorNow) {
        return;
      }
      if (item.key === "floor" || item.key === "equipment") {
        list.push(item.mesh);
      }
    });
    var found = raycaster.intersectObjects(list, false)[0];
    if (found) {
      var owner = null;
      for (var i = 0; i < meshes.length; i += 1) {
        if (meshes[i].mesh === found.object) {
          owner = meshes[i];
          break;
        }
      }
      return {
        world: found.point.clone(),
        item: owner && owner.key === "equipment" ? owner : null
      };
    }
    var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -currentDeck());
    var p = new THREE.Vector3;
    return raycaster.ray.intersectPlane(plane, p) ? {
      world: p,
      item: null
    } : null;
  }
  function setFocusAt(px, py) {
    focus = groundAt(px, py);
  }
  function setFocusWorld(spot) {
    focus = spot ? {
      world: spot.clone(),
      item: null
    } : null;
  }
  function clearFocus() {
    focus = null;
  }
  function disk(n) {
    if (diskCache && diskCache.length === n) {
      return diskCache;
    }
    var out = [], golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i += 1) {
      var r = Math.sqrt((i + 0.5) / n), a = i * golden;
      out.push({
        x: r * Math.cos(a),
        y: r * Math.sin(a)
      });
    }
    diskCache = out;
    return out;
  }
  function toScreen(world) {
    var v = world.clone().project(camera);
    if (v.z > 1 || v.z < -1) {
      return null;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    return {
      x: (v.x + 1) / 2 * w,
      y: (1 - v.y) / 2 * h
    };
  }
  function coverage(world, skip, area) {
    var out = {
      ratio: {},
      center: {}
    };
    var at = toScreen(world);
    if (!at) {
      return out;
    }
    if (!raycaster) {
      raycaster = new THREE.Raycaster;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    var camDir = new THREE.Vector3;
    camera.getWorldDirection(camDir);
    var depthF = (new THREE.Vector3).subVectors(world, camera.position).dot(camDir);
    var margin = span * 0.002;
    var toT = (new THREE.Vector3).subVectors(world, camera.position);
    var len = toT.length();
    var reachW = OPT.radius * perPixel() * 1.5;
    var closest = new THREE.Vector3;
    var seg = new THREE.Line3(camera.position, world);
    var list = [];
    meshes.forEach(function(item) {
      if (item.key === "floor") {
        return;
      }
      if (item.floor && item.floor !== floorNow) {
        return;
      }
      if (item === picked || item === skip) {
        return;
      }
      var g = item.mesh.geometry;
      if (!g.boundingSphere) {
        g.computeBoundingSphere();
      }
      seg.closestPointToPoint(g.boundingSphere.center, true, closest);
      if (closest.distanceTo(g.boundingSphere.center) > g.boundingSphere.radius + reachW) {
        return;
      }
      list.push(item.mesh);
    });
    raycaster.set(camera.position, toT.normalize());
    raycaster.intersectObjects(list, false).forEach(function(found) {
      if (found.distance < len - margin) {
        out.center[found.object.uuid] = true;
      }
    });
    if (area) {
      var pts = disk(OPT.samples);
      pts.forEach(function(d) {
        var sx = at.x + d.x * OPT.radius, sy = at.y + d.y * OPT.radius;
        raycaster.setFromCamera(new THREE.Vector2(sx / w * 2 - 1, -(sy / h) * 2 + 1), camera);
        var cos = raycaster.ray.direction.dot(camDir) || 1;
        var far = depthF / cos - margin;
        var seen = {};
        raycaster.intersectObjects(list, false).forEach(function(found) {
          if (found.distance >= far || seen[found.object.uuid]) {
            return;
          }
          seen[found.object.uuid] = true;
          out.ratio[found.object.uuid] = (out.ratio[found.object.uuid] || 0) + 1;
        });
      });
      Object.keys(out.ratio).forEach(function(k) {
        out.ratio[k] /= pts.length;
      });
    }
    return out;
  }
  function targets() {
    var list = [];
    if (focus) {
      list.push({
        world: focus.world,
        skip: focus.item
      });
    }
    if (OPT.robotTarget && onLane && floorNow === (onLane.floor || ROBOT_ON) && !floorBusy) {
      list.push({
        world: onLane.here.clone().add(new THREE.Vector3(0, span * 0.006, 0)),
        skip: null
      });
    }
    return list;
  }
  function plan() {
    if (!meshes.length) {
      return;
    }
    var topView = pitch * 180 / Math.PI >= OPT.topPitch;
    aim();
    var ratio = {}, blockC = {};
    targets().forEach(function(t) {
      var r = coverage(t.world, t.skip, !topView);
      Object.keys(r.center).forEach(function(k) {
        blockC[k] = true;
      });
      if (topView) {
        return;
      }
      Object.keys(r.ratio).forEach(function(k) {
        ratio[k] = Math.max(ratio[k] || 0, r.ratio[k]);
      });
    });
    var center = focus ? focus.world : target;
    var near = span * 0.3;
    meshes.forEach(function(item) {
      var c = ratio[item.mesh.uuid] || 0;
      item.cover = c;
      item.onLine = !!blockC[item.mesh.uuid];
      item.faded = item.onLine || (item.faded ? c >= OPT.leave : c >= OPT.enter);
      var close = focus && item.center.distanceTo(center) < near;
      var deep = item.onLine && item.key !== "equipment";
      var want = !item.faded ? item.alpha : Math.min(item.alpha, deep ? OPT.fadeTo : OPT.fadeSoft);
      var edge = item.faded ? item.line * 0.85 : close ? item.peak : item.line;
      if (item === picked) {
        want = 1;
        edge = 1;
      }
      item.want = want;
      item.edgeWant = edge;
      item.glowWant = item === picked ? 1 : 0;
    });
    settle();
  }
  function paintOne(item) {
    var vis = item.floor ? floorFade[item.floor] || 0 : 1;
    if (item.floors) {
      vis = Math.max(floorFade[item.floors[0]] || 0, floorFade[item.floors[1]] || 0);
    }
    item.mesh.visible = vis > 0.004;
    item.mat.opacity = item.now * vis;
    var fade = Math.max(0, 1 - item.now / item.alpha);
    fade *= 0.3;
    tone.copy(item.base).lerp(PICKED, item.glowNow);
    item.mat.color.copy(tone).lerp(GHOSTC, fade);
    item.mat.emissive.copy(tone).multiplyScalar(PALETTE[item.key].lift * (isLight() ? LAB.light.lift : 1));
    item.mat.depthWrite = item.now > 0.95 && vis > 0.95;
    item.mesh.renderOrder = item.key === "floor" ? -2 : item.mat.depthWrite ? 0 : 1;
    item.edgeMat.opacity = item.edgeNow * vis;
    item.mesh.castShadow = vis > 0.9 && item.now > item.alpha * 0.5;
  }
  var topLight = null, keyLight = null, hemiLight = null, ambLight = null;
  var AMB_LIGHT = 0.95;
  var HEMI_GROUND_LIGHT = 0xe4e6ea;
  var TOP_LIGHT = 0;
  var KEY_LIGHT_LIGHT = 1.5;
  var LAB = {
    light: {
      amb: AMB_LIGHT,
      key: KEY_LIGHT_LIGHT,
      top: TOP_LIGHT,
      hemi: 1.6,
      hemiSky: 0xffffff,
      hemiGround: HEMI_GROUND_LIGHT,
      lift: LIGHT_LIFT
    },
    dark: {
      amb: 0.25,
      key: 1,
      top: 0,
      hemi: 1.25,
      hemiSky: 0xe4edfb,
      hemiGround: 0x05070c
    },
    darkSet: {
      face: null,
      edge: EDGE,
      ghost: GHOST,
      grid: GRID,
      pickFace: PICK_FACE,
      pickLine: PICK_LINE,
      hoverLine: HOVER_LINE
    },
    wallScale: 1,
    wallAlpha: 1
  };
  function applyTheme() {
    if (!THEMED || !tone) {
      return;
    }
    var light = isLight();
    var Lb = light ? LAB.light : LAB.dark;
    if (topLight) {
      topLight.intensity = Lb.top;
    }
    if (keyLight) {
      keyLight.intensity = Lb.key;
    }
    if (ambLight) {
      ambLight.intensity = Lb.amb;
    }
    if (hemiLight) {
      hemiLight.groundColor.setHex(Lb.hemiGround);
      hemiLight.intensity = Lb.hemi;
      if (Lb.hemiSky != null) {
        hemiLight.color.setHex(Lb.hemiSky);
      }
    }
    var set = light ? LIGHT : isNeutral() ? NEUTRAL : LAB.darkSet;
    meshes.forEach(function(item) {
      var face = set.face ? set.face[item.key] || set.face.other : PALETTE[item.key].face;
      item.base.setHex(face);
      item.edgeMat.color.setHex(set.edge);
    });
    PICKED.setHex(set.pickFace);
    GHOSTC.setHex(set.ghost);
    pickPens.forEach(function(pen) {
      pen.material.color.setHex(set.pickLine);
      pen.children.forEach(function(g) {
        g.material.color.setHex(set.pickLine);
      });
    });
    if (pickPens.length === 2) {
      pickPens[0].material.opacity = 0;
      pickPens[1].material.opacity = 1;
    }
    hoverPens.forEach(function(pen) {
      pen.material.color.setHex(set.hoverLine);
      pen.children.forEach(function(g) {
        g.material.color.setHex(set.hoverLine);
      });
    });
    if (gridMesh) {
      var c = new THREE.Color(set.grid);
      var col = gridMesh.geometry.getAttribute("color");
      for (var i = 0; i < col.count; i++) {
        col.setXYZ(i, c.r, c.g, c.b);
      }
      col.needsUpdate = true;
      gridMesh.material.opacity = light ? 0.5 : 0.3;
    }
    Object.keys(lanes).forEach(function(id) {
      var ln = lanes[id];
      if (!ln || !ln.bot) {
        return;
      }
      tintRobot(ln.bot, id);
      ln.parts.forEach(function(part) {
        var t = part.userData && part.userData.tone;
        if (!t) {
          return;
        }
        var hexc = t === "mark" ? ln.bot.mark || ln.bot.done : ln.bot[t];
        if (part.material && part.material.color) {
          part.material.color.setHex(hexc);
        }
        part.children.forEach(function(ch) {
          if (ch.material && ch.material.color) {
            ch.material.color.setHex(hexc);
          }
        });
      });
    });
    if (onLane) {
      showLane(onLane.id, true);
    }
    stopBacks.forEach(function(b) {
      b.material.color.set(stopFill());
    });
    wpMarks.forEach(function(m) {
      if (m.userData.tone) {
        m.material.color.setHex(wpTint(m.userData.tone));
      }
    });
    if (onLane && onLane.rr) {
      rrApply(onLane);
    }
    Object.keys(stopArt).forEach(function(kind) {
      drawStop(kind, stopArt[kind].image);
      stopArt[kind].needsUpdate = true;
    });
    repaint();
  }
  function labApply() {
    if (!meshes.length) {
      return;
    }
    meshes.forEach(function(it) {
      var pal = PALETTE[it.key];
      if (pal) {
        it.line = pal.line;
        it.peak = pal.peak;
      }
      if (it.key === "wall") {
        var fl = it.floor ? floorOf(it.floor) : null;
        var deck = fl && isFinite(fl.deck) ? fl.deck : 0;
        it.mesh.scale.y = LAB.wallScale;
        it.mesh.position.y = deck * (1 - LAB.wallScale);
        it.mesh.updateMatrixWorld(true);
        it.alpha = LAB.wallAlpha;
      }
    });
    applyTheme();
    plan();
    settle();
  }
  window.APRISM_MAP_LAB = {
    LAB: LAB,
    PALETTE: PALETTE,
    LIGHT: LIGHT,
    OPT: OPT,
    apply: labApply,
    ready: function() {
      return meshes.length > 0;
    }
  };
  function repaint() {
    meshes.forEach(paintOne);
    frame();
  }
  function settle() {
    if (ticking) {
      return;
    }
    ticking = true;
    (function step() {
      var moving = false;
      meshes.forEach(function(item) {
        item.now += (item.want - item.now) * EASE;
        item.edgeNow += (item.edgeWant - item.edgeNow) * EASE;
        item.glowNow += (item.glowWant - item.glowNow) * EASE;
        if (Math.abs(item.want - item.now) > SETTLED) {
          moving = true;
        } else {
          item.now = item.want;
        }
        if (Math.abs(item.edgeWant - item.edgeNow) > SETTLED) {
          moving = true;
        } else {
          item.edgeNow = item.edgeWant;
        }
        if (Math.abs(item.glowWant - item.glowNow) > SETTLED) {
          moving = true;
        } else {
          item.glowNow = item.glowWant;
        }
        paintOne(item);
      });
      frame();
      if (moving) {
        window.requestAnimationFrame(step);
      } else {
        ticking = false;
      }
    })();
  }
  function readFloors() {
    var by = {};
    meshes.forEach(function(item) {
      if (!item.floor) {
        return;
      }
      var f = by[item.floor];
      if (!f) {
        f = by[item.floor] = {
          id: item.floor,
          label: floorLabel(item.floor),
          box: new THREE.Box3,
          deck: -Infinity,
          stairs: new THREE.Box3
        };
      }
      var b = item.mesh.geometry.boundingBox;
      if (!b) {
        item.mesh.geometry.computeBoundingBox();
        b = item.mesh.geometry.boundingBox;
      }
      f.box.union(b);
      if (item.key === "floor") {
        f.deck = Math.max(f.deck, b.max.y);
      }
      if (item.key === "stairs") {
        f.stairs.union(b);
      }
    });
    floors = Object.keys(by).map(function(id) {
      return by[id];
    });
    floors.forEach(function(f) {
      if (f.deck === -Infinity) {
        f.deck = f.box.min.y;
      }
      f.center = f.box.getCenter(new THREE.Vector3);
      f.size = f.box.getSize(new THREE.Vector3);
      f.stairAt = f.stairs.isEmpty() ? f.center.clone() : f.stairs.getCenter(new THREE.Vector3);
    });
    floors.sort(function(a, b) {
      return a.deck - b.deck;
    });
    return floors;
  }
  function floorOf(id) {
    for (var i = 0; i < floors.length; i += 1) {
      if (floors[i].id === id) {
        return floors[i];
      }
    }
    return null;
  }
  function fitFloor() {
    var f = floorOf(floorNow);
    var size = f ? f.size : null;
    if (!size) {
      return;
    }
    fitH = across(right, size);
    fitV = across(upOnGround, size);
    fitBase();
  }
  function fitFloorKeepingView() {
    var before = baseSize;
    fitFloor();
    if (before > 0 && baseSize > 0) {
      zoom *= baseSize / before;
    }
  }
  function tellFloor() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
      var on = btn.getAttribute("data-map-floor") === floorNow;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-floor-label]"), function(node) {
      node.textContent = floorLabel(floorNow);
    });
    document.dispatchEvent(new CustomEvent("aprism:floor", {
      detail: {
        floor: floorNow
      }
    }));
    wpFloorSync();
  }
  function layRobots() {
    if (!floors.length) {
      return;
    }
    laneFor(activeRobot());
    var ln = lanes[activeRobot()];
    if (ln && ln.travel) {
      showLane(activeRobot(), true);
      return;
    }
    if (floorNow === (ln && ln.floor || ROBOT_ON)) {
      showLane(activeRobot(), true);
    } else {
      showLane(-1, true);
    }
  }
  function smooth(t) {
    return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  }
  function seg(t, a, b) {
    return smooth((t - a) / (b - a));
  }
  function goFloor(next, via, at) {
    if (!floors.length || next === floorNow) {
      return;
    }
    if (floorBusy) {
      floorNext = next;
      return;
    }
    var from = floorOf(floorNow), to = floorOf(next);
    if (!from || !to) {
      return;
    }
    floorBusy = true;
    clearFocus();
    choose(null);
    var prev = floorNow;
    floorNow = next;
    tellFloor();
    showLane(-1, true);
    var stair = via === "stairs" ? at || from.stairAt : null;
    var span0 = target.clone();
    var rise = to.deck - from.deck;
    var dur = stair ? 1400 : 900;
    var gridY0 = gridMesh ? gridMesh.position.y : 0;
    var t0 = (window.performance || Date).now();
    (function step() {
      var t = Math.min(1, ((window.performance || Date).now() - t0) / dur);
      if (stair) {
        var near = seg(t, 0, 0.3);
        target.x = span0.x + (stair.x - span0.x) * near;
        target.z = span0.z + (stair.z - span0.z) * near;
      }
      var out1 = stair ? seg(t, 0.22, 0.48) : seg(t, 0, 0.45);
      var in1 = out1;
      var lift = stair ? seg(t, 0.34, 0.74) : seg(t, 0.15, 0.75);
      var out2 = stair ? seg(t, 0.62, 1) : seg(t, 0.55, 1);
      floorFade[prev] = (1 - 0.8 * out1) * (1 - out2);
      floorFade[next] = 0.4 * in1 + 0.6 * out2;
      target.y = span0.y + rise * lift;
      if (gridMesh) {
        gridMesh.position.y = gridY0 + rise * lift;
      }
      clamp();
      repaint();
      if (t < 1) {
        window.requestAnimationFrame(step);
      } else {
        floorFade[prev] = 0;
        floorFade[next] = 1;
        home = to.center.clone();
        home.y = span0.y + rise;
        fitFloorKeepingView();
        floorBusy = false;
        layRobots();
        plan();
        repaint();
        if (!floorNext) {
          arrivalOverview(via === "stairs" ? 520 : 320);
        }
        if (floorNext) {
          var queued = floorNext;
          floorNext = "";
          goFloor(queued, "button");
        }
      }
    })();
  }
  function setupFloors() {
    readFloors();
    if (!floors.length) {
      return;
    }
    var want = window.APRISM_FLOOR_WANT;
    floorNow = floorOf(want) ? want : floorOf(ROBOT_ON) ? ROBOT_ON : floors[0].id;
    floors.forEach(function(f) {
      floorFade[f.id] = f.id === floorNow ? 1 : 0;
    });
    tellFloor();
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
      btn.addEventListener("click", function() {
        goFloor(btn.getAttribute("data-map-floor"), "button");
      });
    });
  }
  var TRAVEL = {
    SPEED: 7,
    STAIR_SPEED: 3.2,
    DWELL: 2.2,
    SHRINK: 260,
    BADGE: 2600,
    OVERVIEW: 1600
  };
  var trav = null;
  var gridByFloor = {};
  var stairHole = {};
  var modelBox = null;
  function stairHoleFor(fid, slab) {
    if (!stairHole[fid]) {
      stairHole[fid] = {
        uHoleOn: {
          value: 0
        },
        uHole: {
          value: new THREE.Vector4
        }
      };
    }
    var u = stairHole[fid];
    var hole = slab ? "if (uHoleOn > 0.5 && vMaskXZ.x > uHole.x && vMaskXZ.x < uHole.z && vMaskXZ.y > uHole.y && vMaskXZ.y < uHole.w) { discard; }\n" : "";
    return function(shader) {
      Object.keys(u).forEach(function(k) {
        shader.uniforms[k] = u[k];
      });
      shader.vertexShader = "varying vec2 vMaskXZ;\n" + shader.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n  vMaskXZ = (modelMatrix * vec4(transformed, 1.0)).xz;");
      shader.fragmentShader = "uniform float uHoleOn;\nuniform vec4 uHole;\nvarying vec2 vMaskXZ;\n" + shader.fragmentShader.replace("#include <premultiplied_alpha_fragment>", hole + "#include <premultiplied_alpha_fragment>");
    };
  }
  var stairLinks = [];
  var stairEnds = [];
  var stairTagBox = [];
  function topY(m) {
    return m.mesh.geometry.boundingBox.max.y;
  }
  function gapXZ(a, b) {
    var A = a.mesh.geometry.boundingBox, B = b.mesh.geometry.boundingBox;
    var gx = Math.max(0, A.min.x - B.max.x, B.min.x - A.max.x);
    var gz = Math.max(0, A.min.z - B.max.z, B.min.z - A.max.z);
    return Math.max(gx, gz);
  }
  function centerOf(m) {
    return m.mesh.geometry.boundingBox.getCenter(new THREE.Vector3);
  }
  function descend(items, start, lowDeck) {
    var chain = [ start ], cur = start;
    for (var guard = 0; topY(cur) > lowDeck + 0.6 && guard < 80; guard += 1) {
      var c0 = centerOf(cur);
      var next = null, best = Infinity;
      for (var i = 0; i < items.length; i += 1) {
        var m = items[i], dy = topY(cur) - topY(m);
        if (dy < 0.2 || dy > 0.6 || chain.indexOf(m) >= 0 || gapXZ(m, cur) > 0.6) {
          continue;
        }
        var d = centerOf(m).distanceTo(c0);
        if (d < best) {
          best = d;
          next = m;
        }
      }
      if (!next) {
        return null;
      }
      chain.push(next);
      cur = next;
    }
    return topY(cur) <= lowDeck + 0.6 ? chain : null;
  }
  function gridOf(fid) {
    if (gridByFloor[fid] === undefined) {
      var keep = ROBOT_ON;
      ROBOT_ON = fid;
      gridByFloor[fid] = mapFloor(modelBox);
      ROBOT_ON = keep;
    }
    return gridByFloor[fid];
  }
  function openNear(fid, p, rect) {
    var g = gridOf(fid);
    var f = floorOf(fid);
    if (!g) {
      return new THREE.Vector3(p.x, f.deck, p.z);
    }
    var best = null, near = Infinity;
    [ g.room, g.open ].some(function(grid) {
      for (var k = 0; k < grid.length; k += 1) {
        if (!grid[k]) {
          continue;
        }
        var c = k % g.cols, r = (k - c) / g.cols;
        var x = g.minX + (c + 0.5) * ROUTE_STEP, z = g.minZ + (r + 0.5) * ROUTE_STEP;
        if (x > rect[0] - 0.3 && x < rect[2] + 0.3 && z > rect[1] - 0.3 && z < rect[3] + 0.3) {
          continue;
        }
        var d = (x - p.x) * (x - p.x) + (z - p.z) * (z - p.z);
        if (d < near) {
          near = d;
          best = new THREE.Vector3(x, 0, z);
        }
      }
      return !!best;
    });
    best = best || new THREE.Vector3(p.x, 0, p.z);
    best.y = f.deck + NAV.lift / NAV.unit;
    return best;
  }
  function readStairs() {
    stairLinks = [];
    stairEnds = [];
    if (floors.length < 1) {
      return;
    }
    var list = meshes.filter(function(m) {
      return m.key === "stairs";
    });
    var group = list.map(function(_, i) {
      return i;
    });
    function root(i) {
      while (group[i] !== i) {
        i = group[i] = group[group[i]];
      }
      return i;
    }
    for (var i = 0; i < list.length; i += 1) {
      var bi = list[i].mesh.geometry.boundingBox.clone().expandByScalar(1.2);
      for (var j = i + 1; j < list.length; j += 1) {
        if (bi.intersectsBox(list[j].mesh.geometry.boundingBox)) {
          group[root(i)] = root(j);
        }
      }
    }
    var cores = {};
    list.forEach(function(m, k) {
      (cores[root(k)] = cores[root(k)] || []).push(m);
    });
    var lift = span * 0.005;
    var topDeck = floors[floors.length - 1].deck, botDeck = floors[0].deck;
    Object.keys(cores).forEach(function(key) {
      var items = cores[key];
      var used = [];
      for (var f = 0; f < floors.length - 1; f += 1) {
        var L = floors[f], U = floors[f + 1];
        var chain = null;
        items.forEach(function(s) {
          var y = topY(s);
          if (y < U.deck - 1.1 || y > U.deck + 0.1) {
            return;
          }
          var c = descend(items, s, L.deck);
          if (c && (!chain || c.length > chain.length)) {
            chain = c;
          }
        });
        if (!chain) {
          continue;
        }
        used = used.concat(chain);
        var rect = [ Infinity, Infinity, -Infinity, -Infinity ];
        chain.forEach(function(m) {
          var b = m.mesh.geometry.boundingBox;
          rect[0] = Math.min(rect[0], b.min.x);
          rect[1] = Math.min(rect[1], b.min.z);
          rect[2] = Math.max(rect[2], b.max.x);
          rect[3] = Math.max(rect[3], b.max.z);
        });
        var path = [], lastY = Infinity;
        chain.forEach(function(m) {
          var y = topY(m), c = centerOf(m);
          if (Math.abs(y - lastY) < 0.1 && path.length) {
            path[path.length - 1].lerp(new THREE.Vector3(c.x, y + lift, c.z), 0.5);
          } else {
            path.push(new THREE.Vector3(c.x, y + lift, c.z));
            lastY = y;
          }
        });
        var upMouth = path[0].clone(), lowMouth = path[path.length - 1].clone();
        var link = {
          lower: L.id,
          upper: U.id,
          items: chain,
          path: path,
          rect: rect,
          upMouth: upMouth,
          lowMouth: lowMouth,
          entry: openNear(U.id, upMouth, rect),
          exit: openNear(L.id, lowMouth, rect),
          mid: new THREE.Vector3((rect[0] + rect[2]) / 2, (upMouth.y + lowMouth.y) / 2, (rect[1] + rect[3]) / 2)
        };
        stairLinks.push(link);
        chain.forEach(function(m) {
          m.link = link;
          m.floors = [ L.id, U.id ];
        });
      }
      var rest = items.filter(function(m) {
        return used.indexOf(m) < 0;
      });
      var above = rest.filter(function(m) {
        return topY(m) > topDeck + 1.5;
      });
      var below = rest.filter(function(m) {
        return topY(m) < botDeck - 1.0;
      });
      function mean(arr) {
        var c = new THREE.Vector3;
        arr.forEach(function(m) {
          c.add(centerOf(m));
        });
        return c.multiplyScalar(1 / arr.length);
      }
      if (above.length) {
        var a = mean(above);
        a.y = topDeck;
        stairEnds.push({
          floor: floors[floors.length - 1].id,
          dir: "up",
          at: a,
          items: above
        });
        above.forEach(function(m) {
          m.beyond = "up";
        });
      }
      if (below.length) {
        var b2 = mean(below);
        b2.y = botDeck;
        stairEnds.push({
          floor: floors[0].id,
          dir: "down",
          at: b2,
          items: below
        });
        below.forEach(function(m) {
          m.beyond = "down";
        });
      }
    });
    stairLinks.forEach(function(link) {
      var u = stairHole[link.upper];
      if (u) {
        u.uHoleOn.value = 1;
        u.uHole.value.set(link.rect[0], link.rect[1], link.rect[2], link.rect[3]);
      }
    });
  }
  function stairTo(px, py) {
    if (!renderer || !camera || floorBusy || floors.length < 2) {
      return null;
    }
    if (!raycaster) {
      raycaster = new THREE.Raycaster;
    }
    var w = view.clientWidth || 1, h = view.clientHeight || 1;
    raycaster.setFromCamera(new THREE.Vector2(px / w * 2 - 1, -(py / h) * 2 + 1), camera);
    var list = [];
    meshes.forEach(function(item) {
      if (item.key !== "stairs") {
        return;
      }
      var on = item.floors ? item.floors.indexOf(floorNow) >= 0 : item.floor === floorNow;
      if (on) {
        list.push(item.mesh);
      }
    });
    var found = list.length ? raycaster.intersectObjects(list, false)[0] : null;
    if (!found) {
      return null;
    }
    var owner = null;
    for (var i = 0; i < meshes.length; i += 1) {
      if (meshes[i].mesh === found.object) {
        owner = meshes[i];
        break;
      }
    }
    if (!owner || !owner.link) {
      return null;
    }
    var link = owner.link;
    return {
      floor: link.upper === floorNow ? link.lower : link.upper,
      at: link.upper === floorNow ? link.upMouth : link.lowMouth
    };
  }
  function syncStairTags() {
    if (!OPT.stairTags || !stairLinks.length) {
      stairTagBox.forEach(function(n) {
        n.hidden = true;
      });
      return;
    }
    var want = [];
    stairLinks.forEach(function(link) {
      var dn = floorOf(link.lower).deck < floorOf(link.upper).deck;
      if (floorNow === link.upper) {
        want.push({
          at: link.upMouth,
          text: (dn ? "↓ " : "↑ ") + link.lower,
          kind: "go"
        });
      }
      if (floorNow === link.lower) {
        want.push({
          at: link.lowMouth,
          text: (dn ? "↑ " : "↓ ") + link.upper,
          kind: "go"
        });
      }
    });
    while (stairTagBox.length < want.length) {
      var n = document.createElement("div");
      n.className = "stair-tag";
      n.hidden = true;
      hit.appendChild(n);
      stairTagBox.push(n);
    }
    stairTagBox.forEach(function(n, i) {
      var w = want[i];
      n.hidden = !w || floorBusy || zoom < 1.4;
      if (!w) {
        return;
      }
      n.textContent = w.text;
      n.classList.toggle("is-off", w.kind === "off");
      put(n, w.at);
    });
  }
  function resample(points, step) {
    var out = [ points[0].clone() ];
    for (var i = 1; i < points.length; i += 1) {
      var a = points[i - 1], b = points[i], d = a.distanceTo(b);
      var n = Math.max(1, Math.ceil(d / step));
      for (var k = 1; k <= n; k += 1) {
        out.push(a.clone().lerp(b, k / n));
      }
    }
    return out;
  }
  function miles(points) {
    var m = [ 0 ];
    for (var i = 1; i < points.length; i += 1) {
      m.push(m[i - 1] + points[i].distanceTo(points[i - 1]));
    }
    return m;
  }
  function pointAt(pts, mi, s) {
    if (s <= 0) {
      return pts[0].clone();
    }
    var n = pts.length - 1;
    if (s >= mi[n]) {
      return pts[n].clone();
    }
    var lo = 0, hi = n;
    while (hi - lo > 1) {
      var md = lo + hi >> 1;
      if (mi[md] <= s) {
        lo = md;
      } else {
        hi = md;
      }
    }
    return pts[lo].clone().lerp(pts[hi], (s - mi[lo]) / Math.max(1e-6, mi[hi] - mi[lo]));
  }
  function lanePart(points, s0, bot, floor) {
    var pts = resample(points, 0.35);
    var mi = miles(pts);
    var done = strand(pts, bot.done, false);
    var left = strand(pts.slice().reverse(), bot.left, true);
    return {
      pts: pts,
      mi: mi,
      s0: s0,
      len: mi[mi.length - 1],
      done: done,
      left: left,
      floor: floor
    };
  }
  function showPart(part, s) {
    var n = part.pts.length - 1;
    var k = Math.max(0, Math.min(n, Math.round(n * (s - part.s0) / Math.max(1e-6, part.len))));
    part.done.geometry.instanceCount = k;
    part.left.geometry.instanceCount = n - k;
  }
  function travelBuild(up, low, tour) {
    var box = modelBox, size = box.getSize(new THREE.Vector3);
    function world(fx, fz) {
      return new THREE.Vector3(box.min.x + fx * size.x, 0, box.min.z + fz * size.z);
    }
    var bot = ROBOTS[Number(CROSS_ID)];
    var flights = stairLinks.filter(function(l) {
      return l.upper === up && l.lower === low;
    });
    if (!flights.length) {
      return null;
    }
    var dest = bot.stops.slice(1).map(function(s) {
      return world(s[0], s[1]);
    });
    var flight = flights.reduce(function(a, b) {
      return b.exit.distanceTo(dest[0]) < a.exit.distanceTo(dest[0]) ? b : a;
    });
    var start = flight.entry.clone().add(new THREE.Vector3(14, 0, -10));
    var via = (tour || []).map(function(q) {
      return world(q[0], q[1]);
    });
    if (via.length) {
      start = via.shift();
    }
    var aPts = routeOnNav(up, [ start ].concat(via).concat([ flight.entry ]));
    var sPts = [ flight.entry ].concat(flight.path.map(function(q) {
      return q.clone();
    })).concat([ flight.exit ]);
    var bPts = routeOnNav(low, [ flight.exit ].concat(dest));
    if (!aPts || !bPts) {
      return null;
    }
    aPts[aPts.length - 1] = flight.entry.clone();
    bPts[0] = flight.exit.clone();
    var A = lanePart(aPts, 0, bot, up);
    var S = lanePart(sPts, A.len, bot, "stair");
    var B = lanePart(bPts, A.len + S.len, bot, low);
    var here = aPts[0].clone();
    var fan = viewFan(bot, here, 1, 0);
    var parts = [ A.done, A.left, S.done, S.left, B.done, B.left, fan ];
    parts.forEach(function(p) {
      p.visible = false;
      scene.add(p);
    });
    var lane = {
      id: CROSS_ID,
      bot: bot,
      parts: parts,
      travel: true,
      floor: up,
      here: here,
      ahead: here.clone(),
      turns: B.pts,
      mile: B.mi,
      total: B.len
    };
    return {
      up: up,
      low: low,
      flight: flight,
      lane: lane,
      segs: [ A, S, B ],
      fan: fan,
      s: 0,
      s1: A.len,
      s2: A.len + S.len,
      s3: A.len + S.len + B.len,
      phase: "walk",
      dwell: 0,
      floor: up,
      t: 0,
      down: floorOf(low).deck < floorOf(up).deck,
      backup: lanes[CROSS_ID],
      seen: false,
      onStairs: false,
      shrinkAt: 0,
      badgeAt: 0,
      arriveAt: 0,
      gridY0: 0,
      followFrom: 0
    };
  }
  var travDom = null;
  function travelDom() {
    if (travDom) {
      return travDom;
    }
    function el(cls, html) {
      var n = document.createElement("div");
      n.className = cls;
      n.hidden = true;
      n.innerHTML = html || "";
      hit.appendChild(n);
      return n;
    }
    travDom = {
      pill: el("tr-pill", "<i></i><span>" + ROBOTS[Number(CROSS_ID)].name + "</span>"),
      badge: el("tr-badge"),
      chip: el("tr-chip")
    };
    return travDom;
  }
  function onCanvas(world) {
    var v = view.getBoundingClientRect(), c = hit.getBoundingClientRect();
    var a = world.clone().project(camera);
    return {
      x: (a.x * 0.5 + 0.5) * v.width + v.left - c.left,
      y: (-a.y * 0.5 + 0.5) * v.height + v.top - c.top
    };
  }
  function put(node, world, dy) {
    var p = onCanvas(world);
    node.style.left = snapPx(p.x);
    node.style.top = snapPx(p.y + (dy || 0));
  }
  function arrow() {
    return trav.down ? "↓" : "↑";
  }
  function tellFloorRobots(now) {
    if (!trav) {
      return;
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
      var id = btn.getAttribute("data-map-floor");
      var arriving = id === trav.low && trav.arriveAt && now - trav.arriveAt < TRAVEL.BADGE + TRAVEL.SHRINK;
      btn.classList.toggle("is-arriving", !!arriving);
      btn.setAttribute("data-arrow", arriving ? arrow() : "");
      btn.classList.toggle("is-moving", id === trav.low && trav.onStairs);
    });
  }
  function clearFloorRobots() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-floor]"), function(btn) {
      btn.removeAttribute("data-arrow");
      btn.classList.remove("is-arriving", "is-moving");
    });
  }
  function ping() {
    var list = [];
    if (travDom && !travDom.pill.hidden) {
      list.push(travDom.pill);
    }
    if (botBox) {
      list.push(botBox);
    }
    list.forEach(function(n) {
      n.classList.remove("is-ping");
      void n.offsetWidth;
      n.classList.add("is-ping");
    });
    window.setTimeout(function() {
      list.forEach(function(n) {
        n.classList.remove("is-ping");
      });
    }, 1800);
  }
  function arrivalOverview(duration) {
    if (!OPT.arriveOverview || !renderer || !home) {
      return;
    }
    var overviewMs = duration || 320;
    var backZoom = zoom;
    clearFocus();
    unwind(yaw);
    glide(yaw, pitch, 1, home.clone(), overviewMs);
    window.setTimeout(ping, overviewMs + 20);
    if (trav && onLane === trav.lane) {
      var hold = overviewMs + TRAVEL.OVERVIEW;
      trav.followFrom = Date.now() + hold + 420;
      window.setTimeout(function() {
        if (trav && onLane === trav.lane) {
          glide(yaw, pitch, Math.max(backZoom, 2.2), trav.lane.here.clone());
        }
      }, hold);
    }
  }
  function travelSync() {
    if (!trav) {
      return;
    }
    var now = Date.now();
    var d = travelDom();
    var tracked = onLane === trav.lane;
    var both = trav.onStairs;
    trav.segs.forEach(function(part) {
      var stairOn = trav.phase === "walk" || trav.phase === "stair" || trav.phase === "dwell";
      var on = tracked && (part.floor === "stair" ? stairOn : part.floor === floorNow);
      part.done.visible = on;
      part.left.visible = on;
    });
    trav.fan.visible = tracked && (trav.floor === floorNow || trav.floor === "stair" || both);
    if (tracked) {
      wpMarks.forEach(function(m) {
        m.visible = floorNow === (m.userData.floor || trav.low);
      });
      if (wpHalo) {
        wpHalo.visible = floorNow === (wpHalo.userData.floor || trav.low);
      }
    }
    var chipOn = tracked && trav.phase === "stair";
    d.chip.hidden = !chipOn;
    if (chipOn) {
      d.chip.textContent = trav.up + " → " + trav.low + " 이동 중";
      put(d.chip, trav.lane.here, -38 * Math.min(2.8, Math.max(1, Math.pow(zoom, 0.7))));
    }
    var shrinking = trav.shrinkAt && now - trav.shrinkAt < TRAVEL.SHRINK;
    var visible = !tracked && trav.floor === floorNow && trav.phase !== "stair";
    var showPill = !tracked && (visible || shrinking && floorNow === trav.up);
    if (showPill && !visible) {
      d.pill.classList.add("is-shrink");
    } else {
      d.pill.classList.remove("is-shrink");
      if (visible && d.pill.hidden) {
        d.pill.classList.remove("is-appear");
        void d.pill.offsetWidth;
        d.pill.classList.add("is-appear");
      }
    }
    d.pill.hidden = !showPill;
    if (showPill) {
      d.pill.style.setProperty("--tint", "#" + ("00000" + (trav.lane.bot.mark || trav.lane.bot.done).toString(16)).slice(-6));
      put(d.pill, shrinking && !visible ? trav.flight.upMouth : trav.lane.here);
    }
    var badgeOn = !tracked && trav.badgeAt && now >= trav.badgeAt && now - trav.badgeAt < TRAVEL.BADGE && floorNow === trav.up;
    d.badge.hidden = !badgeOn;
    if (badgeOn) {
      d.badge.textContent = arrow() + " " + trav.low + " 이동";
      d.badge.style.setProperty("--tint", "#" + ("00000" + (trav.lane.bot.mark || trav.lane.bot.done).toString(16)).slice(-6));
      d.badge.classList.toggle("is-leaving", now - trav.badgeAt > TRAVEL.BADGE - 400);
      put(d.badge, trav.flight.upMouth);
    }
    tellFloorRobots(now);
  }
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function where(s) {
    var seg = s < trav.s1 ? trav.segs[0] : s < trav.s2 ? trav.segs[1] : trav.segs[2];
    return pointAt(seg.pts, seg.mi, s - seg.s0);
  }
  function beginStairMove() {
    trav.onStairs = true;
    floorBusy = true;
    clearFocus();
    floorFade[trav.up] = 1;
    floorFade[trav.low] = 0;
    trav.gridY0 = gridMesh ? gridMesh.position.y : 0;
    trav.homeY0 = home.y;
  }
  function stepStairMove(u) {
    u = Math.max(0, Math.min(1, u));
    var rise = floorOf(trav.low).deck - floorOf(trav.up).deck;
    if (gridMesh) {
      gridMesh.position.y = trav.gridY0 + rise * ease(u);
    }
    if (u >= 0.5 && floorNow !== trav.low) {
      floorFade[trav.up] = 0;
      floorFade[trav.low] = 1;
      floorNow = trav.low;
      tellFloor();
      meshes.forEach(paintOne);
    }
  }
  function endStairMove() {
    if (!trav || !trav.onStairs) {
      return;
    }
    var rise = floorOf(trav.low).deck - floorOf(trav.up).deck;
    trav.onStairs = false;
    floorFade[trav.up] = 0;
    floorFade[trav.low] = 1;
    if (gridMesh) {
      gridMesh.position.y = trav.gridY0 + rise;
    }
    if (floorNow !== trav.low) {
      floorNow = trav.low;
      tellFloor();
    }
    var to = floorOf(trav.low);
    home = to.center.clone();
    home.y = trav.homeY0 + rise;
    fitFloorKeepingView();
    floorBusy = false;
    meshes.forEach(paintOne);
    if (floorNext) {
      var q = floorNext;
      floorNext = "";
      goFloor(q, "button");
    }
  }
  var travLast = 0;
  function travelTick() {
    if (!trav) {
      return;
    }
    var nowT = window.performance ? performance.now() : Date.now();
    var dt = Math.min(0.1, (nowT - travLast) / 1000);
    travLast = nowT;
    var now = Date.now();
    var tracked = onLane === trav.lane;
    var before = trav.s;
    if (trav.phase === "dwell") {
      trav.dwell -= dt;
      if (trav.dwell <= 0) {
        trav.phase = "walk2";
      }
    } else if (trav.phase !== "done") {
      trav.s += dt * (trav.phase === "stair" ? TRAVEL.STAIR_SPEED : TRAVEL.SPEED);
    }
    if (before < trav.s1 && trav.s >= trav.s1) {
      trav.s = trav.s1;
      trav.phase = "stair";
      trav.arriveAt = now;
      if (tracked) {
        beginStairMove();
      } else if (floorNow === trav.up) {
        trav.shrinkAt = now;
        trav.badgeAt = now + TRAVEL.SHRINK;
      }
    }
    if (trav.phase === "stair" && trav.s >= trav.s2) {
      trav.s = trav.s2;
      trav.phase = "dwell";
      trav.dwell = TRAVEL.DWELL;
      endStairMove();
    }
    if (trav.phase === "walk2" && trav.s >= trav.s3) {
      trav.s = trav.s3;
      trav.phase = "done";
    }
    trav.floor = trav.phase === "walk" ? trav.up : trav.phase === "stair" ? "stair" : trav.low;
    trav.lane.floor = trav.floor;
    if (tracked && trav.floor !== "stair" && trav.floor !== trav.saidFloor) {
      trav.saidFloor = trav.floor;
      document.dispatchEvent(new CustomEvent("aprism:robot-floor", {
        detail: {
          floor: trav.floor
        }
      }));
    }
    var here = where(trav.s);
    var ahead = where(Math.min(trav.s3, trav.s + 1.5));
    if (ahead.distanceTo(here) < 1e-3) {
      ahead = here.clone().add(trav.lane.ahead.clone().sub(trav.lane.here));
    }
    trav.lane.here.copy(here);
    trav.lane.ahead.copy(ahead);
    trav.segs.forEach(function(part) {
      showPart(part, trav.s);
    });
    trav.fan.position.copy(here);
    trav.fan.position.y += span * 0.002;
    trav.fan.rotation.y = Math.atan2(ahead.x - here.x, ahead.z - here.z);
    tellHeading();
    if (trav.onStairs) {
      stepStairMove((trav.s - trav.s1) / Math.max(1e-6, trav.s2 - trav.s1));
    }
    if (tracked) {
      if (trav.floor !== "stair" && trav.floor !== floorNow && !floorBusy) {
        goFloor(trav.floor, "button");
      } else if (now > trav.followFrom && !down.length) {
        target.lerp(here, 1 - Math.pow(0.002, dt));
      }
    }
    plan();
    frame();
    if (trav.phase !== "done" || trav.badgeAt && now - trav.badgeAt < TRAVEL.BADGE + 500) {
      window.requestAnimationFrame(travelTick);
    } else {
      trav.running = false;
    }
  }
  function travelReset() {
    if (!trav) {
      return;
    }
    if (trav.onStairs) {
      endStairMove();
    }
    trav.lane.parts.forEach(function(p) {
      scene.remove(p);
    });
    lanes[CROSS_ID] = trav.backup;
    if (travDom) {
      travDom.pill.hidden = travDom.badge.hidden = travDom.chip.hidden = true;
    }
    clearFloorRobots();
    var was = onLane === trav.lane;
    trav = null;
    if (was) {
      onLane = null;
    }
    layRobots();
    plan();
  }
  var CROSS_ID = "4";
  var CROSS = {
    up: "B3",
    low: "B4",
    split: 12,
    atLow: 0.18,
    tour: [ [ 0.62, 0.30 ], [ 0.30, 0.30 ], [ 0.20, 0.55 ], [ 0.45, 0.70 ], [ 0.70, 0.62 ] ]
  };
  function rrTravel(ln) {
    if (!ln || !ln.segs) {
      return;
    }
    var blue = ln.bot.left;
    ln.segs.forEach(function(sg) {
      rrStyle(sg.done, blue, 0.8, 2);
      rrForm(sg.done, true);
      rrStyle(sg.left, blue, rrAheadA(), 4);
      rrForm(sg.left, false);
    });
  }
  function crossLane() {
    if (!document.body.classList.contains("v2-2") || floors.length < 2 || trav) {
      return;
    }
    var built = travelBuild(CROSS.up, CROSS.low, CROSS.tour);
    if (!built) {
      return;
    }
    trav = built;
    lanes[CROSS_ID] = built.lane;
    built.lane.segs = built.segs;
    built.lane.split = CROSS.split;
    trav.s = built.s2 + (built.s3 - built.s2) * CROSS.atLow;
    trav.phase = "walk2";
    trav.floor = CROSS.low;
    trav.saidFloor = CROSS.low;
    built.lane.floor = CROSS.low;
    var here = where(trav.s), ahead = where(Math.min(trav.s3, trav.s + 1.5));
    built.lane.here.copy(here);
    built.lane.ahead.copy(ahead);
    built.segs.forEach(function(part) {
      showPart(part, trav.s);
    });
    built.fan.position.copy(here);
    built.fan.position.y += span * 0.002;
    built.fan.rotation.y = Math.atan2(ahead.x - here.x, ahead.z - here.z);
  }
  function travelStart(tracked) {
    if (!renderer || floors.length < 2) {
      return;
    }
    travelReset();
    var up = "B3", low = "B4";
    var built = travelBuild(up, low);
    if (!built) {
      return;
    }
    trav = built;
    lanes[CROSS_ID] = trav.lane;
    if (trav.backup) {
      trav.backup.parts.forEach(function(p) {
        p.visible = false;
      });
    }
    function go() {
      if (floorBusy) {
        window.setTimeout(go, 60);
        return;
      }
      var card = document.querySelector(".robot-strip .robot-card[data-robot='" + (tracked ? CROSS_ID : "0") + "']");
      if (tracked) {
        if (card) {
          card.click();
        }
        glide(yaw, pitch, Math.max(zoom, 2.2), trav.lane.here.clone());
      } else {
        if (card && activeRobot() === CROSS_ID) {
          var keep = target.clone();
          card.click();
          trip = null;
          target.copy(keep);
        }
        layRobots();
        glide(yaw, pitch, Math.max(zoom, 2), trav.lane.here.clone().lerp(trav.flight.entry, 0.5));
      }
      trav.followFrom = Date.now() + 400;
      travLast = window.performance ? performance.now() : Date.now();
      if (!trav.running) {
        trav.running = true;
        window.requestAnimationFrame(travelTick);
      }
    }
    if (floorNow !== up) {
      goFloor(up, "button");
    }
    go();
  }
  window.APRISM_TRAVEL = {
    start: travelStart,
    reset: travelReset,
    config: TRAVEL,
    state: function() {
      return trav && {
        phase: trav.phase,
        floor: trav.floor,
        s: trav.s,
        s1: trav.s1,
        s2: trav.s2,
        s3: trav.s3,
        tracked: onLane === trav.lane,
        floorNow: floorNow,
        onStairs: trav.onStairs
      };
    }
  };
  var NAV = {
    unit: 1,
    raster: 0.25,
    cell: 0.5,
    radius: 0.4,
    safety: 0.2,
    height: 1.5,
    lift: 0.02,
    turn45: 0.6,
    turn90: 1.4,
    turn135: 4
  };
  var navByFloor = {};
  var routeLog = [];
  function deckOf(fid) {
    var f = floorOf(fid);
    return f ? f.deck : floorY;
  }
  function toWorld(X, Y, fid, lift) {
    return new THREE.Vector3(modelBox.min.x + X / NAV.unit, deckOf(fid) + (lift || 0) / NAV.unit, modelBox.max.z - Y / NAV.unit);
  }
  function toPlan(v) {
    return {
      X: (v.x - modelBox.min.x) * NAV.unit,
      Y: (modelBox.max.z - v.z) * NAV.unit
    };
  }
  function buildNav(fid) {
    var r = NAV.raster;
    var Wm = (modelBox.max.x - modelBox.min.x) * NAV.unit, Hm = (modelBox.max.z - modelBox.min.z) * NAV.unit;
    var cw = Math.ceil(Wm / r), ch = Math.ceil(Hm / r);
    var solid = new Uint8Array(cw * ch);
    var deck = deckOf(fid), low = deck + 0.05 / NAV.unit, high = deck + NAV.height / NAV.unit;
    meshes.forEach(function(item) {
      if (item.key === "floor") {
        return;
      }
      var on = item.floors ? item.floors.indexOf(fid) >= 0 : !item.floor || item.floor === fid;
      if (!on) {
        return;
      }
      var bb = item.mesh.geometry.boundingBox;
      if (bb.max.y < low || bb.min.y > high) {
        return;
      }
      var pos = item.mesh.geometry.attributes.position, idx = item.mesh.geometry.index;
      var count = idx ? idx.count : pos.count;
      for (var t = 0; t + 2 < count; t += 3) {
        var lox = Infinity, hix = -Infinity, loz = Infinity, hiz = -Infinity, loy = Infinity, hiy = -Infinity;
        for (var k = 0; k < 3; k += 1) {
          var v = idx ? idx.getX(t + k) : t + k;
          var x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
          if (x < lox) {
            lox = x;
          }
          if (x > hix) {
            hix = x;
          }
          if (z < loz) {
            loz = z;
          }
          if (z > hiz) {
            hiz = z;
          }
          if (y < loy) {
            loy = y;
          }
          if (y > hiy) {
            hiy = y;
          }
        }
        if (hiy < low || loy > high) {
          continue;
        }
        var c0 = Math.max(0, Math.floor((lox - modelBox.min.x) * NAV.unit / r));
        var c1 = Math.min(cw - 1, Math.floor((hix - modelBox.min.x) * NAV.unit / r));
        var r0 = Math.max(0, Math.floor((modelBox.max.z - hiz) * NAV.unit / r));
        var r1 = Math.min(ch - 1, Math.floor((modelBox.max.z - loz) * NAV.unit / r));
        for (var rr = r0; rr <= r1; rr += 1) {
          for (var cc = c0; cc <= c1; cc += 1) {
            solid[rr * cw + cc] = 1;
          }
        }
      }
    });
    for (var c = 0; c < cw; c += 1) {
      solid[c] = 1;
      solid[(ch - 1) * cw + c] = 1;
    }
    for (var q = 0; q < ch; q += 1) {
      solid[q * cw] = 1;
      solid[q * cw + cw - 1] = 1;
    }
    var d = new Float32Array(cw * ch), D1 = r, D2 = r * Math.SQRT2, i, j, p;
    for (i = 0; i < d.length; i += 1) {
      d[i] = solid[i] ? 0 : 1e9;
    }
    for (j = 0; j < ch; j += 1) {
      for (i = 0; i < cw; i += 1) {
        p = j * cw + i;
        if (!d[p]) {
          continue;
        }
        if (i > 0) {
          d[p] = Math.min(d[p], d[p - 1] + D1);
        }
        if (j > 0) {
          d[p] = Math.min(d[p], d[p - cw] + D1);
          if (i > 0) {
            d[p] = Math.min(d[p], d[p - cw - 1] + D2);
          }
          if (i < cw - 1) {
            d[p] = Math.min(d[p], d[p - cw + 1] + D2);
          }
        }
      }
    }
    for (j = ch - 1; j >= 0; j -= 1) {
      for (i = cw - 1; i >= 0; i -= 1) {
        p = j * cw + i;
        if (!d[p]) {
          continue;
        }
        if (i < cw - 1) {
          d[p] = Math.min(d[p], d[p + 1] + D1);
        }
        if (j < ch - 1) {
          d[p] = Math.min(d[p], d[p + cw] + D1);
          if (i < cw - 1) {
            d[p] = Math.min(d[p], d[p + cw + 1] + D2);
          }
          if (i > 0) {
            d[p] = Math.min(d[p], d[p + cw - 1] + D2);
          }
        }
      }
    }
    return {
      fid: fid,
      cw: cw,
      ch: ch,
      dist: d,
      ni: Math.floor(Wm / NAV.cell) + 1,
      nj: Math.floor(Hm / NAV.cell) + 1
    };
  }
  function navOf(fid) {
    return navByFloor[fid] || (navByFloor[fid] = buildNav(fid));
  }
  function clearAt(nav, i, j) {
    var c = Math.min(nav.cw - 1, Math.floor(i * NAV.cell / NAV.raster));
    var r = Math.min(nav.ch - 1, Math.floor(j * NAV.cell / NAV.raster));
    return nav.dist[r * nav.cw + c] - NAV.raster / 2;
  }
  function snapNode(nav, P, need) {
    var i0 = Math.round(P.X / NAV.cell), j0 = Math.round(P.Y / NAV.cell);
    for (var ring = 0; ring < 40; ring += 1) {
      var best = null, bd = Infinity;
      for (var dj = -ring; dj <= ring; dj += 1) {
        for (var di = -ring; di <= ring; di += 1) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) {
            continue;
          }
          var i = i0 + di, j = j0 + dj;
          if (i < 0 || j < 0 || i >= nav.ni || j >= nav.nj) {
            continue;
          }
          if (clearAt(nav, i, j) < need) {
            continue;
          }
          var dd = di * di + dj * dj;
          if (dd < bd) {
            bd = dd;
            best = [ i, j ];
          }
        }
      }
      if (best) {
        return best;
      }
    }
    return [ i0, j0 ];
  }
  var DIRS = [ [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ -1, 1 ], [ -1, 0 ], [ -1, -1 ], [ 0, -1 ], [ 1, -1 ] ];
  function astar(nav, s, g, need) {
    var ni = nav.ni, nj = nav.nj, N = ni * nj;
    var cost = new Float32Array(N * 9).fill(Infinity);
    var from = new Int32Array(N * 9).fill(-1);
    var heapF = [], heapS = [];
    function push(f, st) {
      heapF.push(f);
      heapS.push(st);
      var k = heapF.length - 1;
      while (k > 0) {
        var up = k - 1 >> 1;
        if (heapF[up] <= heapF[k]) {
          break;
        }
        var tf = heapF[up];
        heapF[up] = heapF[k];
        heapF[k] = tf;
        var ts = heapS[up];
        heapS[up] = heapS[k];
        heapS[k] = ts;
        k = up;
      }
    }
    function pop() {
      var top = heapS[0], lf = heapF.pop(), ls = heapS.pop();
      if (heapF.length) {
        heapF[0] = lf;
        heapS[0] = ls;
        var k = 0;
        for (;;) {
          var a = 2 * k + 1, b = a + 1, m = k;
          if (a < heapF.length && heapF[a] < heapF[m]) {
            m = a;
          }
          if (b < heapF.length && heapF[b] < heapF[m]) {
            m = b;
          }
          if (m === k) {
            break;
          }
          var tf = heapF[m];
          heapF[m] = heapF[k];
          heapF[k] = tf;
          var ts = heapS[m];
          heapS[m] = heapS[k];
          heapS[k] = ts;
          k = m;
        }
      }
      return top;
    }
    function h(i, j) {
      var dx = Math.abs(i - g[0]), dy = Math.abs(j - g[1]);
      return NAV.cell * (Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy));
    }
    var free = function(i, j) {
      return i >= 0 && j >= 0 && i < ni && j < nj && clearAt(nav, i, j) >= need;
    };
    var TURN = [ 0, NAV.turn45, NAV.turn90, NAV.turn135, Infinity ];
    var st0 = (s[1] * ni + s[0]) * 9 + 8;
    cost[st0] = 0;
    push(h(s[0], s[1]), st0);
    var goal = -1, guard = 0;
    while (heapF.length && guard < 4e6) {
      guard += 1;
      var st = pop(), node = st / 9 | 0, dir = st % 9;
      var i = node % ni, j = (node - i) / ni;
      if (i === g[0] && j === g[1]) {
        goal = st;
        break;
      }
      var base = cost[st];
      for (var k = 0; k < 8; k += 1) {
        var turn = 0;
        if (dir !== 8) {
          var dd = Math.abs(dir - k);
          turn = TURN[Math.min(dd, 8 - dd)];
        }
        if (turn === Infinity) {
          continue;
        }
        var ii = i + DIRS[k][0], jj = j + DIRS[k][1];
        if (!free(ii, jj)) {
          continue;
        }
        if (k & 1 && (!free(i + DIRS[k][0], j) || !free(i, j + DIRS[k][1]))) {
          continue;
        }
        var nst = (jj * ni + ii) * 9 + k;
        var nc = base + NAV.cell * (k & 1 ? Math.SQRT2 : 1) + turn;
        if (nc < cost[nst]) {
          cost[nst] = nc;
          from[nst] = st;
          push(nc + h(ii, jj), nst);
        }
      }
    }
    if (goal < 0) {
      return null;
    }
    var out = [];
    for (var w = goal; w >= 0; w = from[w]) {
      var nd = w / 9 | 0, x = nd % ni;
      out.push([ x, (nd - x) / ni ]);
    }
    return out.reverse();
  }
  function straighten(nodes) {
    if (nodes.length < 3) {
      return nodes.slice();
    }
    var out = [ nodes[0] ];
    for (var i = 1; i < nodes.length - 1; i += 1) {
      var a = out[out.length - 1], b = nodes[i], c = nodes[i + 1];
      var d1x = Math.sign(b[0] - a[0]), d1y = Math.sign(b[1] - a[1]);
      var d2x = Math.sign(c[0] - b[0]), d2y = Math.sign(c[1] - b[1]);
      if (d1x !== d2x || d1y !== d2y) {
        out.push(b);
      }
    }
    out.push(nodes[nodes.length - 1]);
    return out;
  }
  var ROUTE_MEMO = "aprism-v6-route|" + (window.APRISM_MAP_GLB ? window.APRISM_MAP_GLB.length : 0) + "|" + JSON.stringify(NAV) + "|";
  function planChain(fid, pts, closed, names) {
    var key = ROUTE_MEMO + fid + "|" + (closed ? 1 : 0) + "|" + pts.map(function(P) {
      return P.X.toFixed(3) + "," + P.Y.toFixed(3);
    }).join(";") + "|" + (names ? names.join(",") : "");
    try {
      var hit = window.localStorage.getItem(key);
      if (hit) {
        var o = JSON.parse(hit);
        o.log.forEach(function(l) {
          routeLog.push(l);
        });
        return {
          path: o.path,
          stops: o.stops,
          reduced: o.reduced
        };
      }
    } catch (e) {}
    var n0 = routeLog.length, res = planChain0(fid, pts, closed, names);
    try {
      window.localStorage.setItem(key, JSON.stringify({
        path: res.path,
        stops: res.stops,
        reduced: res.reduced,
        log: routeLog.slice(n0)
      }));
    } catch (e) {}
    return res;
  }
  function planChain0(fid, pts, closed, names) {
    var nav = navOf(fid);
    var need = NAV.radius + NAV.safety;
    var stops = pts.map(function(P, k) {
      var n = snapNode(nav, P, need);
      var S = {
        X: n[0] * NAV.cell,
        Y: n[1] * NAV.cell,
        Z: 0
      };
      var moved = Math.hypot(S.X - P.X, S.Y - P.Y);
      if (moved > 0.01) {
        routeLog.push((names ? names[k] : "점 " + k) + " 좌표 보정 " + moved.toFixed(2) + " m (장애물 여유 안쪽)");
      }
      return S;
    });
    var order = closed ? stops.concat([ stops[0] ]) : stops;
    var nodes = [], reduced = [];
    for (var k = 0; k < order.length - 1; k += 1) {
      var a = [ Math.round(order[k].X / NAV.cell), Math.round(order[k].Y / NAV.cell) ];
      var b = [ Math.round(order[k + 1].X / NAV.cell), Math.round(order[k + 1].Y / NAV.cell) ];
      var leg = astar(nav, a, b, need);
      if (!leg) {
        leg = astar(nav, a, b, NAV.radius) || astar(nav, a, b, 0);
        reduced.push(k);
        routeLog.push((names ? names[k] + " → " + (names[k + 1] || names[0]) : "구간 " + k) + (leg ? " : 안전거리 미확보(반경만 지킴)" : " : 길 없음 — 직선으로 둠"));
      }
      leg = leg || [ a, b ];
      nodes = nodes.concat(nodes.length ? leg.slice(1) : leg);
    }
    var path = straighten(nodes).map(function(n) {
      return {
        X: n[0] * NAV.cell,
        Y: n[1] * NAV.cell,
        Z: 0
      };
    });
    return {
      path: path,
      stops: stops,
      reduced: reduced
    };
  }
  var ROBOT_WPS = {};
  function planRobot(bot, id) {
    if (!modelBox) {
      return null;
    }
    var size = modelBox.getSize(new THREE.Vector3);
    function frac(f) {
      return {
        X: f[0] * size.x * NAV.unit,
        Y: (1 - f[1]) * size.z * NAV.unit
      };
    }
    var fid = bot.floor || ROBOT_ON;
    var dock = frac(bot.dock);
    var count = railWaypoints().length || WAYPOINTS;
    var names = [ "DOCK" ];
    for (var n = 1; n <= count; n += 1) {
      names.push("WP-" + ("0" + n).slice(-2));
    }
    var wps = ROBOT_WPS[id];
    if (!wps) {
      var seed = planChain(fid, [ dock ].concat(bot.stops.map(frac)), true, null);
      var mi = [ 0 ];
      for (var s = 1; s < seed.path.length; s += 1) {
        mi.push(mi[s - 1] + Math.hypot(seed.path[s].X - seed.path[s - 1].X, seed.path[s].Y - seed.path[s - 1].Y));
      }
      var total = mi[mi.length - 1];
      wps = [];
      for (var k = 1; k <= count; k += 1) {
        var far = total * k / (count + 1), a = 1;
        while (a < mi.length - 1 && mi[a] < far) {
          a += 1;
        }
        var t = (far - mi[a - 1]) / Math.max(1e-6, mi[a] - mi[a - 1]);
        var P = seed.path[a - 1], Q = seed.path[a];
        wps.push([ Math.round((P.X + (Q.X - P.X) * t) / NAV.cell) * NAV.cell, Math.round((P.Y + (Q.Y - P.Y) * t) / NAV.cell) * NAV.cell ]);
      }
      routeLog.push(bot.name + " 웨이포인트 " + count + "개는 씨앗 좌표(ROBOT_WPS 비어 있음)");
    }
    var pts = [ dock ].concat(wps.map(function(w) {
      return {
        X: w[0],
        Y: w[1]
      };
    }));
    var res = planChain(fid, pts, true, names);
    var lift = NAV.lift;
    return {
      fid: fid,
      names: names,
      dockPlan: res.stops[0],
      wpPlan: res.stops.slice(1),
      pathPlan: res.path,
      reduced: res.reduced,
      world: res.path.map(function(q) {
        return toWorld(q.X, q.Y, fid, lift);
      }),
      wpWorld: res.stops.slice(1).map(function(q) {
        return toWorld(q.X, q.Y, fid, lift);
      }),
      dockWorld: toWorld(res.stops[0].X, res.stops[0].Y, fid, lift)
    };
  }
  function dropLane(ln) {
    ln.parts.forEach(function(part) {
      scene.remove(part);
      part.traverse(function(node) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (!node.material) {
          return;
        }
        var mats = Array.isArray(node.material) ? node.material : [ node.material ];
        mats.forEach(function(m) {
          m.dispose();
        });
      });
    });
    ln.parts = [];
  }
  var planBox = null;
  var planDots = {};
  var planArrows = [];
  var planHot = null;
  var planStale = false;
  function planLayer() {
    if (planBox) {
      return planBox;
    }
    planBox = document.createElement("div");
    planBox.className = "map-plan";
    planBox.hidden = true;
    hit.appendChild(planBox);
    planBox.addEventListener("pointerover", function(event) {
      var node = event.target.closest("[data-plan-wp]");
      hotPlan(node ? node.getAttribute("data-plan-wp") : null, true);
    });
    planBox.addEventListener("pointerleave", function() {
      hotPlan(null, true);
    });
    planBox.addEventListener("click", function(event) {
      var node = event.target.closest("[data-plan-wp]");
      if (!node) {
        return;
      }
      document.dispatchEvent(new CustomEvent("aprism:mission-pick", {
        detail: {
          id: node.getAttribute("data-plan-wp")
        }
      }));
    });
    return planBox;
  }
  function clearPlan() {
    if (!planBox) {
      return;
    }
    planBox.textContent = "";
    planBox.hidden = true;
    planDots = {};
    planArrows = [];
    planHot = null;
  }
  function arcAt(turns, mile, p) {
    var best = 0, near = Infinity;
    for (var i = 1; i < turns.length; i += 1) {
      var a = turns[i - 1], b = turns[i];
      var vx = b.x - a.x, vz = b.z - a.z;
      var len2 = vx * vx + vz * vz;
      var t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.z - a.z) * vz) / len2)) : 0;
      var dx = a.x + vx * t - p.x, dz = a.z + vz * t - p.z;
      var d = dx * dx + dz * dz;
      if (d < near) {
        near = d;
        best = mile[i - 1] + (mile[i] - mile[i - 1]) * t;
      }
    }
    return best;
  }
  var ARROW_GAP = 5;
  function layPlan() {
    if (!missionPlan || !onLane || !onLane.plan) {
      planStale = false;
      clearPlan();
      return;
    }
    if (!camera) {
      planStale = true;
      clearPlan();
      return;
    }
    planStale = false;
    var box = planLayer();
    box.textContent = "";
    box.hidden = false;
    planDots = {};
    planArrows = [];
    var book = onLane.book || onLane.plan;
    function spotOf(id) {
      var k = book && book.names ? book.names.indexOf(id) : -1;
      return k > 0 && book.wpWorld && book.wpWorld[k - 1] ? book.wpWorld[k - 1] : null;
    }
    function dot(id, text, skip) {
      var at = spotOf(id);
      if (!at) {
        return;
      }
      var node = document.createElement("button");
      node.type = "button";
      node.className = "map-plan-wp" + (skip ? " is-skip" : "");
      node.setAttribute("data-plan-wp", id);
      node.setAttribute("aria-label", id + (skip ? " · 건너뜀" : " · " + text + "번째"));
      node.title = id;
      node.textContent = text;
      box.appendChild(node);
      planDots[id] = {
        el: node,
        at: at
      };
    }
    missionPlan.stops.forEach(function(id, i) {
      dot(id, String(i + 1), false);
    });
    missionPlan.skip.forEach(function(id) {
      dot(id, "", true);
    });
    var turns = onLane.turns;
    if (!turns || turns.length < 2) {
      return;
    }
    var names = onLane.plan.names;
    var mile = [ 0 ], total = 0, i;
    for (i = 1; i < turns.length; i += 1) {
      total += turns[i].distanceTo(turns[i - 1]);
      mile.push(total);
    }
    var edge = [ 0 ];
    for (i = 1; i < names.length; i += 1) {
      edge.push(arcAt(turns, mile, onLane.plan.wpWorld[i - 1]));
    }
    edge.push(total);
    for (var k = 0; k < edge.length - 1; k += 1) {
      var from = edge[k], span2 = edge[k + 1] - from;
      if (span2 < 0.6) {
        continue;
      }
      var count = Math.max(1, Math.min(3, Math.floor(span2 / ARROW_GAP)));
      for (var n = 1; n <= count; n += 1) {
        var at = from + span2 * n / (count + 1);
        var tip = document.createElement("span");
        tip.className = "map-plan-arrow";
        box.appendChild(tip);
        planArrows.push({
          el: tip,
          at: alongRoute(turns, mile, at),
          to: alongRoute(turns, mile, Math.min(total, at + 0.5)),
          a: names[k] || "DOCK",
          b: names[k + 1] || "DOCK"
        });
      }
    }
    placePlan();
  }
  function placePlan() {
    if (!planBox || planBox.hidden) {
      return;
    }
    Object.keys(planDots).forEach(function(id) {
      put(planDots[id].el, planDots[id].at);
    });
    planArrows.forEach(function(tip) {
      var p = onCanvas(tip.at), q = onCanvas(tip.to);
      var len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      var off = 5;
      var ox = -(q.y - p.y) / len * off, oy = (q.x - p.x) / len * off;
      tip.el.style.left = snapPx(p.x + ox);
      tip.el.style.top = snapPx(p.y + oy);
      var deg = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 45;
      tip.el.style.transform = "translate(-50%, -50%) rotate(" + deg.toFixed(1) + "deg)";
    });
  }
  function hotPlan(id, tell) {
    if (planHot === id) {
      return;
    }
    planHot = id;
    Object.keys(planDots).forEach(function(k) {
      planDots[k].el.classList.toggle("is-hot", k === id);
    });
    planArrows.forEach(function(tip) {
      tip.el.classList.toggle("is-hot", !!id && (tip.a === id || tip.b === id));
    });
    if (tell) {
      document.dispatchEvent(new CustomEvent("aprism:mission-hover", {
        detail: {
          id: id,
          from: "map"
        }
      }));
    }
  }
  document.addEventListener("aprism:mission-hover", function(event) {
    if (!event.detail || event.detail.from === "map") {
      return;
    }
    hotPlan(event.detail.id || null, false);
  });
  function replanMission() {
    var id = activeRobot();
    laneFor(String(id));
    var ln = lanes[String(id)];
    var book = ln && ln.book;
    if (!scene || !book) {
      return;
    }
    if (!missionPlan) {
      dropLane(ln);
      drawRoute(book.world, ln.bot, id, book);
      showLane(id, true);
      clearPlan();
      frame();
      return;
    }
    var names = [ "DOCK" ];
    var pts = [ book.dockPlan ];
    missionPlan.stops.forEach(function(wp) {
      var k = book.names.indexOf(wp);
      if (k > 0 && book.wpPlan[k - 1]) {
        names.push(wp);
        pts.push(book.wpPlan[k - 1]);
      }
    });
    if (pts.length < 2) {
      dropLane(ln);
      layWaypoints();
      clearPlan();
      frame();
      return;
    }
    var res = planChain(book.fid, pts, true, names);
    function world(q) {
      return toWorld(q.X, q.Y, book.fid, NAV.lift);
    }
    var line = res.path.map(world);
    dropLane(ln);
    drawRoute(line, ln.bot, id, {
      fid: book.fid,
      names: names,
      dockPlan: res.stops[0],
      wpPlan: res.stops.slice(1),
      pathPlan: res.path,
      reduced: res.reduced,
      world: line,
      wpWorld: res.stops.slice(1).map(world),
      dockWorld: world(res.stops[0])
    });
    showLane(id, true);
    layPlan();
    frame();
    document.dispatchEvent(new CustomEvent("aprism:mission-route"));
  }
  if (window.MutationObserver) {
    new MutationObserver(function() {
      var stNow = document.body.getAttribute("data-stage");
      if (!missionPlan || stNow === "setup" || PRESTART && stNow === "precheck") {
        return;
      }
      missionPlan = null;
      replanMission();
      layWaypoints();
      frame();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: [ "data-stage" ]
    });
  }
  document.addEventListener("aprism:mission-plan", function(event) {
    var d = event.detail || {};
    missionPlan = {
      stops: (d.stops || []).slice(),
      skip: (d.skip || []).slice(),
      names: d.names || {}
    };
    replanMission();
  });
  function routeOnNav(fid, worldPts) {
    var res = planChain(fid, worldPts.map(toPlan), false, null);
    return res.path.map(function(q) {
      return toWorld(q.X, q.Y, fid, NAV.lift);
    });
  }
  var dockBox = null;
  function syncDock() {
    var ln = onLane && onLane.plan ? onLane : null;
    if (!dockBox) {
      dockBox = document.createElement("div");
      dockBox.className = "map-dock";
      dockBox.hidden = true;
      dockBox.innerHTML = '<span class="map-dock-ic" aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12">' + '<path d="M9 1 3 9h4l-1 6 6-8H8l1-6z" fill="currentColor"/></svg></span><span class="map-dock-txt"></span>';
      hit.appendChild(dockBox);
    }
    var show = !!ln && (ln.floor || ROBOT_ON) === floorNow && !floorBusy;
    dockBox.hidden = !show;
    if (!show) {
      return;
    }
    var at = ln.bot.at;
    var txt = at <= 0.001 ? [ "출발 대기" ] : at >= 0.999 ? [ "복귀 완료" ] : [ "출발 완료", "복귀 대기 " + Math.round(at * 100) + "%" ];
    window.APRISM_TEXT.fill(dockBox.querySelector(".map-dock-txt"), txt);
    dockBox.style.setProperty("--p", String(Math.max(0, Math.min(1, at))));
    dockBox.style.setProperty("--tint", "#" + ("00000" + (ln.bot.mark || ln.bot.done).toString(16)).slice(-6));
    put(dockBox, ln.dock);
  }
  var measureMemo = {};
  window.APRISM_ROUTE = {
    config: NAV,
    measure: function(ids) {
      var id = activeRobot();
      laneFor(String(id));
      var ln = lanes[String(id)], book = ln && ln.book;
      if (!scene || !book || !book.wpPlan) {
        return null;
      }
      var key = ids.join(",");
      if (measureMemo[key] != null) {
        return measureMemo[key];
      }
      var names = [ "DOCK" ], pts = [ book.dockPlan ];
      ids.forEach(function(wp) {
        var k = book.names.indexOf(wp);
        if (k > 0 && book.wpPlan[k - 1]) {
          names.push(wp);
          pts.push(book.wpPlan[k - 1]);
        }
      });
      if (pts.length < 2) {
        return 0;
      }
      var n0 = routeLog.length, res = planChain0(book.fid, pts, true, names);
      routeLog.length = n0;
      var m = 0;
      for (var i = 1; i < res.path.length; i += 1) {
        m += Math.hypot(res.path[i].X - res.path[i - 1].X, res.path[i].Y - res.path[i - 1].Y);
      }
      return measureMemo[key] = m;
    },
    lanesAll: function() {
      var out_eq = null;
      Object.keys(lazyBots).forEach(function(k) {
        laneFor(k);
      });
      var decks = {};
      (floors || []).forEach(function(f) {
        var a = toPlan(f.box.min), b = toPlan(f.box.max);
        decks[f.id] = {
          deck: f.deck,
          X: [ +Math.min(a.X, b.X).toFixed(2), +Math.max(a.X, b.X).toFixed(2) ],
          Y: [ +Math.min(a.Y, b.Y).toFixed(2), +Math.max(a.Y, b.Y).toFixed(2) ]
        };
      });
      var eq = [];
      meshes.forEach(function(it) {
        if (it.key !== 'equipment' && it.key !== 'wall') {
          return;
        }
        var bb = (new THREE.Box3).setFromObject(it.mesh), a = toPlan(bb.min), b = toPlan(bb.max);
        eq.push([ it.floor, it.key, +Math.min(a.X, b.X).toFixed(1), +Math.min(a.Y, b.Y).toFixed(1), +Math.abs(b.X - a.X).toFixed(1), +Math.abs(b.Y - a.Y).toFixed(1) ]);
      });
      out_eq = eq;
      var out = {
        box: modelBox ? {
          minX: 0,
          maxX: (modelBox.max.x - modelBox.min.x) * NAV.unit,
          minY: 0,
          maxY: (modelBox.max.z - modelBox.min.z) * NAV.unit
        } : null,
        decks: decks,
        lanes: {}
      };
      Object.keys(lanes).forEach(function(id) {
        var ln = lanes[id];
        var P = function(v) {
          var q = toPlan(v);
          return [ +q.X.toFixed(2), +q.Y.toFixed(2), +v.y.toFixed(2) ];
        };
        out.lanes[id] = {
          name: ln.bot.name,
          floor: ln.floor || ln.bot.floor || null,
          at: ln.bot.at,
          ended: !!ln.bot.ended,
          turns: (ln.turns || []).map(P),
          wps: (ln.wps || []).map(P),
          names: ln.plan && ln.plan.names ? ln.plan.names.slice(1) : null
        };
      });
      out.eq = out_eq;
      if (trav && typeof where === "function") {
        var cs = [], P2 = function(v) {
          var q = toPlan(v);
          return [ +q.X.toFixed(2), +q.Y.toFixed(2), +v.y.toFixed(2) ];
        };
        for (var sv = 0; sv <= trav.s3; sv += 0.5) {
          cs.push(P2(where(sv)));
        }
        out.cross = {
          id: CROSS_ID,
          s1: trav.s1,
          s2: trav.s2,
          s3: trav.s3,
          at: trav.s,
          pts: cs
        };
      }
      return out;
    },
    report: function() {
      var out = {
        unit: "1 UNIT = " + NAV.unit + " m",
        origin: "도면 좌측 하단 (0,0,0)",
        log: routeLog.slice(),
        robots: {}
      };
      Object.keys(lanes).forEach(function(id) {
        var ln = lanes[id];
        if (!ln || !ln.plan) {
          return;
        }
        out.robots[ln.bot.name] = {
          dock: ln.plan.dockPlan,
          wps: ln.plan.wpPlan.map(function(w, k) {
            return {
              id: ln.plan.names[k + 1],
              X: w.X,
              Y: w.Y,
              Z: 0
            };
          }),
          path: ln.plan.pathPlan,
          reducedLegs: ln.plan.reduced
        };
      });
      return out;
    }
  };
  function syncMap3d() {
    var cs = getComputedStyle(document.body);
    if (!cs.getPropertyValue("--ds-map3d-floor").trim()) {
      return;
    }
    var probe = document.createElement("i");
    probe.style.display = "none";
    document.body.appendChild(probe);
    function hx(n, d) {
      var v = cs.getPropertyValue("--ds-map3d-" + n).trim();
      if (!v) {
        return d;
      }
      probe.style.color = "";
      probe.style.color = v;
      var m = getComputedStyle(probe).color.match(/[\d.]+/g);
      return m ? Math.round(+m[0]) << 16 | Math.round(+m[1]) << 8 | Math.round(+m[2]) : d;
    }
    function css(n) {
      return "#" + ("00000" + n.toString(16)).slice(-6);
    }
    [ "floor", "wall", "equipment", "stairs", "other" ].forEach(function(k) {
      PALETTE[k].face = hx(k, PALETTE[k].face);
      LIGHT.face[k] = hx("light-" + k, LIGHT.face[k]);
    });
    EDGE = hx("edge", EDGE);
    GHOST = hx("ghost", GHOST);
    GRID = hx("grid", GRID);
    PICK_FACE = hx("pick-face", PICK_FACE);
    PICK_LINE = hx("pick-line", PICK_LINE);
    HOVER_LINE = hx("hover-line", HOVER_LINE);
    LIGHT.edge = hx("light-edge", LIGHT.edge);
    LIGHT.ghost = hx("light-ghost", LIGHT.ghost);
    LIGHT.grid = hx("light-grid", LIGHT.grid);
    LIGHT.pickFace = hx("light-pick-face", LIGHT.pickFace);
    LIGHT.pickLine = hx("light-pick-line", LIGHT.pickLine);
    LIGHT.hoverLine = hx("light-hover-line", LIGHT.hoverLine);
    var ST = {
      "수행중": "run",
      "완료": "done",
      "대기": "idle",
      "끊김": "lost"
    };
    Object.keys(ST).forEach(function(k) {
      [ "done", "left", "dot", "mark" ].forEach(function(p) {
        if (BOT_TINT[k] && BOT_TINT[k][p] != null) {
          BOT_TINT[k][p] = hx(ST[k] + "-" + p, BOT_TINT[k][p]);
        }
        if (BOT_TINT_LIGHT[k] && BOT_TINT_LIGHT[k][p] != null) {
          BOT_TINT_LIGHT[k][p] = hx("light-" + ST[k] + "-" + p, BOT_TINT_LIGHT[k][p]);
        }
      });
    });
    var BASE = {
      9026029: "path-a",
      3458905: "path-b",
      16763904: "path-c"
    };
    ROBOTS.forEach(function(r) {
      if (!r) {
        return;
      }
      if (r.ended) {
        r.done = r.left = hx("path-ended", r.done);
        return;
      }
      var key = BASE[r.done];
      if (!key) {
        return;
      }
      r.done = hx(key + "-done", r.done);
      r.left = hx(key + "-left", r.left);
      r.dot = hx(key + "-dot", r.dot);
    });
    [ "safe", "caution", "danger", "current", "upcoming", "skipped" ].forEach(function(k) {
      WP_TINT[k] = hx("wp-" + k, WP_TINT[k]);
    });
    [ "safe", "caution", "current" ].forEach(function(k) {
      WP_TINT_LIGHT[k] = hx("light-wp-" + k, WP_TINT_LIGHT[k]);
    });
    WP_HALO = hx("wp-ring", WP_HALO);
    HALO_GX = hx("halo-run", HALO_GX);
    HALO_G = css(HALO_GX);
    HALO_TINT.alert = HALO_TINT.estop = hx("halo-alert", HALO_TINT.alert);
    HALO_TINT["return"] = hx("halo-return", HALO_TINT["return"]);
    HALO_PAUSE = HALO_TINT.pause = hx("halo-pause", HALO_PAUSE);
    HALO_TRACK = css(hx("halo-track", 0x1f3328));
    MAP3D_HOME = hx("home", MAP3D_HOME);
    probe.remove();
  }
  function start(three, utils, gltf) {
    syncMap3d();
    THREE = three;
    merge = utils.mergeGeometries;
    tone = new THREE.Color;
    PICKED = new THREE.Color(PICK_FACE);
    GHOSTC = new THREE.Color(GHOST);
    scene = new THREE.Scene;
    ambLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambLight);
    hemiLight = new THREE.HemisphereLight(0xe4edfb, 0x05070c, 1.25);
    scene.add(hemiLight);
    var key = new THREE.DirectionalLight(0xffffff, 1);
    keyLight = key;
    scene.add(key);
    scene.add(key.target);
    topLight = new THREE.DirectionalLight(0xffffff, 0);
    topLight.position.set(0, 1, 0);
    scene.add(topLight);
    scene.add(topLight.target);
    var model = build(gltf.scene);
    scene.add(model);
    if (Bvh) {
      meshes.forEach(function(item) {
        item.mesh.geometry.computeBoundsTree = Bvh.computeBoundsTree;
        item.mesh.geometry.computeBoundsTree();
        item.mesh.raycast = Bvh.acceleratedRaycast;
      });
    }
    hideWallJoins();
    var box = (new THREE.Box3).setFromObject(model);
    modelBox = box;
    var size = box.getSize(new THREE.Vector3);
    span = size.length() / 2;
    setupFloors();
    readStairs();
    var here = floors.length ? floorOf(floorNow) : null;
    home = (here ? here.center : box.getCenter(new THREE.Vector3)).clone();
    target = home.clone();
    var deckOn = floors.length ? floorOf(ROBOT_ON) || floors[0] : null;
    floorY = deckOn ? deckOn.deck : box.min.y;
    if (!deckOn) {
      var deck = -Infinity;
      meshes.forEach(function(item) {
        if (item.key === "floor") {
          deck = Math.max(deck, item.mesh.geometry.boundingBox.max.y);
        }
      });
      if (deck > -Infinity) {
        floorY = deck;
      }
    }
    pickPens = [ outlinePen(6, PICK_LINE, 0.14), outlinePen(2, PICK_LINE, 0.85) ];
    hoverPens = [ outlinePen(1.6, HOVER_LINE, 1) ];
    var first = activeRobot();
    ROBOTS.forEach(function(bot, id) {
      if (String(id) === first || String(id) === CROSS_ID) {
        buildLane(bot, id);
      } else {
        lazyBots[String(id)] = bot;
      }
    });
    crossLane();
    layRobots();
    if (missionPlan) {
      replanMission();
    }
    layWaypoints();
    if (chosenWp) {
      chooseWaypoint(chosenWp, "panel");
    }
    key.position.copy(home).add(new THREE.Vector3(0.62, 0.8, -0.62).normalize().multiplyScalar(span * 2));
    key.target.position.copy(home);
    gridMesh = floorGrid(box, here ? here.deck : box.min.y);
    scene.add(gridMesh);
    applyTheme();
    if (THEMED && window.MutationObserver) {
      new MutationObserver(applyTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: [ "data-theme" ]
      });
    }
    WORLD_UP = new THREE.Vector3(0, 1, 0);
    dirV = new THREE.Vector3;
    right = new THREE.Vector3;
    upOnGround = new THREE.Vector3;
    orient();
    var fitSize = here ? here.size : size;
    fitH = across(right, fitSize);
    fitV = across(upOnGround, fitSize);
    fitBase();
    camera = new THREE.PerspectiveCamera(10, 1, 1, span * 40);
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: canvas.hasAttribute("data-map-keep")
    });
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, THEMED ? 2 : 1), 2));
    renderer.setClearAlpha(0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 3;
    key.shadow.bias = -0.0008;
    key.shadow.normalBias = 0.15;
    var cam = key.shadow.camera;
    cam.left = -span;
    cam.right = span;
    cam.top = span;
    cam.bottom = -span;
    cam.near = span * 0.2;
    cam.far = span * 4;
    cam.updateProjectionMatrix();
    if (window.APRISM_MAP_FX) {
      fx = window.APRISM_MAP_FX;
      fx.init({
        THREE: THREE,
        renderer: renderer,
        scene: scene,
        camera: camera,
        view: view,
        key: key,
        meshes: meshes,
        span: span,
        box: box,
        isLight: isLight,
        redraw: frame
      });
    }
    plan();
    frame();
    var demo = (window.location.search.match(/[?&]demo=([\w-]+)/) || [])[1];
    if (demo === "travel" || demo === "travel-free") {
      window.setTimeout(function() {
        travelStart(demo === "travel");
      }, 600);
    }
    if (window.ResizeObserver) {
      new ResizeObserver(frame).observe(view);
      document.addEventListener("aprism:map-room", frame);
    } else {
      window.addEventListener("resize", frame);
    }
  }
  if (!window.APRISM_MAP_GLB) {
    return;
  }
  Promise.all([ import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/utils/BufferGeometryUtils.js"), import("three/addons/lines/Line2.js"), import("three/addons/lines/LineMaterial.js"), import("three/addons/lines/LineGeometry.js"), import("three/addons/lines/LineSegments2.js"), import("three/addons/lines/LineSegmentsGeometry.js"), import("https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.7.8/build/index.module.js").catch(function() {
    return null;
  }) ]).then(function(mods) {
    Bvh = mods[8];
    Fat = {
      Line2: mods[3].Line2,
      LineMaterial: mods[4].LineMaterial,
      LineGeometry: mods[5].LineGeometry,
      LineSegments2: mods[6].LineSegments2,
      LineSegmentsGeometry: mods[7].LineSegmentsGeometry
    };
    (function() {
      var proto = Fat.LineSegmentsGeometry.prototype, orig = proto.setPositions;
      proto.setPositions = function(a) {
        var r = orig.call(this, a);
        delete this._maxInstanceCount;
        return r;
      };
    })();
    var loader = new mods[1].GLTFLoader;
    loader.parse(decode(window.APRISM_MAP_GLB), "", function(gltf) {
      start(mods[0], mods[2], gltf);
    });
  }).catch(function() {});
})();
