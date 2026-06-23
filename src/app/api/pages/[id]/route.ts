import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { GetPageUseCase } from "@/modules/crawler/use-cases/get-page.use-case";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const page = await new GetPageUseCase().execute(id);

    return jsonResponse({ page });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse("INTERNAL_SERVER_ERROR", "Unable to get page", 500);
  }
}
