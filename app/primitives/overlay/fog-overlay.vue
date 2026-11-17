<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { useColorMode } from "#imports";
import { canvasSize } from "./canvas-size";
import { useOverlay } from "./use-overlay";

const { fogOpacity, pixelEnabled } = useOverlay();
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const colorMode = useColorMode();

// Shader code
const vertexShaderSource = /* glsl */ `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = /* glsl */ `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_isLight;

  // Simplex noise functions
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

  // Cheap hash for dithering
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = u_time;

    // One slow, low-frequency flow shared by every depth. It bends the banks
    // as a whole; the old deep domain warp curled them into marble veins
    vec2 flow = vec2(
      fbm3(p * 0.42 + vec2(t * 0.0045, 0.0)),
      fbm3(p * 0.42 + vec2(5.2, 1.3 + t * 0.0035))
    );

    // Three depths drifting the same way at parallax speeds, each squashed
    // into horizontal banks: far is broad, pale and slow; near is fine, dark
    // and quicker. The eye reads the speed difference as distance
    // Each depth is also pushed around by the one behind it, so the wisps
    // feather along the banks instead of sliding over them as flat sheets
    vec2 squash = vec2(0.75, 2.1);
    float far = fbm3((p - vec2(t * 0.006, 0.0)) * squash * 0.9 + flow * 0.45 + vec2(1.7, 9.2)) * 0.5 + 0.5;
    float mid = fbm3((p - vec2(t * 0.013, 0.0)) * squash * 1.8 + flow * 0.6 + far * 0.5 + vec2(8.3, 2.8)) * 0.5 + 0.5;
    float near = fbm4((p - vec2(t * 0.024, -t * 0.002)) * squash * 3.2 + flow * 0.7 + vec2(mid, far) * 0.9 + vec2(3.1, 6.4)) * 0.5 + 0.5;

    float aFar = smoothstep(0.30, 0.85, far) * 0.30;
    float aMid = smoothstep(0.42, 0.88, mid) * 0.32;
    float aNear = smoothstep(0.52, 0.92, near) * 0.40;

    // Fog settles: a little denser low in the frame than high
    float settle = mix(1.12, 0.86, uv.y);
    // Keep the reading column clearer, thicken toward the edges
    vec2 c = uv - 0.5;
    float edge = smoothstep(0.15, 0.75, length(vec2(c.x * 1.1, c.y * 0.85)));
    float shape = settle * mix(0.26, 1.0, edge);
    aFar *= shape;
    aMid *= shape;
    aNear *= shape;

    // Composite near over mid over far. Warm sumi-ink tones, paler with
    // distance the way real fog washes out what is behind it
    vec3 inkFar = vec3(0.34, 0.30, 0.27);
    vec3 inkMid = vec3(0.21, 0.18, 0.155);
    vec3 inkNear = vec3(0.10, 0.083, 0.072);
    vec3 premul = inkNear * aNear + (1.0 - aNear) * (inkMid * aMid + (1.0 - aMid) * inkFar * aFar);
    float alpha = 1.0 - (1.0 - aNear) * (1.0 - aMid) * (1.0 - aFar);
    vec3 ink = premul / max(alpha, 0.0001);

    // Dither kills gradient banding in the thin fog ramps
    alpha += (hash12(gl_FragCoord.xy) - 0.5) * 0.015;

    gl_FragColor = vec4(ink, alpha * u_isLight);
  }
