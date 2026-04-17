export async function POST(request: Request) {
  const body = await request.json();
  const { rawText } = body;

  if (!rawText || typeof rawText !== "string" || rawText.trim().length < 50) {
    return Response.json(
      { error: "Please provide a job description (at least 50 characters)." },
      { status: 400 }
    );
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
              content: `You are an expert job posting analyst. Extract structured data from job descriptions and return ONLY a valid JSON object — no markdown, no code fences, no explanation.

The JSON must have exactly these fields:
{
  "companyName": "string",
  "companyWebsite": "string or null",
  "industry": "string or null",
  "jobTitle": "string",
  "jobUrl": "string or null",
  "locationType": "Remote" | "Hybrid" | "On-site",
  "salaryRange": "string or null",
  "whatTheyExpect": ["array", "of", "strings"],
  "whatIExpect": ["array", "of", "strings"],
  "whyIApplied": "string or null",
  "vibeCheck": "string or null"
}

Rules:
- Extract only what is explicitly stated; do not invent information.
- whatTheyExpect: list each required hard skill, soft skill, and experience item separately.
- whatIExpect: list every benefit, perk, or growth opportunity mentioned.
- locationType: infer from keywords — "remote", "hybrid", "in-office"; city-only listings default to On-site.
- salaryRange: include currency and period if inferable.
- vibeCheck: flag red flags (vague scope, buzzword overload, unrealistic requirements) and genuine positives.
- All string values must be clean — no markdown, no bullet prefixes.`,
            },
            {
              role: "user",
              content: `Extract structured job application data from this job description:\n\n${rawText}`,
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[parse-job] GitHub Models error:", res.status, errText);
      return Response.json(
        { error: `GitHub Models returned ${res.status}: ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const text: string = data.choices[0].message.content;

    // Strip markdown code fences if the model wraps its output
    const clean = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[parse-job]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
