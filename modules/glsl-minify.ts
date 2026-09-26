import { addVitePlugin, defineNuxtModule } from "@nuxt/kit";

/**
 * Strips comments and indentation from `/* glsl *\/`-tagged template literals
 * in the production client bundle.
 *
 * The overlay shaders carry long comments about what they draw and why, which
 * are worth keeping in the source but are dead weight in the bundle - the two
 * of them ship ~24 KB of GLSL text on the critical path. Only comments,
 * leading/trailing whitespace and blank lines go; newlines stay, because the
 * preprocessor directives need them, and nothing else is rewritten, so the
 * compiled shader is the same program.
 *
 * Dev builds are left alone, so a shader compile error still reports the line
 * numbers you see in the editor.
 *
 * The marker is the same `/* glsl *\/` comment editors use to syntax-highlight
 * embedded shaders. A `${...}` placeholder inside one is passed through
 * untouched; it must not contain a `//` sequence.
 */

const MARKER = /\/\*\s*glsl\s*\*\/\s*`/g;

function minifyGlsl(body: string): string {
  return body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .join("\n");
}

/** Index of the backtick closing the literal that opened at `from`. */
function findClose(source: string, from: number): number {
  let depth = 0;
  for (let i = from; i < source.length; i++) {
    const char = source[i];
    if (char === "\\") {
      i++;
    } else if (char === "$" && source[i + 1] === "{") {
      depth++;
      i++;
    } else if (char === "}" && depth > 0) {
      depth--;
    } else if (char === "`" && depth === 0) {
      return i;
    }
  }
  return -1;
}

export function minifyTaggedShaders(source: string): string {
  let out = "";
  let cursor = 0;
  MARKER.lastIndex = 0;
  for (let match = MARKER.exec(source); match; match = MARKER.exec(source)) {
    const open = match.index + match[0].length;
    const close = findClose(source, open);
    if (close === -1) break;
    out += source.slice(cursor, open) + minifyGlsl(source.slice(open, close));
    cursor = close;
    MARKER.lastIndex = close;
  }
  return out + source.slice(cursor);
}

export default defineNuxtModule({
  meta: {
    name: "glsl-minify",
  },
  setup() {
    addVitePlugin(
      {
        name: "glsl-minify",
        enforce: "pre",
        apply: "build",
        transform(code, id) {
          if (!/\.(?:vue|ts)$/.test(id.split("?")[0] ?? "")) return;
          if (!code.includes("glsl")) return;
          const minified = minifyTaggedShaders(code);
          return minified === code ? undefined : { code: minified, map: null };
        },
      },
      { client: true, server: false },
    );
  },
});
