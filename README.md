# Job Application Webapp

A local, self-hosted web app to track job applications. Built with Next.js, Prisma, SQLite, and GitHub Models (GPT-4o).

## Features

- Kanban dashboard grouped by application status
- Magic Import — paste a job description and AI fills in the form
- Job detail and edit view
- AI-powered interview preparation (questions to ask, company insights, expected questions)

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
