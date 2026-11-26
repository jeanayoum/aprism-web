(function() {
  "use strict";
  var S = {
    on: true,
    tone: "none",
    exposure: 0.9,
    env: true,
    envAmt: 0.1,
    rough: 0.8,
    ao: false,
    aoRadius: 4.5,
    aoAmt: 0.6,
    aoDeep: 1,
    aoRest: true,
    aoView: 0,
    bloom: true,
    bloomAmt: 0.4,
    bloomRadius: 0.15,
    bloomTh: 0.51,
    vignette: 0.3,
    shadow: 2048,
    shadowSoft: 5,
    res: 1,
    bake: true,
    bakeR: 1.6,
    bakeAmt: 1.4,
    bakeFade: 1.2,
    bakeDirect: 0.6,
    bakeOff: 0.12,
    bakeRes: 2048,
    bakeView: false
  };
  var TONES = {
    "없음": "none",
    AgX: "AgX",
    ACES: "ACES"
  };
  var LAB = document.documentElement.hasAttribute("data-fx-lab");
  var FPS = LAB || /[?&]fps/.test(window.location.search);
  if (/[?&]fx=off/.test(window.location.search)) {
    S.on = false;
  }
  ((window.location.search.match(/[?&]fxset=([^&]+)/) || [])[1] || "").split(",").forEach(function(kv) {
    var p = decodeURIComponent(kv).split(":");
    if (!(p[0] in S)) {
      return;
    }
    S[p[0]] = typeof S[p[0]] === "number" ? +p[1] : typeof S[p[0]] === "boolean" ? p[1] === "1" || p[1] === "true" : p[1];
  });
  var ctx = null, T = null, composer = null, rt = null;
  var P = {};
  var envTex = null, ready = false, size = {
    w: 0,
    h: 0,
    pr: 0
  };
  var bgNow = null;
  var aoSig = "", aoPrev = "", aoMoved = 0, aoTimer = 0;
  var fps = {
    n: 0,
    t0: 0,
    v: 0
  };
  var pr0 = 0, shSig = "";
  window.APRISM_MAP_FX = {
    init: init,
    render: render,
    S: S
  };
  function init(c) {
    ctx = c;
    T = c.THREE;
    pr0 = c.renderer.getPixelRatio();
    Promise.all([ import("three/addons/postprocessing/EffectComposer.js"), import("three/addons/postprocessing/RenderPass.js"), import("three/addons/postprocessing/GTAOPass.js"), import("three/addons/postprocessing/UnrealBloomPass.js"), import("three/addons/postprocessing/OutputPass.js"), import("three/addons/postprocessing/ShaderPass.js"), import("three/addons/environments/RoomEnvironment.js"), LAB ? import("https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/dist/lil-gui.esm.min.js") : null ]).then(build).catch(function(e) {
      console.warn("[렌더 실험] 효과를 못 불러와 원래대로 그린다", e);
    });
  }
  function build(m) {
    var r = ctx.renderer;
    rt = new T.WebGLRenderTarget(1, 1, {
      type: T.HalfFloatType,
      samples: 4
    });
    composer = new m[0].EffectComposer(r, rt);
    P.render = new m[1].RenderPass(ctx.scene, ctx.camera);
    composer.addPass(P.render);
    P.ao = new m[2].GTAOPass(ctx.scene, ctx.camera, 1, 1);
    P.ao.updatePdMaterial({
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 4,
      rings: 2,
      samples: 16
    });
    P.ao.overrideVisibility = function() {
      var keep = new Set;
      ctx.meshes.forEach(function(it) {
        if (it.mesh.visible && it.now > 0.9) {
          keep.add(it.mesh);
        }
      });
      var cache = this._visibilityCache;
      this.scene.traverse(function(o) {
        cache.set(o, o.visible);
        if ((o.isMesh || o.isLine || o.isPoints || o.isSprite) && !keep.has(o)) {
          o.visible = false;
        }
      });
    };
    var aoSize = P.ao.setSize;
    P.ao.setSize = function(w, h) {
      aoSize.call(this, Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
      aoSig = "";
    };
    var aoRender = P.ao.render;
    P.ao.render = function(r, wb, rb) {
      var sig = sceneSig(), out = this.renderToScreen ? null : wb;
      var now = performance.now();
      if (sig !== aoPrev) {
        aoMoved = now;
        aoPrev = sig;
      }
      var moving = S.aoRest && now - aoMoved < 180;
      if (moving) {
        window.clearTimeout(aoTimer);
        aoTimer = window.setTimeout(ctx.redraw, 200);
      }
      if (this.output !== 0) {
        aoSig = "";
        return aoRender.call(this, r, wb, rb);
      }
      if (!moving && sig !== aoSig) {
        aoSig = sig;
        return aoRender.call(this, r, wb, rb);
      }
      this.copyMaterial.uniforms.tDiffuse.value = rb.texture;
      this.copyMaterial.blending = T.NoBlending;
      this.renderPass(r, this.copyMaterial, out);
      if (moving || !aoSig) {
        return;
      }
      this.blendMaterial.uniforms.intensity.value = this.blendIntensity;
      this.blendMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
      this.renderPass(r, this.blendMaterial, out);
    };
    composer.addPass(P.ao);
    P.bloom = new m[3].UnrealBloomPass(new T.Vector2(1, 1), S.bloomAmt, S.bloomRadius, S.bloomTh);
    composer.addPass(P.bloom);
    P.out = new m[4].OutputPass;
    composer.addPass(P.out);
    P.vig = new m[5].ShaderPass({
      uniforms: {
        tDiffuse: {
          value: null
        },
        amount: {
          value: S.vignette
        },
        aspect: {
          value: 1
        }
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: [ "uniform sampler2D tDiffuse; uniform float amount; uniform float aspect; varying vec2 vUv;", "void main(){", "  vec4 c = texture2D(tDiffuse, vUv);", "  vec2 d = (vUv - 0.5) * vec2(aspect, 1.0);", "  float v = smoothstep(0.35, 1.05, length(d));", "  gl_FragColor = vec4(c.rgb * (1.0 - amount * v), c.a);", "}" ].join("\n")
    });
    composer.addPass(P.vig);
    var pm = new T.PMREMGenerator(r);
    envTex = pm.fromScene(new m[6].RoomEnvironment(r), 0.04).texture;
    pm.dispose();
    if (LAB) {
      Object.assign(window.APRISM_MAP_FX, {
        sync: sync,
        bk: BK,
        ctx: ctx,
        inject: inject
      });
      panel(m[7].GUI);
      window.addEventListener("keydown", function(e) {
        if ((e.key === "b" || e.key === "B") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
          S.on = !S.on;
          sync();
        }
      });
    }
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(document.documentElement, {
        attributes: true,
        attributeFilter: [ "data-theme" ]
      });
    }
    ready = true;
    sync();
  }
  function sceneSig() {
    var e = ctx.camera.matrixWorld.elements, p = ctx.camera.projectionMatrix.elements, s = "";
    for (var i = 12; i < 15; i++) {
      s += e[i].toFixed(3) + ",";
    }
    s += e[8].toFixed(4) + "," + e[10].toFixed(4) + "," + p[0].toFixed(5) + "," + p[5].toFixed(5) + "|";
    ctx.meshes.forEach(function(it) {
      s += it.mesh.visible ? it.now > 0.9 ? "1" : "0" : "-";
    });
    return s;
  }
  function backdrop() {
    var el = ctx.view;
    while (el && el !== document.documentElement) {
      var c = getComputedStyle(el).backgroundColor;
      if (c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c)) {
        return c;
      }
      el = el.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor || "#070a10";
  }
  function sync() {
    if (!ready) {
      return;
    }
    var r = ctx.renderer, on = S.on, light = ctx.isLight();
    r.setPixelRatio(on ? Math.min(pr0, S.res) : pr0);
    r.shadowMap.autoUpdate = !on;
    r.shadowMap.needsUpdate = true;
    shSig = "";
    r.toneMapping = !on || S.tone === "none" ? T.NoToneMapping : S.tone === "ACES" ? T.ACESFilmicToneMapping : T.AgXToneMapping;
    r.toneMappingExposure = on ? S.exposure : 1;
    ctx.scene.environment = on && S.env ? envTex : null;
    ctx.scene.background = on ? new T.Color(bgNow = backdrop()) : null;
    ctx.meshes.forEach(function(it) {
      it.mat.envMapIntensity = S.envAmt;
      it.mat.roughness = on ? S.rough : 0.85;
    });
    var res = on ? S.shadow : 1024;
    if (ctx.key.shadow.mapSize.x !== res) {
      ctx.key.shadow.mapSize.set(res, res);
      if (ctx.key.shadow.map) {
        ctx.key.shadow.map.dispose();
        ctx.key.shadow.map = null;
      }
    }
    ctx.key.shadow.radius = on ? S.shadowSoft : 3;
    if (on) {
      r.shadowMap.needsUpdate = true;
    }
    P.ao.enabled = S.ao;
    P.ao.output = S.aoView;
    P.ao.updatePdMaterial({
      samples: 8
    });
    aoSig = "";
    var aoR = ctx.span * S.aoRadius / 100;
    P.ao.updateGtaoMaterial({
      radius: aoR,
      distanceExponent: 1,
      thickness: aoR * 3,
      scale: S.aoDeep,
      samples: 8
    });
    P.ao.blendIntensity = S.aoAmt * (light ? 0.55 : 1);
    P.bloom.enabled = S.bloom && !light;
    P.bloom.strength = S.bloomAmt;
    P.bloom.radius = S.bloomRadius;
    P.bloom.threshold = S.bloomTh;
    P.vig.enabled = S.vignette > 0 && !light;
    P.vig.uniforms.amount.value = S.vignette;
    if (on && S.bake) {
      bakeAll();
    }
    var bu = BK.u;
    bu.uBakeOn.value = on && S.bake ? 1 : 0;
    bu.uBakeAmt.value = S.bakeAmt * (light ? 0.7 : 1);
    bu.uBakeFade.value = S.bakeFade;
    bu.uBakeDirect.value = S.bakeDirect;
    bu.uBakeOff.value = S.bakeOff;
    bu.uBakeView.value = on && S.bake && S.bakeView ? 1 : 0;
    if (FPS) {
      badge();
    }
    ctx.redraw();
  }
  function render(w, h) {
    if (!ready || !S.on) {
      return false;
    }
    var pr = Math.min(ctx.renderer.getPixelRatio(), S.res);
    if (w !== size.w || h !== size.h || pr !== size.pr) {
      size = {
        w: w,
        h: h,
        pr: pr
      };
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
      P.vig.uniforms.aspect.value = w / h;
    }
    var sh = shadowSig();
    if (sh !== shSig) {
      shSig = sh;
      ctx.renderer.shadowMap.needsUpdate = true;
    }
    var cam = ctx.camera, n0 = cam.near, f0 = cam.far, z = depthSpan();
    if (z) {
      cam.near = Math.max(n0, z[0]);
      cam.far = Math.min(f0, z[1]);
      cam.updateProjectionMatrix();
    }
    composer.render();
    if (z) {
      cam.near = n0;
      cam.far = f0;
      cam.updateProjectionMatrix();
    }
    tick();
    return true;
  }
  var BK = {
    injected: false,
    sig: "",
    u: {
      uBakeOn: {
        value: 0
      },
      uBakeAmt: {
        value: 1
      },
      uBakeFade: {
        value: 1
      },
      uBakeDirect: {
        value: 0.5
      },
      uBakeOff: {
        value: 0.1
      },
      uBakeView: {
        value: 0
      }
    },
    floors: {}
  };
  function bakeAll() {
    var sig = [ S.bakeR, S.bakeRes ].join(",");
    if (sig === BK.sig) {
      return;
    }
    BK.sig = sig;
    var t0 = performance.now(), r = ctx.renderer;
    var groups = {};
    ctx.meshes.forEach(function(it) {
      (groups[it.floor] = groups[it.floor] || []).push(it);
    });
    var prevRT = r.getRenderTarget(), prevClear = new T.Color, prevAlpha = r.getClearAlpha(), prevAuto = r.autoClear, prevSh = r.shadowMap.autoUpdate;
    r.getClearColor(prevClear);
    r.shadowMap.autoUpdate = false;
    var cam = new T.Camera, log = [];
    var vs = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    var quad = function(mat, src, dst) {
      var q = new T.Mesh(new T.PlaneGeometry(2, 2), mat), qs = new T.Scene;
      q.frustumCulled = false;
      qs.add(q);
      mat.uniforms.tSrc.value = src.texture;
      r.setRenderTarget(dst);
      r.render(qs, cam);
      q.geometry.dispose();
    };
    Object.keys(groups).forEach(function(fid) {
      var list = groups[fid], box = new T.Box3, base = -Infinity, lo = Infinity;
      list.forEach(function(it) {
        var b = it.mesh.geometry.boundingBox;
        box.union(b);
        lo = Math.min(lo, b.min.y);
        if (it.key === "floor") {
          base = Math.max(base, b.max.y);
        }
      });
      if (!isFinite(base)) {
        base = lo;
      }
      var pad = S.bakeR * 1.1, top = box.max.y;
      var rx = box.min.x - pad, rz = box.min.z - pad, sx = box.max.x - box.min.x + pad * 2, sz = box.max.z - box.min.z + pad * 2;
      var N = S.bakeRes, w = sx >= sz ? N : Math.max(64, Math.round(N * sx / sz)), h = sx >= sz ? Math.max(64, Math.round(N * sz / sx)) : N;
      var F = BK.floors[fid] || (BK.floors[fid] = {
        tex: {
          value: null
        },
        rect: {
          value: new T.Vector4
        },
        base: {
          value: 0
        },
        rts: []
      });
      F.rts.forEach(function(t) {
        t.dispose();
      });
      var mk = function() {
        return new T.WebGLRenderTarget(w, h, {
          type: T.HalfFloatType,
          minFilter: T.LinearFilter,
          magFilter: T.LinearFilter,
          depthBuffer: true
        });
      };
      var rtH = mk(), rtA = mk(), rtB = mk();
      F.rect.value.set(rx, rz, sx, sz);
      F.base.value = base;
      var hMat = new T.ShaderMaterial({
        uniforms: {
          uRect: {
            value: F.rect.value
          },
          uBase: {
            value: base
          },
          uLo: {
            value: base - 1
          },
          uHi: {
            value: top + 1
          }
        },
        side: T.DoubleSide,
        vertexShader: [ "uniform vec4 uRect; uniform float uLo, uHi; varying float vY;", "void main(){ vY = position.y;", "  vec2 p = (position.xz - uRect.xy) / uRect.zw * 2.0 - 1.0;", "  gl_Position = vec4(p, 1.0 - 2.0 * clamp((position.y - uLo) / (uHi - uLo), 0.0, 1.0), 1.0); }" ].join("\n"),
        fragmentShader: "uniform float uBase; varying float vY; void main(){ gl_FragColor = vec4(max(vY - uBase, 0.0), 0.0, 0.0, 1.0); }"
      });
      var hs = new T.Scene;
      list.forEach(function(it) {
        var m = new T.Mesh(it.mesh.geometry, hMat);
        m.frustumCulled = false;
        hs.add(m);
      });
      r.setRenderTarget(rtH);
      r.setClearColor(0x000000, 1);
      r.autoClear = true;
      r.clear(true, true, true);
      r.render(hs, cam);
      var aoMat = new T.ShaderMaterial({
        uniforms: {
          tSrc: {
            value: null
          },
          uWorld: {
            value: new T.Vector2(sx, sz)
          },
          uR: {
            value: S.bakeR
          }
        },
        vertexShader: vs,
        fragmentShader: [ "uniform sampler2D tSrc; uniform vec2 uWorld; uniform float uR; varying vec2 vUv;", "float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }", "void main(){", "  float h0 = texture2D(tSrc, vUv).r, occ = 0.0, j = hash(vUv * 4096.0);", "  for (int k = 0; k < 24; k++) {", "    float a = (float(k) + j) * 0.2617994;", "    vec2 dir = vec2(cos(a), sin(a)) / uWorld;", "    float best = 0.0;", "    for (int s = 0; s < 20; s++) {", "      float t = (float(s) + 0.5) / 20.0, d = uR * t * t;", "      float dh = texture2D(tSrc, vUv + dir * d).r - h0;", "      if (dh > 0.0) { best = max(best, dh / sqrt(dh * dh + d * d) * (1.0 - t * t)); }", "    }", "    occ += best;", "  }", "  gl_FragColor = vec4(1.0 - occ / 24.0, h0, 0.0, 1.0);", "}" ].join("\n")
      });
      quad(aoMat, rtH, rtA);
      var blur = function(dx, dy, src, dst) {
        var bm = new T.ShaderMaterial({
          uniforms: {
            tSrc: {
              value: null
            },
            uStep: {
              value: new T.Vector2(dx / w, dy / h)
            }
          },
          vertexShader: vs,
          fragmentShader: [ "uniform sampler2D tSrc; uniform vec2 uStep; varying vec2 vUv;", "void main(){", "  vec4 c = texture2D(tSrc, vUv); float sum = c.r, wt = 1.0;", "  for (int i = 1; i <= 4; i++) {", "    float g = exp(-float(i * i) / 8.0);", "    vec4 a = texture2D(tSrc, vUv + uStep * float(i)), b = texture2D(tSrc, vUv - uStep * float(i));", "    float wa = g * step(abs(a.g - c.g), 0.05), wb = g * step(abs(b.g - c.g), 0.05);", "    sum += a.r * wa + b.r * wb; wt += wa + wb;", "  }", "  gl_FragColor = vec4(sum / wt, c.g, 0.0, 1.0);", "}" ].join("\n")
        });
        quad(bm, src, dst);
        bm.dispose();
      };
      blur(1.5, 0, rtA, rtB);
      blur(0, 1.5, rtB, rtA);
      F.tex.value = rtA.texture;
      F.rts = [ rtA ];
      rtH.dispose();
      rtB.dispose();
      hMat.dispose();
      aoMat.dispose();
      log.push((fid || "층") + " 바닥 " + base.toFixed(2) + " · 높이 " + (top - base).toFixed(2) + " · 판 " + sx.toFixed(1) + "×" + sz.toFixed(1) + " → " + w + "×" + h);
    });
    r.setRenderTarget(prevRT);
    r.setClearColor(prevClear, prevAlpha);
    r.autoClear = prevAuto;
    r.shadowMap.autoUpdate = prevSh;
    r.shadowMap.needsUpdate = true;
    inject();
    console.log("[AO 굽기] " + Math.round(performance.now() - t0) + " ms · " + log.join(" | "));
  }
  function inject() {
    if (BK.injected) {
      return;
    }
    BK.injected = true;
    ctx.meshes.forEach(function(it) {
      var F = BK.floors[it.floor], mat = it.mat;
      if (!F) {
        return;
      }
      var prev = mat.onBeforeCompile, prevKey = mat.customProgramCacheKey;
      mat.onBeforeCompile = function(sh, rr) {
        if (prev) {
          prev.call(this, sh, rr);
        }
        Object.keys(BK.u).forEach(function(k) {
          sh.uniforms[k] = BK.u[k];
        });
        sh.uniforms.uBkTex = F.tex;
        sh.uniforms.uBkRect = F.rect;
        sh.uniforms.uBkBase = F.base;
        sh.vertexShader = "varying vec3 vBkP;\nvarying vec3 vBkN;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n  vBkP = transformed; vBkN = objectNormal;");
        sh.fragmentShader = [ "uniform sampler2D uBkTex; uniform vec4 uBkRect; uniform float uBkBase;", "uniform float uBakeOn, uBakeAmt, uBakeFade, uBakeDirect, uBakeOff, uBakeView;", "varying vec3 vBkP; varying vec3 vBkN;", "float bakedAO(){", "  vec3 n = normalize(vBkN);", "  vec4 s = texture2D(uBkTex, (vBkP.xz + n.xz * uBakeOff - uBkRect.xy) / uBkRect.zw);", "  float w = 1.0 - smoothstep(0.0, uBakeFade, vBkP.y - uBkBase - s.g);", "  w *= step(-0.5, n.y);", "  return mix(1.0, pow(clamp(s.r, 0.0, 1.0), uBakeAmt), w * uBakeOn);", "}" ].join("\n") + "\n" + sh.fragmentShader.replace("#include <aomap_fragment>", "#include <aomap_fragment>\n  float bkAO = bakedAO();\n  reflectedLight.indirectDiffuse *= bkAO;\n  reflectedLight.directDiffuse *= mix(1.0, bkAO, uBakeDirect);").replace("#include <premultiplied_alpha_fragment>", "if (uBakeView > 0.5) { gl_FragColor.rgb = vec3(bkAO); }\n#include <premultiplied_alpha_fragment>");
      };
      mat.customProgramCacheKey = function() {
        return (prevKey ? prevKey.call(this) : "") + "|bake-ao";
      };
      mat.needsUpdate = true;
    });
  }
  function shadowSig() {
    var s = "";
    ctx.meshes.forEach(function(it) {
      s += it.mesh.visible ? it.mesh.castShadow ? "1" : "0" : "-";
    });
    return s;
  }
  var _fw = null, _pt = null;
  function depthSpan() {
    var b = ctx.box;
    if (!b) {
      return null;
    }
    _fw = _fw || new T.Vector3;
    _pt = _pt || new T.Vector3;
    ctx.camera.getWorldDirection(_fw);
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < 8; i++) {
      _pt.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(ctx.camera.position);
      var d = _pt.dot(_fw);
      lo = Math.min(lo, d);
      hi = Math.max(hi, d);
    }
    var pad = (hi - lo) * 0.1;
    return hi > 0 ? [ Math.max(0.01, lo - pad), hi + pad ] : null;
  }
  function tick() {
    var t = performance.now();
    if (!fps.t0) {
      fps.t0 = t;
    }
    fps.n += 1;
    if (t - fps.t0 >= 1000) {
      fps.v = Math.round(fps.n * 1000 / (t - fps.t0));
      fps.n = 0;
      fps.t0 = t;
      if (FPS) {
        badge();
      }
    }
  }
  var tag = null;
  function badge() {
    if (!tag) {
      tag = document.createElement("div");
      tag.className = "lab-fx-tag";
      if (!LAB) {
        tag.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;padding:6px 12px;border-radius:999px;font:600 12px/1.4 SUIT,sans-serif;background:rgba(60,66,80,.9);color:#fff;pointer-events:none;white-space:pre";
      }
      document.body.appendChild(tag);
    }
    var c = ctx.renderer.domElement;
    tag.textContent = LAB ? (S.on ? "효과 켜짐" + (fps.v ? " · " + fps.v + " fps" : "") : "효과 꺼짐 · 운영 화면과 같음") + "  ·  B 로 전환" : "지도 " + (fps.v || "–") + " fps · 화면 배율 " + window.devicePixelRatio + " · 캔버스 " + c.width + "×" + c.height + (S.on ? "" : " · 효과 꺼짐");
    tag.classList.toggle("is-off", !S.on);
  }
  function panel(GUI) {
    var gui = new GUI({
      title: "렌더 실험 (1단계) — 기본값 = 운영"
    });
    gui.domElement.classList.add("lab-fx-gui");
    gui.add(S, "on").name("효과 켜기 (B)").onChange(sync).listen();
    var f = gui.addFolder("톤 · 환경광");
    f.add(S, "tone", TONES).name("톤 매핑").onChange(sync);
    f.add(S, "exposure", 0.5, 2, 0.05).name("노출").onChange(sync);
    f.add(S, "env").name("환경광").onChange(sync);
    f.add(S, "envAmt", 0, 1.5, 0.05).name("환경광 세기").onChange(sync);
    f.add(S, "rough", 0.2, 1, 0.05).name("거칠기").onChange(sync);
    f = gui.addFolder("GTAO (11/03 전 운영 · 지금 꺼짐)");
    f.add(S, "ao").name("켜기").onChange(sync).listen();
    f.add(S, "aoRadius", 1, 20, 0.5).name("반경 (모델 %)").onChange(sync);
    f.add(S, "aoDeep", 1, 4, 0.1).name("진하기").onChange(sync);
    f.add(S, "aoAmt", 0, 2, 0.05).name("세기").onChange(sync);
    f.add(S, "aoRest").name("돌리는 동안 쉬기").onChange(sync);
    f.add(S, "aoView", {
      "합친 화면": 0,
      "AO 만 보기": 5,
      "AO 날것": 4,
      "노멀 판": 3,
      "깊이 판": 2
    }).name("보기").onChange(function(v) {
      S.aoView = +v;
      sync();
    });
    f = gui.addFolder("AO 굽기 (운영)");
    var mode = {
      v: S.bake ? S.ao ? "both" : "bake" : S.ao ? "gtao" : "none"
    };
    f.add(mode, "v", {
      "GTAO (11/03 전 운영)": "gtao",
      "굽기 (운영)": "bake",
      "둘 다": "both",
      "없음": "none"
    }).name("AO 방식").onChange(function(v) {
      S.ao = v === "gtao" || v === "both";
      S.bake = v === "bake" || v === "both";
      sync();
    });
    f.add(S, "bakeR", 0.4, 4, 0.1).name("반경 (m) · 다시 굽기").onFinishChange(sync);
    f.add(S, "bakeAmt", 0.3, 4, 0.1).name("진하기").onChange(sync);
    f.add(S, "bakeFade", 0.2, 4, 0.1).name("벽 위로 옅어지는 높이 (m)").onChange(sync);
    f.add(S, "bakeDirect", 0, 1, 0.05).name("직사광에도 (0 = 환경광만)").onChange(sync);
    f.add(S, "bakeOff", 0, 0.5, 0.01).name("벽 면에서 비켜 읽기 (m)").onChange(sync);
    f.add(S, "bakeRes", {
      1024: 1024,
      2048: 2048,
      4096: 4096
    }).name("판 해상도 · 다시 굽기").onChange(function(v) {
      S.bakeRes = +v;
      sync();
    });
    f.add(S, "bakeView").name("구운 그늘만 보기").onChange(sync);
    f = gui.addFolder("블룸 (다크만)");
    f.add(S, "bloom").name("켜기").onChange(sync);
    f.add(S, "bloomAmt", 0, 2, 0.05).name("세기").onChange(sync);
    f.add(S, "bloomRadius", 0, 1, 0.05).name("번짐 폭").onChange(sync);
    f.add(S, "bloomTh", 0, 1, 0.01).name("문턱 (밝은 것만)").onChange(sync);
    f = gui.addFolder("화면 · 그림자");
    f.add(S, "vignette", 0, 0.9, 0.05).name("비네트").onChange(sync);
    f.add(S, "res", {
      "1 (가벼움)": 1,
      1.5: 1.5,
      "2 (운영 화면과 같음)": 2
    }).name("해상도 배율").onChange(function(v) {
      S.res = +v;
      ctx.redraw();
    });
    f.add(S, "shadow", {
      "1024 (원래)": 1024,
      2048: 2048,
      4096: 4096
    }).name("그림자 해상도").onChange(function(v) {
      S.shadow = +v;
      sync();
    });
    f.add(S, "shadowSoft", 1, 10, 0.5).name("그림자 번짐").onChange(sync);
    gui.add({
      copy: function() {
        var txt = JSON.stringify(S, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt);
        }
        console.log("[렌더 실험] 지금 값\n" + txt);
      }
    }, "copy").name("지금 값 복사");
  }
})();
