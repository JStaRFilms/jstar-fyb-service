/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lead_whatsapp_key" ON "Lead"("whatsapp");
