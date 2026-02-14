-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "costUSD" REAL NOT NULL,
    "revenueUSD" REAL NOT NULL,
    "feesUSD" REAL NOT NULL,
    "profitUSD" REAL NOT NULL,
    "profitPercent" REAL NOT NULL,
    "buyExchange" TEXT NOT NULL,
    "sellExchange" TEXT NOT NULL,
    "buyPrice" REAL NOT NULL,
    "sellPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'executed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "dateOfCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("dateOfCreation", "email", "id", "password", "role", "username") SELECT "dateOfCreation", "email", "id", "password", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
