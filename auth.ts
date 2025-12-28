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
      }
      
      // Check 2FA status from Redis
      if (token.id) {
        const isVerified = await redis.get(`session_verified:uid-${token.id}`);
        // If verified in Redis, requireF2A is false. Otherwise true.
        token.requires2FA = !isVerified;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      // Pass the 2FA status to the session so middleware can read it
      // @ts-expect-error - requires2FA is likely not defined in the default types yet
      session.requires2FA = token.requires2FA;
      return session;
    },
  },
});
