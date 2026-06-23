import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const ariaLabelLocatorStrategy: LocatorStrategy = {
  name: "aria-label",
  priority: 3,
  generate(element) {
    if (!element.ariaLabel) {
      return [];
    }

    return [
      locator(
        "playwright:aria-label",
        `page.getByLabel('${quote(element.ariaLabel)}')`,
        92,
        "Use for accessible controls",
        "aria-label is user-facing accessibility metadata and is usually more meaningful than CSS."
      ),
      locator(
        "css:aria-label",
        `[aria-label="${element.ariaLabel}"]`,
        88,
        "Good CSS fallback",
        "aria-label can be targeted directly when Playwright label lookup is not suitable."
      ),
      locator(
        "selenium:css:aria-label",
        `By.cssSelector("[aria-label=\\"${seleniumQuote(element.ariaLabel)}\\"]")`,
        88,
        "Good Selenium fallback",
        "Selenium can target aria-label with CSS."
      )
    ];
  }
};
