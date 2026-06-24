import assert from "node:assert/strict";
import test from "node:test";
import type {
  GeneratedLocator,
  LocatorElement
} from "../types/locator.type";
import { LocatorStabilityScoringService } from "./locator-stability-scoring.service";

const baseElement: LocatorElement = {
  id: "element-1",
  pageId: "page-1",
  tagName: "button",
  elementId: null,
  className: null,
  text: "Submit",
  role: "button",
  ariaLabel: null,
  name: null,
  placeholder: null,
  type: "button",
  href: null,
  testId: null,
  test: null,
  xpath: "/html/body/button",
  cssSelector: "body > button"
};

function candidate(
  locatorType: string,
  locatorValue: string
): GeneratedLocator {
  return {
    locatorType,
    locatorValue,
    score: 0,
    recommendation: "",
    reason: ""
  };
}

test("uses configured base scores and recommendation thresholds", () => {
  const service = new LocatorStabilityScoringService();

  const testId = service.score(
    candidate("playwright:data-testid", "page.getByTestId('submit')"),
    { ...baseElement, testId: "submit" }
  );
  const role = service.score(
    candidate(
      "playwright:role",
      "page.getByRole('button', { name: 'Submit' })"
    ),
    baseElement
  );
  const text = service.score(
    candidate("playwright:text", "page.getByText('Submit')"),
    baseElement
  );
  const css = service.score(
    candidate("css", "body > button"),
    baseElement
  );

  assert.equal(testId.score, 95);
  assert.equal(testId.recommendation, "Recommended");
  assert.equal(role.score, 80);
  assert.equal(role.recommendation, "Acceptable");
  assert.equal(text.score, 55);
  assert.equal(text.recommendation, "Weak");
  assert.equal(css.score, 45);
  assert.equal(css.recommendation, "Avoid");
});

test("deducts points for a generated id", () => {
  const result = new LocatorStabilityScoringService().score(
    candidate("selenium:id", 'By.id("submit-123456")'),
    { ...baseElement, elementId: "submit-123456" }
  );

  assert.equal(result.score, 55);
  assert.equal(result.recommendation, "Weak");
  assert.match(result.reason, /id looks generated or random/);
});

test("detects dynamic and generated classes, deep CSS, and nth selectors", () => {
  const selector =
    "main > section > div > div > form > button.css-abc123:nth-of-type(2)";
  const result = new LocatorStabilityScoringService().score(
    candidate("playwright:css", `page.locator('${selector}')`),
    {
      ...baseElement,
      className: "button css-abc123",
      cssSelector: selector
    }
  );

  assert.equal(result.score, 0);
  assert.equal(result.recommendation, "Avoid");
  assert.match(result.reason, /dynamic class detected/);
  assert.match(result.reason, /generated class pattern detected/);
  assert.match(result.reason, /CSS selector is deep/);
  assert.match(result.reason, /nth-child or nth-of-type/);
});

test("deducts points for long text and long XPath locators", () => {
  const service = new LocatorStabilityScoringService();
  const longText = "A".repeat(90);
  const longXPath = `/${Array.from(
    { length: 12 },
    (_, index) => `div[${index + 1}]`
  ).join("/")}`;

  const textResult = service.score(
    candidate("playwright:text", `page.getByText('${longText}')`),
    { ...baseElement, text: longText }
  );
  const xpathResult = service.score(
    candidate("selenium:xpath", `By.xpath("${longXPath}")`),
    { ...baseElement, xpath: longXPath }
  );

  assert.equal(textResult.score, 40);
  assert.equal(textResult.recommendation, "Avoid");
  assert.match(textResult.reason, /text locator is too long/);
  assert.equal(xpathResult.score, 15);
  assert.equal(xpathResult.recommendation, "Avoid");
  assert.match(xpathResult.reason, /XPath is long/);
});

test("supports simple scoring configuration overrides", () => {
  const service = new LocatorStabilityScoringService({
    baseScores: { id: 90 },
    deductions: { generatedId: 5 }
  });
  const result = service.score(
    candidate("playwright:id", "page.locator('#submit-123456')"),
    { ...baseElement, elementId: "submit-123456" }
  );

  assert.equal(result.score, 85);
  assert.equal(result.recommendation, "Recommended");
});
