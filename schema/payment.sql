CREATE TABLE "payment" (
  "id" INTEGER PRIMARY KEY,
  "url_key" INTEGER NOT NULL,
  "timestamp_created" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price_cents" INTEGER NOT NULL,
  "currency_code" TEXT NOT NULL,
  -- should be unique but I should be able
  -- to manage that without this system.
  "reference" TEXT NOT NULL, -- UNIQUE
  "paid" INTEGER NOT NULL DEFAULT 0,
  "archived" INTEGER NOT NULL DEFAULT 0
);

-- # TODO Add date field

/*

KTN Praktikum

Wir bearbeiten Deine Aufgaben für das Praktikum

3400

EUR

INF210001


Die Zahlung geht an:

Jonas van den Berg
Hülsenpfad 10
51491 Overath
Deutschland

*/
