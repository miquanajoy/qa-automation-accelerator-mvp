import { ApplicationError } from "@/shared/errors/application-error";
import { PageObjectRepository } from "../repositories/page-object.repository";
import type {
  GeneratePageObjectInput,
  GeneratedPageObject,
  PageObjectSourceElement,
  PageObjectSourcePage
} from "../types/page-object.type";

type SelectedElement = {
  element: PageObjectSourceElement;
  propertyName: string;
  locatorValue: string;
};

function words(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function pascalCase(value: string): string {
  const result = words(value)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join("")
    .slice(0, 70);

  if (!result) {
    return "GeneratedPage";
  }

  return /^\d/.test(result) ? `Page${result}` : result;
}

function camelCase(value: string): string {
  const result = pascalCase(value);

  return `${result[0]?.toLowerCase() ?? "e"}${result.slice(1)}`;
}

function classNameFor(page: PageObjectSourcePage): string {
  if (page.title?.trim()) {
    const title = pascalCase(page.title);

    return title.endsWith("Page") ? title : `${title}Page`;
  }

  try {
    const url = new URL(page.url);
    const pathName = url.pathname.split("/").filter(Boolean).at(-1);
    const source = pathName ?? url.hostname.replace(/^www\./, "");
    const name = pascalCase(source);

    return name.endsWith("Page") ? name : `${name}Page`;
  } catch {
    const name = pascalCase(page.url);

    return name.endsWith("Page") ? name : `${name}Page`;
  }
}

function elementBaseName(element: PageObjectSourceElement): string {
  return (
    element.elementId ??
    element.testId ??
    element.ariaLabel ??
    element.name ??
    element.placeholder ??
    element.text ??
    element.tagName
  ).slice(0, 80);
}

function propertySuffix(element: PageObjectSourceElement): string {
  if (["input", "textarea", "select"].includes(element.tagName)) {
    return "Input";
  }

  if (element.tagName === "button" || element.role === "button") {
    return "Button";
  }

  if (element.tagName === "a" || element.role === "link" || element.href) {
    return "Link";
  }

  return "Element";
}

function propertyNameFor(element: PageObjectSourceElement): string {
  const baseName = camelCase(elementBaseName(element));
  const suffix = propertySuffix(element);

  return baseName.toLowerCase().endsWith(suffix.toLowerCase())
    ? baseName
    : `${baseName}${suffix}`;
}

function uniquePropertyNames(
  elements: PageObjectSourceElement[]
): SelectedElement[] {
  const occurrences = new Map<string, number>();

  return elements.flatMap((element) => {
    const locator = [...element.locators].sort(
      (first, second) => second.score - first.score
    )[0];

    if (!locator) {
      return [];
    }

    const baseName = propertyNameFor(element);
    const occurrence = (occurrences.get(baseName) ?? 0) + 1;
    occurrences.set(baseName, occurrence);

    return [
      {
        element,
        propertyName: occurrence === 1 ? baseName : `${baseName}${occurrence}`,
        locatorValue: locator.locatorValue
      }
    ];
  });
}

function actionMethod(selected: SelectedElement): string | null {
  const { element, propertyName } = selected;
  const methodName = `${propertyName[0]?.toUpperCase() ?? ""}${propertyName.slice(1)}`;

  if (["input", "textarea"].includes(element.tagName)) {
    return `  async fill${methodName}(value: string): Promise<void> {\n    await this.${propertyName}.fill(value);\n  }`;
  }

  if (
    element.tagName === "button" ||
    element.role === "button" ||
    element.tagName === "a" ||
    element.role === "link" ||
    element.href
  ) {
    return `  async click${methodName}(): Promise<void> {\n    await this.${propertyName}.click();\n  }`;
  }

  return null;
}

export class PageObjectGeneratorService {
  constructor(private readonly repository = new PageObjectRepository()) {}

  generateCode(
    page: PageObjectSourcePage,
    selectedElementIds?: string[]
  ): { className: string; filename: string; content: string } {
    const selectedIds =
      selectedElementIds && selectedElementIds.length > 0
        ? new Set(selectedElementIds)
        : null;
    const selectedElements = uniquePropertyNames(
      page.elements.filter(
        (element) =>
          element.locators.length > 0 &&
          (!selectedIds || selectedIds.has(element.id))
      )
    );

    if (selectedElements.length === 0) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        "Select at least one element with a Playwright locator",
        400
      );
    }

    const className = classNameFor(page);
    const properties = selectedElements
      .map(({ propertyName }) => `  readonly ${propertyName}: Locator;`)
      .join("\n");
    const assignments = selectedElements
      .map(
        ({ propertyName, locatorValue }) =>
          `    this.${propertyName} = ${locatorValue};`
      )
      .join("\n");
    const actions = selectedElements
      .map(actionMethod)
      .filter(Boolean)
      .join("\n\n");
    const actionBlock = actions ? `\n\n${actions}` : "";
    const content = `import { type Locator, type Page } from "@playwright/test";

export class ${className} {
  readonly page: Page;
${properties}

  constructor(page: Page) {
    this.page = page;
${assignments}
  }${actionBlock}
}
`;

    return {
      className,
      filename: `${className}.ts`,
      content
    };
  }

  async generateAndSave(
    input: GeneratePageObjectInput
  ): Promise<GeneratedPageObject> {
    if (!input.pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    const page = await this.repository.findSourcePage(input.pageId);

    if (!page) {
      throw new ApplicationError("NOT_FOUND", "Page not found", 404);
    }

    const generated = this.generateCode(page, input.selectedElementIds);

    return this.repository.create(page.id, generated.content);
  }

  async listGenerated(pageId: string): Promise<GeneratedPageObject[]> {
    if (!pageId.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Page id is required", 400);
    }

    return this.repository.listByPage(pageId);
  }
}
