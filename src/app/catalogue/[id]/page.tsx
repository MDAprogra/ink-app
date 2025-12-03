import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

// Dans Next.js 15+, params est une Promise qu'il faut attendre
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CatalogueDetailPage({ params }: PageProps) {
  // 1. On récupère l'ID de l'URL
  const { id } = await params;
  const articleId = parseInt(id);

  if (isNaN(articleId)) {
    return notFound();
  }

  // 2. On récupère TOUT : Article -> Stocks -> Mouvements
  const article = await db.catalogue.findUnique({
    where: { id: articleId },
    include: {
      stocks: {
        include: {
          mouvements: {
            orderBy: { date: 'desc' }, // Historique du plus récent au plus vieux
            take: 10 // On limite aux 10 derniers mouvements pour ne pas surcharger
          }
        }
      }
    }
  });

  if (!article) {
    return notFound();
  }

  // 3. Calculs simples pour l'affichage
  // CORRECTION ICI : Conversion explicite de Decimal vers Number
  const stockTotal = article.stocks.reduce((acc, s) => acc + Number(s.quantite), 0);
  const stockSecurite = Number(article.stockSecurite);
  const isLowStock = stockTotal <= stockSecurite;
  
  // On récupère tous les mouvements de tous les stocks pour faire une timeline globale
  const tousMouvements = article.stocks.flatMap(s => s.mouvements)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{article.nom}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              isLowStock 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {stockTotal} en stock
            </span>
          </div>
          <p className="text-muted-fg mt-1">Réf: {article.referenceInterfas || "N/A"}</p>
        </div>

        <div className="flex gap-3">
          <Link 
            href="/catalogue"
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition"
          >
            Retour
          </Link>
          <Link 
            href={`/catalogue/${article.id}/edit`}
            className="px-4 py-2 bg-primary text-primary-fg rounded-md hover:opacity-90 transition shadow-sm"
          >
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- COLONNE GAUCHE : DÉTAILS --- */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Informations Générales</h2>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-muted-fg">Fournisseur</dt>
                <dd className="mt-1 text-base text-foreground">{article.fournisseur}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-fg">Référence Fournisseur</dt>
                <dd className="mt-1 text-base text-foreground">{article.referenceFournisseur}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-fg">Type / Catégorie</dt>
                <dd className="mt-1 text-base text-foreground">{article.type || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-fg">Couleur</dt>
                <dd className="mt-1 text-base text-foreground flex items-center gap-2">
                  {article.couleur ? (
                    <>
                      <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: article.couleur }}></span>
                      {article.couleur}
                    </>
                  ) : "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-fg">Description</dt>
                <dd className="mt-1 text-base text-foreground bg-muted/30 p-3 rounded-md">
                  {article.description || "Aucune description disponible."}
                </dd>
              </div>
            </dl>
          </div>

          {/* --- HISTORIQUE DES MOUVEMENTS --- */}
          <div className="bg-white dark:bg-slate-950 border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Derniers Mouvements</h2>
            </div>
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-fg uppercase">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white dark:bg-slate-950">
                {tousMouvements.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-fg">Aucun mouvement récent</td>
                  </tr>
                ) : (
                  tousMouvements.map((mvt) => (
                    <tr key={mvt.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {new Date(mvt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mvt.type === 'ENTREE' ? 'bg-green-100 text-green-800' : 
                          mvt.type === 'SORTIE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mvt.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                        {/* Correction d'affichage Decimal -> Number */}
                        {mvt.type === 'SORTIE' ? '-' : '+'}{Number(mvt.quantite)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- COLONNE DROITE : GESTION STOCK --- */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">État du Stock</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-fg">Stock Physique</span>
                <span className="text-2xl font-bold text-foreground">{stockTotal}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-fg">Seuil de Sécurité</span>
                <span className="font-mono text-foreground">{stockSecurite}</span>
              </div>

              {isLowStock && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  ⚠️ <strong>Attention :</strong> Le stock est inférieur ou égal au seuil de sécurité. Pensez à réapprovisionner.
                </div>
              )}

              <hr className="border-border my-2" />

              <div className="space-y-2">
                 <h3 className="text-sm font-medium text-muted-fg mb-2">Lots / Emplacements :</h3>
                 {article.stocks.map((stock, index) => (
                    <div key={stock.id} className="text-sm border border-border p-2 rounded bg-muted/10 flex justify-between">
                       <span>Lot #{stock.id}</span>
                       {/* Correction d'affichage Decimal -> Number */}
                       <span className="font-semibold">{Number(stock.quantite)} unités</span>
                    </div>
                 ))}
              </div>

            <Link 
              href={`/catalogue/${article.id}/mouvement`} 
              className="block w-full py-3 text-center bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md transition-colors mt-4"
            >
                Faire un mouvement de stock
            </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}