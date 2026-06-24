import { PageObjectGeneratorService } from "../services/page-object-generator.service";
import type { GeneratedPageObject } from "../types/page-object.type";

export class ListGeneratedPageObjectsUseCase {
  constructor(
    private readonly generatorService = new PageObjectGeneratorService()
  ) {}

  execute(pageId: string): Promise<GeneratedPageObject[]> {
    return this.generatorService.listGenerated(pageId);
  }
}
