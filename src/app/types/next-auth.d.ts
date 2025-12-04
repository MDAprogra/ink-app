import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * On étend l'interface Session par défaut pour y inclure l'ID & le Role
   */
  interface Session {
    user: {
      id: string
      role: string // <--- Ajout du rôle ici
    } & DefaultSession["user"]
  }

  /**
   * On étend l'objet User renvoyé par le provider (authorize)
   */
  interface User {
    id: string
    role: string // <--- Ajout du rôle ici
  }
}

declare module "next-auth/jwt" {
  /**
   * On étend le Token JWT pour qu'il puisse stocker le rôle
   */
  interface JWT {
    id: string
    role: string // <--- Ajout du rôle ici
  }
}