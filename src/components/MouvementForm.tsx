"use client";

import { useState } from "react";

type StockOption = {
  id: number;
  quantite: number;
  date: Date;
};

interface MouvementFormProps {
  stocks: StockOption[];
  articleId: number;
  // On passe la Server Action comme une prop (fonction)
  onSubmit: (formData: FormData) => void;
}

export default function MouvementForm({ stocks, articleId, onSubmit }: MouvementFormProps) {
  const [type, setType] = useState<"ENTREE" | "SORTIE">("ENTREE");
  const [selectedStockId, setSelectedStockId] = useState<string>("nouveau");
  
  // CHANGEMENT 1 : On utilise un string pour gérer la saisie (ex: "1.5")
  // Cela évite que React ne force le formatage pendant que l'utilisateur tape "."
  const [quantite, setQuantite] = useState<string>("1");

  // Calcul du max disponible si c'est une sortie
  const stockSelectionne = stocks.find(s => s.id.toString() === selectedStockId);
  const maxQuantite = type === "SORTIE" && stockSelectionne ? stockSelectionne.quantite : 999999;

  return (
    <form action={onSubmit} className="space-y-6">
      <input type="hidden" name="articleId" value={articleId} />
      
      {/* 1. Choix du Type */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => { setType("ENTREE"); setSelectedStockId("nouveau"); }}
          className={`py-3 rounded-lg border font-semibold transition ${
            type === "ENTREE" 
              ? "bg-green-100 border-green-500 text-green-800" 
              : "bg-white border-border text-muted-fg hover:bg-muted"
          }`}
        >
          📥 Entrée (Ajout)
        </button>
        <button
          type="button"
          onClick={() => { setType("SORTIE"); setSelectedStockId(stocks[0]?.id.toString() || ""); }}
          disabled={stocks.length === 0}
          className={`py-3 rounded-lg border font-semibold transition ${
            type === "SORTIE" 
              ? "bg-orange-100 border-orange-500 text-orange-800" 
              : "bg-white border-border text-muted-fg hover:bg-muted"
          } ${stocks.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          📤 Sortie (Retrait)
        </button>
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
            <option value="nouveau">✨ Créer un nouveau lot (Nouvelle Date)</option>
          )}
          {stocks.map((s) => (
            <option key={s.id} value={s.id}>
              Lot #{s.id} — Dispo: {s.quantite} (Reçu le {new Date(s.date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Quantité */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Quantité</label>
        <input
          type="number"
          name="quantite"
          // CHANGEMENT 2 : min très bas pour autoriser 0.5 par exemple
          min="0.001"
          // CHANGEMENT 3 : step obligatoire pour les décimaux (3 chiffres après la virgule comme dans Prisma)
          step="0.001"
          max={maxQuantite}
          value={quantite}
          // CHANGEMENT 4 : On garde la valeur en string pendant la saisie
          onChange={(e) => setQuantite(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-primary"
          required
        />
        {type === "SORTIE" && stockSelectionne && (
           <p className="text-xs text-muted-fg">
             Maximum sortable : {maxQuantite} unités
           </p>
        )}
      </div>

      {/* Bouton de validation */}
      <button
        type="submit"
        className={`w-full py-3 rounded-md text-white font-bold shadow-md transition ${
          type === "ENTREE" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        Valider {type === "ENTREE" ? "l'entrée" : "la sortie"}
      </button>
    </form>
  );
}