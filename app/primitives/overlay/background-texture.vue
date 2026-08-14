<script setup lang="ts">
const { textureOpacity } = useOverlay();
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const colorMode = useColorMode();

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// SILENT HILL 3 Otherworld wall: rust built from real iron-oxide strata
// (magnetite core -> hematite -> fresh goethite rim), blood spreading like
// sumi ink dropped on a water surface (closed-form marbling rings + a dense
// diffusion front + radial filaments).
const fragmentShaderSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_isDark;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );

    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;

    return 130.0 * dot(m, g);
  }

  // Rotation matrix to reduce axial bias
  mat2 m2 = mat2(0.8, -0.6, 0.6, 0.8);

  float fbm3(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p = m2 * p * 2.02;
    f += 0.2500 * snoise(p); p = m2 * p * 2.03;
    f += 0.1250 * snoise(p);
    return f / 0.875;
  }

  float fbm4(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p = m2 * p * 2.02;
    f += 0.2500 * snoise(p); p = m2 * p * 2.03;
    f += 0.1250 * snoise(p); p = m2 * p * 2.01;
    f += 0.0625 * snoise(p);
    return f / 0.9375;
  }

  // Cheap hashes for grain, pit cells, and per-drop lifecycle randomness
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float hash11(float n) {
    return fract(sin(n * 12.9898) * 43758.5453);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  // Worley F1 for pitting corrosion: returns distance to the nearest feature
  // point and the id of its cell so pits can be culled per-pit, not per-pixel
  float worleyF1(vec2 p, out vec2 cellId) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float d = 8.0;
    cellId = ip;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash22(ip + g);
        vec2 r = g + o - fp;
        float dd = dot(r, r);
        if (dd < d) {
          d = dd;
          cellId = ip + g;
        }
      }
    }
    return sqrt(d);
  }

  // Iron-oxide color ramp, dark to bright: magnetite black-brown, old
  // hematite red-brown, #942D00 / #B7410E rust body, fresh goethite orange,
  // powdery akaganeite ochre. Values darkened ~55% to sit behind text.
  vec3 rustRamp(float t) {
    vec3 c = mix(vec3(0.050, 0.036, 0.030), vec3(0.135, 0.085, 0.075), smoothstep(0.00, 0.30, t));
    c = mix(c, vec3(0.210, 0.085, 0.030), smoothstep(0.30, 0.60, t));
    c = mix(c, vec3(0.270, 0.115, 0.045), smoothstep(0.60, 0.80, t));
    c = mix(c, vec3(0.300, 0.160, 0.100), smoothstep(0.80, 0.92, t));
    c = mix(c, vec3(0.290, 0.200, 0.110), smoothstep(0.92, 1.00, t));
    return c;
  }

  // Ink-drop lifecycle: each drop is reborn elsewhere every cycle; the radius
  // follows the physical diffusion curve (fast at first, then slowing)
  void dropParams(float fi, float aspect, out vec2 center, out float R, out float rmax, out float age) {
    // One shared ~30s clock with quarter-cycle offsets: a fresh bloom is always
    // opening somewhere, so the fast-spreading phase never leaves the screen
    float phase = u_time * 0.033 + fi * 0.25 + hash11(fi * 7.93 + 2.7) * 0.05;
    age = fract(phase);
    float gen = floor(phase);
    center = vec2(
      hash11(fi * 13.17 + gen * 7.77 + 0.31) * aspect,
      hash11(fi * 29.31 + gen * 3.33 + 1.7)
    );
    rmax = mix(0.26, 0.46, hash11(fi * 5.97 + gen * 11.13 + 0.77));
    R = max(rmax * (1.0 - exp(-4.0 * age)), 0.0001);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvA = vec2(uv.x * aspect, uv.y);
    vec2 p = uvA * 2.0;
    float vY = 1.0 - uv.y; // 0 at top, grows downward: gravity for run-off

    // Keep the reading column calm, push texture to the edges
    vec2 c = uv - 0.5;
    float calm = smoothstep(0.16, 0.60, length(vec2(c.x * 1.15, c.y * 0.75)));
    float intensity = mix(0.30, 1.0, calm);

    vec3 col = vec3(0.051, 0.039, 0.035); // #0d0a09 darkness

    // === Wall filth: faint vertical grime, the wall is never clean ===
    float grime = fbm3(vec2(p.x * 6.0, p.y * 0.7)) * 0.5 + 0.5;
    col = mix(col, vec3(0.125, 0.105, 0.085), grime * 0.16 * intensity);

    // === Rust patches ===
    // Warp frequency is kept at/above the patch frequency with modest
    // amplitude: crumpled blotch outlines, not laminar marble smears
    vec2 wR = vec2(
      fbm3(p * 1.7 + vec2(2.3, 9.1)),
      fbm3(p * 1.7 + vec2(8.4, 3.2))
    );
    float gran = snoise(p * 48.0) * 0.6 + snoise(p * 96.0) * 0.4; // powdery mm-scale
    float fR = fbm4(p * 1.35 + 0.5 * wR + vec2(5.1, 0.7)) * 0.5 + 0.5;
    fR += 0.045 * gran; // rust creeps granularly: speckled patch edges

    float M = smoothstep(0.55, 0.62, fR); // hard-ish edge, per SH3 crushed tones
    float rimR = smoothstep(0.51, 0.55, fR) * (1.0 - smoothstep(0.56, 0.64, fR));
    float ageR = smoothstep(0.60, 0.88, fR); // deeper into the patch = older

    // Stratification: dark oxygen-starved core, red-brown body, fresh orange
    // rim where the corrosion front is advancing under the paint
    float tone = clamp(0.75 * rimR + (1.0 - ageR) * 0.42 + 0.26 * (gran * 0.5 + 0.5), 0.0, 1.0);
    float rustA = max(M, rimR * 0.85) * (0.62 + 0.38 * (gran * 0.5 + 0.5));
    col = mix(col, rustRamp(tone), rustA * 0.9 * intensity);

    // === Pitting corrosion: sparse dark pinholes with a faint rust halo ===
    vec2 pitCell;
    float wp = worleyF1(uvA * 46.0, pitCell);
    float pit = 1.0 - smoothstep(0.05, 0.16, wp);
    float halo = (1.0 - smoothstep(0.16, 0.40, wp)) - pit;
    float pitStrength = step(0.62, hash12(pitCell + 7.3)) * (0.30 + 0.70 * M);
    col = mix(col, rustRamp(0.62), clamp(halo, 0.0, 1.0) * 0.30 * pitStrength * intensity);
    col = mix(col, vec3(0.030, 0.022, 0.019), clamp(pit, 0.0, 1.0) * 0.85 * pitStrength * intensity);

    // Matte powdery grain, strongest on corroded areas
    col *= 1.0 + 0.055 * gran * (0.25 + 0.75 * M);

    // === Rust run-off: water carries oxide down from patches in narrow,
    //     slightly meandering vertical bleeds ===
    float xx = uvA.x + 0.012 * snoise(vec2(vY * 5.0, 31.7));
    float srcY = 0.08 + 0.50 * (snoise(vec2(xx * 3.5, 9.2)) * 0.5 + 0.5);
    float column = smoothstep(0.60, 0.88, clamp(snoise(vec2(xx * 70.0, 1.7)) * 0.5 + 0.5, 0.0, 1.0));
    float lenS = mix(0.15, 0.70, snoise(vec2(xx * 11.0, 5.5)) * 0.5 + 0.5);
    float fall = vY - srcY;
    float streak = column * smoothstep(0.0, 0.03, fall) * (1.0 - smoothstep(lenS * 0.55, lenS, fall));
    streak *= 0.65 + 0.35 * (snoise(vec2(xx * 85.0, vY * 6.0)) * 0.5 + 0.5);
    // Only bleed below columns that actually hold rust at the source height
    float fSrc = fbm4(vec2(xx, 1.0 - srcY) * 2.7 + vec2(5.1, 0.7)) * 0.5 + 0.5;
    streak *= smoothstep(0.42, 0.52, fSrc);
    // Semi-transparent oxide stain: darkens what it crosses and warms it,
    // so bleeds stay visible over both bare wall and rust patches
    col = mix(col, col * 0.5 + vec3(0.085, 0.038, 0.018), clamp(streak, 0.0, 1.0) * 0.75 * intensity);

    // === Old dried blood: hard-edged dark maroon stains, no swirling ===
    float driedF = fbm3(p * 0.8 + 0.2 * wR + vec2(4.7, 1.9)) * 0.5 + 0.5;
    float dried = smoothstep(0.63, 0.70, driedF);
    col = mix(col, vec3(0.102, 0.030, 0.026), dried * 0.55 * intensity);

    // === Fresh blood as sumi ink on water ===
    // A shared writhing field: time is injected into the phase via length(q)
    // so the distortion swirls instead of translating
    vec2 qi = uvA;
    qi += 0.022 * sin(vec2(0.38, 0.33) * u_time + length(qi) * vec2(4.1, 4.3));
    vec2 iw = vec2(
      fbm3(qi * 2.6 + vec2(u_time * 0.09, -u_time * 0.065)),
      fbm3(qi * 2.6 + vec2(3.1 + u_time * 0.07, 7.7 + u_time * 0.10))
    );

    // Fibrous nijimi texture: ink wicking into paper. Coupled to the flow
    // field so the feathered fingers visibly crawl along the front
    float fiber = fbm3(uvA * 14.0 - iw * 0.3 + vec2(0.0, u_time * 0.015)) * 0.5 + 0.5;

    float inkWash = 0.0;
    float inkRing = 0.0;
    float inkFront = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 Ci; float Ri; float rmaxI; float ageI;
      dropParams(fi, aspect, Ci, Ri, rmaxI, ageI);

      // Instability grows with age: young drops are clean rings, old ones writhe
      vec2 P = uvA + iw * (rmaxI * (0.15 + 0.50 * ageI));

      // Closed-form marbling: neighbouring drops shove this drop's rings
      // aside area-preservingly (P mapped back to its pre-drop position)
      for (int j = 0; j < 4; j++) {
        if (j == i) continue;
        vec2 Cj; float Rj; float rmaxJ; float ageJ;
        dropParams(float(j), aspect, Cj, Rj, rmaxJ, ageJ);
        vec2 v = P - Cj;
        float L2 = max(dot(v, v), 0.000001);
        P = Cj + v * sqrt(max(1.0 - (Rj * Rj * 0.55) / L2, 0.0));
      }

      vec2 dp = P - Ci;
      float dist = length(dp);
      float life = smoothstep(0.0, 0.05, ageI) * (1.0 - smoothstep(0.60, 0.98, ageI));

      // Suminagashi ring lattice: bands at sqrt(k) * r0, thinner outward;
      // the fiber jitter makes the year-rings bleed instead of staying crisp
      float r0 = Ri / 3.0;
      float ru = min(dot(dp, dp) / max(r0 * r0, 0.000001), 64.0);
      float tri = abs(2.0 * fract(0.5 * (ru + (fiber - 0.5) * 0.9)) - 1.0);
      float rings = smoothstep(0.45, 0.75, tri);
      float inside = 1.0 - smoothstep(Ri * 0.92, Ri * 1.04, dist + (fiber - 0.5) * Ri * 0.35);
      float core = 1.0 - smoothstep(0.25, 0.9, ru);

      // Dense diffusion front: fiber noise breaks it into wicking fingers
      // that creep as the flow field advects, and it blurs as it travels
      float sd = dist - Ri + (fiber - 0.5) * Ri * 0.45;
      float wRim = rmaxI * (0.015 + 0.09 * ageI);
      float rim = exp(-sd * sd / (wRim * wRim)) * (1.0 - 0.45 * ageI) * (0.7 + 0.6 * fiber);

      // Filaments licking outward: ridged noise, fine across the angle,
      // stretched along the radius so the spikes point away from the drop
      float theta = atan(dp.y, dp.x);
      float fn = snoise(vec2(theta * 5.0, dist * 2.2 / rmaxI - ageI * 2.6) + hash11(fi * 91.7) * 19.0);
      float fil = pow(max(1.0 - abs(fn) * 1.7, 0.0), 2.0);
      float filWin = smoothstep(Ri * 0.8, Ri, dist) * (1.0 - smoothstep(Ri, Ri * 1.6, dist));

      // Interior pooling drifts with the flow so old drops keep moving
      float pool = 0.72 + 0.28 * (iw.x * 0.5 + 0.5);
      inkWash += (core * 0.6 + inside * 0.22) * pool * life;
      inkRing += rings * inside * 0.85 * life;
      inkFront += (rim + fil * filWin * 0.8) * life;
    }
    col = mix(col, vec3(0.115, 0.030, 0.027), clamp(inkWash, 0.0, 1.0) * 0.75 * intensity);
    col = mix(col, vec3(0.235, 0.042, 0.034), clamp(inkRing, 0.0, 1.0) * 0.85 * intensity);
    col = mix(col, vec3(0.315, 0.058, 0.044), clamp(inkFront, 0.0, 1.0) * 0.9 * intensity);

    // Corner vignette
    col *= 1.0 - smoothstep(0.55, 0.95, length(c)) * 0.35;

    // Flickering film grain (static under reduced motion since u_time stays 0)
    float grainT = floor(u_time * 8.0);
    float grain = hash12(gl_FragCoord.xy + vec2(mod(grainT, 64.0), mod(grainT * 1.7, 64.0)));
    col += (grain - 0.5) * 0.022;

    // Only visible in dark mode
    gl_FragColor = vec4(col, u_isDark);
  }
