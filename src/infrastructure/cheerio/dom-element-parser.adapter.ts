import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export type ParsedDomElement = {
  tagName: string;
  elementId: string | null;
  className: string | null;
  text: string | null;
  role: string | null;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  type: string | null;
  href: string | null;
  testId: string | null;
  test: string | null;
  xpath: string | null;
  cssSelector: string | null;
};

const interactiveSelector = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "form",
  "[role]",
  "[aria-label]",
  "[data-testid]",
  "[data-test]",
].join(",");

function cleanText(value: string | undefined): string | null {
  const text = value?.replace(/\s+/g, " ").trim();

  return text ? text.slice(0, 220) : null;
}

function cssEscape(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function buildCssSelector(element: Element, $: cheerio.CheerioAPI): string {
  const current = $(element);
  const id = current.attr("id");

  if (id) {
    return `#${cssEscape(id)}`;
  }

  const dataTestId = current.attr("data-testid");

  if (dataTestId) {
    return `[data-testid="${dataTestId}"]`;
  }

  const dataTest = current.attr("data-test");

  if (dataTest) {
    return `[data-test="${dataTest}"]`;
  }

  const parts: string[] = [];
  let node: cheerio.Cheerio<Element> = current;

  while (node.length > 0 && node[0]?.type === "tag" && parts.length < 5) {
    const tagName = node[0].tagName.toLowerCase();
    const className = node.attr("class")?.trim().split(/\s+/).filter(Boolean)[0];
    const baseSelector = className ? `${tagName}.${cssEscape(className)}` : tagName;
    const parent = node.parent();
    const siblings = parent.children(tagName);
    const index = siblings.index(node);
    const selectorPart =
      siblings.length > 1 && index >= 0
        ? `${baseSelector}:nth-of-type(${index + 1})`
        : baseSelector;

    parts.unshift(selectorPart);
    node = parent;

    if (tagName === "body") {
      break;
    }
  }

  return parts.join(" > ");
}

function buildXPath(element: Element, $: cheerio.CheerioAPI): string {
  const parts: string[] = [];
  let node: cheerio.Cheerio<Element> = $(element);

  while (node.length > 0 && node[0]?.type === "tag") {
    const tagName = node[0].tagName.toLowerCase();
    const parent = node.parent();
    const sameTagSiblings = parent.children(tagName);
    const index = Math.max(sameTagSiblings.index(node) + 1, 1);

    parts.unshift(`${tagName}[${index}]`);
    node = parent;

    if (tagName === "html") {
      break;
    }
  }

  return `/${parts.join("/")}`;
}

export class DomElementParserAdapter {
  parse(html: string): ParsedDomElement[] {
    const $ = cheerio.load(html);
    const elements: ParsedDomElement[] = [];
    const seenSelectors = new Set<string>();

    $(interactiveSelector).each((_index, element) => {
      if (element.type !== "tag") {
        return;
      }

      const current = $(element);
      const tagName = element.tagName.toLowerCase();
      const cssSelector = buildCssSelector(element, $);

      if (seenSelectors.has(cssSelector)) {
        return;
      }

      seenSelectors.add(cssSelector);

      const text = cleanText(current.text());
      const ariaLabel = cleanText(current.attr("aria-label"));
      const nameAttribute = cleanText(current.attr("name"));
      const placeholder = cleanText(current.attr("placeholder"));
      const type = cleanText(current.attr("type"));
      const href = cleanText(current.attr("href"));
      const testId = cleanText(current.attr("data-testid"));
      const test = cleanText(current.attr("data-test"));

      elements.push({
        tagName,
        elementId: current.attr("id") ?? null,
        className: current.attr("class") ?? null,
        text,
        role: current.attr("role") ?? null,
        ariaLabel,
        name: nameAttribute,
        placeholder,
        type,
        href,
        testId,
        test,
        xpath: buildXPath(element, $),
        cssSelector
      });
    });

    return elements.slice(0, 300);
  }
}
