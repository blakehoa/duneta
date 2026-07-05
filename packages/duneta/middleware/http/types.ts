/** Minimal user shape from Better Auth session resolution. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
};

export type AuthSession = {
  session: AuthSessionRecord;
  user: AuthUser;
};
