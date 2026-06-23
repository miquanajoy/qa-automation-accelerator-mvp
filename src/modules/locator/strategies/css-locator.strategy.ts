import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const cssLocatorStrategy: LocatorStrategy = {
  name: "css",
  priority: 9,
  generate(element) {
    if (!element.cssSelector) {
      return [];
    }

    return [
      locator(
        "playwright:css",
        `page.locator('${quote(element.cssSelector)}')`,
        48,
        "CSS fallback only",
        "CSS selector may depend on layout/classes and should be used after semantic locators."
      ),
      locator(
        "css",
        element.cssSelector,
        48,
        "Raw CSS selector",
        "Useful for debugging or frameworks outside Playwright."
      ),
      locator(
        "selenium:css",
        `By.cssSelector("${seleniumQuote(element.cssSelector)}")`,
        48,
        "Selenium CSS fallback",
        "CSS selector for Selenium when stronger options are missing."
      )
    ];
  }
};
