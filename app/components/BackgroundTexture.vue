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

// 血と錆と闇のシェーダー
const fragmentShaderSource = `
  precision highp float;

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

  // FBM with rotation to reduce axial bias
  mat2 m2 = mat2(0.8, -0.6, 0.6, 0.8);

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p = m2 * p * 2.02;
    f += 0.2500 * snoise(p); p = m2 * p * 2.03;
    f += 0.1250 * snoise(p); p = m2 * p * 2.01;
    f += 0.0625 * snoise(p); p = m2 * p * 2.04;
    f += 0.0312 * snoise(p);
    return f / 0.9687;
  }

  // 錆のFBM（より粗い質感）
  float rustFbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p = m2 * p * 1.8;
    f += 0.3000 * snoise(p); p = m2 * p * 2.2;
    f += 0.1500 * snoise(p); p = m2 * p * 2.5;
    f += 0.0500 * snoise(p);
    return f;
  }

  // 血のFBM（滲むような質感）
  float bloodFbm(vec2 p) {
    float f = 0.0;
    f += 0.6000 * snoise(p); p = m2 * p * 1.5;
    f += 0.2500 * snoise(p); p = m2 * p * 2.0;
    f += 0.1000 * snoise(p);
    return f;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    // 非常にゆっくりとした時間変化
    float t = u_time * 0.005;

    // === 闇のベース色 ===
    vec3 darkness = vec3(0.051, 0.039, 0.035); // #0d0a09

    // === 錆のテクスチャ ===
    float rust1 = rustFbm(p * 1.5 + vec2(t * 0.1, 0.0));
    float rust2 = rustFbm(p * 2.5 + vec2(100.0, t * 0.05));
    float rust3 = rustFbm(p * 0.8 + vec2(50.0, 30.0));

    // 錆のノイズを合成
    float rustNoise = (rust1 + rust2 * 0.7 + rust3 * 0.5) / 2.2;
    rustNoise = rustNoise * 0.5 + 0.5;

    // 錆の色（より明るく）
    vec3 rustColor1 = vec3(0.30, 0.15, 0.10); // 錆茶
    vec3 rustColor2 = vec3(0.45, 0.22, 0.12); // 明るい錆オレンジ
    vec3 rustColor = mix(rustColor1, rustColor2, rustNoise);

    // === 血のテクスチャ ===
    float blood1 = bloodFbm(p * 1.2 + vec2(200.0, t * 0.02));
    float blood2 = bloodFbm(p * 2.0 + vec2(150.0, 80.0));

    float bloodNoise = (blood1 + blood2 * 0.6) / 1.6;
    bloodNoise = bloodNoise * 0.5 + 0.5;

    // 血の色（より明るく）
    vec3 bloodColor1 = vec3(0.22, 0.05, 0.05); // 暗い血
    vec3 bloodColor2 = vec3(0.40, 0.10, 0.08); // 明るい血
    vec3 bloodColor = mix(bloodColor1, bloodColor2, bloodNoise);

    // === 合成 ===
    // 全体にノイズで錆と血を散らす
    float rustAmount = smoothstep(0.30, 0.60, rustNoise);
    float bloodAmount = smoothstep(0.40, 0.65, bloodNoise);

    vec3 finalColor = darkness;

    // 錆を強めに混ぜる
    finalColor = mix(finalColor, rustColor, rustAmount * 0.7);

    // 血を混ぜる
    finalColor = mix(finalColor, bloodColor, bloodAmount * 0.5);

    // ダークモードでのみ表示
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

  const timeLoc = gl.getUniformLocation(program, "u_time");
  const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
  const isDarkLoc = gl.getUniformLocation(program, "u_isDark");

  const time = prefersReducedMotion.value ? 0 : (now - startTime) / 1000;
  gl.uniform1f(timeLoc, time);
  gl.uniform2f(resolutionLoc, canvasRef.value!.width, canvasRef.value!.height);
  gl.uniform1f(isDarkLoc, colorMode.value === "dark" ? 1.0 : 0.0);

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
  // キャンバスをクリア
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

  // 初期状態をチェック
  isDarkMode.value = checkDarkMode();
  if (isDarkMode.value) {
    startRender();
  }

  // html要素のclass変更を監視
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
    :style="{ opacity: textureOpacity }"
    width="1"
    height="1"
  />
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
</style>
