import { ZodError } from "zod";
import { PlaywrightCrawlerAdapter } from "@/infrastructure/playwright/playwright-crawler.adapter";
import { ApplicationError } from "@/shared/errors/application-error";
import { crawlUrlDto } from "../dto/crawl-url.dto";
import { PageRepository } from "../repositories/page.repository";
import { normalizeCrawlUrl } from "./url-normalizer.service";
import type {
  CrawlDetail,
  CrawlHistoryItem,
  CrawlResult,
  CrawlUrlInput
} from "../types/crawl-result.type";

function validationMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid crawl payload";
}

export class CrawlerService {
  constructor(
    private readonly pageRepository = new PageRepository(),
    private readonly crawlerAdapter = new PlaywrightCrawlerAdapter()
  ) {}

  async crawlUrl(input: CrawlUrlInput): Promise<CrawlResult> {
    const parsed = crawlUrlDto.safeParse(input);

    if (!parsed.success) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        validationMessage(parsed.error),
        400
      );
    }

    const projectExists = await this.pageRepository.projectExists(
      parsed.data.projectId
    );

    if (!projectExists) {
      throw new ApplicationError("NOT_FOUND", "Project not found", 404);
    }

    const normalizedUrl = normalizeCrawlUrl(parsed.data.url);
    const crawledPage = await this.crawlerAdapter.crawl(normalizedUrl);

    return this.pageRepository.create({
      projectId: parsed.data.projectId,
      url: crawledPage.url,
      title: crawledPage.title,
      html: crawledPage.html
    });
  }

  async listProjectPages(projectId: string): Promise<CrawlHistoryItem[]> {
    if (!projectId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Project id is required", 400);
    }

    const projectExists = await this.pageRepository.projectExists(projectId);

    if (!projectExists) {
      throw new ApplicationError("NOT_FOUND", "Project not found", 404);
    }

    return this.pageRepository.listByProject(projectId);
  }

  async getPage(pageId: string): Promise<CrawlDetail> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    const page = await this.pageRepository.findById(pageId);

    if (!page) {
      throw new ApplicationError("NOT_FOUND", "Page not found", 404);
    }

    return page;
  }
}
