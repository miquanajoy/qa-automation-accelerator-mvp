import type { LocatorStrategy } from "../types/locator.type";
import { locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const xpathLocatorStrategy: LocatorStrategy = {
  name: "xpath",
  priority: 10,
  generate(element) {
    if (!element.xpath) {
      return [];
    }

    return [
      locator(
        "playwright:xpath",
        `page.locator('xpath=${quote(element.xpath)}')`,
        30,
        "Last-resort Playwright fallback",
        "XPath is brittle and should only be used when no stable attribute or text locator exists."
      ),
      locator(
        "xpath",
        element.xpath,
        30,
        "Raw XPath",
        "Useful for debugging and as a last resort."
      ),
      locator(
        "selenium:xpath",
        `By.xpath("${seleniumQuote(element.xpath)}")`,
        30,
        "Last-resort Selenium fallback",
        "XPath is available in Selenium but tends to be brittle."
      )
    ];
  }
};
