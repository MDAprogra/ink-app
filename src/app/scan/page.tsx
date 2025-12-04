import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

// Dans Next.js 15, searchParams est une Promise
interface ScanPageProps {
  searchParams: Promise<{ error?: string; code?: string }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  // On récupère les paramètres d'URL (qui contiennent le code nettoyé après redirection)
  const { error, code: scannedCode } = await searchParams;

  // La Server Action qui gère le scan
  async function handleScan(formData: FormData) {
    "use server";
    
    // 1. On récupère le code brut saisi ou scanné
    let code = formData.get("code") as string;
    
    if (!code) return;
    
    // Pour éviter les espaces accidentels (souvent le cas avec les douchettes)
    code = code.trim();

    // 2. --- LOGIQUE DE NETTOYAGE DU CODE BARRE ---
    // Si le code commence par "91" (ex: 91YEP30007428N...)
    // if (code.startsWith("91")) {
    //   // On retire le préfixe '91' et on garde 12 caractères
    //   // La variable 'code' est écrasée avec la nouvelle valeur
    //   code = code.substring(2, 14);
    // }
    // À partir d'ici, la variable 'code' contient la version propre (12 chars)
    // ------------------------------------------

    // 3. Recherche de l'article avec le code NETTOYÉ
    const article = await db.catalogue.findFirst({
      where: {
        OR: [
          // On vérifie si c'est un ID numérique (ex: "15")
          // { id: !isNaN(parseInt(code)) ? parseInt(code) : undefined },
          // On cherche dans les références texte
          { referenceInterfas: code },
          { referenceFournisseur: code }
        ]
      }
    });

    if (article) {
      // Trouvé : on redirige vers le mouvement
      redirect(`/catalogue/${article.id}/mouvement`);
    } else {
      // PAS Trouvé : On redirige avec le code NETTOYÉ dans l'URL
      // Comme 'code' a été modifié plus haut, c'est bien la version courte qui passe dans l'URL
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

        {/* Formulaire de scan */}
        <form action={handleScan} className="relative">
          <input
            type="text"
            name="code"
            autoFocus
            // Key permet de forcer le rafraichissement du champ si le code change
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
        {/* Ici 'scannedCode' vient de l'URL, donc c'est le code nettoyé */}
        {error === "not_found" && scannedCode && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Voulez-vous ajouter ce produit au catalogue ?
            </p>
            <Link
              // On passe le code nettoyé à la page de création
              href={`/catalogue/nouveau?ref=${scannedCode}`}
              className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition shadow-sm"
            >
              + Créer l'article ({scannedCode})
            </Link>
          </div>
        )}

        <div className="border-t border-border pt-6">
            <Link href="/catalogue" className="text-sm text-primary hover:underline">
                Retour au catalogue manuel
            </Link>
        </div>
      </div>
    </div>
  );
}