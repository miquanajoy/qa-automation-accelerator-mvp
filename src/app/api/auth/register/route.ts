import { ZodError } from "zod";
import { ApplicationError } from "@/shared/errors/application-error";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { RegisterUseCase } from "@/modules/auth/use-cases/register.use-case";
import { registerSchema } from "@/modules/auth/validators/auth.schemas";
import {
  authCookieName,
  sessionDurationMs
} from "@/modules/auth/services/session-token.service";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const result = await new RegisterUseCase().execute(payload);
    const response = jsonResponse(
      {
        user: result.user
      },
      201
    );

    response.cookies.set(authCookieName, result.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionDurationMs / 1000,
      path: "/"
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        error.issues[0]?.message ?? "Invalid request payload",
        400
      );
    }

    if (error instanceof ApplicationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Unable to register user",
      500
    );
  }
}
