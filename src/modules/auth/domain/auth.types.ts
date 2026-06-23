export type AuthUser = {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
};

export type AuthSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
};

export type AuthenticatedSession = {
  user: AuthUser;
  session: AuthSession;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type AuthResult = {
  user: AuthUser;
  sessionToken: string;
  expiresAt: Date;
};
