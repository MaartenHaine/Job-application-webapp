import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (!app) return Response.json({ error: "Not found" }, { status: 404 });

  const jobType = (app as Record<string, unknown>).jobType as string ?? "Full-time";

  try {
    const res = await fetch(
      "https://models.inference.ai.azure.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a compensation research expert with deep knowledge of salary scales across sectors — including Belgian and European government barema's, university pay scales (Flemish universities, hogescholen, UC Leuven-Limburg, KU Leuven, UGent, etc.), non-profit scales, and private sector market rates.

Given a job, estimate realistic compensation and explain exactly how you arrived at it. Return ONLY a valid JSON object — no markdown, no code fences.

The JSON must have exactly these fields:
{
  "estimate": "string — the estimated salary or range, e.g. '€2,400–€2,800/month gross' or '€35,000–€42,000/year gross'",
  "basis": "string — one of: 'Official government scale', 'University/hogeschool scale', 'Non-profit CP scale', 'Market rate estimate', 'Internship/student rate'",
  "breakdown": ["array of strings explaining the reasoning step by step"],
  "scaleReference": "string or null — name of the specific scale or barema if applicable, e.g. 'Flemish government: salary scale A1' or 'PC 330 non-profit'",
  "notes": "string or null — important caveats, e.g. seniority impact, year-end premiums, benefits that offset lower base, student/intern limitations"
}

Be specific. If you know the actual scale, cite it. For Belgian government or education roles always try to identify the correct barema. For internships, note the legal minimum or typical rates. For private companies, use industry and seniority signals.`,
            },
            {
              role: "user",
              content: `Research the expected compensation for this role:

Company: ${app.companyName}
Industry: ${app.industry ?? "unknown"}
Job title: ${app.jobTitle}
Job type: ${jobType}
Location type: ${app.locationType}
${app.salaryRange ? `Salary mentioned in posting: ${app.salaryRange}` : "No salary was mentioned in the job posting."}
${app.whyIApplied ? `Additional context: ${app.whyIApplied}` : ""}

Provide a detailed salary estimate with reasoning.`,
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[salary] GitHub error:", res.status, errText);
      return Response.json({ error: `${res.status}: ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data.choices[0].message.content;
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const result = JSON.parse(clean);

    await prisma.jobApplication.update({
      where: { id },
      data: { salaryResearch: JSON.stringify(result) },
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[salary]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
