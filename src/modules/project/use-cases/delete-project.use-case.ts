import { ProjectService } from "../services/project.service";

export class DeleteProjectUseCase {
  constructor(private readonly projectService = new ProjectService()) {}

  async execute(id: string): Promise<void> {
    await this.projectService.delete(id);
  }
}
