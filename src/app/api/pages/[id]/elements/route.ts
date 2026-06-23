import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { ListPageElementsUseCase } from "@/modules/parser/use-cases/list-page-elements.use-case";
import { ParsePageElementsUseCase } from "@/modules/parser/use-cases/parse-page-elements.use-case";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const elements = await new ListPageElementsUseCase().execute(id);

    return jsonResponse({ elements });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to list parsed elements",
      500
    );
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const elements = await new ParsePageElementsUseCase().execute(id);

    return jsonResponse({ elements });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to parse page elements",
      500
    );
  }
}
