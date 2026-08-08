import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "@auth/core/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/validation/auth";
import {
  identifierFromRequest,
  isRateLimited,
  recordAttempt,
} from "@/lib/domain/rateLimit";

// Deliberately generic - never reveals whether the email exists or the
// password was wrong, to avoid account enumeration.
class InvalidLoginError extends CredentialsSignin {
  code = "invalid-credentials";
}

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials, request) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) throw new InvalidLoginError();
      const { email, password } = parsed.data;

      const identifiers = identifierFromRequest(request, email);
      for (const identifier of identifiers) {
        if (await isRateLimited(identifier)) throw new InvalidLoginError();
      }

      const user = await prisma.user.findUnique({ where: { email } });
      const isValid = user?.passwordHash
        ? await bcrypt.compare(password, user.passwordHash)
        : false;

      if (!user || !isValid) {
        await Promise.all(identifiers.map(recordAttempt));
        throw new InvalidLoginError();
      }

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

// Google is optional - only registered when AUTH_GOOGLE_ID/SECRET are set,
// so the app works with email+password alone if you'd rather not touch
// anything external.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Required whenever a Credentials provider is registered - the adapter's
  // DB-session flow is incompatible with Credentials by design.
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
