import type { LocatorStrategy } from "../types/locator.type";
import {
  cleanLocatorText,
  cssAttributeQuote,
  locator,
  seleniumQuote
} from "./locator-strategy.helpers";

function nameAttributeValue(elementName: string, comparisonValues: Array<string | null>) {
  const normalizedName = cleanLocatorText(elementName);

  if (!normalizedName) {
    return null;
  }

  const duplicatesDerivedLabel = comparisonValues.some(
    (value) => cleanLocatorText(value) === normalizedName
  );

  return duplicatesDerivedLabel ? null : normalizedName;
}

export const nameLocatorStrategy: LocatorStrategy = {
  name: "name",
  priority: 6,
  generate(element) {
    if (!element.name) {
      return [];
    }

    const name = nameAttributeValue(element.name, [
      element.ariaLabel,
      element.placeholder,
      element.text
    ]);

    if (!name) {
      return [];
    }

    const cssName = cssAttributeQuote(name);
    const seleniumName = seleniumQuote(name);

    return [
      locator(
        "playwright:name",
        `page.locator('[name="${cssName}"]')`,
        80,
        "Use for form controls",
        "name is useful for form fields when test ids and labels are unavailable."
      ),
      locator(
        "css:name",
        `[name="${cssName}"]`,
        80,
        "CSS form locator",
        "Targets the HTML name attribute."
      ),
      locator(
        "selenium:name",
        `By.name("${seleniumName}")`,
        80,
        "Selenium form locator",
        "Selenium has native name lookup."
      )
    ];
  }
};
