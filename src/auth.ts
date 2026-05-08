import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { getAppEnv } from "@/server/config/app-env";
import { prisma } from "@/server/db/prisma";

const appEnv = getAppEnv();
const developmentAuthSecret = "development-only-auth-secret-change-before-deploy";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret:
    appEnv.auth.secret ?? (process.env.NODE_ENV === "production" ? undefined : developmentAuthSecret),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
});
