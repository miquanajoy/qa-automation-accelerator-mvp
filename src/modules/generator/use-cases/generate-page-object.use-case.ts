import { PageObjectGeneratorService } from "../services/page-object-generator.service";
import type {
  GeneratePageObjectInput,
  GeneratedPageObject
} from "../types/page-object.type";

export class GeneratePageObjectUseCase {
  constructor(
    private readonly generatorService = new PageObjectGeneratorService()
  ) {}

  execute(input: GeneratePageObjectInput): Promise<GeneratedPageObject> {
    return this.generatorService.generateAndSave(input);
  }
}
