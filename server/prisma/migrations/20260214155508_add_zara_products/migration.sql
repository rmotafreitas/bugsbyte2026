/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `descricao` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagem` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loja` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parteDoCorpo` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `produto` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamanhosDisponiveis` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produto" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tamanhosDisponiveis" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "preco" TEXT NOT NULL,
    "loja" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "parteDoCorpo" TEXT NOT NULL,
    "genero" TEXT NOT NULL
);
INSERT INTO "new_Product" ("id") SELECT "id" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_produto_key" ON "Product"("produto");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
