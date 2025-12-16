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
        where: { quantite: { gt: 0 } },
        orderBy: { dateReapprovisionnement: "desc" },
      },
    },
  });

  if (!article) return notFound();

  // 2. LA SERVER ACTION
  async function createMouvement(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Vous devez être connecté pour faire un mouvement");
    }

    const userId = parseInt(session.user.id);
    const type = formData.get("type") as string;
    const stockIdRaw = formData.get("stockId") as string;
    const quantite = Number(formData.get("quantite"));
    const articleIdForm = parseInt(formData.get("articleId") as string);

    if (!quantite || quantite <= 0) return;

    await db.$transaction(async (tx) => {
      let targetStockId: number;

      if (type === "ENTREE" && stockIdRaw === "nouveau") {
        const newStock = await tx.stock.create({
          data: {
            idCatalogue: articleIdForm,
            quantite: quantite,
            dateReapprovisionnement: new Date(),
          },
        });
        targetStockId = newStock.id;
      } else {
        targetStockId = parseInt(stockIdRaw);
        const increment = type === "ENTREE" ? quantite : -quantite;

        await tx.stock.update({
          where: { id: targetStockId },
          data: {
            quantite: { increment: increment },
          },
        });
      }

      await tx.mouvement.create({
        data: {
          type: type,
          quantite: quantite,
          idStock: targetStockId,
          date: new Date(),
          idUser: userId,
        },
      });
    });

    revalidatePath(`/catalogue/${articleIdForm}`);
    revalidatePath("/mouvements");
    redirect(`/catalogue/${articleIdForm}`);
  }

  // 3. Récupération de la session pour les permissions
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Nouveau Mouvement
        </h1>
        <p className="text-muted-fg">
          Produit :{" "}
          <span className="font-semibold text-foreground">{article.nom}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm">
        <MouvementForm
          stocks={article.stocks.map((s) => ({
            id: s.id,
            quantite: Number(s.quantite),
            date: s.dateReapprovisionnement,
          }))}
          articleId={articleId}
          onSubmit={createMouvement}
          userRole={session?.user?.role}
          // ICI : On passe l'unité au formulaire
          unite={article.uniteGestion}
        />
      </div>
    </div>
  );
}
