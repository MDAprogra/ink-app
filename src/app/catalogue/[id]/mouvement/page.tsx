import { db } from "@/lib/db";
import MouvementForm from "@/components/MouvementForm";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewMouvementPage({ params }: PageProps) {
  const { id } = await params;
  const articleId = parseInt(id);

  if (isNaN(articleId)) return notFound();

  // 1. Récupérer l'article et ses lots existants
  const article = await db.catalogue.findUnique({
    where: { id: articleId },
    include: {
      stocks: {
        where: { quantite: { gt: 0 } }, // On récupère seulement les lots qui ont encore du stock
        orderBy: { dateReapprovisionnement: 'desc' }
      }
    }
  });

  if (!article) return notFound();

  // 2. LA SERVER ACTION (Cœur du système)
  async function createMouvement(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Vous devez être connecté pour faire un mouvement");
  }

  // Conversion de l'ID string (NextAuth) en nombre (Prisma)
  const userId = parseInt(session.user.id);
  
    const type = formData.get("type") as string;
    const stockIdRaw = formData.get("stockId") as string;
    
    // CORRECTION MAJEURE ICI : parseInt -> Number
    // parseInt tronque les décimales (1.5 devient 1). Number garde 1.5.
    const quantite = Number(formData.get("quantite")); 
    const articleIdForm = parseInt(formData.get("articleId") as string);

    if (!quantite || quantite <= 0) return;

    // --- LOGIQUE TRANSACTIONNELLE ---
    await db.$transaction(async (tx) => {
      let targetStockId: number;

      // CAS A : Création d'un NOUVEAU lot (Entrée seulement)
      if (type === "ENTREE" && stockIdRaw === "nouveau") {
        const newStock = await tx.stock.create({
          data: {
            idCatalogue: articleIdForm,
            quantite: quantite, // Prisma convertira le Number JS en Decimal BDD
            dateReapprovisionnement: new Date(),
          }
        });
        targetStockId = newStock.id;
      } 
      // CAS B : Mise à jour d'un lot EXISTANT (Entrée ou Sortie)
      else {
        targetStockId = parseInt(stockIdRaw);
        
        // On calcule l'incrément (+1.5 ou -1.5)
        const increment = type === "ENTREE" ? quantite : -quantite;

        await tx.stock.update({
          where: { id: targetStockId },
          data: {
            // Prisma gère très bien l'incrément avec des floats sur un champ Decimal
            quantite: { increment: increment } 
          }
        });
      }

      // Enfin, on trace le mouvement dans l'historique
      await tx.mouvement.create({
        data: {
          type: type,
          quantite: quantite,
          idStock: targetStockId,
          date: new Date(),
          idUser : userId
        }
      });
    });

    // Nettoyage et Redirection
    revalidatePath(`/catalogue/${articleIdForm}`);
    revalidatePath("/mouvements");
    redirect(`/catalogue/${articleIdForm}`);
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nouveau Mouvement</h1>
        <p className="text-muted-fg">Produit : <span className="font-semibold text-foreground">{article.nom}</span></p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm">
        <MouvementForm 
          stocks={article.stocks.map(s => ({
            id: s.id,
            // Conversion Decimal -> Number pour le formulaire React
            quantite: Number(s.quantite),
            date: s.dateReapprovisionnement
          }))} 
          articleId={articleId}
          onSubmit={createMouvement}
        />
      </div>
    </div>
  );
}