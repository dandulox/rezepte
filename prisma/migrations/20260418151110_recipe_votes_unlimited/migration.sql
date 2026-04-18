-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecipeVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "visitorKey" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeVote_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecipeVote" ("createdAt", "id", "recipeId", "type", "visitorKey") SELECT "createdAt", "id", "recipeId", "type", "visitorKey" FROM "RecipeVote";
DROP TABLE "RecipeVote";
ALTER TABLE "new_RecipeVote" RENAME TO "RecipeVote";
CREATE INDEX "RecipeVote_recipeId_idx" ON "RecipeVote"("recipeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
