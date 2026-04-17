-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "industry" TEXT,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "locationType" TEXT NOT NULL DEFAULT 'Remote',
    "jobType" TEXT NOT NULL DEFAULT 'Full-time',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "salaryRange" TEXT,
    "whatTheyExpect" TEXT,
    "whatIExpect" TEXT,
    "whyIApplied" TEXT,
    "interviewNotes" TEXT,
    "vibeCheck" TEXT,
    "companyResearch" TEXT
);
INSERT INTO "new_JobApplication" ("companyName", "companyResearch", "companyWebsite", "createdAt", "id", "industry", "interviewNotes", "jobTitle", "jobUrl", "locationType", "salaryRange", "status", "updatedAt", "vibeCheck", "whatIExpect", "whatTheyExpect", "whyIApplied") SELECT "companyName", "companyResearch", "companyWebsite", "createdAt", "id", "industry", "interviewNotes", "jobTitle", "jobUrl", "locationType", "salaryRange", "status", "updatedAt", "vibeCheck", "whatIExpect", "whatTheyExpect", "whyIApplied" FROM "JobApplication";
DROP TABLE "JobApplication";
ALTER TABLE "new_JobApplication" RENAME TO "JobApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
