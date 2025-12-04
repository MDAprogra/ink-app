// Définition des rôles constants pour éviter les fautes de frappe
export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  USER: "user",
} as const;

// --- DÉFINITION DES RÈGLES ---
const RULES = {
    // --- CATALOGUE --- //
    viewDetailArticle: [ROLES.OWNER,ROLES.MANAGER, ROLES.USER],
    editArticle: [ROLES.OWNER, ROLES.MANAGER],
    archiveArticle: [ROLES.OWNER],
    addArticle: [ROLES.OWNER, ROLES.MANAGER],

    // --- MOUVEMENT --- //
    doArticleMovement: [ROLES.OWNER,ROLES.MANAGER, ROLES.USER],
    viewArticleMovement: [ROLES.OWNER,ROLES.MANAGER],
    OutputMovement : [ROLES.OWNER,ROLES.MANAGER, ROLES.USER],
    InputMovement : [ROLES.OWNER,ROLES.MANAGER],
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
  canViewDetailArticle: (role?: string | null) => hasAccess(role, RULES.viewDetailArticle),
  canEditArticle: (role?: string | null) => hasAccess(role, RULES.editArticle),
  canAddArticle: (role?: string | null) => hasAccess(role, RULES.addArticle),
  canArchiveArticle: (role?: string | null) => hasAccess(role, RULES.archiveArticle),

  canDoArticleMovement: (role?: string | null) => hasAccess(role, RULES.doArticleMovement),
  canViewArticleMovement: (role?: string | null) => hasAccess(role, RULES.viewArticleMovement),
  canOutputMovement: (role?: string | null) => hasAccess(role, RULES.viewArticleMovement),
  canInputMovement: (role?: string | null) => hasAccess(role, RULES.InputMovement),
};