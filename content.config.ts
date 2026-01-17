import { defineContentConfig, defineCollection } from "@nuxt/content";
import * as v from "valibot";

const content = defineCollection({
  type: "page",
  source: {
    include: "**/*.{md,yml,json}",
    cwd: "content",
  },
  schema: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.pipe(v.string(), v.isoDate())),
    tags: v.optional(v.array(v.string()), []),
    draft: v.optional(v.boolean(), false),
  }),
});

const docs = defineCollection({
  type: "page",
  source: {
    include: "**/*.md",
    prefix: "/docs",
    cwd: "docs",
  },
  schema: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  }),
});

export default defineContentConfig({
  collections: {
    content,
    docs,
  },
});
