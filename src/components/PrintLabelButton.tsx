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
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10,
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
    const printWindow = window.open("", "_blank", "width=500,height=300");
    if (!printWindow) return;

    // 3. On écrit le HTML spécifique pour l'étiquette
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression Étiquette - ${reference}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .label-container {
              text-align: center;
              border: 1px dashed #ccc; /* Bordure pour visualiser la zone, peut être retirée */
              padding: 10px;
              max-width: 100%;
            }
            h2 { font-size: 16px; margin: 0 0 5px 0; }
            /* Cache les éléments non pertinents à l'impression */
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 1cm; }
              .label-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${svgContent}
          </div>
          <script>
            // Lance l'impression automatiquement et ferme la fenêtre après
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
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
        <span>🖨️</span> Imprimer Étiquette
      </button>
    </>
  );
}