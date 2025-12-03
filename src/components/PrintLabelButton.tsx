"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface PrintLabelButtonProps {
  reference: string;
  nom: string;
}

export default function PrintLabelButton({ reference, nom }: PrintLabelButtonProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  // Génération du code-barres au montage du composant
  useEffect(() => {
    if (barcodeRef.current && reference) {
      try {
        JsBarcode(barcodeRef.current, reference, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.3,        // Réduit pour rentrer dans 50mm (standard est 2)
          height: 45,        // Augmenté car on a plus de place sans le nom (était 35)
          displayValue: true,
          fontSize: 11,      // Police plus petite
          textMargin: 2,     // Marge entre barres et texte réduite
          margin: 0,         // Marge globale à 0 pour laisser le CSS gérer
        });
      } catch (e) {
        console.error("Erreur génération code-barres", e);
      }
    }
  }, [reference]);

  const handlePrint = () => {
    // 1. On récupère le SVG généré
    const svgContent = barcodeRef.current?.outerHTML;
    if (!svgContent) return;

    // 2. On ouvre une fenêtre vierge pour l'impression
    const printWindow = window.open("", "_blank", "width=400,height=200");
    if (!printWindow) return;

    // 3. On écrit le HTML spécifique pour l'étiquette
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression Étiquette - ${reference}</title>
          <style>
            /* Configuration précise de la page pour l'imprimante thermique */
            @page {
              size: 50mm 19mm;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 50mm;
              height: 19mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              overflow: hidden; /* Empêche les débordements sur une 2e page */
            }

            .label-container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              /* Petite marge de sécurité interne pour ne pas coller aux bords physiques */
              padding: 1mm; 
              box-sizing: border-box;
            }

            svg {
              max-width: 48mm; /* Force le SVG à ne pas dépasser la largeur */
              height: auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${svgContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              // Petit délai pour assurer que l'ordre d'impression est parti avant de fermer
              setTimeout(() => {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* Le code-barres est généré mais caché (display: none) dans la page principale */}
      <svg ref={barcodeRef} style={{ display: "none" }}></svg>

      <button
        onClick={handlePrint}
        className="w-full py-3 text-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg shadow-sm transition-colors mt-4 flex items-center justify-center gap-2"
      >
        <span>🖨️</span> Imprimer Étiquette (50x19mm)
      </button>
    </>
  );
}