`;

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let animationId: number | null = null;
let startTime = 0;
let lastFrameTime = 0;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// Cached uniform locations
let uTimeLoc: WebGLUniformLocation | null = null;
let uResolutionLoc: WebGLUniformLocation | null = null;
let uIsDarkLoc: WebGLUniformLocation | null = null;

const prefersReducedMotion = ref(false);
const isDarkMode = ref(false);

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const prog = gl.createProgram();
  if (!prog) return null;

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }

  return prog;
}

function initWebGL() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) {
    console.warn("WebGL not supported");
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vs || !fs) return;

  program = createProgram(gl, vs, fs);
  if (!program) return;

  const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  // Cache uniform locations
  uTimeLoc = gl.getUniformLocation(program, "u_time");
  uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
  uIsDarkLoc = gl.getUniformLocation(program, "u_isDark");

  startTime = performance.now();
  resizeCanvas();
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas || !gl) return;

  const dpr = Math.min(window.devicePixelRatio, 1.5);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function render() {
  if (!gl || !program) return;

  const now = performance.now();
  const elapsed = now - lastFrameTime;

  // Frame rate limiting to 30fps
  if (elapsed < FRAME_INTERVAL) {
    animationId = requestAnimationFrame(render);
    return;
  }
  lastFrameTime = now - (elapsed % FRAME_INTERVAL);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  const time = prefersReducedMotion.value ? 0 : (now - startTime) / 1000;
  gl.uniform1f(uTimeLoc, time);
  gl.uniform2f(uResolutionLoc, canvasRef.value!.width, canvasRef.value!.height);
  gl.uniform1f(uIsDarkLoc, colorMode.value === "dark" ? 1.0 : 0.0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  animationId = requestAnimationFrame(render);
}

function cleanup() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function startRender() {
  if (animationId !== null) return;
  initWebGL();
  render();
}

function stopRender() {
  cleanup();
  // Clear the canvas
  if (gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}

function checkDarkMode() {
  return document.documentElement.classList.contains("dark");
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", (e) => {
    prefersReducedMotion.value = e.matches;
  });

  window.addEventListener("resize", resizeCanvas);

  // Watch tab visibility changes (pause rendering when inactive)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cleanup();
    }
    else if (isDarkMode.value) {
      startRender();
    }
  });

  // Check initial state
  isDarkMode.value = checkDarkMode();
  if (isDarkMode.value) {
    startRender();
  }

  // Watch for class changes on the html element
  const observer = new MutationObserver(() => {
    const newIsDark = checkDarkMode();
    if (newIsDark !== isDarkMode.value) {
      isDarkMode.value = newIsDark;
      if (newIsDark) {
        startRender();
      }
      else {
        stopRender();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  onBeforeUnmount(() => {
    observer.disconnect();
  });
});

onBeforeUnmount(() => {
  cleanup();
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    width="1"
    height="1"
  />
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: v-bind(textureOpacity);
  pointer-events: none;
  touch-action: none;
  user-select: none;
}
</style>
