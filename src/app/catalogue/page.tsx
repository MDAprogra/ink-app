import { db } from "@/lib/db";
import Link from "next/link";
import Search from "@/components/Search";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";     
import { permissions } from "@/lib/permissions"; 

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function CataloguePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";

  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  // Calcul des permissions globales (pour le bouton "Nouvel Article" en haut)
  const canAddArticle = permissions.canAddArticle(userRole);

  const articles = await db.catalogue.findMany({
    where: {
      OR: [
        { nom: { contains: query } }, 
        { referenceInterfas: { contains: query } },
        { referenceFournisseur: { contains: query } },
        { fournisseur: { contains: query } },
        { uniteGestion: { contains: query } },
      ],
    },
    include: {
      stocks: true,
    },
    orderBy: {
      nom: "asc",
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête ... (inchangé) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-foreground">Catalogue</h1>
           <p className="text-muted-fg mt-1">Gérez vos références et consultez les stocks.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
            <div className="w-full md:w-64">
                <Search placeholder="Rechercher..." />
            </div>

            {/* Bouton Nouvel Article : On cache complètement s'il n'a pas le droit */}
            {canAddArticle && (
              <Link 
                href="/catalogue/nouveau" 
                className="bg-primary text-primary-fg hover:opacity-90 px-4 py-2 rounded-md transition shadow-sm whitespace-nowrap flex items-center justify-center"
              >
                + Nouvel Article
              </Link>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Nom / Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Stock Actuel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase tracking-wider">Stock Sécu.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-fg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-950 divide-y divide-border">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-fg">
                    {query ? `Aucun résultat pour "${query}"` : "Aucun article dans le catalogue pour le moment."}
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  const stockTotal = article.stocks.reduce((acc, stock) => acc + Number(stock.quantite), 0);
                  const stockSecu = Number(article.stockSecurite);
                  const isLowStock = stockTotal <= stockSecu;

                  // Calcul des permissions locales pour chaque ligne (lisibilité)
                  // Note: Assurez-vous que ces fonctions existent dans votre lib/permissions.ts
                  // Si vous utilisez la méthode générique 'can', remplacez par can("doArticleMovement", userRole)
                  const canMove = permissions.canDoArticleMovement ? permissions.canDoArticleMovement(userRole) : true; 
                  const canView = permissions.canViewDetailArticle ? permissions.canViewDetailArticle(userRole) : true;
                  const canEdit = permissions.canEditArticle ? permissions.canEditArticle(userRole) : false;

                  return (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      {/* ... Autres colonnes inchangées ... */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{article.referenceInterfas || "N/A"}</div>
                        <div className="text-xs text-muted-fg">Ref Fourn: {article.referenceFournisseur}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{article.nom}</div>
                        {article.description && (
                          <div className="text-sm text-muted-fg truncate max-w-xs">{article.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{article.fournisseur}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isLowStock ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"
                        }`}>
                          {stockTotal} {article.uniteGestion}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-fg">
                        {stockSecu} {article.uniteGestion}
                      </td>

                      {/* --- COLONNE ACTIONS --- */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        
                        {/* 1. BOUTON STOCK */}
                        {canMove ? (
                          <Link
                            href={`/catalogue/${article.id}/mouvement`}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 mr-4 transition-colors"
                          >
                            +/- Stock
                          </Link>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-400 bg-gray-100 mr-4 cursor-not-allowed opacity-50">
                            +/- Stock
                          </span>
                        )}

                        {/* 2. BOUTON VOIR */}
                        {canView ? (
                          <Link 
                            href={`/catalogue/${article.id}`} 
                            className="text-primary hover:text-primary/80 mr-4 transition-colors"
                          >
                            Voir
                          </Link>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 mr-4 cursor-not-allowed" aria-disabled="true">
                            Voir
                          </span>
                        )}

                        {/* 3. BOUTON ÉDITER */}
                        {canEdit ? (
                          <Link 
                            href={`/catalogue/${article.id}/edit`} 
                            className="text-muted-fg hover:text-foreground transition-colors"
                          >
                            Éditer
                          </Link>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 cursor-not-allowed" aria-disabled="true">
                            Éditer
                          </span>
                        )}

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