import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  CrawlDetail,
  CrawlHistoryItem,
  CrawlResult
} from "../types/crawl-result.type";

function mapPage(page: {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  html: string;
  createdAt: Date;
  updatedAt: Date;
}): CrawlResult {
  return {
    id: page.id,
    projectId: page.projectId,
    url: page.url,
    title: page.title,
    html: page.html,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt
  };
}

function mapHistoryItem(page: {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CrawlHistoryItem {
  return {
    id: page.id,
    projectId: page.projectId,
    url: page.url,
    title: page.title,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt
  };
}

export class PageRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async projectExists(projectId: string): Promise<boolean> {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    return Boolean(project);
  }

  async create(input: {
    projectId: string;
    url: string;
    title: string | null;
    html: string;
  }): Promise<CrawlResult> {
    const page = await this.db.page.create({
      data: input
    });

    return mapPage(page);
  }

  async listByProject(projectId: string): Promise<CrawlHistoryItem[]> {
    const pages = await this.db.page.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectId: true,
        url: true,
        title: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return pages.map(mapHistoryItem);
  }

  async findById(pageId: string): Promise<CrawlDetail | null> {
    const page = await this.db.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      return null;
    }

    return {
      ...mapPage(page),
      htmlSize: page.html.length
    };
  }
}
