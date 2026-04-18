-- CreateTable
CREATE TABLE "RecipeTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "nutritionText" TEXT,
    "instructions" JSONB NOT NULL,
    "ingredients" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecipeTranslation_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RecipeTranslation_recipeId_idx" ON "RecipeTranslation"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTranslation_recipeId_locale_key" ON "RecipeTranslation"("recipeId", "locale");
