<script setup lang="ts">
const { fogOpacity } = useOverlay();
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const colorMode = useColorMode();

// シェーダーコード
const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_isLight;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,   // (3.0-sqrt(3.0))/6.0
      0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
      -0.577350269189626,  // -1.0 + 2.0 * C.x
      0.024390243902439    // 1.0 / 41.0
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

  // FBM (Fractal Brownian Motion) for more natural fog
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    // Slow time for gentle fog movement
    float t = u_time * 0.02;

    // Multiple layers of fog with different speeds and scales
    float fog1 = fbm(p * 1.5 + vec2(t * 0.3, t * 0.1));
    float fog2 = fbm(p * 2.5 + vec2(-t * 0.2, t * 0.15));
    float fog3 = fbm(p * 0.8 + vec2(t * 0.1, -t * 0.05));

    // Combine fog layers
    float fog = (fog1 + fog2 * 0.5 + fog3 * 0.7) / 2.2;

    // Normalize to 0-1 range
    fog = fog * 0.5 + 0.5;

    // Slight vertical gradient (subtle fade at extreme edges)
    float verticalFog = 1.0 - abs(uv.y - 0.5) * 0.3;
    verticalFog = smoothstep(0.0, 1.0, verticalFog);

    // Slight edge gradient (subtle fade at extreme edges)
    float edgeFog = 1.0 - abs(uv.x - 0.5) * 0.3;
    edgeFog = smoothstep(0.0, 1.0, edgeFog);

    fog = fog * mix(0.7, 1.0, verticalFog * edgeFog);

    // Adjust fog intensity
    fog = smoothstep(0.1, 0.7, fog) * 0.7;

    // Black fog for light mode
    vec3 fogColor = vec3(0.0);

    // Only show in light mode
    gl_FragColor = vec4(fogColor, fog * u_isLight);
  }
`;

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let animationId: number | null = null;
let startTime = 0;

const prefersReducedMotion = ref(false);
const isLightMode = ref(false);

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

  // Enable alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vs || !fs) return;

  program = createProgram(gl, vs, fs);
  if (!program) return;

  // Create fullscreen quad
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

  const dpr = Math.min(window.devicePixelRatio, 2);
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

  // Clear with transparent background
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  // Update uniforms
  const timeLoc = gl.getUniformLocation(program, "u_time");
  const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
  const isLightLoc = gl.getUniformLocation(program, "u_isLight");

  const time = prefersReducedMotion.value ? 0 : (performance.now() - startTime) / 1000;
  gl.uniform1f(timeLoc, time);
  gl.uniform2f(resolutionLoc, canvasRef.value!.width, canvasRef.value!.height);
  gl.uniform1f(isLightLoc, colorMode.value === "light" ? 1.0 : 0.0);

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

function checkLightMode() {
  return document.documentElement.classList.contains("light");
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", (e) => {
    prefersReducedMotion.value = e.matches;
  });

  window.addEventListener("resize", resizeCanvas);

  // 初期状態をチェック
  isLightMode.value = checkLightMode();
  if (isLightMode.value) {
    startRender();
  }

  // html要素のclass変更を監視
  const observer = new MutationObserver(() => {
    const newIsLight = checkLightMode();
    if (newIsLight !== isLightMode.value) {
      isLightMode.value = newIsLight;
      if (newIsLight) {
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
    :style="{ opacity: fogOpacity }"
    width="1"
    height="1"
  />
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}
</style>
