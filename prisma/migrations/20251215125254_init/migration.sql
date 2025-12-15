-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whatsapp" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "twist" TEXT NOT NULL,
    "complexity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW'
);
