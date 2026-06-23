import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { ListProjectPagesUseCase } from "@/modules/crawler/use-cases/list-project-pages.use-case";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const pages = await new ListProjectPagesUseCase().execute(id);

    return jsonResponse({ pages });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to list crawled pages",
      500
    );
  }
}
