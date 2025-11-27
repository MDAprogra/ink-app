# Roadmap du Projet Catalogue (Ink-App)

## 🟢 1. Terminé & Fonctionnel
- [x] **Initialisation du projet** : Next.js 15+ (App Router), TypeScript, Tailwind CSS.
- [x] **Configuration DB** : SQLite locale configurée avec Prisma (v5.22.0).
- [x] **Modélisation** : Schéma Prisma défini (Catalogue, Stock, Mouvement).
- [x] **Architecture** : Instance Prisma Singleton (`lib/db.ts`) pour éviter les connexions multiples.
- [x] **Design System** : Variables CSS globales (Colors semantic) et Dark Mode supporté.
- [x] **Page Liste (`/catalogue`)** : Tableau des articles avec calcul du stock total et indicateurs visuels.
- [x] **Page Détail (`/catalogue/[id]`)** : Dashboard produit avec historique des mouvements et infos stock.
- [x] **Page Édition (`/catalogue/[id]/edit`)** : Formulaire avec Server Actions.
- [x] **Composants Client** : `ColorInput` isolé pour gérer l'interactivité (Island Architecture).

---

## 🟡 2. Priorité Immédiate (Fonctionnalités manquantes)
- [ ] **Page Création (`/catalogue/nouveau`)** :
    - Créer le formulaire d'ajout (similaire à l'édition).
    - Gérer la création initiale d'un stock (ex: quantité 0 par défaut).
- [ ] **Action Supprimer** :
    - Ajouter un bouton "Supprimer" sur la page détail ou liste.
    - Gérer la suppression en cascade (Prisma le fait, mais attention à l'UX : confirmation requise).
- [ ] **Navigation** :
    - Créer une Navbar ou Sidebar commune (dans `layout.tsx`) pour naviguer facilement entre Accueil et Catalogue.

---

## 🟠 3. Gestion des Stocks (Cœur du métier)
- [ ] **Actions de Mouvement** :
    - Créer des boutons "Entrée de stock" (+) et "Sortie de stock" (-) sur la page détail.
    - *Logique* : Créer une entrée dans la table `Mouvement` ET mettre à jour la table `Stock` via une transaction Prisma (`db.$transaction`).
- [ ] **Inventaire** :
    - Possibilité de forcer/corriger une quantité (Mouvement de type "CORRECTION").

---

## 🔵 4. Améliorations UI/UX (Senior Touch)
- [ ] **Loading States** :
    - Créer un fichier `loading.tsx` global ou par dossier pour afficher des Skeletons pendant les chargements de données async.
- [ ] **Feedback Utilisateur** :
    - Ajouter des "Toasts" (notifications flottantes) lors du succès d'une création/modification (au lieu de juste rediriger).
    - Librairie conseillée : `sonner` ou `react-hot-toast`.
- [ ] **Gestion des Erreurs** :
    - Créer un fichier `error.tsx` pour attraper les plantages (ex: DB inaccessible) et afficher une page propre.
- [ ] **Barre de Recherche** :
    - Ajouter un input de recherche sur la liste catalogue (filtrage par nom ou référence côté serveur via URL params `?query=...`).

---

## 🟣 5. Qualité & Robustesse (Tech Debt)
- [ ] **Validation de données** :
    - Intégrer **Zod** dans les Server Actions pour valider les inputs (email invalide, nombre négatif, etc.) avant d'appeler Prisma.
- [ ] **Pagination** :
    - Si le catalogue dépasse 50 articles, implémenter une pagination (`take`, `skip` avec Prisma) pour ne pas charger toute la base.
- [ ] **Seed** :
    - Mettre à jour le script `prisma/seed.ts` pour générer un jeu de données plus réaliste (30+ articles) pour tester l'UI.