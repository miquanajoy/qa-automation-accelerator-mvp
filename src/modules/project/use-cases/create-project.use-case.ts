import { ProjectService } from "../services/project.service";
import type { CreateProjectInput, Project } from "../types/project.type";

export class CreateProjectUseCase {
  constructor(private readonly projectService = new ProjectService()) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    return this.projectService.create(input);
  }
}
