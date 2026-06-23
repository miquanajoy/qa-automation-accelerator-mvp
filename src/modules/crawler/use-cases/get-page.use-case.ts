import { CrawlerService } from "../services/crawler.service";
import type { CrawlDetail } from "../types/crawl-result.type";

export class GetPageUseCase {
  constructor(private readonly crawlerService = new CrawlerService()) {}

  async execute(pageId: string): Promise<CrawlDetail> {
    return this.crawlerService.getPage(pageId);
  }
}
