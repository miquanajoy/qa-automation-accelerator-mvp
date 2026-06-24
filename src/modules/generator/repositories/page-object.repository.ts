import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  GeneratedPageObject,
  PageObjectSourcePage
} from "../types/page-object.type";

const PAGE_OBJECT_TYPE = "playwright_page_object";

function classNameFromContent(content: string): string {
  return content.match(/export class ([A-Za-z_$][\w$]*)/)?.[1] ?? "PageObject";
}

function mapGeneratedFile(file: {
  id: string;
  pageId: string;
  type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): GeneratedPageObject {
  const className = classNameFromContent(file.content);

  return {
    ...file,
    className,
    filename: `${className}.ts`
  };
}

export class PageObjectRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findSourcePage(pageId: string): Promise<PageObjectSourcePage | null> {
    return this.db.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        url: true,
        title: true,
        elements: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            tagName: true,
            elementId: true,
            text: true,
            role: true,
            ariaLabel: true,
            name: true,
            placeholder: true,
            type: true,
            href: true,
            testId: true,
            locators: {
              where: {
                locatorType: {
                  startsWith: "playwright:"
                }
              },
              orderBy: [{ score: "desc" }, { createdAt: "asc" }],
              select: {
                locatorType: true,
                locatorValue: true,
                score: true,
                recommendation: true
              }
            }
          }
        }
      }
    });
  }

  async create(pageId: string, content: string): Promise<GeneratedPageObject> {
    const file = await this.db.generatedFile.create({
      data: {
        pageId,
        type: PAGE_OBJECT_TYPE,
        content
      }
    });

    return mapGeneratedFile(file);
  }

  async listByPage(pageId: string): Promise<GeneratedPageObject[]> {
    const files = await this.db.generatedFile.findMany({
      where: {
        pageId,
        type: PAGE_OBJECT_TYPE
      },
      orderBy: { createdAt: "desc" }
    });

    return files.map(mapGeneratedFile);
  }
}
