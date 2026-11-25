/* [11/25 디자이너] Delta 홀로그램(채택안 "J 강하게", 실험실 lab-delta-icon-v7) — Delta 가 무언가를 만드는 동안에만 육각 아이콘 위에 켬.
 * 박 조각 = 아이콘의 삼각 면 하나. 면마다 파랑 명도(blue-100 ~ 650, 흰 판은 300 ~ 750)가 빛을 따라 바뀜. 평소(정지)는 --ds-ai-face 면 명암.
 * 쓰는 법: var stop = window.APRISM_DELTA_HOLO.start(iconEl); … stop();   iconEl = 마스크로 육각을 그리는 .i 같은 정사각 상자.
 * 움직임 줄이기면 켜지 않음. WebGL 판 하나를 같이 쓰고 아이콘마다 옮겨 찍음.
 *
 * 셰이더는 React Bits HoloCard(JS-CSS)를 줄여 옮김 — Copyright (c) 2026 David Haz, MIT + Commons Clause License Condition v1.0
 * (https://github.com/DavidHDev/react-bits). 앱 안에서 쓰는 것은 허용, 컴포넌트 자체를 팔거나 따로 배포하는 것은 금지. */
(function () {
  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "uniform sampler2D uArt; uniform vec2 uSize; uniform vec2 uTilt; uniform vec2 uLight; uniform float uDistance;",
    "uniform vec3 uRamp[4]; uniform vec3 uFoil; uniform float uSide; uniform vec2 uCenter;",
    "out vec4 outColor;",
    "float hash(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }",
    "vec3 hue(float t) { t = abs(fract(t * 0.5) * 2.0 - 1.0); vec3 b = mix(uRamp[0], uRamp[1], smoothstep(0.0, 0.33, t)); b = mix(b, uRamp[2], smoothstep(0.33, 0.66, t)); return mix(b, uRamp[3], smoothstep(0.66, 1.0, t)); }",
    "void main() {",
    "  vec2 uv = vec2(gl_FragCoord.x / uSize.x, 1.0 - gl_FragCoord.y / uSize.y);",
    "  vec4 s = texture(uArt, uv); if (s.a <= 0.0) { outColor = vec4(0.0); return; }",
    "  vec3 art = pow(s.rgb, vec3(2.2)); vec2 c = vec2(0.5);",
    "  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cos(uTilt.x), sin(uTilt.x), 0.0, -sin(uTilt.x), cos(uTilt.x));",
    "  mat3 ry = mat3(cos(uTilt.y), 0.0, -sin(uTilt.y), 0.0, 1.0, 0.0, sin(uTilt.y), 0.0, cos(uTilt.y));",
    "  mat3 turn = rx * ry; vec3 world = turn * vec3(uv - c, 0.0);",
    "  vec3 view = normalize(transpose(turn) * (vec3(0.0, 0.0, uDistance) - world));",
    "  vec3 light = normalize(transpose(turn) * (vec3((uLight - 0.5) * 1.1, 0.9) - world));",
    "  vec3 halfway = normalize(light + view); vec2 sweep = light.xy + view.xy;",
    "  float sheen = pow(max(halfway.z, 0.0), 10.0), shine = pow(max(halfway.z, 0.0), 80.0);",
    // 박 조각: 육각을 나누는 정삼각 격자(삼각 면 하나 = 한 조각), 면은 바깥으로 기움
    "  vec2 d = (uv - uCenter) / uSide; float u = d.x + d.y / 1.7320508, v = -2.0 * d.y / 1.7320508;",
    "  vec2 cell = floor(vec2(u, v)), f = fract(vec2(u, v)); float up = step(1.0, f.x + f.y); vec2 id = cell * 2.0 + vec2(up, 0.0);",
    "  float seam = smoothstep(0.0, 0.06, min(min(f.x, f.y), abs(1.0 - f.x - f.y)));",
    "  vec2 mid = cell + (up > 0.5 ? vec2(2.0 / 3.0) : vec2(1.0 / 3.0)); vec2 cxy = vec2(mid.x + 0.5 * mid.y, -mid.y * 0.8660254);",
    "  vec2 nrm = normalize(cxy + 0.0001) * 0.42; float ang = atan(cxy.y, cxy.x);",
    "  float phase = dot(sweep, vec2(cos(ang), sin(ang))) * 1.2 + dot(sweep, vec2(0.8, 0.6)) * 1.6 + hash(id + 3.1) * 0.35 * 0.55;",
    "  float glint = pow(max(dot(normalize(vec3(nrm, 1.0)), halfway), 0.0), 24.0);",
    "  vec3 foil = hue(phase) * (1.15 + 0.3 * sheen) + uFoil * glint * 1.2;",
    "  float awake = mix(0.75, 1.0, smoothstep(0.02, 0.21, length(sin(uTilt))));",
    "  vec3 col = mix(art, foil, clamp(0.85 * (0.35 + 0.65 * seam) * awake * 0.8, 0.0, 1.0));",
    "  col += vec3(sheen * 0.07 + shine * 0.3) * 0.5;",
    "  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)); outColor = vec4(col * s.a, s.a);",
    "}"
  ].join("\n");
  var VERT = "#version 300 es\nin vec2 position;\nvoid main(){gl_Position=vec4(position,0.0,1.0);}";
  // 육각 아이콘(--ic-delta-hex) 그림과 면 나눔 — 24 격자, 가운데 (12.11, 11.59), 꼭짓점 6
  var SA = "M21.8037 11.5879L16.959 19.9805H7.26758L2.42285 11.5889L7.26758 3.19629H16.959L21.8037 11.5879ZM5.16541 10.838C4.97296 11.1713 5.21347 11.588 5.59835 11.588L12.5 11.5889L15.4282 17.0997C15.6125 17.4465 16.1063 17.4552 16.3027 17.1151L19.061 12.338C19.2535 12.0047 19.0129 11.588 18.6279 11.588L12.5 11.5889L8.86566 5.89057C8.66393 5.57428 8.19868 5.58454 8.0111 5.90942L5.16541 10.838Z";
  var V = [[16.959, 3.196], [21.804, 11.588], [16.959, 19.98], [7.268, 19.98], [2.423, 11.589], [7.268, 3.196]];
  // 면 색(--ds-ai-face 와 같은 단): 위, 오른쪽 위, 오른쪽 아래, 아래, 왼쪽 아래, 왼쪽 위 / 홀로 파랑 폭 넷
  var FACE = { dark: ["300", "500", "750", "650", "400", "200"], light: ["500", "650", "900", "750", "600", "400"] };
  var WIDE = { dark: ["100", "300", "500", "650"], light: ["300", "500", "650", "750"] };
  var TILT = 28, PERSP = 1100;
  var gl = null, gc = null, U = {}, items = [], raf = 0, last = 0;

  function init() {
    if (gl) { return true; }
    gc = document.createElement("canvas");
    gl = gc.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
    if (!gl) { return false; }
    function sh(t, src) { var o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(pr, 0, "position"); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    ["uArt", "uSize", "uTilt", "uLight", "uDistance", "uRamp", "uFoil", "uSide", "uCenter"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    return true;
  }
  function color(el, step) {   // 토큰 값(테마 · 판 범위에 따라 바뀐 값)을 그 자리에서 읽음
    var t = document.createElement("i"); t.style.color = "var(--color-blue-" + step + ")"; t.style.display = "none"; el.appendChild(t);
    var c = getComputedStyle(t).color; t.remove(); return c;
  }
  function lin(c) { return (c.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(function (v) { return Math.pow(v / 255, 2.2); }); }
  function isLight(el) {
    if (el.closest(".is-dark-scope")) { return false; }
    return document.documentElement.getAttribute("data-theme") === "light" || !!el.closest(".is-light-scope");
  }
  function texture(el, tone) {
    var N = 256, c = document.createElement("canvas"); c.width = c.height = N;
    var x = c.getContext("2d"); x.scale(N / 24, N / 24); x.save(); x.clip(new Path2D(SA), "evenodd");
    // 면 i: 가운데 + 꼭짓점 V[i], V[i+1] — 위(5,0) 오른쪽 위(0,1) 오른쪽 아래(1,2) 아래(2,3) 왼쪽 아래(3,4) 왼쪽 위(4,5)
    var pairs = [[5, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
    pairs.forEach(function (pq, i) {
      var p = V[pq[0]], q = V[pq[1]]; x.beginPath(); x.moveTo(12.11, 11.59); x.lineTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.closePath();
      x.fillStyle = color(el, FACE[tone][i]); x.fill(); x.strokeStyle = x.fillStyle; x.lineWidth = 0.05; x.stroke();
    });
    x.restore();
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); gl.generateMipmap(gl.TEXTURE_2D);
    return t;
  }
  function frame(now) {
    raf = 0; if (!items.length) { return; }
    var dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000)); last = now;
    items.forEach(function (it) {
      var s = it.s; s.clock += dt; var t = s.clock;
      // 가만히 있어도 깨어 있음: 기울기 · 빛이 천천히 돎(실험실 "강하게"의 두 배 흔들림)
      s.tx = Math.sin(t * 0.7) * TILT * 0.56; s.ty = Math.sin(t * 0.53 + 1.2) * TILT * 0.8;
      s.lx = 0.5 + Math.sin(t * 0.41 * 2) * 0.42; s.ly = 0.38 + Math.sin(t * 0.33 * 2 + 0.6) * 0.3;
      var w = it.cv.width; if (gc.width !== w) { gc.width = w; gc.height = w; }
      gl.viewport(0, 0, w, w); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.tex); gl.uniform1i(U.uArt, 0);
      gl.uniform2f(U.uSize, w, w); gl.uniform2f(U.uTilt, s.tx * Math.PI / 180, s.ty * Math.PI / 180); gl.uniform2f(U.uLight, s.lx, s.ly);
      gl.uniform1f(U.uDistance, PERSP / Math.max(1, it.size)); gl.uniform3fv(U.uRamp, it.ramp); gl.uniform3fv(U.uFoil, it.ramp.slice(0, 3));
      gl.uniform1f(U.uSide, 9.69 / 24); gl.uniform2f(U.uCenter, 12.11 / 24, 11.59 / 24);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      it.ctx.clearRect(0, 0, w, w); it.ctx.drawImage(gc, 0, 0);
    });
    raf = requestAnimationFrame(frame);
  }
  window.APRISM_DELTA_HOLO = {
    start: function (el) {
      var none = function () {};
      if (!el || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || !init()) { return none; }
      var size = Math.round(el.getBoundingClientRect().width) || 16, dpr = Math.min(window.devicePixelRatio || 1, 2);
      var tone = isLight(el) ? "light" : "dark";
      var cv = document.createElement("canvas"); cv.className = "ds-delta-holo"; cv.width = cv.height = Math.round(size * dpr); cv.setAttribute("aria-hidden", "true");
      el.appendChild(cv);
      var it = { cv: cv, ctx: cv.getContext("2d"), size: size, tex: texture(el, tone), s: { clock: Math.random() * 6 },
        ramp: [].concat.apply([], WIDE[tone].map(function (st) { return lin(color(el, st)); })) };
      items.push(it);
      requestAnimationFrame(function () { cv.classList.add("is-on"); });
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      return function stop() {
        cv.classList.remove("is-on");
        setTimeout(function () { items = items.filter(function (x) { return x !== it; }); cv.remove(); if (it.tex) { gl.deleteTexture(it.tex); } }, 400);
      };
    }
  };
})();
