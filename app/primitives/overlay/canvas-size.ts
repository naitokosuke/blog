import { phoneQuery, tuning } from "../pixel-tuning";

// The drawing-buffer size of a full-viewport background canvas. Pixelated,
// it is drawn one pixel per step and stretched without smoothing to a whole
// number of steps, which may overhang the viewport's edge by under a step;
// otherwise it is drawn at up to 1.5 device pixels per CSS pixel.
export function canvasSize(pixelated: boolean) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (!pixelated) {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    return {
      key: `${width}x${height}@${dpr}`,
      width: width * dpr,
      height: height * dpr,
      cssWidth: width,
      cssHeight: height,
      rendering: "",
    };
  }

  const { wide, phone } = tuning.background;
  const step = window.matchMedia(phoneQuery).matches ? phone : wide;
  const columns = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  return {
    key: `${columns}x${rows}/${step}`,
    width: columns,
    height: rows,
    cssWidth: columns * step,
    cssHeight: rows * step,
    rendering: "pixelated",
  };
}
