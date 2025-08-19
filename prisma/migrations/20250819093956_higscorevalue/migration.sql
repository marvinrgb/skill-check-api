/*
  Warnings:

  - Added the required column `value` to the `Highscore` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Highscore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" REAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    CONSTRAINT "Highscore_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Highscore_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Highscore" ("created_at", "game_id", "id", "user_id") SELECT "created_at", "game_id", "id", "user_id" FROM "Highscore";
DROP TABLE "Highscore";
ALTER TABLE "new_Highscore" RENAME TO "Highscore";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
