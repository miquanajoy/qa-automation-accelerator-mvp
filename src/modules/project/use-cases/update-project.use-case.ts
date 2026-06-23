import { ProjectService } from "../services/project.service";
import type { Project, UpdateProjectInput } from "../types/project.type";

export class UpdateProjectUseCase {
  constructor(private readonly projectService = new ProjectService()) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    return this.projectService.update(input);
  }
}
