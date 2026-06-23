import { ProjectService } from "../services/project.service";
import type { ProjectDetail } from "../types/project.type";

export class GetProjectUseCase {
  constructor(private readonly projectService = new ProjectService()) {}

  async execute(id: string): Promise<ProjectDetail> {
    return this.projectService.getById(id);
  }
}
