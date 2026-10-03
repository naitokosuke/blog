import { queryCollection, useAsyncData } from "#imports";

/**
 * Every post, newest first, with only the fields a listing needs. The index
 * renders it and an article reads its neighbours from it; sharing the key
 * means moving between the two never queries twice.
 */
export function usePostList() {
  return useAsyncData("post-list", () =>
    queryCollection("content")
      .where("path", "NOT LIKE", "/")
      .where("extension", "=", "md")
      .order("date", "DESC")
      .select("path", "title", "description", "date")
      .all(),
  );
}
