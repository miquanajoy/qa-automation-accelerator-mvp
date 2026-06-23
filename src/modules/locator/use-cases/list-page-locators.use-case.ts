import { LocatorGeneratorService } from "../services/locator-generator.service";
import type { LocatorGroup } from "../types/locator.type";

export class ListPageLocatorsUseCase {
  constructor(
    private readonly locatorGeneratorService = new LocatorGeneratorService()
  ) {}

  async execute(pageId: string): Promise<LocatorGroup[]> {
    return this.locatorGeneratorService.listForPage(pageId);
  }
}
