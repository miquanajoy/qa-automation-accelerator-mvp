import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  GeneratedLocator,
  LocatorElement,
  LocatorGroup,
  LocatorReport
} from "../types/locator.type";

function mapElement(element: LocatorElement): LocatorElement {
  return element;
}

function mapLocator(locator: {
  id: string;
  elementId: string;
  locatorType: string;
  locatorValue: string;
  score: number;
  recommendation: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): LocatorReport {
  return {
    id: locator.id,
    elementId: locator.elementId,
    locatorType: locator.locatorType,
    locatorValue: locator.locatorValue,
    score: locator.score,
    recommendation: locator.recommendation ?? "",
    reason: locator.reason ?? "",
    createdAt: locator.createdAt,
    updatedAt: locator.updatedAt
  };
}

export class LocatorRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async listElementsByPage(pageId: string): Promise<LocatorElement[]> {
    const elements = await this.db.element.findMany({
      where: { pageId },
      orderBy: [{ createdAt: "asc" }]
    });

    return elements.map(mapElement);
  }

  async replaceLocatorsForPage(
    pageId: string,
    locatorsByElement: Array<{
      elementId: string;
      locators: GeneratedLocator[];
    }>
  ): Promise<LocatorGroup[]> {
    const elements = await this.db.element.findMany({
      where: { pageId },
      select: { id: true }
    });
    const elementIds = elements.map((element) => element.id);

    await this.db.locatorReport.deleteMany({
      where: {
        elementId: {
          in: elementIds
        }
      }
    });

    const locatorRows = locatorsByElement.flatMap((entry) =>
      entry.locators.map((locator) => ({
        elementId: entry.elementId,
        locatorType: locator.locatorType,
        locatorValue: locator.locatorValue,
        score: locator.score,
        recommendation: locator.recommendation,
        reason: locator.reason
      }))
    );

    if (locatorRows.length > 0) {
      await this.db.locatorReport.createMany({
        data: locatorRows
      });
    }

    return this.listLocatorGroupsByPage(pageId);
  }

  async listLocatorGroupsByPage(pageId: string): Promise<LocatorGroup[]> {
    const elements = await this.db.element.findMany({
      where: { pageId },
      orderBy: [{ createdAt: "asc" }],
      include: {
        locators: {
          orderBy: [{ score: "desc" }, { createdAt: "asc" }]
        }
      }
    });

    return elements
      .filter((element) => element.locators.length > 0)
      .map((element) => ({
        element: mapElement(element),
        locators: element.locators.map(mapLocator)
      }));
  }
}
