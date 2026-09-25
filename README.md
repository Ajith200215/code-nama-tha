# code-nama-tha (CodeArena)

CodeArena is a guided-learning coding platform with 4-level AI assistance, AI code reviews, custom multiplayer rooms, and an AI code explainer. Built with Next.js 15, Tailwind CSS, Supabase, Monaco Editor, Judge0, and Groq.

## Features

- **4-Level Assistance**: Pick your difficulty level per problem (L3 gives 90% code, L0 gives empty editor).
- **AI Code Review**: AI analyzes time/space complexity and provides a reference solution when you solve a problem at Level 0.
- **Code Explainer**: Paste any code to get beginner-friendly explanations with analogies.
- **Custom Rooms**: Create rooms, invite friends via short codes, solve daily problems, and track live leaderboards.
- **AI Topic Practice**: Let AI generate a custom, graded problem set (with test cases and reference solutions) on any topic.

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (DoDo design system tokens)
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Database & Auth**: Supabase (Postgres, Auth, Realtime)
- **Code Execution**: Judge0 CE API
- **AI Provider**: Groq (`openai/gpt-oss-20b`) via `groq-sdk`
- **Validation**: Zod
- **Markdown**: `react-markdown` + `remark-gfm`

## Getting Started

### 1. Environment Variables

Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required keys:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your Supabase project dashboard.
- `GROQ_API_KEY`: Get a free key from the [Groq Console](https://console.groq.com).
- `JUDGE0_URL`: RapidAPI Judge0 endpoint URL or your self-hosted Judge0 URL.
- `JUDGE0_API_KEY`: RapidAPI Key (if using the RapidAPI hosted version).

### 2. Database Setup

The Supabase migrations are located in `supabase/migrations/`. 
To apply them to your local or remote Supabase instance, use the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

*Note: Ensure the `00002_fix_room_rls.sql` migration is applied to fix the room members recursive policy.*

### 3. Run Development Server

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Judge0 Setup (Production)

For production, **never run user code directly on your web server.** We recommend hosting Judge0 CE on a separate VPS:

1. Provision a VPS (e.g., DigitalOcean Droplet, AWS EC2) with Docker installed.
2. Follow the [Judge0 CE Installation Guide](https://github.com/judge0/judge0/blob/master/CHANGELOG.md).
3. Secure the Judge0 API port and configure an API key for access.
4. Update `JUDGE0_URL` and `JUDGE0_API_KEY` in your production environment variables.

## Security Overview

- **Row Level Security (RLS)**: Enabled on all tables. Users can only access their own custom problems, and room data is restricted to room members.
- **AI Quotas**: API limits enforced per user in the `ai_usage` table to prevent abuse (e.g., 5 generations/day for custom problems).
- **Execution Sandboxing**: All user code is executed securely in Docker containers via Judge0. No secrets are leaked to the client bundle.
- **AI Validation**: Zod schemas strictly enforce the structure of generated code before persisting it to the database.
