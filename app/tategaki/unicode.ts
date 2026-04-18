/// Character classification helpers not specific to layout logic.

/**
 * ASCII letters and digits. Used to tighten vertical spacing for short
 * Latin runs. Glyph orientation in vertical text is handled entirely
 * by CSS (`writing-mode: vertical-rl; text-orientation: mixed`) plus
 * the font's `vert` OpenType feature — the browser consults Unicode's
 * Vertical_Orientation property so no custom set of rotated characters
 * is needed.
 */
export const isLatinOrDigit = (ch: string): boolean => {
  if (ch.length !== 1) return false;
  const c = ch.charCodeAt(0);
  return (c >= 0x30 && c <= 0x39) // 0-9
    || (c >= 0x41 && c <= 0x5a) // A-Z
    || (c >= 0x61 && c <= 0x7a); // a-z
};
