export interface NewsArticleSummary {
  readonly id: string;
  readonly title: string;
  readonly sourceName: string;
  readonly publishedAt: string;
  readonly unread: boolean;
  readonly bookmarked: boolean;
  readonly thumbnailUrl?: string;
  readonly summary?: string;
}

export interface NewsFeedStatus {
  readonly connected: boolean;
  readonly message: string;
}

export interface FeedsClient {
  getStatus(): Promise<NewsFeedStatus>;
  listRecentArticles(limit: number): Promise<readonly NewsArticleSummary[]>;
}

export class UnavailableFeedsClient implements FeedsClient {
  async getStatus(): Promise<NewsFeedStatus> {
    return {
      connected: false,
      message: "GoreeCloud Feeds is not connected in this Development source foundation.",
    };
  }

  async listRecentArticles(_limit: number): Promise<readonly NewsArticleSummary[]> {
    return [];
  }
}
