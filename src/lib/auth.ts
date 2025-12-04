import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt", // On utilise des JSON Web Tokens pour la session
  },
  pages: {
    signIn: "/login", // Notre page de login personnalisée
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. On cherche l'utilisateur dans la BDD
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // 2. On compare le mot de passe fourni avec le hash en BDD
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastConnect: new Date() },
          });
        } catch (error) {
          console.error("Erreur lors de la mise à jour de lastConnect", error);
          // On ne bloque pas la connexion si cette mise à jour échoue
        }

        // 3. Si tout est bon, on retourne l'utilisateur
        return {
          id: user.id + "",
          email: user.email,
          name: user.name,
          role: user.role
        };
      },
    }),
  ],
//   callbacks: {
//     // Permet d'ajouter l'ID utilisateur à la session côté client
//     async session({ session, token }) {
//       if (token && session.user) {
//         // @ts-ignore
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET, // À ajouter dans ton .env
// };
callbacks: {
    // 1. On met le rôle dans le Token (JWT)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // 2. On met le rôle dans la Session (pour l'utiliser dans les composants)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};