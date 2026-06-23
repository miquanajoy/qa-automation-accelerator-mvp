import type { LocatorStrategy } from "../types/locator.type";
import { cleanLocatorText, locator, quote, seleniumQuote } from "./locator-strategy.helpers";

export const textLocatorStrategy: LocatorStrategy = {
  name: "text",
  priority: 8,
  generate(element) {
    const text = cleanLocatorText(element.text);

    if (!text) {
      return [];
    }

    return [
      locator(
        "playwright:text",
        `page.getByText('${quote(text)}')`,
        68,
        "Readable text fallback",
        "Text locators are readable but can break when content changes."
      ),
      locator(
        "selenium:xpath:text",
        `By.xpath("//${element.tagName}[normalize-space()=\\"${seleniumQuote(text)}\\"]")`,
        62,
        "Selenium text fallback",
        "XPath can match visible text when stronger attributes are unavailable."
      )
    ];
  }
};
