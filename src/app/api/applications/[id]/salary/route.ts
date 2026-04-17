import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [app, profile] = await Promise.all([
    prisma.jobApplication.findUnique({ where: { id } }),
    prisma.userProfile.findUnique({ where: { id: "profile" } }),
  ]);
  if (!app) return Response.json({ error: "Not found" }, { status: 404 });

  const jobType = (app as Record<string, unknown>).jobType as string ?? "Full-time";
  const location = (app as Record<string, unknown>).location as string | null;

  // Build profile context for the prompt
  let profileContext = "";
  if (profile) {
    const workExp: Array<{ title: string; company: string; from: string; to: string | null; current: boolean }> = profile.workExperience
      ? (() => { try { return JSON.parse(profile.workExperience); } catch { return []; } })()
      : [];
    const edu: Array<{ degree: string; field: string; institution: string; year: string | null }> = profile.education
      ? (() => { try { return JSON.parse(profile.education); } catch { return []; } })()
      : [];
    const skills: string[] = profile.skills
      ? (() => { try { return JSON.parse(profile.skills); } catch { return []; } })()
      : [];

    const expYears = workExp.length > 0
      ? workExp.map(w => {
          const start = parseInt(w.from?.match(/\d{4}/)?.[0] ?? "0");
          const end = w.current ? new Date().getFullYear() : parseInt(w.to?.match(/\d{4}/)?.[0] ?? "0");
          return isNaN(start) || isNaN(end) ? 0 : end - start;
        }).reduce((a, b) => a + b, 0)
      : null;

    profileContext = `
Candidate profile:
${profile.name ? `Name: ${profile.name}` : ""}
${profile.currentTitle ? `Current title: ${profile.currentTitle}` : ""}
${expYears !== null ? `Total experience: ~${expYears} years` : ""}
${workExp.length > 0 ? `Recent experience: ${workExp.slice(0, 3).map(w => `${w.title} at ${w.company}`).join(", ")}` : ""}
${edu.length > 0 ? `Education: ${edu.map(e => `${e.degree} in ${e.field} (${e.institution})`).join(", ")}` : ""}
${skills.length > 0 ? `Skills: ${skills.slice(0, 15).join(", ")}` : ""}
${profile.location ? `Candidate location: ${profile.location}` : ""}`.trim();
  }

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
              content: `You are a compensation research expert specialising in Belgian and European labour markets. You have deep knowledge of:

- Belgian government barema's (federal, Flemish, Walloon, local)
- University and hogeschool pay scales (KU Leuven, UGent, VUB, UCLouvain, UC Leuven-Limburg, Arteveldehogeschool, etc.)
- Joint committee scales (Paritair Comité / PC): PC 200, PC 218, PC 330, PC 319, etc.
- Non-profit and social sector scales (Sociale Maribel, etc.)
- Private sector market rates by industry and seniority
- Regional cost-of-living differences within Belgium (Brussels premium, Ghent/Antwerp vs smaller cities)
- Student job and internship legal minimums (Belgian student flexi-job rules, stage vergoeding)
- Belgian salary components: gross vs net conversion (~65–70% rule of thumb), meal vouchers, eco cheques, 13th month, holiday pay (dubbel vakantiegeld), group insurance, hospitalization insurance, company car BIK
- EU Pay Transparency Directive (2023/970): EU member states must implement by June 2026, requiring employers to disclose salary ranges in job postings and provide pay progression information. Belgium is transposing this into national law. This means salary data will become increasingly public — your estimates should align with what will eventually be disclosed.

Given a job, estimate realistic compensation with full reasoning. Return ONLY a valid JSON object — no markdown, no code fences.

{
  "estimate": "string — gross salary range, e.g. '€2,400–€2,800/month gross' or '€35,000–€42,000/year gross'",
  "netEstimate": "string or null — approximate net monthly take-home if calculable, noting assumptions",
  "basis": "string — one of: 'Official government scale', 'University/hogeschool scale', 'Joint committee scale', 'Non-profit sector scale', 'Market rate estimate', 'Internship/student rate'",
  "breakdown": ["array of strings — step-by-step reasoning"],
  "scaleReference": "string or null — specific scale name, e.g. 'Barema A1 – Vlaamse overheid' or 'PC 200 – bedienden'",
  "locationAdjustment": "string or null — note any location-specific factors, e.g. Brussels expat premium, remote work impact on location-based pay",
  "benefitsToFactor": ["array of common benefits for this type of role that offset the base salary"],
  "payTransparencyNote": "string or null — any relevant note about upcoming Belgian/EU pay transparency rules and what they mean for this role",
  "notes": "string or null — caveats: seniority, experience level, negotiation room, etc."
}`,
            },
            {
              role: "user",
              content: `Research compensation for this role:

Company: ${app.companyName}
Industry: ${app.industry ?? "unknown"}
Job title: ${app.jobTitle}
Job type: ${jobType}
Work arrangement: ${app.locationType}
${location ? `Location: ${location}` : "Location: not specified"}
${app.salaryRange ? `Salary mentioned in posting: ${app.salaryRange}` : "No salary was mentioned in the job posting."}
${app.whyIApplied ? `Additional context: ${app.whyIApplied}` : ""}
${profileContext ? `\n${profileContext}\n\nUse the candidate's experience and education level to adjust the salary estimate to the appropriate seniority bracket.` : ""}

Provide a detailed salary estimate with full reasoning, location adjustments, and benefit context.`,
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
