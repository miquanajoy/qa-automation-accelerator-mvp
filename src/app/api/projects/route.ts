import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { CreateProjectUseCase } from "@/modules/project/use-cases/create-project.use-case";
import { ListProjectsUseCase } from "@/modules/project/use-cases/list-projects.use-case";

export async function GET() {
  try {
    const projects = await new ListProjectsUseCase().execute();

    return jsonResponse({ projects });
  } catch {
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to list projects",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const project = await new CreateProjectUseCase().execute(await request.json());

    return jsonResponse({ project }, 201);
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to create project",
      500
    );
  }
}
