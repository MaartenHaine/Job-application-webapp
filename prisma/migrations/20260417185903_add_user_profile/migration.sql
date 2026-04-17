-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'profile',
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "currentTitle" TEXT,
    "location" TEXT,
    "summary" TEXT,
    "workExperience" TEXT,
    "education" TEXT,
    "skills" TEXT,
    "languages" TEXT
);
