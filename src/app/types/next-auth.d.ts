import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * On étend l'interface Session par défaut pour y inclure l'ID
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}