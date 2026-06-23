import { ZodError } from "zod";
import { ApplicationError } from "@/shared/errors/application-error";
import { createProjectDto } from "../dto/create-project.dto";
import { updateProjectDto } from "../dto/update-project.dto";
import { ProjectRepository } from "../repositories/project.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  UpdateProjectInput
} from "../types/project.type";

function validationMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid project payload";
}

export class ProjectService {
  constructor(private readonly projectRepository = new ProjectRepository()) {}

  async create(input: CreateProjectInput): Promise<Project> {
    const parsed = createProjectDto.safeParse(input);

    if (!parsed.success) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        validationMessage(parsed.error),
        400
      );
    }

    return this.projectRepository.create(parsed.data);
  }

  async list(): Promise<Project[]> {
    return this.projectRepository.list();
  }

  async getById(id: string): Promise<ProjectDetail> {
    if (!id.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Project id is required", 400);
    }

    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new ApplicationError("NOT_FOUND", "Project not found", 404);
    }

    return project;
  }

  async update(input: UpdateProjectInput): Promise<Project> {
    const parsed = updateProjectDto.safeParse(input);

    if (!parsed.success) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        validationMessage(parsed.error),
        400
      );
    }

    const project = await this.projectRepository.update(parsed.data);

    if (!project) {
      throw new ApplicationError("NOT_FOUND", "Project not found", 404);
    }

    return project;
  }

  async delete(id: string): Promise<void> {
    if (!id.trim()) {
      throw new ApplicationError("VALIDATION_ERROR", "Project id is required", 400);
    }

    const wasDeleted = await this.projectRepository.delete(id);

    if (!wasDeleted) {
      throw new ApplicationError("NOT_FOUND", "Project not found", 404);
    }
  }
}
