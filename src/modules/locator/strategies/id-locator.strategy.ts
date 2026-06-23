import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const idLocatorStrategy: LocatorStrategy = {
  name: "id",
  priority: 5,
  generate(element) {
    if (!element.elementId) {
      return [];
    }

    return [
      locator(
        "playwright:id",
        `page.locator('#${quote(element.elementId)}')`,
        86,
        "Use when test attributes are unavailable",
        "HTML id is concise and fast, but may be less intentional than test-specific attributes."
      ),
      locator(
        "css:id",
        `#${element.elementId}`,
        86,
        "Good CSS locator",
        "ID selector is concise when the id is stable."
      ),
      locator(
        "selenium:id",
        `By.id("${seleniumQuote(element.elementId)}")`,
        86,
        "Good Selenium locator",
        "Selenium has native ID lookup."
      )
    ];
  }
};
