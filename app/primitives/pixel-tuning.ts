// How coarse the PlayStation-resolution look is, in one place. The text
// filters (pixel-filters.vue) and the background canvases (overlay/) both
// read it; the CSS only says which role takes which text filter.
export const tuning = {
  // How much of the coarse picture a -soft text filter shows over the sharp
  // text, 0 to 1
  softMix: 0.55,
  // Text on wide screens, in CSS pixels
  wide: { title: 3, text: 2 },
  phone: {
    // In CSS pixels
    title: 2,
    // In device pixels, by screen density (2x, 3x); the CSS picks the one
    // for the screen
    text: { 2: 3, 3: 5 },
  },
  // The background (the wall, the fog), in CSS pixels: it is drawn one pixel
  // per step and scaled up without smoothing
  background: { wide: 3, phone: 2 },
};

// The same breakpoint the CSS uses for a phone
export const phoneQuery = "(width <= 768px)";
