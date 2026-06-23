type ExportElement = {
  tagName: string;
  elementId: string | null;
  text: string | null;
  role: string | null;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  href: string | null;
  testId: string | null;
  test: string | null;
  xpath: string | null;
  cssSelector: string | null;
};

type ExportLocator = {
  locatorType: string;
  locatorValue: string;
  score: number;
  recommendation: string;
  reason: string;
};

export type ExportLocatorGroup = {
  element: ExportElement;
  locators: ExportLocator[];
};

function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

function elementName(element: ExportElement): string {
  return (
    element.name ??
    element.text ??
    element.ariaLabel ??
    element.elementId ??
    element.tagName
  );
}

function locatorRows(groups: ExportLocatorGroup[], pageUrl: string) {
  return groups.flatMap((group) =>
    group.locators.map((locator) => ({
      pageUrl,
      elementTag: group.element.tagName,
      elementName: elementName(group.element),
      elementText: group.element.text,
      elementId: group.element.elementId,
      role: group.element.role,
      ariaLabel: group.element.ariaLabel,
      testId: group.element.testId,
      dataTest: group.element.test,
      href: group.element.href,
      locatorType: locator.locatorType,
      locatorValue: locator.locatorValue,
      score: locator.score,
      recommendation: locator.recommendation,
      reason: locator.reason,
      cssSelector: group.element.cssSelector,
      xpath: group.element.xpath
    }))
  );
}

export function buildLocatorCsv(
  groups: ExportLocatorGroup[],
  pageUrl: string
): string {
  const headers = [
    "pageUrl",
    "elementTag",
    "elementName",
    "elementText",
    "elementId",
    "role",
    "ariaLabel",
    "testId",
    "dataTest",
    "href",
    "locatorType",
    "locatorValue",
    "score",
    "recommendation",
    "reason",
    "cssSelector",
    "xpath"
  ];
  const rows = locatorRows(groups, pageUrl).map((row) =>
    headers.map((header) => csvCell(row[header as keyof typeof row])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function buildLocatorJson(
  groups: ExportLocatorGroup[],
  pageUrl: string
): string {
  return JSON.stringify(
    {
      pageUrl,
      exportedAt: new Date().toISOString(),
      groups
    },
    null,
    2
  );
}

export function buildRecommendedLocatorText(groups: ExportLocatorGroup[]): string {
  return groups
    .map((group) => {
      const locator =
        group.locators.find(
          (candidate) => candidate.recommendation === "Recommended"
        ) ?? group.locators[0];

      if (!locator) {
        return null;
      }

      return `${elementName(group.element)} | ${locator.locatorType} | ${locator.locatorValue}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function downloadTextFile(
  filename: string,
  contents: string,
  mimeType: string
) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function safeExportFilename(name: string, extension: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${cleaned || "locators"}.${extension}`;
}
