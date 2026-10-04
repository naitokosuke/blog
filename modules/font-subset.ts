import { defineNuxtModule, useLogger } from "@nuxt/kit";

/**
 * Cuts Zen Old Mincho down to the glyphs the site renders at the start of
 * every build (scripts/build-font-subset.mjs), so a new post never ships with
 * a stale subset and the generated files never need committing.
 *
 * `nuxt dev` only builds one when none exists yet - fetching from Google on
 * every restart would slow the loop for no gain. If the fetch fails (offline,
 * Google down) the build goes on with whatever subset is there, or an empty
 * one: every glyph then comes from the Google subsets @nuxt/fonts injects,
 * which renders the same and only costs bytes.
 */
export default defineNuxtModule({
  meta: {
    name: "font-subset",
  },
  async setup(_, nuxt) {
    if (nuxt.options._prepare) return;

    const logger = useLogger("font-subset");
    const { buildFontSubset, ensureFontSubsetCss, hasFontSubset } =
      await import("../scripts/build-font-subset.mjs");

    // nuxt.config lists the file in `css`; it has to exist before anything
    // resolves it, even if the build below ends up replacing it
    await ensureFontSubsetCss();

    nuxt.hook("build:before", async () => {
      if (nuxt.options.dev && (await hasFontSubset())) return;
      try {
        await buildFontSubset((line: string) => logger.info(line));
      } catch (error) {
        logger.warn("Could not build the font subset; falling back to Google subsets.", error);
      } finally {
        await ensureFontSubsetCss();
      }
    });
  },
});
