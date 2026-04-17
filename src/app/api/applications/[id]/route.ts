import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/applications/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await prisma.jobApplication.findUnique({ where: { id } });
  if (!application) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(application);
}

// PATCH /api/applications/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    // Explicitly map only known fields so Prisma never receives unknown keys
    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.companyWebsite !== undefined && { companyWebsite: body.companyWebsite || null }),
        ...(body.industry !== undefined && { industry: body.industry || null }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle }),
        ...(body.jobUrl !== undefined && { jobUrl: body.jobUrl || null }),
        ...(body.locationType !== undefined && { locationType: body.locationType }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.jobType !== undefined && { jobType: body.jobType }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.salaryRange !== undefined && { salaryRange: body.salaryRange || null }),
        ...(body.whyIApplied !== undefined && { whyIApplied: body.whyIApplied || null }),
        ...(body.interviewNotes !== undefined && { interviewNotes: body.interviewNotes || null }),
        ...(body.vibeCheck !== undefined && { vibeCheck: body.vibeCheck || null }),
        ...(body.companyResearch !== undefined && { companyResearch: body.companyResearch || null }),
        ...(body.salaryResearch !== undefined && { salaryResearch: body.salaryResearch || null }),
        ...(body.whatTheyExpect !== undefined && {
          whatTheyExpect: Array.isArray(body.whatTheyExpect)
            ? JSON.stringify(body.whatTheyExpect)
            : body.whatTheyExpect,
        }),
        ...(body.whatIExpect !== undefined && {
          whatIExpect: Array.isArray(body.whatIExpect)
            ? JSON.stringify(body.whatIExpect)
            : body.whatIExpect,
        }),
      },
    });

    return Response.json(application);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[PATCH application]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.jobApplication.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
