import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "@auth/core/providers/credentials";
import { bcryptPasswordCompare } from "@/lib/brypt";
import { routes } from "@/config/routes";
import { SignInSchema } from "@/app/schemas/auth.schema";
import { redis } from "@/lib/redis-store";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: routes.signIn,
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.hashedPassword) return null;

          const passwordsMatch = await bcryptPasswordCompare(password, user.hashedPassword);
          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Check 2FA status
      // STRATEGY: Hybrid "State Promotion"
      // 1. If the token is ALREADY verified (from a previous Redis check), trust it. (Stateless)
      // 2. If not, check Redis. (Stateful)
      // 3. If Redis says yes, WRITE it to the token so we don't need Redis next time.
      if (token.id) {
        if (token.isVerified) {
             token.requires2FA = false;
        } else {
             try {
                const isVerifiedInRedis = await redis.get(`session_verified:uid-${token.id}`);
                if (isVerifiedInRedis) {
                    token.isVerified = true; // Promote to JWT
                    token.requires2FA = false;
                } else {
                    token.requires2FA = true;
                }
             } catch (error) {
                console.error("Redis 2FA check failed:", error);
                // Fail-secure: If Redis is down and we aren't verified yet, lock it.
                token.requires2FA = true; 
             }
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      // Pass the 2FA status to the session so middleware can read it
      session.requires2FA = token.requires2FA;
      return session;
    },
  },
});
