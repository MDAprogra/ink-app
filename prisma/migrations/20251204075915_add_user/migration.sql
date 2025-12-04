-- CreateTable
CREATE TABLE `catalogue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `reference_interfas` VARCHAR(191) NULL,
    `reference_fournisseur` VARCHAR(191) NOT NULL,
    `fournisseur` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `stock_securite` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duree_conservation` INTEGER NULL,
    `couleur` VARCHAR(191) NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `catalogue_reference_interfas_key`(`reference_interfas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantite` DECIMAL(10, 3) NOT NULL,
    `date_reapprovisionnement` DATETIME(3) NOT NULL,
    `id_catalogue` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouvement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `quantite` DECIMAL(10, 3) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_stock` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastConnect` DATETIME(3) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_id_catalogue_fkey` FOREIGN KEY (`id_catalogue`) REFERENCES `catalogue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvement` ADD CONSTRAINT `mouvement_id_stock_fkey` FOREIGN KEY (`id_stock`) REFERENCES `stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvement` ADD CONSTRAINT `mouvement_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
