import crypto from "node:crypto";

export const authCookieName = "qa_auth_session";
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSessionExpiry(now = new Date()): Date {
  return new Date(now.getTime() + sessionDurationMs);
}
