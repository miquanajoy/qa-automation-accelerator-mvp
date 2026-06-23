import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { CrawlUrlUseCase } from "@/modules/crawler/use-cases/crawl-url.use-case";

export async function POST(request: Request) {
  try {
    const page = await new CrawlUrlUseCase().execute(await request.json());

    return jsonResponse(
      {
        page: {
          id: page.id,
          projectId: page.projectId,
          url: page.url,
          title: page.title,
          createdAt: page.createdAt
        }
      },
      201
    );
  } catch (error) {
    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse("INTERNAL_SERVER_ERROR", "Unable to crawl URL", 500);
  }
}
