-- CreateTable
CREATE TABLE "RecipeVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeVote_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RecipeVote_recipeId_idx" ON "RecipeVote"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeVote_recipeId_visitorKey_key" ON "RecipeVote"("recipeId", "visitorKey");
