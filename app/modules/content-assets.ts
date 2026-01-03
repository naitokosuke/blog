import { defineNuxtModule, useNuxt } from "@nuxt/kit";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];

function copyImagesRecursively(srcDir: string, destDir: string, baseDir: string): void {
  if (!existsSync(srcDir)) return;

  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);

    if (entry.isDirectory()) {
      copyImagesRecursively(srcPath, destDir, baseDir);
    }
    else if (entry.isFile()) {
      const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf("."));
      if (imageExtensions.includes(ext)) {
        const destDirPath = join(destDir, relative(baseDir, srcDir));
        if (!existsSync(destDirPath)) {
          mkdirSync(destDirPath, { recursive: true });
        }
        cpSync(srcPath, join(destDirPath, entry.name));
      }
    }
  }
}

export default defineNuxtModule({
  meta: {
    name: "content-assets",
    configKey: "contentAssets",
  },
  setup() {
    const nuxt = useNuxt();
    const contentDir = join(nuxt.options.rootDir, "content");
    const publicDir = join(nuxt.options.rootDir, "public");

    // Copy images to public dir at build start (for IPX to process during prerender)
    nuxt.hook("build:before", () => {
      copyImagesRecursively(contentDir, publicDir, contentDir);
    });

    // Also copy to output public dir after build
    nuxt.hook("nitro:build:public-assets", (nitro) => {
      const outputPublicDir = nitro.options.output.publicDir as string;
      copyImagesRecursively(contentDir, outputPublicDir, contentDir);
    });
  },
});
