import { CrawlerService } from "../services/crawler.service";
import type { CrawlResult, CrawlUrlInput } from "../types/crawl-result.type";

export class CrawlUrlUseCase {
  constructor(private readonly crawlerService = new CrawlerService()) {}

  async execute(input: CrawlUrlInput): Promise<CrawlResult> {
    return this.crawlerService.crawlUrl(input);
  }
}
