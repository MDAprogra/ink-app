"use client";

import { useState } from "react";
import { permissions } from "@/lib/permissions"; // Changement d'import : 'can' -> 'permissions'

type StockOption = {
  id: number;
  quantite: number;
  date: Date;
};

interface MouvementFormProps {
  stocks: StockOption[];
  articleId: number;
  onSubmit: (formData: FormData) => void;
  userRole?: string | null; // Pour les permissions
  unite?: string | null; // Pour l'affichage (ex: "kg")
}

export default function MouvementForm({
  stocks,
  articleId,
  onSubmit,
  userRole,
  unite,
}: MouvementFormProps) {
  // 1. Calcul des permissions via l'objet permissions (et non plus la fonction 'can')
  const canInput = permissions.canInputMovement(userRole);
  const canOutput = permissions.canOutputMovement(userRole);

  // 2. État initial intelligent
  // Si l'utilisateur ne peut pas faire d'entrée, on le met par défaut sur "SORTIE"
  const [type, setType] = useState<"ENTREE" | "SORTIE">(
    canInput ? "ENTREE" : "SORTIE"
  );
  const [selectedStockId, setSelectedStockId] = useState<string>("nouveau");
  const [quantite, setQuantite] = useState<string>("1");

  const stockSelectionne = stocks.find(
    (s) => s.id.toString() === selectedStockId
  );
  const maxQuantite =
    type === "SORTIE" && stockSelectionne ? stockSelectionne.quantite : 999999;

  // Affichage de l'unité (ex: "(L)")
  const unitLabel = unite ? `(${unite})` : "";

  // Sécurité : Si aucun droit, on bloque l'affichage
  if (!canInput && !canOutput) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        🚫 Vous n'avez pas les droits pour effectuer des mouvements de stock.
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <input type="hidden" name="articleId" value={articleId} />

      {/* 1. Choix du Type */}
      <div className="grid grid-cols-2 gap-4">
        {canInput ? (
          <button
            type="button"
            onClick={() => {
              setType("ENTREE");
              setSelectedStockId("nouveau");
            }}
            className={`py-3 rounded-lg border font-semibold transition flex items-center justify-center gap-2 ${
              type === "ENTREE"
                ? "bg-green-100 border-green-500 text-green-800"
                : "bg-white border-border text-muted-fg hover:bg-muted"
            }`}
          >
            📥 Entrée (Ajout)
          </button>
        ) : (
          <div className="py-3 rounded-lg border border-dashed border-gray-200 text-gray-300 flex items-center justify-center cursor-not-allowed select-none bg-gray-50">
            Entrée interdite
          </div>
        )}

        {canOutput ? (
          <button
            type="button"
            onClick={() => {
              setType("SORTIE");
              setSelectedStockId(stocks[0]?.id.toString() || "");
            }}
            // Désactivé si pas de stock dispo OU pas sélectionné
            disabled={stocks.length === 0}
            className={`py-3 rounded-lg border font-semibold transition flex items-center justify-center gap-2 ${
              type === "SORTIE"
                ? "bg-orange-100 border-orange-500 text-orange-800"
                : "bg-white border-border text-muted-fg hover:bg-muted"
            } ${stocks.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            📤 Sortie (Retrait)
          </button>
        ) : (
          <div className="py-3 rounded-lg border border-dashed border-gray-200 text-gray-300 flex items-center justify-center cursor-not-allowed select-none bg-gray-50">
            Sortie interdite
          </div>
        )}

        {/* Champ caché pour envoyer le type choisi au serveur */}
        <input type="hidden" name="type" value={type} />
      </div>

      {/* 2. Choix du Lot (Stock) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Sur quel lot appliquer le mouvement ?
        </label>
        <select
          name="stockId"
          value={selectedStockId}
          onChange={(e) => setSelectedStockId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          required
        >
          {type === "ENTREE" && (
            <option value="nouveau">
              ✨ Créer un nouveau lot (Nouvelle Date)
            </option>
          )}
          {stocks.map((s) => (
            <option key={s.id} value={s.id}>
              Lot #{s.id} — Dispo: {s.quantite} {unite} (Reçu le{" "}
              {new Date(s.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Quantité */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Quantité {unitLabel}
        </label>
        <div className="relative">
          <input
            type="number"
            name="quantite"
            min="0.001"
            step="0.001"
            max={maxQuantite}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary pr-12"
            required
          />
          {unite && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg text-sm pointer-events-none font-medium">
              {unite}
            </span>
          )}
        </div>

        {type === "SORTIE" && stockSelectionne && (
          <p className="text-xs text-muted-fg mt-1">
            Maximum sortable sur ce lot :{" "}
            <span className="font-mono font-bold">{maxQuantite}</span> {unite}
          </p>
        )}
      </div>

      {/* Bouton de validation */}
      <button
        type="submit"
        className={`w-full py-3 rounded-md text-white font-bold shadow-md transition transform active:scale-[0.98] ${
          type === "ENTREE"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        Valider {type === "ENTREE" ? "l'entrée" : "la sortie"}
      </button>
    </form>
  );
}
