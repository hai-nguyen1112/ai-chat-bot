import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the same folder as server.js
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Proxy route (frontend -> backend -> OpenAI)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Error contacting OpenAI' });
  }
});

app.listen(3000, () =>
  console.log(`Backend server running at ${process.env.APP_URL}`)
);
