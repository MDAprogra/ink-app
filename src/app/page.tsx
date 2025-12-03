import { db } from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  // 1. Récupération des données réelles (Dashboard dynamique)
  
  // A. Total des articles
  const totalArticles = await db.catalogue.count();

  // B. Articles en stock critique (Calcul en JS car relation complexe)
  const articles = await db.catalogue.findMany({
    select: {
      stockSecurite: true,
      stocks: {
        select: { quantite: true },
      },
    },
  });

  const lowStockCount = articles.filter((article) => {
    const totalStock = article.stocks.reduce((acc, s) => acc + Number(s.quantite), 0);
    return totalStock <= Number(article.stockSecurite);
  }).length;

  // C. Mouvements récents (dernières 24h)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const recentMovementsCount = await db.mouvement.count({
    where: {
      date: {
        gte: twentyFourHoursAgo,
      },
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen  font-sans">
      
      {/* En-tête de la page (Style Catalogue) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Tableau de bord</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Vue d'ensemble de votre stock d'encres en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-slate-950 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
        </div>
      </div>

      {/* Section Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte 1 : Alertes Stock */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">Stock Critique</h3>
              {lowStockCount > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{lowStockCount}</div>
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            {lowStockCount > 0 
              ? "⚠️ Articles nécessitent un réapprovisionnement" 
              : "✅ Tous les niveaux de stock sont bons"}
          </p>
        </div>

        {/* Carte 2 : Total Catalogue */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider mb-2">Références</h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{totalArticles}</div>
          </div>
          <p className="text-sm text-zinc-500 mt-4">
             Articles enregistrés dans le catalogue
          </p>
        </div>

        {/* Carte 3 : Mouvements */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider mb-2">Activité (24h)</h3>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                {recentMovementsCount > 0 ? "+" : ""}{recentMovementsCount}
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            Mouvements de stock depuis hier
          </p>
        </div>
      </div>

      {/* Section Actions Rapides (Style Grille Catalogue) */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Accès Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link href="/catalogue" className="group p-6 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <div>
                <span className="block font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Catalogue</span>
                <span className="text-sm text-zinc-500">Gérer les références</span>
            </div>
          </Link>

          

          <Link href="/scan" className="group p-6 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all flex flex-col gap-4">
             <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
              </svg>
            </div>
            <div>
                <span className="block font-semibold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Scanner</span>
                <span className="text-sm text-zinc-500">Recherche code-barre</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}