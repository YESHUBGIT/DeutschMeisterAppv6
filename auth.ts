import type { NextAuthOptions } from "next-auth"
import Cognito from "next-auth/providers/cognito"

function getAdapter(): any {
  if (process.env.AUTH_DISABLED === "true") return undefined
  try {
    const dynamicRequire = eval("require") as NodeRequire
    const { PrismaAdapter } = dynamicRequire("@auth/prisma-adapter")
    const { prisma } = dynamicRequire("./lib/prisma")
    return PrismaAdapter(prisma)
  } catch {
    return undefined
  }
}

export const authOptions: NextAuthOptions = {
  adapter: getAdapter(),
  session: { strategy: "jwt" },
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER ?? "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
}
