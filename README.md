![BetaBanner](/public/MesaBetaBanner.png)
# Mesa AI 👨‍🎓🧐
A complex **AI powered** study tool meant to promote reinforced learning and speed up notetaking by summarising lectures into *digestable* notebooks
- 📒 **Notebooks**: All-in-one interface to use sources (lecture notes, etc) as summary notes, chat context, and quiz material.
- 💬 **Chat**: Chat with your files, or upload any.
- 🤖 **Agent**: Use natural language to edit your notes.
- 📋 **Quiz**: Curiculum-based quiz questions, tailored to every subject. AI marking ensures your text answers fufil exam criterias.
- 📂 **Drive**: Store all lesson notes and files, automatically embedded and indexed.

## Demo credentials:
I don't recommend using this, since you'll be skipping out on the actual tutorials and onboarding flow, but if you want a basic test:
- Email: `test@mesa-ai.com`
- Password: `test1234`

*Please don't change the demo account password!*

## How it works
1. Files uploaded to the drive are first extracted, then chunked and embedded using a custom RAG pipeline.
2. All actions when generating notes, quizzes or chats use those chunked files to speed up generation time. Compared to just adding the files on every request, this RAG method saved about half the time neeeded
3. When generating notes, the model can choose from images extracted during upload and embed them into the notebook.
4. Afterwards, the actual note content is generated based on those topics.


All files are stored with Cloudflare R2, the database runs on Neon, and the website, along with the serverless functions, run on Vercel. Authentication is provided by Better-Auth, which is self-hosted. For AI, the ai-sdk, along with Vercel Gateway and OpenRouter is used. This tech stack is honestly one of the most complex ones I ever used ;p 

Most data fetching runs server side with ssr, which is something I haven't explored much until now. Developing is alot faster with ssr, and pages feel like they load more naturally now. CRUD actions also run on server actions, directly called by components like api calls without needing to handle errors manually. The amount of actions in this one project is honestly pretty crazy for me!

## Getting started

**Tutorial Video**

https://github.com/user-attachments/assets/b599a15f-33b4-4916-a0d5-e653a5ff6bd7

1. Navigate to the homepage: [https://mesa-ai.vercel.app](https://mesa-ai.vercel.app)
2. Create an account
3. Verify your email address
4. Engage in the tutorial! 🏫
5. You're all set up for using Mesa AI.

## Future plans
Here are a list of things I wanted to complete, but just didnt have the time to 😭:
- [] Mobile support for Notebooks
- [] Topics that are procedurely generated
- [] Add flashcards
- [] Freshen up UI (little umpolished here and there)
- [] Add a marking mode (AI marks papers for you)
- [] Collaboration & sharing noteboooks
- [] Code the dashboard page
 
## Self-hosting
Mesa AI is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
