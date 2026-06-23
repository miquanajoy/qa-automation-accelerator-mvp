import type { GeneratedLocator, LocatorElement } from "../types/locator.type";

export function quote(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function seleniumQuote(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function cssAttributeQuote(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function cleanLocatorText(value: string | null): string | null {
  const text = value?.replace(/\s+/g, " ").trim();

  if (!text) {
    return null;
  }

  return text.length > 120 ? text.slice(0, 120) : text;
}

export function locator(
  locatorType: string,
  locatorValue: string,
  score: number,
  recommendation: string,
  reason: string
): GeneratedLocator {
  return {
    locatorType,
    locatorValue,
    score,
    recommendation,
    reason
  };
}

export function elementName(element: LocatorElement): string | null {
  return (
    cleanLocatorText(element.ariaLabel) ??
    cleanLocatorText(element.name) ??
    cleanLocatorText(element.placeholder) ??
    cleanLocatorText(element.text)
  );
}
