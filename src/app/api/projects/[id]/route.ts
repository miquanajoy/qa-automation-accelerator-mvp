import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { DeleteProjectUseCase } from "@/modules/project/use-cases/delete-project.use-case";
import { GetProjectUseCase } from "@/modules/project/use-cases/get-project.use-case";
import { UpdateProjectUseCase } from "@/modules/project/use-cases/update-project.use-case";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await new GetProjectUseCase().execute(id);

    return jsonResponse({ project });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse("INTERNAL_SERVER_ERROR", "Unable to get project", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await new UpdateProjectUseCase().execute({
      ...(await request.json()),
      id
    });

    return jsonResponse({ project });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to update project",
      500
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await new DeleteProjectUseCase().execute(id);

    return jsonResponse({ ok: true });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to delete project",
      500
    );
  }
}
