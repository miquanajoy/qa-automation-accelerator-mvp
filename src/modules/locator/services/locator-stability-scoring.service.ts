import type {
  GeneratedLocator,
  LocatorElement,
  LocatorRecommendation
} from "../types/locator.type";

type ScoringRuleConfig = {
  baseScores: Record<string, number>;
  deductions: {
    dynamicClass: number;
    generatedId: number;
    longText: number;
    longXPath: number;
    deepCssSelector: number;
    nthChild: number;
    generatedClass: number;
  };
  thresholds: {
    recommended: number;
    acceptable: number;
    weak: number;
  };
};

const scoringConfig: ScoringRuleConfig = {
  baseScores: {
    "data-testid": 95,
    "data-test": 90,
    "aria-label": 85,
    role: 80,
    id: 75,
    name: 70,
    placeholder: 65,
    text: 55,
    css: 45,
    xpath: 35
  },
  deductions: {
    dynamicClass: 25,
    generatedId: 20,
    longText: 15,
    longXPath: 20,
    deepCssSelector: 20,
    nthChild: 30,
    generatedClass: 25
  },
  thresholds: {
    recommended: 85,
    acceptable: 70,
    weak: 50
  }
};

const generatedClassPatterns = [
  /\bcss-[a-z0-9]+\b/i,
  /\bMui[A-Za-z]+-[A-Za-z]+-\d+\b/,
  /\bsc-[a-z0-9]+\b/i,
  /\bchakra-[a-z-]+-[a-z0-9]+\b/i,
  /\bant-[a-z-]+-\d+\b/i
];

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function baseScoreFor(locatorType: string): number {
  if (locatorType.includes("data-testid")) {
    return scoringConfig.baseScores["data-testid"];
  }

  if (locatorType.includes("data-test")) {
    return scoringConfig.baseScores["data-test"];
  }

  if (locatorType.includes("aria-label")) {
    return scoringConfig.baseScores["aria-label"];
  }

  if (locatorType.includes("role")) {
    return scoringConfig.baseScores.role;
  }

  if (locatorType.endsWith(":id") || locatorType === "id") {
    return scoringConfig.baseScores.id;
  }

  if (locatorType.includes("name")) {
    return scoringConfig.baseScores.name;
  }

  if (locatorType.includes("placeholder")) {
    return scoringConfig.baseScores.placeholder;
  }

  if (locatorType.includes("text")) {
    return scoringConfig.baseScores.text;
  }

  if (locatorType.includes("css")) {
    return scoringConfig.baseScores.css;
  }

  if (locatorType.includes("xpath")) {
    return scoringConfig.baseScores.xpath;
  }

  return scoringConfig.baseScores.css;
}

function recommendationFor(score: number): LocatorRecommendation {
  if (score >= scoringConfig.thresholds.recommended) {
    return "Recommended";
  }

  if (score >= scoringConfig.thresholds.acceptable) {
    return "Acceptable";
  }

  if (score >= scoringConfig.thresholds.weak) {
    return "Weak";
  }

  return "Avoid";
}

function hasGeneratedId(id: string | null): boolean {
  if (!id) {
    return false;
  }

  return /(?:^|[-_])\d{3,}(?:$|[-_])/.test(id) || /[a-f0-9]{8,}/i.test(id);
}

function hasGeneratedClass(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return generatedClassPatterns.some((pattern) => pattern.test(value));
}

function hasDynamicClass(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return value.split(/\s+/).some((className) => {
    const hasHashLikeSuffix = /[-_][a-z0-9]{5,}$/i.test(className);
    const hasManyDigits = /\d{3,}/.test(className);

    return hasHashLikeSuffix || hasManyDigits;
  });
}

function isLongXPath(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return value.length > 140 || value.split("/").filter(Boolean).length > 10;
}

function isDeepCssSelector(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return value.split(">").length > 5 || value.length > 160;
}

function hasNthChild(value: string): boolean {
  return /:nth-(child|of-type)\(/i.test(value);
}

function isLongTextLocator(locator: GeneratedLocator, element: LocatorElement): boolean {
  if (!locator.locatorType.includes("text")) {
    return false;
  }

  return (element.text?.length ?? 0) > 80 || locator.locatorValue.length > 140;
}

export class LocatorStabilityScoringService {
  score(locator: GeneratedLocator, element: LocatorElement): GeneratedLocator {
    const scoreReasons: string[] = [];
    const deductions: string[] = [];
    let score = baseScoreFor(locator.locatorType);

    scoreReasons.push(`Base ${score} for ${locator.locatorType}`);

    if (
      locator.locatorType.includes("css") &&
      hasDynamicClass(element.className)
    ) {
      score -= scoringConfig.deductions.dynamicClass;
      deductions.push("dynamic class detected");
    }

    if (
      locator.locatorType.includes("css") &&
      hasGeneratedClass(`${element.className ?? ""} ${locator.locatorValue}`)
    ) {
      score -= scoringConfig.deductions.generatedClass;
      deductions.push("generated class pattern detected");
    }

    if (locator.locatorType.includes("id") && hasGeneratedId(element.elementId)) {
      score -= scoringConfig.deductions.generatedId;
      deductions.push("id looks generated or random");
    }

    if (isLongTextLocator(locator, element)) {
      score -= scoringConfig.deductions.longText;
      deductions.push("text locator is too long");
    }

    if (locator.locatorType.includes("xpath") && isLongXPath(element.xpath)) {
      score -= scoringConfig.deductions.longXPath;
      deductions.push("XPath is long");
    }

    if (
      locator.locatorType.includes("css") &&
      isDeepCssSelector(element.cssSelector)
    ) {
      score -= scoringConfig.deductions.deepCssSelector;
      deductions.push("CSS selector is deep");
    }

    if (hasNthChild(locator.locatorValue)) {
      score -= scoringConfig.deductions.nthChild;
      deductions.push("locator uses nth-child or nth-of-type");
    }

    const finalScore = clampScore(score);
    const recommendation = recommendationFor(finalScore);
    const deductionText =
      deductions.length > 0
        ? `Deductions: ${deductions.join(", ")}.`
        : "No instability pattern detected.";

    return {
      ...locator,
      score: finalScore,
      recommendation,
      reason: `${scoreReasons.join(". ")}. ${deductionText}`
    };
  }
}
