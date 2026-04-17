import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET — fetch profile (or empty object if none)
export async function GET() {
  const profile = await prisma.userProfile.findUnique({ where: { id: "profile" } });
  return Response.json(profile ?? {});
}

// PUT — upsert full profile
export async function PUT(request: NextRequest) {
  const body = await request.json();

  try {
    const profile = await prisma.userProfile.upsert({
      where: { id: "profile" },
      create: {
        id: "profile",
        name: body.name || null,
        email: body.email || null,
        currentTitle: body.currentTitle || null,
        location: body.location || null,
        summary: body.summary || null,
        workExperience: body.workExperience ? JSON.stringify(body.workExperience) : null,
        education: body.education ? JSON.stringify(body.education) : null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        languages: body.languages ? JSON.stringify(body.languages) : null,
      },
      update: {
        name: body.name || null,
        email: body.email || null,
        currentTitle: body.currentTitle || null,
        location: body.location || null,
        summary: body.summary || null,
        workExperience: body.workExperience ? JSON.stringify(body.workExperience) : null,
        education: body.education ? JSON.stringify(body.education) : null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        languages: body.languages ? JSON.stringify(body.languages) : null,
      },
    });
    return Response.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
