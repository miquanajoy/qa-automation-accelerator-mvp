import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthRepository } from "../repositories/auth.repository";
import {
  authCookieName,
  hashSessionToken
} from "./session-token.service";
import type { AuthUser } from "../domain/auth.types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authCookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  const authRepository = new AuthRepository();
  const authenticatedSession = await authRepository.findSessionByTokenHash(
    hashSessionToken(sessionToken)
  );

  return authenticatedSession?.user ?? null;
}

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
