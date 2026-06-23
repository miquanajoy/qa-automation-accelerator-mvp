import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const dataTestIdLocatorStrategy: LocatorStrategy = {
  name: "data-testid",
  priority: 1,
  generate(element) {
    if (!element.testId) {
      return [];
    }

    return [
      locator(
        "playwright:data-testid",
        `page.getByTestId('${quote(element.testId)}')`,
        100,
        "Use first",
        "data-testid is purpose-built for stable test automation."
      ),
      locator(
        "css:data-testid",
        `[data-testid="${element.testId}"]`,
        98,
        "Strong CSS fallback",
        "data-testid is stable even when layout or text changes."
      ),
      locator(
        "selenium:css:data-testid",
        `By.cssSelector("[data-testid=\\"${seleniumQuote(element.testId)}\\"]")`,
        98,
        "Strong Selenium fallback",
        "Selenium can target the same data-testid attribute with CSS."
      )
    ];
  }
};
