import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const dataTestLocatorStrategy: LocatorStrategy = {
  name: "data-test",
  priority: 2,
  generate(element) {
    if (!element.test) {
      return [];
    }

    return [
      locator(
        "playwright:data-test",
        `page.locator('[data-test="${quote(element.test)}"]')`,
        96,
        "Use when data-testid is unavailable",
        "data-test is usually intended for automation and is more stable than styling selectors."
      ),
      locator(
        "css:data-test",
        `[data-test="${element.test}"]`,
        95,
        "Strong CSS fallback",
        "data-test is an automation-friendly attribute."
      ),
      locator(
        "selenium:css:data-test",
        `By.cssSelector("[data-test=\\"${seleniumQuote(element.test)}\\"]")`,
        95,
        "Strong Selenium fallback",
        "Selenium can target the same data-test attribute with CSS."
      )
    ];
  }
};
