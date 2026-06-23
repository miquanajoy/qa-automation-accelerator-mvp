import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";
import type { AuthenticatedSession, AuthSession, AuthUser } from "../domain/auth.types";

type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

function mapUser(user: {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt
  };
}

function mapSession(session: {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}): AuthSession {
  return {
    id: session.id,
    userId: session.userId,
    tokenHash: session.tokenHash,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt
  };
}

export class AuthRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    return this.db.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        createdAt: true
      }
    });
  }

  async createUser(input: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<AuthUser> {
    const user = await this.db.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        passwordHash: input.passwordHash
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    return mapUser(user);
  }

  async createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<AuthSession> {
    const session = await this.db.authSession.create({
      data: input
    });

    return mapSession(session);
  }

  async findSessionByTokenHash(
    tokenHash: string,
    now = new Date()
  ): Promise<AuthenticatedSession | null> {
    const session = await this.db.authSession.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: now
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return null;
    }

    return {
      session: mapSession(session),
      user: mapUser(session.user)
    };
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await this.db.authSession.deleteMany({
      where: { tokenHash }
    });
  }
}
