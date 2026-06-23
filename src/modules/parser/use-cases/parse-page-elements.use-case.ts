import { DomParserService } from "../services/dom-parser.service";
import type { ParsedElement } from "../types/parsed-element.type";

export class ParsePageElementsUseCase {
  constructor(private readonly domParserService = new DomParserService()) {}

  async execute(pageId: string): Promise<ParsedElement[]> {
    return this.domParserService.parsePage(pageId);
  }
}
