# Job Application Webapp

A local, self-hosted web app to track job applications. Built with Next.js, Prisma, SQLite, and GitHub Models (GPT-4o).

## Features

- Kanban dashboard grouped by application status
- Magic Import — paste a job description and AI fills in the form
- Job detail and edit view with inline editing
- Job type support: Internship, Student Job, Part-time, Full-time
- AI-powered interview preparation (questions to ask, company insights, talking points, expected questions)
- AI salary research with Belgian/EU pay scale knowledge and pay transparency awareness

## Setup

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

Add a `.env` file:

```
DATABASE_URL="file:./dev.db"
GITHUB_TOKEN="your-github-token"
```

```bash
npm run dev
```

---

## How it works

### Dashboard

The home page shows all your applications as a Kanban board, grouped by status across five pipeline columns: **Applied → Recruiter Screen → Technical → Final Interview → Offer**. Draft and Rejected applications appear below as flat rows. Click any card to open the detail view.

### Adding an application

Click **+ Add Application** in the top right. You have two options:

**Magic Import (recommended)**
1. Find the job posting and copy all the text (title, company, requirements, salary, everything).
2. Paste it into the Magic Import text area at the top of the form.
3. Click **Parse with AI** — the form will auto-fill with the extracted data.
4. Review the fields, adjust anything that looks off, set the **Job Type**, **Location**, and **Status**, then click **Save Application**.

**Manual entry**
Fill in the form fields directly without using the parser.

### Job detail & editing

Click any application card to open the detail view. By default everything is read-only. Click **Edit** in the top right to edit all fields inline, including the **Location** field (e.g. "Leuven, Belgium"). Click **Save** when done.

The **Interview Scratchpad** at the bottom is always editable and auto-saves when you click away — use it for raw notes during or after interviews.

### Salary research

On any application's detail page, scroll to the **Salary Research** section. A yellow "No salary listed" badge appears when the posting didn't mention compensation. Click **Research Salary** and the AI will provide:

- **Gross estimate** — salary range based on official scales or market rates
- **Net take-home** — approximate monthly net using Belgian tax rules
- **How it was calculated** — step-by-step reasoning
- **Scale reference** — the specific barema or joint committee scale if applicable (e.g. *Barema A1 – Vlaamse overheid*, *PC 200*)
- **Location adjustment** — cost-of-living or regional differences (Brussels premium, remote work impact, etc.)
- **Benefits to factor in** — meal vouchers, eco cheques, 13th month, double holiday pay, group insurance, company car
- **Pay Transparency note** — how the EU Pay Transparency Directive (required by June 2026) applies to this role and sector

The AI has specific knowledge of Belgian government barema's, Flemish university and hogeschool scales, non-profit sector scales (Sociale Maribel, various PC's), and private sector market rates. Adding a precise **Location** (city + country) improves the estimate.

### Interview preparation

On any application's detail page, scroll to the **Interview Preparation** section.

1. Optionally type a focus in the text field, for example:
   - `"technical stack and tooling"`
   - `"internship learning goals"`
   - `"team culture and work-life balance"`
2. Click **Research** — the AI generates four sections tailored to the company, role, and job type:
   - **Questions to Ask** — thoughtful questions to put to the interviewer
   - **Company Insights** — things worth knowing about the company or industry
   - **Talking Points** — ways to show genuine interest and preparation in conversation
   - **Questions You May Be Asked** — likely interview questions with coaching tips on how to answer them (click each question to expand the tip)
3. The output is adapted to the **Job Type** — internship prep looks different from full-time prep.
4. Click **Regenerate** any time to get a fresh set, for example with a different focus.

Results are saved automatically and will be there next time you open the application.

### Profile

Click **Profile** in the nav bar to set up your personal profile. This is used to personalise salary estimates and interview preparation across all applications.

**CV Import (recommended)**
1. Copy your full CV text (from a PDF, Word doc, LinkedIn export, anything).
2. Paste it into the Import from CV text area.
3. Click **Parse CV** — the AI extracts your work experience, education, skills, and languages automatically.
4. Review the fields and click **Save Profile**.

**Manual entry**
Fill in the sections directly:
- Basic info: name, email, current title, location, summary
- Work experience: title, company, dates, description (mark current roles with the checkbox)
- Education: degree, field, institution, graduation year
- Skills: type and press Enter to add tags
- Languages: language + level (e.g. Native, B2, Fluent)

**How the profile is used**
- **Salary research** — your work history is used to calculate total years of experience and place you in the right seniority bracket, making estimates more accurate
- **Interview prep** — your current title, summary, and skills are passed to the AI so talking points and expected questions are tailored to your actual background

