-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlumniProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "industry" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "skills" TEXT NOT NULL,
    "isMentor" BOOLEAN NOT NULL DEFAULT false,
    "profileComplete" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT NOT NULL DEFAULT 'CCHS',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AlumniProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AlumniProfile" ("batch", "city", "company", "country", "id", "industry", "isMentor", "latitude", "longitude", "profileComplete", "program", "role", "school", "skills", "userId") SELECT "batch", "city", "company", "country", "id", "industry", "isMentor", "latitude", "longitude", "profileComplete", "program", "role", "school", "skills", "userId" FROM "AlumniProfile";
DROP TABLE "AlumniProfile";
ALTER TABLE "new_AlumniProfile" RENAME TO "AlumniProfile";
CREATE UNIQUE INDEX "AlumniProfile_userId_key" ON "AlumniProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
