import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { GenerateLocatorsUseCase } from "@/modules/locator/use-cases/generate-locators.use-case";
import { ListPageLocatorsUseCase } from "@/modules/locator/use-cases/list-page-locators.use-case";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locatorGroups = await new ListPageLocatorsUseCase().execute(id);

    return jsonResponse({ locatorGroups });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse("INTERNAL_SERVER_ERROR", "Unable to list locators", 500);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const locatorGroups = await new GenerateLocatorsUseCase().execute(id);

    return jsonResponse({ locatorGroups });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to generate locators",
      500
    );
  }
}
