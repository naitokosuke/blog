import { defineNuxtModule } from "@nuxt/kit";
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export default defineNuxtModule({
  meta: {
    name: "content-assets",
  },
  setup(_options, nuxt) {
    const contentDir = join(nuxt.options.rootDir, "content");
    const publicDir = join(nuxt.options.rootDir, "public");

    const syncContentAssets = () => {
      if (!existsSync(contentDir)) return;

      const findImageDirs = (dir: string): string[] => {
        const results: string[] = [];
        for (const entry of readdirSync(dir)) {
          const fullPath = join(dir, entry);
          if (!statSync(fullPath).isDirectory()) continue;
          if (entry === "images") {
            results.push(fullPath);
          }
          else {
            results.push(...findImageDirs(fullPath));
          }
        }
        return results;
      };

      for (const imageDir of findImageDirs(contentDir)) {
        const relativePath = relative(contentDir, imageDir);
        const targetDir = join(publicDir, relativePath);
        mkdirSync(targetDir, { recursive: true });
        cpSync(imageDir, targetDir, { recursive: true });
      }
    };

    // Build 時のみ実行
    nuxt.hook("build:before", syncContentAssets);
  },
});
