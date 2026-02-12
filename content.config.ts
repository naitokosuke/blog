import { defineContentConfig, defineCollection } from "@nuxt/content";
import * as v from "valibot";

const content = defineCollection({
  type: "page",
  source: {
    include: "**/*.{md,yml,json}",
    exclude: ["docs/**"],
  },
  schema: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/))),
    tags: v.optional(v.array(v.string()), []),
    draft: v.optional(v.boolean(), false),
  }),
});

const docs = defineCollection({
  type: "page",
  source: {
    include: "docs/**/*.md",
    prefix: "/docs",
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
