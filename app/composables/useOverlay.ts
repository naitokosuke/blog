let fogAnimationId: number | null = null;
let textureAnimationId: number | null = null;

export function useOverlay() {
  // 霧（ライトモード用）
  const fogEnabled = useState("fogEnabled", () => true);
  const fogOpacity = useState("fogOpacity", () => 1);

  // 血と錆（ダークモード用）
  const textureEnabled = useState("textureEnabled", () => true);
  const textureOpacity = useState("textureOpacity", () => 1);

  function toggleFog() {
    if (fogAnimationId !== null) {
      cancelAnimationFrame(fogAnimationId);
    }

    const targetOpacity = fogEnabled.value ? 0 : 1;
    const startOpacity = fogOpacity.value;
    const duration = 800;
    const startTime = performance.now();

    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      fogOpacity.value = startOpacity + (targetOpacity - startOpacity) * eased;

      if (progress < 1) {
        fogAnimationId = requestAnimationFrame(animate);
      } else {
        fogEnabled.value = !fogEnabled.value;
        fogAnimationId = null;
      }
    }

    animate();
  }

  function toggleTexture() {
    if (textureAnimationId !== null) {
      cancelAnimationFrame(textureAnimationId);
    }

    const targetOpacity = textureEnabled.value ? 0 : 1;
    const startOpacity = textureOpacity.value;
    const duration = 800;
    const startTime = performance.now();

    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      textureOpacity.value = startOpacity + (targetOpacity - startOpacity) * eased;

      if (progress < 1) {
        textureAnimationId = requestAnimationFrame(animate);
      } else {
        textureEnabled.value = !textureEnabled.value;
        textureAnimationId = null;
      }
    }

    animate();
  }

  return {
    fogEnabled,
    fogOpacity,
    toggleFog,
    textureEnabled,
    textureOpacity,
    toggleTexture,
  };
}
