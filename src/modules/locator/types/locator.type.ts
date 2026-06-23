export type LocatorElement = {
  id: string;
  pageId: string;
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

export type GeneratedLocator = {
  locatorType: string;
  locatorValue: string;
  score: number;
  recommendation: string;
  reason: string;
};

export type LocatorRecommendation = "Recommended" | "Acceptable" | "Weak" | "Avoid";

export type LocatorReport = GeneratedLocator & {
  id: string;
  elementId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LocatorGroup = {
  element: LocatorElement;
  locators: LocatorReport[];
};

export type LocatorStrategy = {
  name: string;
  priority: number;
  generate(element: LocatorElement): GeneratedLocator[];
};
