export const JOB_STATUSES = [
  "Draft",
  "Applied",
  "Recruiter Screen",
  "Technical",
  "Final Interview",
  "Offer",
  "Rejected",
] as const;

export const LOCATION_TYPES = ["Remote", "Hybrid", "On-site"] as const;

export const JOB_TYPES = ["Internship", "Student Job", "Part-time", "Full-time"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export type JobStatus = (typeof JOB_STATUSES)[number];
export type LocationType = (typeof LOCATION_TYPES)[number];

export interface JobApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  companyWebsite: string | null;
  industry: string | null;
  jobTitle: string;
  jobUrl: string | null;
  locationType: string;
  status: string;
  salaryRange: string | null;
  whatTheyExpect: string | null; // JSON string of string[]
  whatIExpect: string | null;    // JSON string of string[]
  whyIApplied: string | null;
  interviewNotes: string | null;
  vibeCheck: string | null;
}

export interface ParsedJob {
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  jobTitle: string;
  jobUrl?: string;
  locationType: "Remote" | "Hybrid" | "On-site";
  salaryRange?: string;
  whatTheyExpect: string[];
  whatIExpect: string[];
  whyIApplied?: string;
  vibeCheck?: string;
}
