-- CreateTable
CREATE TABLE "RecipeCategoryDef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelDe" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RecipeDietKindDef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelDe" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isMeat" BOOLEAN NOT NULL DEFAULT false,
    "searchExtra" TEXT NOT NULL DEFAULT ''
);

INSERT INTO "RecipeCategoryDef" ("id", "labelDe", "labelEn", "sortOrder") VALUES
('hauptgericht', 'Hauptgericht', 'Main course', 0),
('vorspeise', 'Vorspeise', 'Starter', 1),
('beilage', 'Beilage', 'Side dish', 2),
('salat', 'Salat', 'Salad', 3),
('suppe', 'Suppe & Eintopf', 'Soup & stew', 4),
('dessert', 'Dessert', 'Dessert', 5),
('backen', 'Backen', 'Baking', 6),
('fruehstueck', 'Frühstück & Brunch', 'Breakfast & brunch', 7),
('getraenk', 'Getränk', 'Drink', 8),
('snack', 'Snack', 'Snack', 9),
('sonstiges', 'Sonstiges', 'Other', 10);

INSERT INTO "RecipeDietKindDef" ("id", "labelDe", "labelEn", "sortOrder", "isMeat", "searchExtra") VALUES
('vegan', 'Vegan', 'Vegan', 0, 0, 'pflanzlich plant-based'),
('vegetarisch', 'Vegetarisch', 'Vegetarian', 1, 0, 'veggie ovo-laktisch eier milch'),
('fleisch_huhn', 'Huhn / Geflügel', 'Chicken / poultry', 2, 1, 'hähnchen geflügel poulet chicken pute truthahn fleisch'),
('fleisch_schwein', 'Schwein', 'Pork', 3, 1, 'schweinefleisch speck bacon schinken fleisch'),
('fleisch_rind', 'Rind', 'Beef', 4, 1, 'rindfleisch beef steak burger fleisch'),
('fleisch_andere', 'Fleisch (sonstiges)', 'Meat (other)', 5, 1, 'fleisch lamm lammfleisch ente gans fisch lachs thunfisch wild kaninchen');
