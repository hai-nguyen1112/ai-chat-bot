## AI Chat Bot

A full-stack AI-powered chat application built with React, NodeJS and OpenAI API.

Demo: https://ai-chat-bot-hai-nguyen.vercel.app/

- Developed a responsive chat application using React, managing state with hooks for clean and scalable architecture.
- Powered real-time AI conversations using OpenAI API with streaming responses.
- Managed chat history and session state locally, with optional support for future expansion to a database.
- Built a responsive UI with Flexbox and CSS Grid, optimized for mobile and desktop.
- Implemented features like emoji picker, typing indicators, and scroll-to-bottom for a smooth UX.
- Ensured accessibility and usability with keyboard navigation, focus management, and responsive input handling.
- Optimized performance by preventing unnecessary re-renders.

## Getting Started

### Run The Backend

```bash
cd backend
npm install
npm run server
```

The backend server should be up and running at http://localhost:3000

Open another termial to run the frontend.

### Run The Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Important Note: The installation command for the UI needs the flag --legacy-peer-deps because React 19 hasn't supported emoji-mart library yet.

The UI should be up and running at http://localhost:5173
