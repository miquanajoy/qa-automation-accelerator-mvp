import { Prisma } from "@prisma/client";
import { ApplicationError } from "@/shared/errors/application-error";
import type { AuthResult, RegisterInput } from "../domain/auth.types";
import { AuthRepository } from "../repositories/auth.repository";
import { hashPassword } from "../services/password.service";
import {
  createSessionExpiry,
  createSessionToken,
  hashSessionToken
} from "../services/session-token.service";

export class RegisterUseCase {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await this.authRepository.createUser({
        email: input.email,
        username: input.username,
        passwordHash
      });
      const sessionToken = createSessionToken();
      const expiresAt = createSessionExpiry();

      await this.authRepository.createSession({
        userId: user.id,
        tokenHash: hashSessionToken(sessionToken),
        expiresAt
      });

      return {
        user,
        sessionToken,
        expiresAt
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApplicationError(
          "VALIDATION_ERROR",
          "Email or username already exists",
          409
        );
      }

      throw error;
    }
  }
}
