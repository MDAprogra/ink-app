"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface PrintLabelButtonProps {
  reference: string;
  nom: string;
}

export default function PrintLabelButton({ reference, nom }: PrintLabelButtonProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && reference) {
      try {
        JsBarcode(barcodeRef.current, reference, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.1,
          height: 16,
          displayValue: false,
          margin: 0,
        });
      } catch (e) {
        console.error("Erreur génération code-barres", e);
      }
    }
  }, [reference]);

  const handlePrint = () => {
    const svgContent = barcodeRef.current?.outerHTML;
    if (!svgContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=250");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquette ${reference}</title>
          <style>
            @page {
              size: 50mm 20mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 50mm;
              height: 20mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 50mm;
              height: 20mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .ref {
              margin-top: 1mm;
              margin-bottom: 2mm;
              font-size: 15px;
              text-align: center;
            }
            svg {
              width: 45mm;
              height: 14mm;
            }
          </style>
        </head>
        <body>
          <div class="label">
            ${svgContent}
            <div class="ref">${nom}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <>
      {/* SVG caché dans la page principale */}
      <svg ref={barcodeRef} style={{ display: "none" }}></svg>

      <button
        onClick={handlePrint}
        className="w-full py-3 text-center bg-white dark:bg-zinc-800 
        border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 
        dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg
        shadow-sm transition-colors mt-4 flex items-center justify-center gap-2"
      >
        <span>🖨️</span> Imprimer Étiquette
      </button>
    </>
  );
}