`;

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let animationId: number | null = null;
let resizeId: number | null = null;
let startTime = 0;
// The animation clock, frozen while the canvas is not rendering. Restarting it
// at zero on a theme flip or a tab switch snapped the fog back to its first
// frame, which read as the effect looping
let clockMs = 0;
let lastFrameTime = 0;
let sizedKey = "";
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// Cached uniform locations
let uTimeLoc: WebGLUniformLocation | null = null;
let uResolutionLoc: WebGLUniformLocation | null = null;
let uIsLightLoc: WebGLUniformLocation | null = null;

const prefersReducedMotion = ref(false);
const isLightMode = ref(false);

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const prog = gl.createProgram();

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (gl.getProgramParameter(prog, gl.LINK_STATUS) !== true) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }

  return prog;
}

function initWebGL() {
  const canvas = canvasRef.value;
  // Compile once: theme flips and tab switches re-enter this through
  // startRender(), and recompiling the shader there stalls the first frame
  if (!canvas || gl) return;

  gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) {
    console.warn("WebGL not supported");
    return;
  }

  // Enable alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vs || !fs) return;

  program = createProgram(gl, vs, fs);
  if (!program) return;

  // Create fullscreen quad
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  // Cache uniform locations
  uTimeLoc = gl.getUniformLocation(program, "u_time");
  uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
  uIsLightLoc = gl.getUniformLocation(program, "u_isLight");

  resizeCanvas();
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas || !gl) return;

  const size = canvasSize(pixelEnabled.value);

  // Mobile browsers fire resize for every URL-bar nudge; reallocating the
  // drawing buffer for an unchanged size is pure waste
  if (size.key === sizedKey) return;
  sizedKey = size.key;

  canvas.width = size.width;
  canvas.height = size.height;
  canvas.style.width = `${size.cssWidth}px`;
  canvas.style.height = `${size.cssHeight}px`;
  canvas.style.imageRendering = size.rendering;

  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Resize fires in bursts; collapse each burst into one reallocation. While the
// canvas is not rendering (dark mode, hidden tab, faded out) the new size is
// picked up by startRender instead.
function scheduleResize() {
  if (resizeId !== null || !gl || animationId === null) return;
  resizeId = requestAnimationFrame(() => {
    resizeId = null;
    resizeCanvas();
  });
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

  // Clear with transparent background
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  clockMs = now - startTime;
  const time = prefersReducedMotion.value ? 0 : clockMs / 1000;
  gl.uniform1f(uTimeLoc, time);
  gl.uniform2f(uResolutionLoc, canvasRef.value!.width, canvasRef.value!.height);
  gl.uniform1f(uIsLightLoc, colorMode.value === "light" ? 1.0 : 0.0);

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
  // Faded out by the header toggle: nothing to draw, so do not burn frames
  if (fogOpacity.value <= 0) return;
  initWebGL();
  if (!gl) return;
  resizeCanvas();
  // Resume the clock where it stopped instead of rewinding it
  startTime = performance.now() - clockMs;
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

function checkLightMode() {
  return document.documentElement.classList.contains("light");
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", (e) => {
    prefersReducedMotion.value = e.matches;
  });

  window.addEventListener("resize", scheduleResize);
  // The header's pixel toggle coarsens the fog along with the words
  watch(pixelEnabled, scheduleResize);

  // Watch tab visibility changes (pause rendering when inactive)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cleanup();
    } else if (isLightMode.value) {
      startRender();
    }
  });

  // The fade the header toggle runs ends at opacity 0: an invisible canvas
  // does not need to keep rendering
  watch(fogOpacity, (opacity) => {
    if (opacity <= 0) stopRender();
    else if (isLightMode.value && !document.hidden) startRender();
  });

  // Check initial state
  isLightMode.value = checkLightMode();
  if (isLightMode.value) {
    startRender();
  }

  // Watch for class changes on the html element
  const observer = new MutationObserver(() => {
    const newIsLight = checkLightMode();
    if (newIsLight !== isLightMode.value) {
      isLightMode.value = newIsLight;
      if (newIsLight) {
        startRender();
      } else {
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
  if (resizeId !== null) cancelAnimationFrame(resizeId);
  window.removeEventListener("resize", scheduleResize);
});
</script>

<template>
  <canvas ref="canvasRef" height="1" width="1" />
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  z-index: var(--z-fog);
  opacity: v-bind(fogOpacity);
  pointer-events: none;
  touch-action: none;
  user-select: none;
}
</style>
