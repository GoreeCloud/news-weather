import type { NewsArticleSummary } from "./integrations/feeds";

export const MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH = 160;
export const MAX_LOCAL_NEWS_SEARCH_RESULTS = 50;
const MAX_SEARCH_TERMS = 8;

export function normalizeLocalNewsSearchQuery(value: string): string {
  return value
    .trim()
    .replaceAll(/\s+/g, " ")
    .slice(0, MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH);
}

function searchableArticleText(article: NewsArticleSummary): string {
  return [
    article.title,
    article.sourceName,
    article.summary ?? "",
  ]
    .join("\n")
    .toLocaleLowerCase();
}

export function searchLocalNewsArticles(
  articles: readonly NewsArticleSummary[],
  query: string,
  limit = MAX_LOCAL_NEWS_SEARCH_RESULTS,
): readonly NewsArticleSummary[] {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LOCAL_NEWS_SEARCH_RESULTS) {
    throw new Error("Local news search limit must be an integer between 1 and 50.");
  }

  const normalized = normalizeLocalNewsSearchQuery(query).toLocaleLowerCase();
  if (!normalized) return [];

  const terms = normalized
    .split(" ")
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TERMS);

  const results: NewsArticleSummary[] = [];
  for (const article of articles) {
    const haystack = searchableArticleText(article);
    if (!terms.every((term) => haystack.includes(term))) continue;

    results.push(article);
    if (results.length >= limit) break;
  }

  return results;
}
