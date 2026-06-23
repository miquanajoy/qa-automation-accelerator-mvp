import { ProjectService } from "../services/project.service";
import type { Project } from "../types/project.type";

export class ListProjectsUseCase {
  constructor(private readonly projectService = new ProjectService()) {}

  async execute(): Promise<Project[]> {
    return this.projectService.list();
  }
}
