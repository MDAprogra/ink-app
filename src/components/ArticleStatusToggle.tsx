"use client";

import { toggleArticleStatus } from "@/app/actions/catalogue";
import { useTransition } from "react";

interface ArticleStatusToggleProps {
  articleId: number;
  actif: boolean;
  stockTotal: number;
}

export default function ArticleStatusToggle({ articleId, actif, stockTotal }: ArticleStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  // On peut désactiver SEULEMENT si c'est déjà inactif (pour réactiver) OU si le stock est à 0
  const canToggle = !actif || stockTotal === 0;

  const handleToggle = () => {
    if (!canToggle) return;
    
    startTransition(async () => {
      try {
        await toggleArticleStatus(articleId, actif, stockTotal);
      } catch (error) {
        alert("Erreur lors du changement de statut");
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Badge visuel */}
      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
        actif 
          ? "bg-green-100 text-green-700 border-green-200" 
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}>
        {actif ? "ACTIF" : "ARCHIVÉ"}
      </span>

      {/* Bouton d'action */}
      <button
        onClick={handleToggle}
        disabled={isPending || !canToggle}
        className={`text-sm underline transition-colors ${
          !canToggle 
            ? "text-gray-300 cursor-not-allowed" 
            : "text-muted-fg hover:text-foreground cursor-pointer"
        }`}
        title={!canToggle ? "Videz le stock avant d'archiver" : "Changer le statut"}
      >
        {isPending ? "..." : (actif ? "Archiver" : "Réactiver")}
      </button>
    </div>
  );
}