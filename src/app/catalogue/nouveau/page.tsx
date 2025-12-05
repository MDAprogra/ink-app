import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ColorInput from "@/components/ColorInput";

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function NewCataloguePage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  
  // --- SERVER ACTION ---
  async function createArticle(formData: FormData) {
    "use server";

    // 1. Extraction des données
    const nom = formData.get("nom") as string;
    const refInterfas = formData.get("refInterfas") as string;
    const refFourn = formData.get("refFourn") as string;
    const fournisseur = formData.get("fournisseur") as string;
    const type = formData.get("type") as string;
    const couleur = formData.get("couleur") as string;
    const description = formData.get("description") as string;
    
    // Pour les numériques et optionnels, on récupère en string d'abord
    const stockSecuriteRaw = formData.get("stockSecurite") as string;
    const uniteGestion = formData.get("uniteGestion") as string;

    // 2. Validation basique
    if (!nom || !fournisseur || !refFourn) {
      return; 
    }

    // 3. Création en base de données
    const newArticle = await db.catalogue.create({
      data: {
        nom,
        referenceInterfas: refInterfas || null,
        referenceFournisseur: refFourn,
        fournisseur,
        type: type || null,
        couleur: couleur || null,
        description: description || null,
        stockSecurite: stockSecuriteRaw ? Number(stockSecuriteRaw) : 0,
        uniteGestion: uniteGestion || null,
      },
    });

    // 4. Actualisation et Redirection
    revalidatePath("/catalogue");
    
    // On redirige vers la page détail du nouvel article pour confirmer la création
    redirect(`/catalogue/${newArticle.id}`);
  }

  // --- RENDER ---
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-foreground">Nouvel Article</h1>
            <p className="text-muted-fg mt-1">Ajoutez une nouvelle référence au catalogue.</p>
        </div>
        <Link 
            href="/catalogue" 
            className="text-sm px-4 py-2 border border-border rounded-md hover:bg-muted transition text-foreground"
        >
          Annuler
        </Link>
      </div>

      {/* Formulaire */}
      <form action={createArticle} className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm space-y-6">
        
        {/* Si on vient du scan, on affiche un petit message sympa */}
        {ref && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-md border border-blue-200 dark:border-blue-800">
                ✨ Pré-remplissage avec le code scanné : <strong>{ref}</strong>
            </div>
        )}

        {/* Section Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nom" className="block text-sm font-medium text-foreground">Nom du produit *</label>
            <input
              type="text"
              name="nom"
              id="nom"
              placeholder="Ex: Encre Noire Premium"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fournisseur" className="block text-sm font-medium text-foreground">Fournisseur *</label>
            <input
              type="text"
              name="fournisseur"
              id="fournisseur"
              placeholder="Ex: Encre & Co"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="refInterfas" className="block text-sm font-medium text-foreground">Réf. Interne (Interfas)</label>
            <input
              type="text"
              name="refInterfas"
              id="refInterfas"
              placeholder="Ex: INT-001"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="refFourn" className="block text-sm font-medium text-foreground">Réf. Fournisseur *</label>
            <input
              type="text"
              name="refFourn"
              id="refFourn"
              defaultValue={ref || ""} 
              placeholder="Ex: REF-ABC-123"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Section Détails - Réorganisée en 2 colonnes pour intégrer l'unité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-foreground">Type / Catégorie</label>
            <input
              type="text"
              name="type"
              id="type"
              placeholder="Ex: Solvant"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="couleur" className="block text-sm font-medium text-foreground">Couleur</label>
            <ColorInput defaultValue="#000000" />
          </div>

          <div className="space-y-2">
            <label htmlFor="stockSecurite" className="block text-sm font-medium text-foreground">Stock de Sécurité</label>
            <input
              type="number"
              name="stockSecurite"
              id="stockSecurite"
              defaultValue="0"
              min="0"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-fg">Alerte si stock inférieur à...</p>
          </div>

          {/* Nouveau champ : Unité de gestion */}
          <div className="space-y-2">
            <label htmlFor="uniteGestion" className="block text-sm font-medium text-foreground">Unité de Gestion</label>
            <input
              type="text"
              name="uniteGestion"
              id="uniteGestion"
              list="units-list"
              placeholder="ex: kg, L, unité"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <datalist id="units-list">
              <option value="kg" />
              <option value="L" />
              <option value="m" />
              <option value="m²" />
              <option value="unité" />
              <option value="carton" />
              <option value="rouleau" />
            </datalist>
            <p className="text-xs text-muted-fg">Unité utilisée pour les mouvements (facultatif)</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
          <textarea
            name="description"
            id="description"
            rows={3}
            placeholder="Détails techniques, emplacement, notes..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-4">
            <button
                type="submit"
                className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-md transition"
            >
                Créer l'article
            </button>
        </div>
      </form>
    </div>
  );
}