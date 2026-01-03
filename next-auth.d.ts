import type NextAuth from "next-auth";

declare module "next-auth" {
	interface User {
		role?: "ADMIN" | "USER";
		requires2FA?: boolean | undefined;
	}

	interface Session {
		user: User;
		requires2FA?: boolean;
	}
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER";
    requires2FA?: boolean;
    isVerified?: boolean;
  }
}