import { GeneratePageObjectUseCase } from "@/modules/generator/use-cases/generate-page-object.use-case";
import { ListGeneratedPageObjectsUseCase } from "@/modules/generator/use-cases/list-generated-page-objects.use-case";
import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type GeneratePageObjectBody = {
  selectedElementIds?: string[];
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const generatedFiles = await new ListGeneratedPageObjectsUseCase().execute(id);

    return jsonResponse({ generatedFiles });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to list generated page objects",
      500
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as GeneratePageObjectBody;
    const generatedFile = await new GeneratePageObjectUseCase().execute({
      pageId: id,
      selectedElementIds: body.selectedElementIds
    });

    return jsonResponse({ generatedFile }, 201);
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to generate Page Object",
      500
    );
  }
}
