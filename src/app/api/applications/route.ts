import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/applications — list all
export async function GET() {
  const applications = await prisma.jobApplication.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(applications);
}

// POST /api/applications — create new
export async function POST(request: NextRequest) {
  const body = await request.json();

  const application = await prisma.jobApplication.create({
    data: {
      companyName: body.companyName,
      companyWebsite: body.companyWebsite ?? null,
      industry: body.industry ?? null,
      jobTitle: body.jobTitle,
      jobUrl: body.jobUrl ?? null,
      locationType: body.locationType ?? "Remote",
      status: body.status ?? "Draft",
      salaryRange: body.salaryRange ?? null,
      whatTheyExpect: body.whatTheyExpect
        ? JSON.stringify(body.whatTheyExpect)
        : null,
      whatIExpect: body.whatIExpect ? JSON.stringify(body.whatIExpect) : null,
      whyIApplied: body.whyIApplied ?? null,
      interviewNotes: body.interviewNotes ?? null,
      vibeCheck: body.vibeCheck ?? null,
    },
  });

  return Response.json(application, { status: 201 });
}
