import { ApplicationError } from "@/shared/errors/application-error";
import type { AuthResult, LoginInput } from "../domain/auth.types";
import { AuthRepository } from "../repositories/auth.repository";
import { verifyPassword } from "../services/password.service";
import {
  createSessionExpiry,
  createSessionToken,
  hashSessionToken
} from "../services/session-token.service";

export class LoginUseCase {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const userRecord = await this.authRepository.findUserByEmailOrUsername(
      input.identifier
    );

    if (!userRecord) {
      throw new ApplicationError("VALIDATION_ERROR", "Invalid credentials", 401);
    }

    const isPasswordValid = await verifyPassword(
      input.password,
      userRecord.passwordHash
    );

    if (!isPasswordValid) {
      throw new ApplicationError("VALIDATION_ERROR", "Invalid credentials", 401);
    }

    const sessionToken = createSessionToken();
    const expiresAt = createSessionExpiry();

    await this.authRepository.createSession({
      userId: userRecord.id,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt
    });

    return {
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        createdAt: userRecord.createdAt
      },
      sessionToken,
      expiresAt
    };
  }
}
