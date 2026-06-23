import { DomElementParserAdapter } from "@/infrastructure/cheerio/dom-element-parser.adapter";
import { ApplicationError } from "@/shared/errors/application-error";
import { ElementRepository } from "../repositories/element.repository";
import type { ParsedElement } from "../types/parsed-element.type";

export class DomParserService {
  constructor(
    private readonly elementRepository = new ElementRepository(),
    private readonly parserAdapter = new DomElementParserAdapter()
  ) {}

  async parsePage(pageId: string): Promise<ParsedElement[]> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    const html = await this.elementRepository.findPageHtml(pageId);

    if (!html) {
      throw new ApplicationError("NOT_FOUND", "Page not found", 404);
    }

    const elements = this.parserAdapter.parse(html);

    return this.elementRepository.replaceForPage(pageId, elements);
  }

  async listPageElements(pageId: string): Promise<ParsedElement[]> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    return this.elementRepository.listByPage(pageId);
  }
}
