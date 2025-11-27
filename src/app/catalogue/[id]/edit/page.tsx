import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ColorInput from "@/components/ColorInput";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCataloguePage({ params }: PageProps) {
  // 1. Récupération de l'ID et des données actuelles
  const { id } = await params;
  const articleId = parseInt(id);

  if (isNaN(articleId)) return notFound();

  const article = await db.catalogue.findUnique({
    where: { id: articleId },
  });

  if (!article) return notFound();

  // 2. La Server Action pour mettre à jour
  async function updateArticle(formData: FormData) {
    "use server";

    const nom = formData.get("nom") as string;
    const refInterfas = formData.get("refInterfas") as string;
    const refFourn = formData.get("refFourn") as string;
    const fournisseur = formData.get("fournisseur") as string;
    const type = formData.get("type") as string;
    const couleur = formData.get("couleur") as string;
    const description = formData.get("description") as string;
    const stockSecurite = formData.get("stockSecurite");

    // Validation basique
    if (!nom || !fournisseur) {
      // Dans une vraie app, on gérerait les erreurs plus finement
      return;
    }

    await db.catalogue.update({
      where: { id: articleId },
      data: {
        nom,
        referenceInterfas: refInterfas || null,
        referenceFournisseur: refFourn,
        fournisseur,
        type: type || null,
        couleur: couleur || null,
        description: description || null,
        stockSecurite: stockSecurite ? Number(stockSecurite) : 0,
      },
    });

    // On rafraîchit les caches pour que les nouvelles données s'affichent partout
    revalidatePath("/catalogue");
    revalidatePath(`/catalogue/${articleId}`);
    
    // On redirige vers la page de détail
    redirect(`/catalogue/${articleId}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Modifier l'article</h1>
        <Link href={`/catalogue/${articleId}`} className="text-sm text-muted-fg hover:text-foreground underline">
          Annuler et retour
        </Link>
      </div>

      <form action={updateArticle} className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm space-y-6">
        
        {/* Section Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nom" className="block text-sm font-medium text-foreground">Nom du produit *</label>
            <input
              type="text"
              name="nom"
              id="nom"
              defaultValue={article.nom}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fournisseur" className="block text-sm font-medium text-foreground">Fournisseur *</label>
            <input
              type="text"
              name="fournisseur"
              id="fournisseur"
              defaultValue={article.fournisseur}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="refInterfas" className="block text-sm font-medium text-foreground">Réf. Interfas</label>
            <input
              type="text"
              name="refInterfas"
              id="refInterfas"
              defaultValue={article.referenceInterfas || ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="refFourn" className="block text-sm font-medium text-foreground">Réf. Fournisseur *</label>
            <input
              type="text"
              name="refFourn"
              id="refFourn"
              defaultValue={article.referenceFournisseur}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Section Détails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-foreground">Type / Catégorie</label>
            <input
              type="text"
              name="type"
              id="type"
              defaultValue={article.type || ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="couleur" className="block text-sm font-medium text-foreground">
                Couleur (Hex ou Nom)
            </label>
            {/* On appelle notre Client Component ici */}
            <ColorInput defaultValue={article.couleur} />
        </div>

          <div className="space-y-2">
            <label htmlFor="stockSecurite" className="block text-sm font-medium text-foreground">Stock de Sécurité</label>
            <input
              type="number"
              name="stockSecurite"
              id="stockSecurite"
              defaultValue={Number(article.stockSecurite)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-fg">Seuil d'alerte pour réappro.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
          <textarea
            name="description"
            id="description"
            rows={6}
            defaultValue={article.description || ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-4">
          <Link
             href={`/catalogue/${articleId}`}
             className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-primary-fg bg-primary hover:bg-primary/90 rounded-md shadow-sm transition"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}