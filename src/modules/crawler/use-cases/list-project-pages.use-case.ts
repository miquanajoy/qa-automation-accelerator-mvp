import { CrawlerService } from "../services/crawler.service";
import type { CrawlHistoryItem } from "../types/crawl-result.type";

export class ListProjectPagesUseCase {
  constructor(private readonly crawlerService = new CrawlerService()) {}

  async execute(projectId: string): Promise<CrawlHistoryItem[]> {
    return this.crawlerService.listProjectPages(projectId);
  }
}
