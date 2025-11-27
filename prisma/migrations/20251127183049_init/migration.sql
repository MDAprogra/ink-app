-- CreateTable
CREATE TABLE "catalogue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "reference_interfas" TEXT,
    "reference_fournisseur" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "type" TEXT,
    "stock_securite" DECIMAL NOT NULL DEFAULT 0,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duree_conservation" INTEGER,
    "couleur" TEXT
);

-- CreateTable
CREATE TABLE "stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantite" INTEGER NOT NULL,
    "date_reapprovisionnement" DATETIME NOT NULL,
    "id_catalogue" INTEGER NOT NULL,
    CONSTRAINT "stock_id_catalogue_fkey" FOREIGN KEY ("id_catalogue") REFERENCES "catalogue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mouvement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_stock" INTEGER NOT NULL,
    CONSTRAINT "mouvement_id_stock_fkey" FOREIGN KEY ("id_stock") REFERENCES "stock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogue_reference_interfas_key" ON "catalogue"("reference_interfas");
