import { defineNuxtModule, useNuxt } from "@nuxt/kit";
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];

function copyImagesRecursively(srcDir: string, destDir: string, baseDir: string) {
  if (!existsSync(srcDir)) return;

  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const relativePath = relative(baseDir, srcPath);
    const destPath = join(destDir, relativePath);

    if (entry.isDirectory()) {
      copyImagesRecursively(srcPath, destDir, baseDir);
    } else if (entry.isFile()) {
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

    nuxt.hook("nitro:build:public-assets", (nitro) => {
      const contentDir = join(nuxt.options.rootDir, "content");
      const publicDir = nitro.options.output.publicDir;

      copyImagesRecursively(contentDir, publicDir, contentDir);
    });
  },
});
