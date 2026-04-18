-- CreateTable
CREATE TABLE "RecipeCookLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "cookedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeCookLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RecipeCookLog_recipeId_idx" ON "RecipeCookLog"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeCookLog_cookedAt_idx" ON "RecipeCookLog"("cookedAt");
