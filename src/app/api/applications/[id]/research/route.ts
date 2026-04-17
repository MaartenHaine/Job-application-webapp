import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const JOB_TYPE_CONTEXT: Record<string, string> = {
  Internship:
    "This is an internship. Focus on learning opportunities, mentorship, day-to-day tasks, team culture, and what a successful intern looks like. Avoid long-term career trajectory questions. Expected questions will focus on motivation, curiosity, and basic skills.",
  "Student Job":
    "This is a student job alongside studies. Questions should address scheduling flexibility, practical skills, and short-term fit. Expected questions will be straightforward and practical.",
  "Part-time":
    "This is a part-time role. Questions should address scope, team integration, hours, and growth potential within those constraints. Expected questions will probe availability and reliability.",
  "Full-time":
    "This is a full-time position. Questions can cover long-term growth, team structure, company direction, and career development. Expected questions will be comprehensive.",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const focus: string = body.focus ?? "";

  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (!app) return Response.json({ error: "Not found" }, { status: 404 });

  const whatTheyExpect = parseJsonArray(app.whatTheyExpect);
  const jobType = (app as Record<string, unknown>).jobType as string ?? "Full-time";
  const jobTypeContext = JOB_TYPE_CONTEXT[jobType] ?? JOB_TYPE_CONTEXT["Full-time"];

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
              content: `You are a career coach helping a candidate prepare for a job interview. Given information about a company and role, produce a research brief. Return ONLY a valid JSON object — no markdown, no code fences.

The JSON must have exactly these fields:
{
  "questions": ["array of 6-8 thoughtful questions to ask the interviewer"],
  "insights": ["array of 4-6 interesting facts or things worth knowing about the company or industry"],
  "talkingPoints": ["array of 4-5 talking points that show genuine interest and preparation"],
  "expectedQuestions": [
    { "question": "string", "tip": "string" }
  ]
}

For expectedQuestions: provide 6-8 questions the interviewer is likely to ask the candidate, each with a short coaching tip on how to approach the answer well.

Job type context: ${jobTypeContext}
${focus ? `The candidate wants to focus on: ${focus}. Weight the questions, insights, and talking points accordingly.` : ""}

For questions to ask: mix strategic ones (company direction, team dynamics, success metrics) with role-specific ones. Avoid generic HR questions.
For insights: focus on things that would impress — market position, tech stack signals, culture signals.
For talkingPoints: concrete ways the candidate can reference company knowledge naturally in conversation.
All string values must be clean — no markdown, no bullet prefixes.`,
            },
            {
              role: "user",
              content: `Company: ${app.companyName}
Industry: ${app.industry ?? "unknown"}
Role: ${app.jobTitle}
Job type: ${jobType}
Location: ${app.locationType}
${whatTheyExpect.length ? `Key requirements: ${whatTheyExpect.slice(0, 8).join(", ")}` : ""}
${app.vibeCheck ? `Vibe check notes: ${app.vibeCheck}` : ""}
${app.whyIApplied ? `Why I applied: ${app.whyIApplied}` : ""}
${focus ? `My focus for this research: ${focus}` : ""}

Generate a research brief to help me prepare for this interview.`,
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[research] GitHub error:", res.status, errText);
      return Response.json({ error: `${res.status}: ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data.choices[0].message.content;
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const research = JSON.parse(clean);

    await prisma.jobApplication.update({
      where: { id },
      data: { companyResearch: JSON.stringify(research) },
    });

    return Response.json(research);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[research]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
