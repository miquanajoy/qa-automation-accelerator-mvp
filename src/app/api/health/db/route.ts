import { prisma } from "@/infrastructure/prisma/client";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import type { HealthCheckResponse } from "@/shared/types/health";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return jsonResponse<HealthCheckResponse>({
      status: "ok",
      database: "connected"
    });
  } catch {
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Database connection failed",
      500
    );
  }
}
