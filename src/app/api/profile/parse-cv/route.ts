export async function POST(request: Request) {
  const { rawText } = await request.json();

  if (!rawText || rawText.trim().length < 50) {
    return Response.json({ error: "Please paste your CV text (at least 50 characters)." }, { status: 400 });
  }

  try {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
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
            content: `You are an expert CV parser. Extract structured profile data from raw CV text and return ONLY a valid JSON object — no markdown, no code fences.

The JSON must have exactly these fields:
{
  "name": "string or null",
  "email": "string or null",
  "currentTitle": "string or null — most recent job title",
  "location": "string or null — city, country",
  "summary": "string or null — professional summary or objective, max 3 sentences",
  "workExperience": [
    {
      "title": "string",
      "company": "string",
      "from": "string — e.g. 'Sep 2022'",
      "to": "string or null — e.g. 'Jun 2024', null if current",
      "current": true or false,
      "description": "string or null — brief summary of responsibilities"
    }
  ],
  "education": [
    {
      "degree": "string — e.g. 'Bachelor of Science'",
      "field": "string — e.g. 'Computer Science'",
      "institution": "string",
      "year": "string or null — graduation year or expected year"
    }
  ],
  "skills": ["array of skill strings"],
  "languages": [
    { "language": "string", "level": "string — e.g. 'Native', 'Fluent', 'B2'" }
  ]
}

Extract only what is present. Do not invent information.`,
          },
          {
            role: "user",
            content: `Parse this CV:\n\n${rawText}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `${res.status}: ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data.choices[0].message.content;
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return Response.json(JSON.parse(clean));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[parse-cv]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
