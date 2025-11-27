// src/components/ColorInput.tsx
"use client"; // <--- La directive magique qui active le JavaScript côté navigateur

import { useState } from "react";

interface ColorInputProps {
  defaultValue?: string | null;
}

export default function ColorInput({ defaultValue }: ColorInputProps) {
  // On gère l'état localement pour la synchro immédiate
  const [color, setColor] = useState(defaultValue || "#000000");

  return (
    <div className="flex gap-2">
      {/* Input Texte (pour écrire le code hexa) */}
      <input
        type="text"
        name="couleur" // C'est ce name que la Server Action va lire
        id="couleur"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="#000000"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      
      {/* Sélecteur Visuel */}
      <input
        type="color"
        value={color} // Lié au même state
        onChange={(e) => setColor(e.target.value)}
        className="h-9 w-9 p-0 border border-border rounded cursor-pointer bg-transparent"
      />
    </div>
  );
}