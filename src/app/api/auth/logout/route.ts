import { cookies } from "next/headers";
import { errorResponse, jsonResponse } from "@/shared/http/api-response";
import { LogoutUseCase } from "@/modules/auth/use-cases/logout.use-case";
import { authCookieName } from "@/modules/auth/services/session-token.service";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(authCookieName)?.value;

    if (sessionToken) {
      await new LogoutUseCase().execute(sessionToken);
    }

    const response = jsonResponse({
      ok: true
    });

    response.cookies.set(authCookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch {
    return errorResponse("INTERNAL_SERVER_ERROR", "Unable to logout", 500);
  }
}
