import { defineContentConfig, defineCollection } from "@nuxt/content";
import * as v from "valibot";

const posts = defineCollection({
  type: "page",
  source: "**",
  schema: v.object({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.optional(v.pipe(v.string(), v.isoDate())),
    tags: v.optional(v.array(v.string()), []),
    draft: v.optional(v.boolean(), false),
  }),
});

export default defineContentConfig({
  collections: {
    posts,
  },
});
