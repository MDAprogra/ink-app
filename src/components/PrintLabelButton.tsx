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
          height: 45,        // Hauteur des barres
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
              overflow: hidden;
            }

            .label-container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 1mm; 
              box-sizing: border-box;
              
              /* ROTATION DU CODE BARRE ICI */
              /* Changez 180deg par 90deg ou 270deg si nécessaire selon votre imprimante */
              transform: rotate(180deg);
            }

            svg {
              max-width: 48mm;
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