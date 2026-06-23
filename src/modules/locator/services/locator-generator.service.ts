import { ApplicationError } from "@/shared/errors/application-error";
import { ariaLabelLocatorStrategy } from "../strategies/aria-label-locator.strategy";
import { cssLocatorStrategy } from "../strategies/css-locator.strategy";
import { dataTestIdLocatorStrategy } from "../strategies/data-testid-locator.strategy";
import { dataTestLocatorStrategy } from "../strategies/data-test-locator.strategy";
import { idLocatorStrategy } from "../strategies/id-locator.strategy";
import { nameLocatorStrategy } from "../strategies/name-locator.strategy";
import { placeholderLocatorStrategy } from "../strategies/placeholder-locator.strategy";
import { roleLocatorStrategy } from "../strategies/role-locator.strategy";
import { textLocatorStrategy } from "../strategies/text-locator.strategy";
import { xpathLocatorStrategy } from "../strategies/xpath-locator.strategy";
import { LocatorRepository } from "../repositories/locator.repository";
import { LocatorStabilityScoringService } from "./locator-stability-scoring.service";
import type {
  GeneratedLocator,
  LocatorElement,
  LocatorGroup,
  LocatorStrategy
} from "../types/locator.type";

const locatorStrategies: LocatorStrategy[] = [
  dataTestIdLocatorStrategy,
  dataTestLocatorStrategy,
  ariaLabelLocatorStrategy,
  roleLocatorStrategy,
  idLocatorStrategy,
  nameLocatorStrategy,
  placeholderLocatorStrategy,
  textLocatorStrategy,
  cssLocatorStrategy,
  xpathLocatorStrategy
].sort((first, second) => first.priority - second.priority);

function uniqueLocators(locators: GeneratedLocator[]): GeneratedLocator[] {
  const seen = new Set<string>();

  return locators.filter((locator) => {
    const key = `${locator.locatorType}:${locator.locatorValue}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export class LocatorGeneratorService {
  constructor(
    private readonly locatorRepository = new LocatorRepository(),
    private readonly scoringService = new LocatorStabilityScoringService()
  ) {}

  generateForElement(element: LocatorElement): GeneratedLocator[] {
    return uniqueLocators(
      locatorStrategies.flatMap((strategy) => strategy.generate(element))
    )
      .map((locator) => this.scoringService.score(locator, element))
      .sort((first, second) => second.score - first.score);
  }

  async generateForPage(pageId: string): Promise<LocatorGroup[]> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    const elements = await this.locatorRepository.listElementsByPage(pageId);

    if (elements.length === 0) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        "Analyze DOM before generating locators",
        400
      );
    }

    return this.locatorRepository.replaceLocatorsForPage(
      pageId,
      elements.map((element) => ({
        elementId: element.id,
        locators: this.generateForElement(element)
      }))
    );
  }

  async listForPage(pageId: string): Promise<LocatorGroup[]> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    return this.locatorRepository.listLocatorGroupsByPage(pageId);
  }
}
