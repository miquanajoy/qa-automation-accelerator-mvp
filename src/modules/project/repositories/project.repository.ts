import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  UpdateProjectInput
} from "../types/project.type";

function mapProject(project: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export class ProjectRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(input: CreateProjectInput): Promise<Project> {
    const project = await this.db.project.create({
      data: {
        name: input.name,
        description: input.description ?? null
      }
    });

    return mapProject(project);
  }

  async list(): Promise<Project[]> {
    const projects = await this.db.project.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return projects.map(mapProject);
  }

  async findById(id: string): Promise<ProjectDetail | null> {
    const project = await this.db.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pages: true
          }
        }
      }
    });

    if (!project) {
      return null;
    }

    return {
      ...mapProject(project),
      pageCount: project._count.pages
    };
  }

  async update(input: UpdateProjectInput): Promise<Project | null> {
    const existingProject = await this.db.project.findUnique({
      where: { id: input.id },
      select: { id: true }
    });

    if (!existingProject) {
      return null;
    }

    const project = await this.db.project.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name,
        description: input.description ?? null
      }
    });

    return mapProject(project);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.project.deleteMany({
      where: { id }
    });

    return deleted.count > 0;
  }
}
