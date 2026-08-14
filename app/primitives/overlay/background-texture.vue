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

// Shader for blood, rust, and darkness
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

  // Cheap hash for film grain / dithering
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Beer-Lambert-style density response: pigment saturates exponentially
  // above the onset, leaving a long wet tail instead of a hard band
  float dens(float x, float onset, float k) {
    return 1.0 - exp(-max(x - onset, 0.0) * k);
  }

  // Scalar hash for per-drop lifecycle randomness
  float hash11(float n) {
    return fract(sin(n * 12.9898) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvA = vec2(uv.x * aspect, uv.y);
    vec2 p = uvA * 2.0;

    // Slow but perceptible drift
    float t = u_time * 0.05;

    // === Darkness base color ===
    vec3 darkness = vec3(0.051, 0.039, 0.035); // #0d0a09

    // Gentle organic distortion — blotchy stains, not marble swirls
    vec2 w = vec2(
      fbm3(p * 0.55 + vec2(t * 0.03, 0.0)),
      fbm3(p * 0.55 + vec2(4.7, 2.3))
    );
    vec2 pw = p + 0.38 * w;

    // Fiber noise feathers the bleeding edges like ink wicking into paper;
    // the drifting flow field keeps the bloom fronts writhing as they spread
    float fiber = fbm3(pw * 5.5) * 0.5 + 0.5;
    float flow = fbm3(pw * 2.2 + vec2(t * 0.6, -t * 0.4)) * 0.5 + 0.5;
    float frontNoise = mix(fiber, flow, 0.6);

    // Vertical streak field: corrosion and filth run down the wall
    float streak = fbm3(vec2(pw.x * 6.0, pw.y * 0.65)) * 0.5 + 0.5;

    // Grime: the wall is never clean — faint vertical filth over everything
    float grime = streak * 0.6 + fiber * 0.4;

    // === Rust: blotches gathered along the run-down streaks, heavily
    //     granulated like corroded metal ===
    float rustShape = fbm4(pw * 1.3 + vec2(7.0, 3.0)) * 0.5 + 0.5;
    float rustEmerge = fbm3(p * 0.45 + vec2(t * 0.8, -t * 0.5)) * 0.5 + 0.5;
    float rustField = 0.5 + (rustShape - 0.5) * 1.5 + (rustEmerge - 0.5) * 1.0 + (streak - 0.5) * 0.3;

    float rustWash = dens(rustField + (fiber - 0.5) * 0.36, 0.46, 3.5);
    float rustCore = dens(rustField + (fiber - 0.5) * 0.16, 0.62, 6.0);
    float rustGran = 0.45 + 0.55 * smoothstep(0.25, 0.85, fiber); // speckled corrosion
    float rustHot = smoothstep(0.65, 0.95, fiber) * rustCore; // sparse burnt-orange peaks

    // === Blood: long soaking halos, dense pools, and drips that run down
    //     from the pools sitting higher on the wall ===
    float bloodShape = fbm4(pw * 1.05 + vec2(2.4, 8.8)) * 0.5 + 0.5;
    float bloodEmerge = fbm3(p * 0.4 + vec2(9.4 - t * 0.65, 4.1 + t * 0.95)) * 0.5 + 0.5;
    float bloodField = 0.5 + (bloodShape - 0.5) * 1.5 + (bloodEmerge - 0.5) * 1.1;

    float bloodSerum = dens(bloodField + (frontNoise - 0.5) * 0.40, 0.56, 3.0);
    float bloodMid = dens(bloodField + (frontNoise - 0.5) * 0.24, 0.65, 4.5);
    float bloodCore = dens(bloodField + (frontNoise - 0.5) * 0.10, 0.74, 8.0);

    // gl_FragCoord's y axis points up, so sampling at +y asks "is there a
    // blood pool above this pixel?" — its drips run down the streak lines
    float bloodShapeAbove = fbm4((pw + vec2(0.0, 0.45)) * 1.05 + vec2(2.4, 8.8)) * 0.5 + 0.5;
    float bloodAbove = 0.5 + (bloodShapeAbove - 0.5) * 1.5 + (bloodEmerge - 0.5) * 1.1;
    float bloodDrip = dens(bloodAbove, 0.66, 6.0) * smoothstep(0.60, 0.72, streak);

    // === Ink-drop blooms: like ink dropped into water, each drop opens as a
    //     dense front ring with a thin interior wash. The radius follows a
    //     diffusion curve (fast at first, then slowing), the front blurs and
    //     feathers as it travels, then the drop fades and is reborn elsewhere ===
    float bloodBloomWash = 0.0;
    float bloodBloomRing = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float cycle = mix(12.0, 20.0, hash11(fi * 3.71 + 0.13));
      float phase = u_time / cycle + hash11(fi * 7.93 + 2.7);
      float age = fract(phase);
      float gen = floor(phase);
      vec2 center = vec2(hash11(fi * 13.17 + gen * 7.77 + 0.31) * aspect, hash11(fi * 29.31 + gen * 3.33 + 1.7));
      float rmax = mix(0.16, 0.30, hash11(fi * 5.97 + gen * 11.13 + 0.77));
      float radius = rmax * pow(age, 0.45);
      float soft = 0.02 + 0.14 * age;
      float feather = radius * (0.3 + 0.9 * age);
      float d = length(uvA - center) + (frontNoise - 0.5) * feather;
      float disk = 1.0 - smoothstep(radius - soft, radius + soft, d);
      float inner = 1.0 - smoothstep(radius * 0.5 - soft, radius * 0.5 + soft, d);
      float life = smoothstep(0.0, 0.06, age) * (1.0 - smoothstep(0.55, 1.0, age));
      bloodBloomWash += inner * life;
      bloodBloomRing += max(disk - inner, 0.0) * life;
    }
    float rustBloomWash = 0.0;
    float rustBloomRing = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i) + 100.0;
      float cycle = mix(16.0, 26.0, hash11(fi * 3.71 + 0.13));
      float phase = u_time / cycle + hash11(fi * 7.93 + 2.7);
      float age = fract(phase);
      float gen = floor(phase);
      vec2 center = vec2(hash11(fi * 13.17 + gen * 7.77 + 0.31) * aspect, hash11(fi * 29.31 + gen * 3.33 + 1.7));
      float rmax = mix(0.18, 0.34, hash11(fi * 5.97 + gen * 11.13 + 0.77));
      float radius = rmax * pow(age, 0.45);
      float soft = 0.02 + 0.16 * age;
      float feather = radius * (0.35 + 1.0 * age);
      float d = length(uvA - center) + (frontNoise - 0.5) * feather;
      float disk = 1.0 - smoothstep(radius - soft, radius + soft, d);
      float inner = 1.0 - smoothstep(radius * 0.5 - soft, radius * 0.5 + soft, d);
      float life = smoothstep(0.0, 0.06, age) * (1.0 - smoothstep(0.55, 1.0, age));
      rustBloomWash += inner * life;
      rustBloomRing += max(disk - inner, 0.0) * life;
    }

    // === Composition: keep the reading column calm, push texture to the edges ===
    vec2 c = uv - 0.5;
    float calm = smoothstep(0.16, 0.60, length(vec2(c.x * 1.15, c.y * 0.75)));
    float intensity = mix(0.30, 1.0, calm);

    vec3 finalColor = darkness;

    // Filth pass: everything sits on a dirty, streaked wall
    finalColor = mix(finalColor, vec3(0.16, 0.13, 0.105), grime * 0.22 * intensity);

    // Rust: granular wash, speckled corroded core, sparse burnt-orange peaks
    finalColor = mix(finalColor, vec3(0.115, 0.06, 0.032), rustWash * rustGran * 0.55 * intensity);
    finalColor = mix(finalColor, vec3(0.33, 0.16, 0.06), rustCore * rustGran * 0.75 * intensity);
    finalColor = mix(finalColor, vec3(0.54, 0.29, 0.10), rustHot * 0.55 * intensity);

    // Blood: pale serum edge, long red soak, dense pool, drips running down
    finalColor = mix(finalColor, vec3(0.14, 0.095, 0.05), bloodSerum * 0.30 * intensity);
    finalColor = mix(finalColor, vec3(0.23, 0.045, 0.035), bloodMid * 0.55 * intensity);
    finalColor = mix(finalColor, vec3(0.35, 0.06, 0.045), bloodCore * 0.80 * intensity);
    finalColor = mix(finalColor, vec3(0.30, 0.05, 0.04), bloodDrip * 0.45 * intensity);

    // Rust blooms: thin interior wash under a denser spreading front
    finalColor = mix(finalColor, vec3(0.12, 0.07, 0.045), min(rustBloomWash, 1.0) * 0.45 * intensity);
    finalColor = mix(finalColor, vec3(0.28, 0.14, 0.06), min(rustBloomRing, 1.0) * 0.65 * intensity);

    // Blood blooms open on top
    finalColor = mix(finalColor, vec3(0.15, 0.03, 0.03), min(bloodBloomWash, 1.0) * 0.50 * intensity);
    finalColor = mix(finalColor, vec3(0.30, 0.05, 0.045), min(bloodBloomRing, 1.0) * 0.75 * intensity);

    // Corner vignette
    finalColor *= 1.0 - smoothstep(0.55, 0.95, length(c)) * 0.35;

    // Film grain kills gradient banding on the dark ramps
    finalColor += (hash12(gl_FragCoord.xy) - 0.5) * 0.02;

    // Only visible in dark mode
    float alpha = u_isDark;

    gl_FragColor = vec4(finalColor, alpha);
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
