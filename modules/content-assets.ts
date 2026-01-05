import { defineNuxtModule } from "@nuxt/kit";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export default defineNuxtModule({
  meta: {
    name: "content-assets",
  },
  setup(_, nuxt) {
    const contentDir = join(nuxt.options.rootDir, "content");

    const findImageDirs = (dir: string): string[] => {
      const results: string[] = [];
      if (!existsSync(dir)) return results;
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

    // Nitro の publicAssets に content 内の images ディレクトリを追加
    // これによりローカル public/ にコピーせずに画像を配信できる
    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.publicAssets ||= [];
      for (const imageDir of findImageDirs(contentDir)) {
        const baseURL = "/" + relative(contentDir, imageDir).replace(/\\/g, "/");
        nitroConfig.publicAssets.push({
          dir: imageDir,
          baseURL,
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    });
  },
});
