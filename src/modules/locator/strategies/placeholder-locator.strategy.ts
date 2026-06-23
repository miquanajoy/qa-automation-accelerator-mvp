import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const placeholderLocatorStrategy: LocatorStrategy = {
  name: "placeholder",
  priority: 7,
  generate(element) {
    if (!element.placeholder) {
      return [];
    }

    return [
      locator(
        "playwright:placeholder",
        `page.getByPlaceholder('${quote(element.placeholder)}')`,
        76,
        "Use for input fallback",
        "Placeholder is readable, but product copy can change."
      ),
      locator(
        "css:placeholder",
        `[placeholder="${element.placeholder}"]`,
        72,
        "CSS fallback",
        "Targets placeholder text directly."
      ),
      locator(
        "selenium:css:placeholder",
        `By.cssSelector("[placeholder=\\"${seleniumQuote(element.placeholder)}\\"]")`,
        72,
        "Selenium CSS fallback",
        "Selenium can target placeholder with CSS."
      )
    ];
  }
};
