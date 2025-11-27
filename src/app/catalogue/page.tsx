import { db } from "@/lib/db";
import Link from "next/link";

export default async function CataloguePage() {
  // 1. Récupération des données avec la relation Stock
  const articles = await db.catalogue.findMany({
    include: {
      stocks: true, // On récupère les stocks associés pour calculer le total
    },
    orderBy: {
      nom: "asc",
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Catalogue</h1>
        <Link 
        href="/catalogue/nouveau" 
        className="bg-primary text-primary-fg hover:opacity-90 px-4 py-2 rounded-md transition shadow-sm"
        >
        + Nouvel Article
        </Link>
      </div>

      {/* Tableau des données */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Nom / Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Stock Actuel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Stock Sécu.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Aucun article dans le catalogue pour le moment.
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  // Calcul du stock total (somme des entrées stock pour cet article)
                  const stockTotal = article.stocks.reduce((acc, stock) => acc + stock.quantite, 0);
                  
                  // Conversion du Decimal pour l'affichage
                  const stockSecu = Number(article.stockSecurite);
                  const isLowStock = stockTotal <= stockSecu;

                  return (
                    <tr key={article.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                      {/* Références */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{article.referenceInterfas || "N/A"}</div>
                        <div className="text-xs text-gray-500">Ref Fourn: {article.referenceFournisseur}</div>
                      </td>

                      {/* Nom et Description */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{article.nom}</div>
                        {article.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{article.description}</div>
                        )}
                      </td>

                      {/* Fournisseur */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{article.fournisseur}</div>
                      </td>

                      {/* Stock Calculé avec indicateur visuel */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {stockTotal}
                        </span>
                      </td>

                      {/* Stock Sécurité (Decimal) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stockSecu}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  {/* NOUVEAU : Bouton d'action rapide Stock */}
  <Link
    href={`/catalogue/${article.id}/mouvement`}
    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 mr-4 transition-colors"
    title="Faire une entrée ou sortie"
  >
    +/- Stock
  </Link>

  {/* Lien Voir (Optimisé avec Link) */}
  <Link 
    href={`/catalogue/${article.id}`} 
    className="text-primary hover:text-primary/80 mr-4 transition-colors"
  >
    Voir
  </Link>

  {/* Lien Éditer (Optimisé avec Link) */}
  <Link 
    href={`/catalogue/${article.id}/edit`} 
    className="text-muted-fg hover:text-foreground transition-colors"
  >
    Éditer
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