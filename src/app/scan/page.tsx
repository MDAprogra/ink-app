import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

// Dans Next.js 15, searchParams est une Promise
interface ScanPageProps {
  searchParams: Promise<{ error?: string; code?: string }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const { error, code: scannedCode } = await searchParams;

  // La Server Action qui gère le scan
  async function handleScan(formData: FormData) {
    "use server";
    
    const code = formData.get("code") as string;
    if (!code) return;

    // Recherche de l'article
    const article = await db.catalogue.findFirst({
      where: {
        OR: [
          { id: !isNaN(parseInt(code)) ? parseInt(code) : undefined },
          { referenceInterfas: code },
          { referenceFournisseur: code }
        ]
      }
    });

    if (article) {
      redirect(`/catalogue/${article.id}/mouvement`);
    } else {
      // SI NON TROUVÉ : On redirige avec le code scanné dans l'URL
      redirect(`/scan?error=not_found&code=${encodeURIComponent(code)}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-xl border border-border shadow-lg text-center space-y-6">
        
        {/* En-tête dynamique selon l'état */}
        <div className="space-y-2">
          <span className="text-6xl">
            {error === "not_found" ? "⚠️" : "🔫"}
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            {error === "not_found" ? "Produit inconnu" : "Mode Scan"}
          </h1>
          <p className="text-muted-fg">
            {error === "not_found" 
              ? `Le code "${scannedCode}" n'existe pas.` 
              : "Scannez un code-barres pour gérer le stock."}
          </p>
        </div>

        {/* Formulaire de scan (toujours visible pour scanner un autre truc) */}
        <form action={handleScan} className="relative">
          <input
            type="text"
            name="code"
            autoFocus
            // Si on a fait une erreur, on vide le champ pour le scan suivant
            // Sinon on peut laisser vide
            key={scannedCode || "init"} 
            placeholder="Scannez ici..."
            className={`w-full text-center text-2xl py-4 rounded-lg border-2 bg-background focus:outline-none focus:ring-4 transition-all ${
                error === "not_found" 
                ? "border-red-500 focus:ring-red-500/30" 
                : "border-primary focus:ring-primary/30"
            }`}
            autoComplete="off"
          />
        </form>

        {/* ZONE D'ACTION : Création si non trouvé */}
        {error === "not_found" && scannedCode && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Voulez-vous ajouter ce produit au catalogue ?
            </p>
            <Link
              // On envoie le code vers la page "Nouveau" via un paramètre URL
              href={`/catalogue/nouveau?ref=${scannedCode}`}
              className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition shadow-sm"
            >
              + Créer l'article
            </Link>
          </div>
        )}

        <div className="border-t border-border pt-6">
            <a href="/catalogue" className="text-sm text-primary hover:underline">
                Retour au catalogue manuel
            </a>
        </div>
      </div>
    </div>
  );
}