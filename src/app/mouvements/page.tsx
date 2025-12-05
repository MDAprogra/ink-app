import { db } from "@/lib/db";
import Link from "next/link";

export default async function MouvementsPage() {
  // 1. Récupération des mouvements avec relations imbriquées
  const mouvements = await db.mouvement.findMany({
    orderBy: {
      date: 'desc', // Les plus récents en haut
    },
    take: 100, // On limite aux 100 derniers pour la performance (pagination à prévoir plus tard)
    include: {
      stock: {
        include: {
          catalogue: true, // Pour récupérer le nom du produit ET l'unité
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal des Mouvements</h1>
          <p className="text-muted-fg mt-1">Historique global des entrées et sorties de stock.</p>
        </div>
        <Link 
          href="/catalogue"
          className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition"
        >
          Retour au Catalogue
        </Link>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-950 border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Ref. Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-fg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-950 divide-y divide-border">
              {mouvements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-fg">
                    Aucun mouvement enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                mouvements.map((mvt) => {
                  const isEntree = mvt.type === 'ENTREE';
                  const produit = mvt.stock.catalogue;

                  return (
                    <tr key={mvt.id} className="hover:bg-muted/30 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-fg">
                        <div className="text-foreground font-medium">
                          {new Date(mvt.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs">
                          {new Date(mvt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                        </div>
                      </td>

                      {/* Article (Lien vers le détail) */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{produit.nom}</div>
                        <div className="text-xs text-muted-fg">Ref: {produit.referenceInterfas || "N/A"}</div>
                      </td>

                      {/* Type (Badge couleur) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isEntree 
                            ? "bg-green-100 text-green-800 border border-green-200" 
                            : "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}>
                          {mvt.type}
                        </span>
                      </td>

                      {/* Quantité AVEC UNITE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          isEntree ? "text-green-600" : "text-orange-600"
                        }`}>
                          {isEntree ? "+" : "-"}{Number(mvt.quantite)} {produit.uniteGestion}
                        </span>
                      </td>

                      {/* Info technique (ID du lot) */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-fg">
                        Lot #{mvt.idStock}
                      </td>

                      {/* Lien Voir */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/catalogue/${produit.id}`} className="text-primary hover:text-primary/80">
                          Voir produit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}