import { MeiliSearch } from "meilisearch";

export const meilisearchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
});
