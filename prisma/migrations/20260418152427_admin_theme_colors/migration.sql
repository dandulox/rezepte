-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pinHash" TEXT NOT NULL,
    "adminAccentLight" TEXT NOT NULL DEFAULT '#4f46e5',
    "adminAccentLightHover" TEXT NOT NULL DEFAULT '#4338ca',
    "adminAccentLightFg" TEXT NOT NULL DEFAULT '#fafafa',
    "adminSuccessLight" TEXT NOT NULL DEFAULT '#4338ca',
    "adminAccentDark" TEXT NOT NULL DEFAULT '#818cf8',
    "adminAccentDarkHover" TEXT NOT NULL DEFAULT '#a5b4fc',
    "adminAccentDarkFg" TEXT NOT NULL DEFAULT '#18181b',
    "adminSuccessDark" TEXT NOT NULL DEFAULT '#a5b4fc'
);
INSERT INTO "new_AdminSettings" ("id", "pinHash") SELECT "id", "pinHash" FROM "AdminSettings";
DROP TABLE "AdminSettings";
ALTER TABLE "new_AdminSettings" RENAME TO "AdminSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
