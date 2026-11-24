(function(global) {
  "use strict";
  var PALETTES = {
    critical: {
      a: [ 0.64, 0.24, 0.30 ],
      b: [ 0.30, 0.20, 0.20 ],
      c: [ 0.6, 0.6, 0.6 ],
      d: [ 0.00, 0.16, 0.32 ]
    },
    warning: {
      a: [ 0.72, 0.50, 0.24 ],
      b: [ 0.24, 0.26, 0.18 ],
      c: [ 0.6, 0.6, 0.6 ],
      d: [ 0.05, 0.12, 0.36 ]
    },
    safe: {
      a: [ 0.26, 0.60, 0.44 ],
      b: [ 0.22, 0.26, 0.22 ],
      c: [ 0.6, 0.6, 0.6 ],
      d: [ 0.32, 0.04, 0.20 ]
    },
    info: {
      a: [ 0.28, 0.42, 0.74 ],
      b: [ 0.24, 0.24, 0.20 ],
      c: [ 0.6, 0.6, 0.6 ],
      d: [ 0.38, 0.22, 0.04 ]
    }
  };
  var DEFAULTS = {
    palette: "info",
    glass: true,
    bevel: 0.4,
    coreBlur: 0.05,
    refraction: 0.16,
    dispersion: 0.35,
    glow: 1,
    hueShift: 0,
    speed: 1
  };
  var PAL_FN = `\n  uniform vec3 uA, uB, uC, uD;\n  vec3 pal(float t) { return uA + uB * cos(6.28318 * (uC * t + uD)); }\n`;
  var VERT = `\n  varying vec3 vViewPos;\n  varying vec3 vLocal;\n  varying vec3 vSphereN;\n  varying vec3 vNorm;\n  void main() {\n    vLocal = position;\n    vSphereN = normalMatrix * normalize(position);\n    vNorm = normalMatrix * normal;\n    vec4 mv = modelViewMatrix * vec4(position, 1.0);\n    vViewPos = mv.xyz;\n    gl_Position = projectionMatrix * mv;\n  }\n`;
  var CORE_FRAG = `\n  precision highp float;\n  uniform float uTime, uShift;\n  ${PAL_FN}\n  varying vec3 vViewPos;\n  varying vec3 vLocal;\n  varying vec3 vSphereN;\n  varying vec3 vNorm;\n  void main() {\n    vec3 N = normalize(vLocal);\n    vec3 V = normalize(-vViewPos);\n    float t = 0.30 + 0.42 * N.y + 0.16 * sin(N.x * 2.3 + uTime * 0.5)\n            + 0.10 * sin(N.z * 3.1 - uTime * 0.37) + uShift;\n    vec3 col = pal(t) * 1.25;\n    col += pal(t + 0.18) * 0.45 * smoothstep(0.1, 0.9, 0.5 + 0.5 * sin(N.y * 4.0 + uTime * 0.6));\n    float edge = 1.0 - clamp(dot(normalize(vLocal), V), 0.0, 1.0);\n    float falloff = pow(clamp(1.0 - edge, 0.0, 1.0), 2.2);\n    col *= 0.6 + 1.3 * falloff;\n    // white only at the hot centre, colour everywhere else\n    col = mix(col, vec3(1.6), pow(falloff, 6.0) * 0.85);\n    gl_FragColor = vec4(col * falloff, falloff);\n  }\n`;
  var BLUR_FRAG = `\n  precision highp float;\n  uniform sampler2D uSrc;\n  uniform vec2 uDir;\n  varying vec2 vUv;\n  void main() {\n    vec4 s = texture2D(uSrc, vUv) * 0.1964;\n    s += (texture2D(uSrc, vUv + uDir * 1.4) + texture2D(uSrc, vUv - uDir * 1.4)) * 0.1748;\n    s += (texture2D(uSrc, vUv + uDir * 3.3) + texture2D(uSrc, vUv - uDir * 3.3)) * 0.1213;\n    s += (texture2D(uSrc, vUv + uDir * 5.3) + texture2D(uSrc, vUv - uDir * 5.3)) * 0.0658;\n    s += (texture2D(uSrc, vUv + uDir * 7.4) + texture2D(uSrc, vUv - uDir * 7.4)) * 0.0299;\n    gl_FragColor = s;\n  }\n`;
  var QUAD_VERT = `\n  varying vec2 vUv;\n  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }\n`;
  var SHELL_FRAG = `\n  precision highp float;\n  uniform float uTime, uGlow, uShift, uGlass, uRefract, uDisp, uBlur, uBevel;\n  uniform vec2 uRes;\n  uniform sampler2D uTex;\n  uniform sampler2D uSoftTex;\n  ${PAL_FN}\n  varying vec3 vViewPos;\n  varying vec3 vLocal;\n  varying vec3 vSphereN;\n  varying vec3 vNorm;\n\n  vec4 samp(vec2 uv, vec2 off, float k) {\n    return texture2D(uTex, clamp(uv + off * k, vec2(0.002), vec2(0.998)));\n  }\n\n  // wide poisson-ish blur so the core reads as light, not a solid body\n  vec4 soft(vec2 uv, vec2 off, float k, float r) {\n    vec4 s = samp(uv, off, k) * 0.16;\n    s += samp(uv, off + vec2( r,     0.0), k) * 0.105;\n    s += samp(uv, off + vec2(-r,     0.0), k) * 0.105;\n    s += samp(uv, off + vec2( 0.0,   r  ), k) * 0.105;\n    s += samp(uv, off + vec2( 0.0,  -r  ), k) * 0.105;\n    s += samp(uv, off + vec2( r*0.7, r*0.7), k) * 0.085;\n    s += samp(uv, off + vec2(-r*0.7, r*0.7), k) * 0.085;\n    s += samp(uv, off + vec2( r*0.7,-r*0.7), k) * 0.085;\n    s += samp(uv, off + vec2(-r*0.7,-r*0.7), k) * 0.085;\n    s += samp(uv, off + vec2( r*1.9, 0.0), k) * 0.0225;\n    s += samp(uv, off + vec2(-r*1.9, 0.0), k) * 0.0225;\n    s += samp(uv, off + vec2( 0.0, r*1.9), k) * 0.0225;\n    s += samp(uv, off + vec2( 0.0,-r*1.9), k) * 0.0225;\n    return s;\n  }\n\n  void main() {\n    // beveled geometry carries true smooth normals; hard-faceted geometry uses screen-space flat normals\n    vec3 N = uBevel > 0.5\n      ? normalize(vNorm)\n      : normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));\n    vec3 V = normalize(-vViewPos);\n    if (dot(N, V) < 0.0) N = -N;\n    float ndv = clamp(dot(N, V), 0.0, 1.0);\n    float fres = pow(1.0 - ndv, 2.4);\n\n    vec3 L1 = normalize(vec3(-0.45, 0.85, 0.55));\n    vec3 L2 = normalize(vec3(0.75, -0.35, 0.40));\n    float d1 = max(dot(N, L1), 0.0);\n    float d2 = max(dot(N, L2), 0.0);\n\n    float spread = 0.34 * N.x + 0.30 * N.y + 0.12 * fres;\n    float band = 0.08 * sin(uTime * 0.11) + uShift;\n    float t = 0.38 + clamp(spread, -0.28, 0.28) + band;\n    vec3 tint = pal(t) * 0.6 + pal(t + 0.04) * 0.4;\n\n    float lum = clamp(0.16 + 0.85 * pow(d1, 1.3) + 0.32 * pow(d2, 2.0), 0.0, 1.0);\n    vec3 solid = mix(vec3(0.024, 0.022, 0.030), tint, smoothstep(0.13, 0.55, lum));\n    solid = mix(solid, vec3(1.0), smoothstep(0.80, 1.0, lum) * 0.12);\n\n    vec3 col = solid;\n    float a = 1.0;\n\n    if (uGlass > 0.5) {\n      vec2 uv = gl_FragCoord.xy / uRes;\n      vec3 R = refract(-V, N, 1.0 / 1.45);\n      vec2 off = R.xy * uRefract * (0.55 + 0.75 * fres);\n      float rad = uBlur;\n      vec4 r = texture2D(uSoftTex, clamp(uv + off * (1.0 - uDisp), vec2(0.002), vec2(0.998)));\n      vec4 g = texture2D(uSoftTex, clamp(uv + off, vec2(0.002), vec2(0.998)));\n      vec4 b = texture2D(uSoftTex, clamp(uv + off * (1.0 + uDisp), vec2(0.002), vec2(0.998)));\n      vec4 blur = soft(uv, off, 1.0, rad);\n      vec3 refr = vec3(r.r, g.g, b.b) * 0.6 + blur.rgb * 0.4;\n      float mask = smoothstep(0.005, 0.45, (r.a + g.a + b.a) / 3.0);\n      float bleed = clamp(blur.a * 3.2, 0.0, 1.0);\n      vec3 bleedCol = blur.rgb / max(blur.a, 0.02);\n\n      vec3 glassBody = mix(solid * 0.9, solid * 0.35 + bleedCol * 0.75, bleed * 0.8);\n      glassBody += refr * (0.9 + 0.5 * ndv) * mask;\n      glassBody += tint * 0.12 * lum;\n      col = glassBody;\n      a = clamp(0.46 + 0.54 * pow(fres, 1.1) + mask * 0.35 + bleed * 0.25, 0.0, 1.0);\n      if (!gl_FrontFacing) { col *= 0.55; a *= 0.5; }\n    } else if (!gl_FrontFacing) {\n      col *= 0.55;\n    }\n\n    vec3 H = normalize(L1 + V);\n    col += vec3(1.0) * pow(max(dot(N, H), 0.0), 72.0) * 0.26;\n    col += pal(t + 0.15) * pow(fres, 2.0) * 0.55 * uGlow;\n\n\n    gl_FragColor = vec4(col, a);\n  }\n`;
  var VS_HEAD = [ "#version 300 es", "#define attribute in", "#define varying out", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat3 normalMatrix;", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "" ].join("\n");
  var FS_HEAD = [ "#version 300 es", "#define varying in", "#define texture2D texture", "precision highp float;", "out highp vec4 pc_fragColor;", "#define gl_FragColor pc_fragColor", "" ].join("\n");
  var CAM_Z = 5.4;
  var CAM_NEAR = 0.1;
  var CAM_FAR = 100;
  var ORB_FILL = 0.8;
  var REF_PX = 1360;
  var SUPERSAMPLE = 2;
  var MAX_RATIO = 4;
  var STILL_T = 2.0;
  var PHI = (1 + Math.sqrt(5)) / 2;
  var ICO_V = [ -1, PHI, 0, 1, PHI, 0, -1, -PHI, 0, 1, -PHI, 0, 0, -1, PHI, 0, 1, PHI, 0, -1, -PHI, 0, 1, -PHI, PHI, 0, -1, PHI, 0, 1, -PHI, 0, -1, -PHI, 0, 1 ];
  var ICO_I = [ 0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1 ];
  function lerp3(a, b, t) {
    return [ a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t ];
  }
  function subdivideFace(a, b, c, detail, out) {
    var cols = detail + 1;
    var grid = [];
    var i, j;
    for (i = 0; i <= cols; i++) {
      grid[i] = [];
      var aj = lerp3(a, c, i / cols);
      var bj = lerp3(b, c, i / cols);
      var rows = cols - i;
      for (j = 0; j <= rows; j++) {
        grid[i][j] = j === 0 && i === cols ? aj : lerp3(aj, bj, j / rows);
      }
    }
    function push(v) {
      out.push(v[0], v[1], v[2]);
    }
    for (i = 0; i < cols; i++) {
      for (j = 0; j < 2 * (cols - i) - 1; j++) {
        var k = Math.floor(j / 2);
        if (j % 2 === 0) {
          push(grid[i][k + 1]);
          push(grid[i + 1][k]);
          push(grid[i][k]);
        } else {
          push(grid[i][k + 1]);
          push(grid[i + 1][k + 1]);
          push(grid[i + 1][k]);
        }
      }
    }
  }
  function icosahedron(radius, detail) {
    var out = [];
    for (var f = 0; f < ICO_I.length; f += 3) {
      var ia = ICO_I[f] * 3, ib = ICO_I[f + 1] * 3, ic = ICO_I[f + 2] * 3;
      subdivideFace([ ICO_V[ia], ICO_V[ia + 1], ICO_V[ia + 2] ], [ ICO_V[ib], ICO_V[ib + 1], ICO_V[ib + 2] ], [ ICO_V[ic], ICO_V[ic + 1], ICO_V[ic + 2] ], detail, out);
    }
    var pos = new Float32Array(out);
    for (var i = 0; i < pos.length; i += 3) {
      var l = Math.sqrt(pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2]) || 1;
      var s = radius / l;
      pos[i] *= s;
      pos[i + 1] *= s;
      pos[i + 2] *= s;
    }
    return pos;
  }
  function flatNormals(pos) {
    var nrm = new Float32Array(pos.length);
    for (var i = 0; i < pos.length; i += 9) {
      var ax = pos[i], ay = pos[i + 1], az = pos[i + 2];
      var bx = pos[i + 3], by = pos[i + 4], bz = pos[i + 5];
      var cx = pos[i + 6], cy = pos[i + 7], cz = pos[i + 8];
      var ux = cx - bx, uy = cy - by, uz = cz - bz;
      var vx = ax - bx, vy = ay - by, vz = az - bz;
      var nx = uy * vz - uz * vy;
      var ny = uz * vx - ux * vz;
      var nz = ux * vy - uy * vx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= l;
      ny /= l;
      nz /= l;
      for (var k = 0; k < 9; k += 3) {
        nrm[i + k] = nx;
        nrm[i + k + 1] = ny;
        nrm[i + k + 2] = nz;
      }
    }
    return nrm;
  }
  function sphereNormals(pos) {
    var nrm = new Float32Array(pos.length);
    for (var i = 0; i < pos.length; i += 3) {
      var l = Math.sqrt(pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2]) || 1;
      nrm[i] = pos[i] / l;
      nrm[i + 1] = pos[i + 1] / l;
      nrm[i + 2] = pos[i + 2] / l;
    }
    return nrm;
  }
  function maxReach(pos) {
    var m = 0;
    for (var i = 0; i < pos.length; i += 3) {
      var r = Math.sqrt(pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2]);
      if (r > m) m = r;
    }
    return m;
  }
  function solid(radius, detail) {
    var pos = icosahedron(radius, detail);
    return {
      position: pos,
      normal: detail === 0 ? flatNormals(pos) : sphereNormals(pos)
    };
  }
  function bevelize(base, bevel) {
    var planes = [];
    var i, q;
    for (i = 0; i < base.length; i += 9) {
      var ax = base[i], ay = base[i + 1], az = base[i + 2];
      var abx = base[i + 3] - ax, aby = base[i + 4] - ay, abz = base[i + 5] - az;
      var acx = base[i + 6] - ax, acy = base[i + 7] - ay, acz = base[i + 8] - az;
      var nx = aby * acz - abz * acy;
      var ny = abz * acx - abx * acz;
      var nz = abx * acy - aby * acx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (!l) continue;
      nx /= l;
      ny /= l;
      nz /= l;
      if (nx * ax + ny * ay + nz * az < 0) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      var d = nx * ax + ny * ay + nz * az;
      if (d <= 1e-4) continue;
      var seen = false;
      for (q = 0; q < planes.length; q++) {
        if (planes[q][0] * nx + planes[q][1] * ny + planes[q][2] * nz > 0.999) {
          seen = true;
          break;
        }
      }
      if (!seen) planes.push([ nx, ny, nz, d ]);
    }
    if (!planes.length) return {
      position: base,
      normal: flatNormals(base)
    };
    var k = Math.min(Math.max(bevel, 0), 1);
    var p = Math.pow(2, 9.8 - 2.5 * k);
    var pos = icosahedron(1, 5);
    for (i = 0; i < pos.length; i += 3) {
      var x = pos[i], y = pos[i + 1], z = pos[i + 2];
      var sum = 0;
      for (q = 0; q < planes.length; q++) {
        var pl = planes[q];
        var dp = x * pl[0] + y * pl[1] + z * pl[2];
        if (dp > 0) sum += Math.pow(dp / pl[3], p);
      }
      var s = sum > 0 ? Math.pow(sum, -1 / p) : 1;
      pos[i] = x * s;
      pos[i + 1] = y * s;
      pos[i + 2] = z * s;
    }
    return {
      position: pos,
      normal: flatNormals(pos)
    };
  }
  function mat4() {
    return new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
  }
  function mul4(out, a, b) {
    for (var c = 0; c < 4; c++) {
      var b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return out;
  }
  function perspective(out, fovDeg, aspect, near, far) {
    var top = near * Math.tan(fovDeg * Math.PI / 360);
    var height = 2 * top, width = aspect * height;
    out[0] = 2 * near / width;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 2 * near / height;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = -(far + near) / (far - near);
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = -2 * far * near / (far - near);
    out[15] = 0;
    return out;
  }
  function eulerXYZ(out, x, y, z, ty) {
    var a = Math.cos(x), b = Math.sin(x);
    var c = Math.cos(y), d = Math.sin(y);
    var e = Math.cos(z), f = Math.sin(z);
    var ae = a * e, af = a * f, be = b * e, bf = b * f;
    out[0] = c * e;
    out[4] = -c * f;
    out[8] = d;
    out[12] = 0;
    out[1] = af + be * d;
    out[5] = ae - bf * d;
    out[9] = -b * c;
    out[13] = ty;
    out[2] = bf - ae * d;
    out[6] = be + af * d;
    out[10] = a * c;
    out[14] = 0;
    out[3] = 0;
    out[7] = 0;
    out[11] = 0;
    out[15] = 1;
    return out;
  }
  function normalMatrix(out, m) {
    var a = m[0], b = m[1], c = m[2];
    var d = m[4], e = m[5], f = m[6];
    var g = m[8], h = m[9], i = m[10];
    var t1 = e * i - f * h, t2 = f * g - d * i, t3 = d * h - e * g;
    var det = a * t1 + b * t2 + c * t3;
    var s = det ? 1 / det : 0;
    out[0] = t1 * s;
    out[3] = t2 * s;
    out[6] = t3 * s;
    out[1] = (c * h - b * i) * s;
    out[4] = (a * i - c * g) * s;
    out[7] = (b * g - a * h) * s;
    out[2] = (b * f - c * e) * s;
    out[5] = (c * d - a * f) * s;
    out[8] = (a * e - b * d) * s;
    return out;
  }
  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }
  function program(gl, vsBody, fsBody) {
    var prog = gl.createProgram();
    var vs = compile(gl, gl.VERTEX_SHADER, VS_HEAD + vsBody);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FS_HEAD + fsBody);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "position");
    gl.bindAttribLocation(prog, 1, "normal");
    gl.bindAttribLocation(prog, 2, "uv");
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog));
    }
    var u = {};
    var n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var name = gl.getActiveUniform(prog, i).name;
      u[name] = gl.getUniformLocation(prog, name);
    }
    return {
      id: prog,
      u: u
    };
  }
  function mesh(gl, attrs) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    attrs.forEach(function(a) {
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, a.data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(a.loc);
      gl.vertexAttribPointer(a.loc, a.size, gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    return {
      vao: vao,
      count: attrs[0].data.length / attrs[0].size
    };
  }
  function target(gl) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {
      tex: tex,
      fbo: fbo,
      w: 0,
      h: 0
    };
  }
  function sizeTarget(gl, t, w, h) {
    if (t.w === w && t.h === h) return;
    t.w = w;
    t.h = h;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  function f1(gl, u, n, v) {
    if (u[n]) gl.uniform1f(u[n], v);
  }
  function f2(gl, u, n, x, y) {
    if (u[n]) gl.uniform2f(u[n], x, y);
  }
  function f3(gl, u, n, v) {
    if (u[n]) gl.uniform3f(u[n], v[0], v[1], v[2]);
  }
  function i1(gl, u, n, v) {
    if (u[n]) gl.uniform1i(u[n], v);
  }
  function m4(gl, u, n, v) {
    if (u[n]) gl.uniformMatrix4fv(u[n], false, v);
  }
  function m3(gl, u, n, v) {
    if (u[n]) gl.uniformMatrix3fv(u[n], false, v);
  }
  function mount(host, options) {
    if (!host) return null;
    var opts = {};
    var key;
    for (key in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(key)) opts[key] = DEFAULTS[key];
    }
    for (key in options || {}) {
      if (options.hasOwnProperty(key)) opts[key] = options[key];
    }
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      stencil: false
    });
    if (!gl) return null;
    var progShell, progCore, progBlur;
    try {
      progShell = program(gl, VERT, SHELL_FRAG);
      progCore = program(gl, VERT, CORE_FRAG);
      progBlur = program(gl, QUAD_VERT, BLUR_FRAG);
    } catch (err) {
      if (global.console) console.warn("PrismOrb: 셰이더를 만들지 못했다 —", err.message);
      return null;
    }
    var shellGeo = bevelize(icosahedron(1.15, 0), opts.bevel);
    var reach = maxReach(shellGeo.position);
    var camFov = 2 * Math.atan(reach / (ORB_FILL * Math.sqrt(CAM_Z * CAM_Z - reach * reach))) * 180 / Math.PI;
    var shell = mesh(gl, [ {
      loc: 0,
      size: 3,
      data: shellGeo.position
    }, {
      loc: 1,
      size: 3,
      data: shellGeo.normal
    } ]);
    var coreGeo = solid(0.44, 1);
    var haloGeo = solid(0.82, 2);
    var core = mesh(gl, [ {
      loc: 0,
      size: 3,
      data: coreGeo.position
    }, {
      loc: 1,
      size: 3,
      data: coreGeo.normal
    } ]);
    var halo = mesh(gl, [ {
      loc: 0,
      size: 3,
      data: haloGeo.position
    }, {
      loc: 1,
      size: 3,
      data: haloGeo.normal
    } ]);
    var quad = mesh(gl, [ {
      loc: 0,
      size: 3,
      data: new Float32Array([ -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0 ])
    }, {
      loc: 2,
      size: 2,
      data: new Float32Array([ 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1 ])
    } ]);
    var rt = target(gl);
    var rtA = target(gl);
    var rtB = target(gl);
    var proj = mat4();
    var view = mat4();
    view[14] = -CAM_Z;
    var model = mat4();
    var mv = mat4();
    var nm = new Float32Array(9);
    var pal = PALETTES[opts.palette] || PALETTES.info;
    var pw = 0, ph = 0, bw = 0, bh = 0;
    var raf = 0, dead = false, running = false;
    var start = 0;
    var needsResize = true;
    var reduce = global.matchMedia ? global.matchMedia("(prefers-reduced-motion: reduce)") : null;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);
    host.classList.add("has-orb");
    gl.clearColor(0, 0, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    function resize() {
      needsResize = false;
      var w = host.clientWidth || 1;
      var h = host.clientHeight || 1;
      var ratio = Math.min((global.devicePixelRatio || 1) * SUPERSAMPLE, MAX_RATIO);
      var nw = Math.max(2, Math.round(w * ratio));
      var nh = Math.max(2, Math.round(h * ratio));
      if (nw === pw && nh === ph) return;
      pw = nw;
      ph = nh;
      canvas.width = pw;
      canvas.height = ph;
      bw = Math.max(2, Math.floor(pw / 4));
      bh = Math.max(2, Math.floor(ph / 4));
      sizeTarget(gl, rt, pw, ph);
      sizeTarget(gl, rtA, bw, bh);
      sizeTarget(gl, rtB, bw, bh);
      perspective(proj, camFov, pw / ph, CAM_NEAR, CAM_FAR);
    }
    function bind(fbo, w, h) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    function palUniforms(u) {
      f3(gl, u, "uA", pal.a);
      f3(gl, u, "uB", pal.b);
      f3(gl, u, "uC", pal.c);
      f3(gl, u, "uD", pal.d);
    }
    function draw(T) {
      var s = opts.speed;
      eulerXYZ(model, 0, 0, 0, 0);
      var cs = 1 + Math.sin(T * 0.9) * 0.07;
      model[0] = cs;
      model[5] = cs;
      model[10] = cs;
      mul4(mv, view, model);
      normalMatrix(nm, mv);
      bind(rt.fbo, pw, ph);
      gl.useProgram(progCore.id);
      gl.disable(gl.CULL_FACE);
      gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
      m4(gl, progCore.u, "projectionMatrix", proj);
      m4(gl, progCore.u, "modelViewMatrix", mv);
      m3(gl, progCore.u, "normalMatrix", nm);
      f1(gl, progCore.u, "uTime", T);
      f1(gl, progCore.u, "uShift", opts.hueShift);
      palUniforms(progCore.u);
      gl.bindVertexArray(core.vao);
      gl.drawArrays(gl.TRIANGLES, 0, core.count);
      gl.bindVertexArray(halo.vao);
      gl.drawArrays(gl.TRIANGLES, 0, halo.count);
      var dir = opts.coreBlur * 9.0 * 16 / REF_PX;
      gl.useProgram(progBlur.id);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(quad.vao);
      i1(gl, progBlur.u, "uSrc", 0);
      gl.activeTexture(gl.TEXTURE0);
      bind(rtA.fbo, bw, bh);
      gl.bindTexture(gl.TEXTURE_2D, rt.tex);
      f2(gl, progBlur.u, "uDir", dir, 0);
      gl.drawArrays(gl.TRIANGLES, 0, quad.count);
      bind(rtB.fbo, bw, bh);
      gl.bindTexture(gl.TEXTURE_2D, rtA.tex);
      f2(gl, progBlur.u, "uDir", 0, dir);
      gl.drawArrays(gl.TRIANGLES, 0, quad.count);
      eulerXYZ(model, T * 0.62 * s, T * 0.41 * s, T * 0.27 * s, Math.sin(T * 0.8) * 0.05);
      mul4(mv, view, model);
      normalMatrix(nm, mv);
      bind(null, pw, ph);
      gl.useProgram(progShell.id);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      m4(gl, progShell.u, "projectionMatrix", proj);
      m4(gl, progShell.u, "modelViewMatrix", mv);
      m3(gl, progShell.u, "normalMatrix", nm);
      f1(gl, progShell.u, "uTime", T);
      f1(gl, progShell.u, "uGlow", opts.glow);
      f1(gl, progShell.u, "uShift", opts.hueShift);
      f1(gl, progShell.u, "uGlass", opts.glass ? 1 : 0);
      f1(gl, progShell.u, "uRefract", opts.refraction);
      f1(gl, progShell.u, "uDisp", opts.dispersion);
      f1(gl, progShell.u, "uBlur", opts.coreBlur * 0.6);
      f1(gl, progShell.u, "uBevel", opts.bevel > 0.001 ? 1 : 0);
      f2(gl, progShell.u, "uRes", pw, ph);
      palUniforms(progShell.u);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, rt.tex);
      i1(gl, progShell.u, "uTex", 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, rtB.tex);
      i1(gl, progShell.u, "uSoftTex", 1);
      gl.bindVertexArray(shell.vao);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);
      gl.drawArrays(gl.TRIANGLES, 0, shell.count);
      gl.cullFace(gl.BACK);
      gl.drawArrays(gl.TRIANGLES, 0, shell.count);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindVertexArray(null);
    }
    function still() {
      if (dead) return;
      if (needsResize) resize();
      draw(STILL_T);
    }
    function tick(now) {
      if (dead) return;
      if (!start) start = now;
      if (needsResize) resize();
      draw((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    var held = false;
    function play() {
      if (dead || running || held) return;
      if (reduce && reduce.matches) {
        still();
        return;
      }
      running = true;
      start = 0;
      raf = requestAnimationFrame(tick);
    }
    function onVisibility() {
      if (document.hidden) stop(); else play();
    }
    function onMotionChange() {
      stop();
      play();
    }
    var ro = null;
    if (global.ResizeObserver) {
      ro = new ResizeObserver(function() {
        needsResize = true;
        if (!running) still();
      });
      ro.observe(host);
    }
    document.addEventListener("visibilitychange", onVisibility);
    if (reduce && reduce.addEventListener) reduce.addEventListener("change", onMotionChange);
    canvas.addEventListener("webglcontextlost", function(event) {
      event.preventDefault();
      destroy();
    });
    function destroy() {
      if (dead) return;
      dead = true;
      stop();
      if (ro) ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (reduce && reduce.removeEventListener) reduce.removeEventListener("change", onMotionChange);
      host.classList.remove("has-orb");
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    play();
    return {
      setPalette: function(name) {
        var next = PALETTES[name];
        if (!next || next === pal) return;
        pal = next;
        if (!running) still();
      },
      pause: function() {
        held = true;
        stop();
      },
      resume: function() {
        held = false;
        play();
      },
      destroy: destroy
    };
  }
  global.PrismOrb = {
    mount: mount,
    PALETTES: PALETTES
  };
})(window);
