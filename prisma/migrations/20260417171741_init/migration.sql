-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "industry" TEXT,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "locationType" TEXT NOT NULL DEFAULT 'Remote',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "salaryRange" TEXT,
    "whatTheyExpect" TEXT,
    "whatIExpect" TEXT,
    "whyIApplied" TEXT,
    "interviewNotes" TEXT,
    "vibeCheck" TEXT
);
