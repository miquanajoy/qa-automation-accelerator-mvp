export type ParsedElement = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type ParsedElementInput = {
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
