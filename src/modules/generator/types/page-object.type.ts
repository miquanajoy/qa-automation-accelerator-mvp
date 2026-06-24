export type PageObjectSourceElement = {
  id: string;
  tagName: string;
  elementId: string | null;
  text: string | null;
  role: string | null;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  type: string | null;
  href: string | null;
  testId: string | null;
  locators: Array<{
    locatorType: string;
    locatorValue: string;
    score: number;
    recommendation: string | null;
  }>;
};

export type PageObjectSourcePage = {
  id: string;
  url: string;
  title: string | null;
  elements: PageObjectSourceElement[];
};

export type GeneratePageObjectInput = {
  pageId: string;
  selectedElementIds?: string[];
};

export type GeneratedPageObject = {
  id: string;
  pageId: string;
  type: string;
  className: string;
  filename: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PageObjectArtifactSummary = GeneratedPageObject;
