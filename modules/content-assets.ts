import { defineNuxtModule } from "@nuxt/kit";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export default defineNuxtModule({
  meta: {
    name: "content-assets",
  },
  setup(_, nuxt) {
    const contentDir = join(nuxt.options.rootDir, "content");

    const findImageDirs = (dir: string): { fullPath: string; baseURL: string }[] => {
      const results: { fullPath: string; baseURL: string }[] = [];
      if (!existsSync(dir)) return results;
      for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        if (!statSync(fullPath).isDirectory()) continue;
        if (entry === "images") {
          const baseURL = "/" + relative(contentDir, fullPath).replace(/\\/g, "/");
          results.push({ fullPath, baseURL });
        }
        else {
          results.push(...findImageDirs(fullPath));
        }
      }
      return results;
    };

    const imageDirs = findImageDirs(contentDir);

    // Nitro の publicAssets に content 内の images ディレクトリを追加
    // これによりローカル public/ にコピーせずに画像を配信できる
    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.publicAssets ||= [];
      for (const { fullPath, baseURL } of imageDirs) {
        nitroConfig.publicAssets.push({
          dir: fullPath,
          baseURL,
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    });
  },
});
