import { AuthRepository } from "../repositories/auth.repository";
import { hashSessionToken } from "../services/session-token.service";

export class LogoutUseCase {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async execute(sessionToken: string): Promise<void> {
    await this.authRepository.deleteSessionByTokenHash(
      hashSessionToken(sessionToken)
    );
  }
}
