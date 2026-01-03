-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "fileSearchStoreCreatedAt" TIMESTAMP(3),
ADD COLUMN     "fileSearchStoreId" TEXT;

-- AlterTable
ALTER TABLE "ResearchDocument" ADD COLUMN     "fileSearchFileId" TEXT,
ADD COLUMN     "importError" TEXT,
ADD COLUMN     "importedToFileSearch" BOOLEAN NOT NULL DEFAULT false;
