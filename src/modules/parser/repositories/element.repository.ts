import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  ParsedElement,
  ParsedElementInput
} from "../types/parsed-element.type";

function mapElement(element: {
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
}): ParsedElement {
  return element;
}

export class ElementRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findPageHtml(pageId: string): Promise<string | null> {
    const page = await this.db.page.findUnique({
      where: { id: pageId },
      select: { html: true }
    });

    return page?.html ?? null;
  }

  async replaceForPage(
    pageId: string,
    elements: ParsedElementInput[]
  ): Promise<ParsedElement[]> {
    await this.db.element.deleteMany({
      where: { pageId }
    });

    if (elements.length === 0) {
      return [];
    }

    await this.db.element.createMany({
      data: elements.map((element) => ({
        ...element,
        pageId
      }))
    });

    return this.listByPage(pageId);
  }

  async listByPage(pageId: string): Promise<ParsedElement[]> {
    const elements = await this.db.element.findMany({
      where: { pageId },
      orderBy: [{ tagName: "asc" }, { createdAt: "asc" }]
    });

    return elements.map(mapElement);
  }
}
