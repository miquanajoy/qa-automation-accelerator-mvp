export type CrawlUrlInput = {
  projectId: string;
  url: string;
};

export type CrawlResult = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  html: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CrawlHistoryItem = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CrawlDetail = CrawlResult & {
  htmlSize: number;
};
