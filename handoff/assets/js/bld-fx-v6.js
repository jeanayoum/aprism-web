(function() {
  "use strict";
  var S = {
    on: true,
    edges: true,
    edgeColor: "#7ca0c0",
    edgeAmt: 0.2,
    edgeNormal: 0.42,
    edgeDepth: 0.2,
    edgeWidth: 0.75,
    scan: true,
    scanColor: "#4db2ff",
    scanSec: 2,
    scanBand: 2,
    scanAmt: 0.5,
    scanIdle: 0,
    ao: true,
    aoRadius: 4,
    aoAmt: 0.7,
    bloom: true,
    bloomAmt: 0.45,
    bloomRadius: 0.35,
    bloomTh: 0.6,
    vignette: 0.35,
    sky: true,
    skyTop: "#04070d",
    skyLow: "#0d1a2b",
    skyGlow: "#1d4f7a",
    fog: true,
    fogColor: "#0a1220",
    fogAmt: 0.35,
    cursor: false,
    cursorColor: "#8fc8ff",
    cursorAmt: 0.6,
    cursorSize: 26,
    res: 1.5
  };
  var SL = {
    edgeColor: "#959aa1",
    edgeAmt: 1,
    edgeWidth: 1,
    edgeDepth: 0.8,
    inner: 0.4,
    aoAmt: 0.7 * 0.55,
    bloom: false,
    vignette: 0,
    skyTop: "#d6dae1",
    skyLow: "#d6dae1",
    skyGlow: "#d6dae1",
    fogColor: "#d6dae1"
  };
  function C() {
    return ctx && ctx.isLight() ? Object.assign({}, S, SL) : S;
  }
  var LAB = document.documentElement.hasAttribute("data-fx-lab");
  if (/[?&]fx=off/.test(window.location.search)) {
    S.on = false;
  }
  var ctx = null, T = null, composer = null, P = {}, ready = false;
  var nrt = null, nMat = null, skyTex = null, skyTexL = null, fog = null, pool = null, ray = null, ndc = null;
  var U = null;
  var scanT0 = -1, scanLo = 0, scanHi = 0, stSig = "", warm = 0;
  var cur = {
    on: 0,
    want: 0,
    p: null,
    f: null
  };
  var size = {
    w: 0,
    h: 0,
    pr: 0
  };
  var fps = {
    n: 0,
    t0: 0,
    v: 0
  };
  window.APRISM_BLD_FX = {
    init: init,
    step: step,
    render: render,
    S: S,
    replay: function() {
      scanT0 = -1;
      stSig = "";
    }
  };
  function init(c) {
    ctx = c;
    T = c.THREE;
    Promise.all([ import("three/addons/postprocessing/EffectComposer.js"), import("three/addons/postprocessing/RenderPass.js"), import("three/addons/postprocessing/GTAOPass.js"), import("three/addons/postprocessing/UnrealBloomPass.js"), import("three/addons/postprocessing/OutputPass.js"), import("three/addons/postprocessing/ShaderPass.js"), LAB ? import("https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/dist/lil-gui.esm.min.js") : null ]).then(build).catch(function(e) {
      console.warn("[통합 순회 연출 v6] 효과를 못 불러와 원래대로 그린다", e);
    });
  }
  function pad(w, h) {
    var cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    return cv;
  }
  function tex(cv) {
    var t = new T.CanvasTexture(cv);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  function skyArt(S) {
    var W = 64, H = 512, cv = pad(W, H), g = cv.getContext("2d");
    var lin = g.createLinearGradient(0, 0, 0, H);
    lin.addColorStop(0, S.skyTop);
    lin.addColorStop(0.55, S.skyTop);
    lin.addColorStop(1, S.skyLow);
    g.fillStyle = lin;
    g.fillRect(0, 0, W, H);
    var big = pad(1024, 512), b = big.getContext("2d");
    b.drawImage(cv, 0, 0, 1024, 512);
    var r = b.createRadialGradient(512, 560, 0, 512, 560, 520);
    r.addColorStop(0, hexA(S.skyGlow, 0.55));
    r.addColorStop(1, hexA(S.skyGlow, 0));
    b.fillStyle = r;
    b.fillRect(0, 0, 1024, 512);
    return tex(big);
  }
  function hexA(hex, a) {
    var c = new T.Color(hex);
    return "rgba(" + Math.round(c.r * 255) + "," + Math.round(c.g * 255) + "," + Math.round(c.b * 255) + "," + a + ")";
  }
  function poolArt() {
    var N = 256, cv = pad(N, N), g = cv.getContext("2d");
    var r = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.35, "rgba(255,255,255,.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, N, N);
    return tex(cv);
  }
  function build(m) {
    var r = ctx.renderer;
    var rt = new T.WebGLRenderTarget(1, 1, {
      type: T.HalfFloatType,
      samples: 4
    });
    composer = new m[0].EffectComposer(r, rt);
    composer.addPass(P.render = new m[1].RenderPass(ctx.scene, ctx.camera));
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
      var cache = this._visibilityCache;
      this.scene.traverse(function(o) {
        cache.set(o, o.visible);
        if ((o.isMesh || o.isLine || o.isPoints || o.isSprite) && !o.userData.kind) {
          o.visible = false;
        }
        if (o.isLine) {
          o.visible = false;
        }
      });
    };
    var aoSize = P.ao.setSize;
    P.ao.setSize = function(w, h) {
      aoSize.call(this, Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    };
    composer.addPass(P.ao);
    nrt = new T.WebGLRenderTarget(1, 1, {
      type: T.HalfFloatType
    });
    nrt.depthTexture = new T.DepthTexture(1, 1);
    nMat = new T.MeshNormalMaterial;
    P.edge = new m[5].ShaderPass({
      uniforms: {
        tDiffuse: {
          value: null
        },
        tNormal: {
          value: null
        },
        tDepth: {
          value: null
        },
        texel: {
          value: new T.Vector2(1, 1)
        },
        color: {
          value: new T.Color(S.edgeColor)
        },
        amt: {
          value: S.edgeAmt
        },
        nTh: {
          value: S.edgeNormal
        },
        dTh: {
          value: S.edgeDepth
        },
        dSpan: {
          value: 8000
        },
        wid: {
          value: S.edgeWidth
        },
        front: {
          value: -1e4
        },
        band: {
          value: S.scanBand
        },
        scanAmt: {
          value: 0
        },
        mixMode: {
          value: 0
        },
        inner: {
          value: 1
        },
        camInvProj: {
          value: new T.Matrix4
        },
        camInvView: {
          value: new T.Matrix4
        }
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: [ "uniform sampler2D tDiffuse; uniform sampler2D tNormal; uniform sampler2D tDepth;", "uniform vec2 texel; uniform vec3 color; uniform float amt; uniform float nTh; uniform float dTh; uniform float dSpan; uniform float wid;", "uniform float front; uniform float band; uniform float scanAmt; uniform float mixMode; uniform float inner; uniform mat4 camInvProj; uniform mat4 camInvView;", "varying vec2 vUv;", "vec4 nAt(vec2 uv){ return texture2D(tNormal, uv); }", "float dAt(vec2 uv){ return texture2D(tDepth, uv).r; }", "void main(){", "  vec4 base = texture2D(tDiffuse, vUv);", "  vec4 n0 = nAt(vUv); float d0 = dAt(vUv);", "  float e = 0.0; float es = 0.0;", "  vec2 o[4]; o[0] = vec2(texel.x * wid, 0.0); o[1] = vec2(-texel.x * wid, 0.0); o[2] = vec2(0.0, texel.y * wid); o[3] = vec2(0.0, -texel.y * wid);", "  for (int i = 0; i < 4; i++) {", "    vec4 n = nAt(vUv + o[i]); float d = dAt(vUv + o[i]);", "    if (n.a < 0.5 && n0.a < 0.5) continue;", "    if (n.a < 0.5 || n0.a < 0.5) { e = max(e, 1.0); es = 1.0; continue; }", "    e = max(e, smoothstep(nTh, nTh + 0.25, distance(n.rgb, n0.rgb)));", "    e = max(e, smoothstep(dTh, dTh * 2.0, abs(d - d0) * dSpan));", "  }", "  float k = 1.0;", "  if (scanAmt > 0.001 && n0.a > 0.5) {", "    vec4 cp = camInvProj * vec4(vUv * 2.0 - 1.0, d0 * 2.0 - 1.0, 1.0); cp /= cp.w; vec3 wp = (camInvView * cp).xyz;", "    float s = smoothstep(front - band, front, wp.y) * (1.0 - smoothstep(front, front + 0.6, wp.y));", "    k += s * scanAmt * 2.5;", "  }", "  float w = max(es, e * inner);", "  gl_FragColor = mixMode > 0.5 ? vec4(mix(base.rgb, color, clamp(w * amt * k, 0.0, 1.0)), base.a) : vec4(base.rgb + color * e * amt * k, base.a);", "}" ].join("\n")
    });
    composer.addPass(P.edge);
    P.bloom = new m[3].UnrealBloomPass(new T.Vector2(1, 1), S.bloomAmt, S.bloomRadius, S.bloomTh);
    composer.addPass(P.bloom);
    composer.addPass(new m[4].OutputPass);
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
      fragmentShader: "uniform sampler2D tDiffuse; uniform float amount; uniform float aspect; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = (vUv - 0.5) * vec2(aspect, 1.0); float v = smoothstep(0.35, 1.05, length(d)); gl_FragColor = vec4(c.rgb * (1.0 - amount * v), c.a); }"
    });
    composer.addPass(P.vig);
    U = {
      uScanFront: {
        value: -1e4
      },
      uScanBand: {
        value: S.scanBand
      },
      uScanCol: {
        value: new T.Color(S.scanColor)
      },
      uScanAmt: {
        value: 0
      },
      uScanMix: {
        value: 0
      }
    };
    ctx.FLOORS.forEach(function(f) {
      var s = ctx.F[f];
      if (!s) {
        return;
      }
      Object.keys(s.mats).forEach(function(k) {
        patchScan(s.mats[k]);
      });
    });
    skyTex = skyArt(S);
    skyTexL = skyArt(Object.assign({}, S, SL));
    fog = new T.Fog(S.fogColor, 1500, 1700);
    pool = new T.Mesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({
      map: poolArt(),
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      opacity: 0,
      fog: false
    }));
    pool.renderOrder = 8;
    pool.raycast = function() {};
    ctx.scene.add(pool);
    ray = new T.Raycaster;
    ndc = new T.Vector2;
    ctx.view.addEventListener("pointermove", onMove);
    ctx.view.addEventListener("pointerleave", function() {
      cur.want = 0;
    });
    if (LAB) {
      panel(m[6].GUI);
      window.addEventListener("keydown", function(e) {
        if ((e.key === "b" || e.key === "B") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
          S.on = !S.on;
          badge();
        }
      });
    }
    ready = true;
    window.APRISM_BLD_FX.ready = performance.now();
    badge();
  }
  function patchScan(mat) {
    mat.onBeforeCompile = function(sh) {
      Object.keys(U).forEach(function(k) {
        sh.uniforms[k] = U[k];
      });
      sh.vertexShader = "varying float vScanY;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n  vScanY = (modelMatrix * vec4(transformed, 1.0)).y;");
      sh.fragmentShader = "uniform float uScanFront; uniform float uScanBand; uniform vec3 uScanCol; uniform float uScanAmt; uniform float uScanMix; varying float vScanY;\n" + sh.fragmentShader.replace("#include <dithering_fragment>", "  float sb = smoothstep(uScanFront - uScanBand, uScanFront, vScanY) * (1.0 - smoothstep(uScanFront, uScanFront + 0.6, vScanY));\n" + "  float below = 1.0 - smoothstep(uScanFront - uScanBand * 3.0, uScanFront - uScanBand, vScanY);\n" + "  float sk = (sb * 0.9 + (1.0 - below) * 0.06) * uScanAmt;\n" + "  gl_FragColor.rgb = uScanMix > 0.5 ? mix(gl_FragColor.rgb, uScanCol, clamp(sb * 0.9 * uScanAmt, 0.0, 1.0)) : gl_FragColor.rgb + uScanCol * sk;\n" + "#include <dithering_fragment>");
    };
    mat.customProgramCacheKey = function() {
      return "bld-fx-v6-scan";
    };
    mat.needsUpdate = true;
  }
  function onMove(e) {
    if (!ready || !active() || !S.cursor) {
      return;
    }
    var vr = ctx.view.getBoundingClientRect();
    ndc.set((e.clientX - vr.left) / vr.width * 2 - 1, -((e.clientY - vr.top) / vr.height) * 2 + 1);
    ray.setFromCamera(ndc, ctx.camera);
    var list = [];
    ctx.FLOORS.forEach(function(f) {
      var s = ctx.F[f];
      if (s && s.op > 0.5) {
        s.meshes.forEach(function(mm) {
          if (mm.userData.kind === "floor") {
            list.push(mm);
          }
        });
      }
    });
    var h = ray.intersectObjects(list, false)[0];
    if (!h) {
      cur.want = 0;
      return;
    }
    cur.want = 1;
    cur.f = h.object.userData.floor;
    if (!cur.p) {
      cur.p = h.point.clone();
    } else {
      cur.target = h.point.clone();
    }
    if (!cur.target) {
      cur.target = h.point.clone();
    }
  }
  function active() {
    return ready && S.on;
  }
  function step(now) {
    if (!ready) {
      return;
    }
    var on = active(), S = C(), light = ctx.isLight();
    U.uScanMix.value = light ? 1 : 0;
    ctx.scene.background = on && S.sky ? light ? skyTexL : skyTex : null;
    ctx.scene.fog = on && S.fog ? fog : null;
    pool.visible = false;
    U.uScanAmt.value = 0;
    ctx.FLOORS.forEach(function(f) {
      var s = ctx.F[f];
      if (s) {
        s.lines.forEach(function(ls) {
          ls.visible = !(on && S.edges) || light && ls.userData.kind === "stairs";
        });
      }
    });
    if (!on) {
      return;
    }
    var lo = Infinity, hi = -Infinity, rad = 0;
    ctx.FLOORS.forEach(function(f) {
      var s = ctx.F[f];
      if (s && s.op > 0.01) {
        lo = Math.min(lo, s.y);
        hi = Math.max(hi, s.y + s.size.y);
        rad = Math.max(rad, s.size.x, s.size.z);
      }
    });
    if (lo === Infinity) {
      return;
    }
    fog.color.set(S.fogColor);
    fog.near = 1500 - rad * 0.1;
    fog.far = 1500 + rad * (2.4 - 1.6 * S.fogAmt);
    var st = ctx.state(), sig = st.mode + "|" + st.cur;
    if (S.scan && warm >= 3 && (sig !== stSig || scanT0 < 0)) {
      stSig = sig;
      scanT0 = now + 120;
    }
    var t = S.scan && scanT0 >= 0 ? (now - scanT0) / (S.scanSec * 1000) : 2;
    if (S.scanIdle > 0 && t > 1 + S.scanIdle / S.scanSec) {
      scanT0 = now;
      t = 0;
    }
    var live = t >= 0 && t <= 1.15;
    var spans = [];
    ctx.FLOORS.forEach(function(f) {
      var s = ctx.F[f];
      if (s && s.op > 0.01) {
        spans.push([ s.y - 1, s.y + s.size.y + 2 ]);
      }
    });
    spans.sort(function(a, b) {
      return a[0] - b[0];
    });
    var total = spans.reduce(function(a, sp) {
      return a + sp[1] - sp[0];
    }, 0), go = total * Math.min(1, Math.max(0, t)), front = spans.length ? spans[spans.length - 1][1] : hi;
    for (var si = 0; si < spans.length; si += 1) {
      var len = spans[si][1] - spans[si][0];
      if (go <= len) {
        front = spans[si][0] + go;
        break;
      }
      go -= len;
    }
    window.APRISM_BLD_FX.front = front;
    U.uScanFront.value = front;
    U.uScanBand.value = S.scanBand;
    U.uScanCol.value.set(S.scanColor);
    U.uScanAmt.value = live ? S.scanAmt * (t > 1 ? 1 - (t - 1) / 0.15 : 1) : 0;
    P.edge.uniforms.front.value = front;
    P.edge.uniforms.band.value = S.scanBand;
    P.edge.uniforms.scanAmt.value = U.uScanAmt.value;
    cur.on += ((S.cursor ? cur.want : 0) - cur.on) * 0.12;
    if (cur.target) {
      if (!cur.p) {
        cur.p = cur.target.clone();
      }
      cur.p.lerp(cur.target, 0.2);
    }
    if (cur.on > 0.01 && cur.p) {
      pool.visible = true;
      pool.position.set(cur.p.x, cur.p.y + 0.06, cur.p.z);
      pool.scale.set(S.cursorSize, 1, S.cursorSize);
      pool.material.color.set(S.cursorColor);
      pool.material.opacity = S.cursorAmt * cur.on;
    }
  }
  function render() {
    if (!active()) {
      return false;
    }
    var S = C();
    P.edge.uniforms.mixMode.value = ctx.isLight() ? 1 : 0;
    P.edge.uniforms.inner.value = ctx.isLight() ? SL.inner : 1;
    var r = ctx.renderer, v = r.getSize(new T.Vector2), pr = Math.min(r.getPixelRatio(), S.res);
    if (v.x !== size.w || v.y !== size.h || pr !== size.pr) {
      size = {
        w: v.x,
        h: v.y,
        pr: pr
      };
      composer.setPixelRatio(pr);
      composer.setSize(v.x, v.y);
      nrt.setSize(Math.round(v.x * pr), Math.round(v.y * pr));
      P.edge.uniforms.texel.value.set(1 / (v.x * pr), 1 / (v.y * pr));
      P.vig.uniforms.aspect.value = v.x / Math.max(1, v.y);
    }
    P.edge.enabled = S.edges;
    if (S.edges) {
      var hide = [];
      ctx.scene.traverse(function(o) {
        if ((o.isLine || o.isPoints || o.isSprite || o.isMesh && !o.userData.kind) && o.visible) {
          hide.push(o);
          o.visible = false;
        }
      });
      var bg = ctx.scene.background, fg = ctx.scene.fog;
      ctx.scene.background = null;
      ctx.scene.fog = null;
      ctx.scene.overrideMaterial = nMat;
      var cc = r.getClearColor(new T.Color), ca = r.getClearAlpha();
      r.setClearColor(0x000000, 0);
      r.setRenderTarget(nrt);
      r.clear();
      r.render(ctx.scene, ctx.camera);
      r.setRenderTarget(null);
      r.setClearColor(cc, ca);
      ctx.scene.overrideMaterial = null;
      ctx.scene.background = bg;
      ctx.scene.fog = fg;
      hide.forEach(function(o) {
        o.visible = true;
      });
      var u = P.edge.uniforms;
      u.tNormal.value = nrt.texture;
      u.tDepth.value = nrt.depthTexture;
      u.color.value.set(S.edgeColor);
      u.amt.value = S.edgeAmt;
      u.nTh.value = S.edgeNormal;
      u.dTh.value = S.edgeDepth;
      u.wid.value = S.edgeWidth;
      u.dSpan.value = ctx.camera.far - ctx.camera.near;
      u.camInvProj.value.copy(ctx.camera.projectionMatrixInverse);
      u.camInvView.value.copy(ctx.camera.matrixWorld);
    }
    P.ao.enabled = S.ao;
    P.ao.updateGtaoMaterial({
      radius: S.aoRadius,
      distanceExponent: 1,
      thickness: S.aoRadius * 3,
      scale: 1,
      samples: 8
    });
    P.ao.blendIntensity = S.aoAmt;
    P.bloom.enabled = S.bloom;
    P.bloom.strength = S.bloomAmt;
    P.bloom.radius = S.bloomRadius;
    P.bloom.threshold = S.bloomTh;
    P.vig.enabled = S.vignette > 0;
    P.vig.uniforms.amount.value = S.vignette;
    composer.render();
    warm += 1;
    tick();
    return true;
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
      badge();
    }
  }
  var tag = null;
  function badge() {
    if (!LAB) {
      return;
    }
    if (!tag) {
      tag = document.createElement("div");
      tag.className = "lab-fx-tag";
      document.body.appendChild(tag);
    }
    tag.textContent = (S.on ? ctx.isLight() ? "라이트 연출" : "연출 켜짐" + (fps.v ? " · " + fps.v + " fps" : "") : "연출 꺼짐 · 운영 화면과 같음") + "  ·  B 로 전환";
    tag.classList.toggle("is-off", !S.on);
  }
  function panel(GUI) {
    var gui = new GUI({
      title: "통합 순회 연출 v6"
    });
    gui.domElement.classList.add("lab-fx-gui");
    gui.add(S, "on").name("연출 켜기 (B)").onChange(badge).listen();
    var f = gui.addFolder("1 셰이더 윤곽선");
    f.add(S, "edges").name("켜기 (끄면 선 도형)");
    f.addColor(S, "edgeColor").name("색");
    f.add(S, "edgeAmt", 0, 3, 0.05).name("세기");
    f.add(S, "edgeNormal", 0.05, 1, 0.01).name("꺾임 문턱");
    f.add(S, "edgeDepth", 0.1, 5, 0.1).name("깊이 문턱");
    f.add(S, "edgeWidth", 0.5, 2.5, 0.25).name("굵기");
    f = gui.addFolder("2 스캔 라인");
    f.add(S, "scan").name("켜기");
    f.addColor(S, "scanColor").name("색");
    f.add(S, "scanSec", 0.6, 5, 0.1).name("차오르는 시간 (초)");
    f.add(S, "scanBand", 0.5, 10, 0.5).name("띠 두께");
    f.add(S, "scanAmt", 0, 3, 0.05).name("세기");
    f.add(S, "scanIdle", 0, 20, 1).name("되풀이 (초, 0=한 번)");
    f.add(window.APRISM_BLD_FX, "replay").name("다시 차오르기");
    f = gui.addFolder("3 AO · 블룸 · 비네트");
    f.close();
    f.add(S, "ao").name("AO");
    f.add(S, "aoRadius", 1, 12, 0.5).name("AO 반경");
    f.add(S, "aoAmt", 0, 1, 0.05).name("AO 세기");
    f.add(S, "bloom").name("블룸");
    f.add(S, "bloomAmt", 0, 2, 0.05).name("블룸 세기");
    f.add(S, "bloomRadius", 0, 1, 0.05).name("블룸 폭");
    f.add(S, "bloomTh", 0, 1, 0.01).name("블룸 문턱");
    f.add(S, "vignette", 0, 0.9, 0.05).name("비네트");
    f = gui.addFolder("4 배경 · 안개");
    f.close();
    f.add(S, "sky").name("그라데이션 하늘");
    [ "skyTop", "skyLow", "skyGlow" ].forEach(function(k, i) {
      f.addColor(S, k).name([ "위", "지평선", "빛" ][i]).onChange(function() {
        skyTex = skyArt();
      });
    });
    f.add(S, "fog").name("안개");
    f.addColor(S, "fogColor").name("안개 색");
    f.add(S, "fogAmt", 0, 1, 0.05).name("안개 세기");
    f = gui.addFolder("5 커서 빛");
    f.close();
    f.add(S, "cursor").name("켜기");
    f.addColor(S, "cursorColor").name("색");
    f.add(S, "cursorAmt", 0, 1, 0.05).name("세기");
    f.add(S, "cursorSize", 8, 60, 1).name("크기");
    gui.add(S, "res", {
      "1 (가벼움)": 1,
      1.5: 1.5,
      2: 2
    }).name("해상도 배율").onChange(function(v) {
      S.res = +v;
    });
    gui.add({
      copy: function() {
        var txt = JSON.stringify(S, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt);
        }
        console.log("[통합 순회 연출 v6] 지금 값\n" + txt);
      }
    }, "copy").name("지금 값 복사");
  }
})();
