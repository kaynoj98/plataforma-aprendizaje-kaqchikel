import type {
  AccountStatus,
  ProfileType,
  Role,
} from "../../generated/prisma/client.js";

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileType: ProfileType;
  status: AccountStatus;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  sessionId: string;
  expiresAt: Date;
  user: PublicUser;
}
