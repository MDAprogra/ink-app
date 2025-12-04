// Définition des rôles constants pour éviter les fautes de frappe
export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  USER: "user",
} as const;

// --- DÉFINITION DES RÈGLES ---
// C'est ici que vous centralisez "Qui a le droit de faire Quoi"
const RULES = {
  // Voir l'historique : Owner et Manager
  viewMovements: [ROLES.OWNER, ROLES.MANAGER],
  
  // Ajouter un article : Owner uniquement
  addArticle: [ROLES.OWNER],
  
  // Gérer le stock (Scanner/Entrée/Sortie) : Tout le monde connecté
  manageStock: [ROLES.OWNER, ROLES.MANAGER, ROLES.USER],
  
  // Supprimer un article (futur)
  deleteArticle: [ROLES.OWNER],
};

/**
 * Fonction générique pour vérifier une permission
 */
function hasAccess(role: string | undefined | null, allowedRoles: readonly string[]) {
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Export des vérificateurs prêts à l'emploi
 * Utilisation : if (permissions.canViewMovements(session.user.role)) { ... }
 */
export const permissions = {
  canViewMovements: (role?: string | null) => hasAccess(role, RULES.viewMovements),
  canAddArticle: (role?: string | null) => hasAccess(role, RULES.addArticle),
  canManageStock: (role?: string | null) => hasAccess(role, RULES.manageStock),
  canDeleteArticle: (role?: string | null) => hasAccess(role, RULES.deleteArticle),
};