# C4-Bot Assistant (assistant-app)

This is a small Next.js (App Router) demo app that implements the C4-Bot assistant UI for Code4.

Features included:
- Floating robot avatar with cursor-follow, blink and wave on load
- Glassmorphism chat panel with quick-action suggestions and canned responses
- Framer Motion animations, Tailwind CSS styling

To run locally:

1. cd assistant-app
2. npm install
3. npm run dev

Open http://localhost:3000

Notes:
- This is a standalone demo so you can preview and iterate. The key components are in `components/ai`:
  - `RobotAssistant.tsx` — orchestrator + state
  - `RobotAvatar.tsx` — SVG avatar with animated eyes
  - `ChatPanel.tsx` — chat UI and quick actions
- Optional advanced features (OpenAI integration, voice, server-side hooks) are noted in code comments.
