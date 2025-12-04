"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="ml-2 text-xs font-medium text-muted-fg hover:text-red-600 transition-colors border border-border hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-2 py-1"
      title="Se déconnecter"
    >
      Déconnexion
    </button>
  );
}