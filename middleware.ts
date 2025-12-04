import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Définition locale des rôles pour le middleware (pour éviter des imports complexes sur Edge Runtime)
const ALLOWED_ROLES = {
  ADMINS: ["owner", "manager"], // Peuvent voir l'historique, créer, éditer
  ALL: ["owner", "manager", "user"], // Peuvent scanner
};

export default withAuth(
  // Fonction middleware personnalisée pour vérifier les rôles
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const userRole = token?.role as string;

    // 1. Protection de l'Historique (/mouvements)
    // Seuls les Admins (Owner + Manager) peuvent voir l'historique complet
    if (path.startsWith("/mouvements")) {
      if (!ALLOWED_ROLES.ADMINS.includes(userRole)) {
        // Si pas le bon rôle -> Redirection vers le catalogue
        return NextResponse.redirect(new URL("/catalogue", req.url));
      }
    }

    // 2. Protection de la Création (/catalogue/nouveau)
    // Seuls les Admins peuvent créer
    if (path === "/catalogue/nouveau") {
      if (!ALLOWED_ROLES.ADMINS.includes(userRole)) {
        return NextResponse.redirect(new URL("/catalogue", req.url));
      }
    }

    // 3. Protection de l'Édition (/catalogue/[id]/edit)
    // Seuls les Admins peuvent éditer
    if (path.match(/\/catalogue\/\d+\/edit/)) {
      if (!ALLOWED_ROLES.ADMINS.includes(userRole)) {
        return NextResponse.redirect(new URL("/catalogue", req.url));
      }
    }
    
    // Note : Le Scan (/scan) est accessible à tous les utilisateurs connectés
    // car il n'y a pas de bloc `if` restrictif ici, juste le `authorized` callback en bas.
  },
  {
    callbacks: {
      // Vérifie d'abord si l'utilisateur est connecté (token existe)
      // Si return false -> Redirection automatique vers /login
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protège toutes les pages sous /scan (Connexion requise)
    "/scan/:path*", 
    
    // Protège toutes les pages sous /mouvements (Connexion + Rôle requis)
    "/mouvements/:path*", 
    
    // Protège /catalogue/nouveau, /catalogue/1, /catalogue/1/edit...
    // MAIS LAISSE /catalogue (la liste) PUBLIC grâce au "+"
    "/catalogue/:path+" 
  ],
};