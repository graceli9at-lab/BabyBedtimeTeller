import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import storyRouter from './routes/story.js';
import metricsRouter from './routes/metrics.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mock: process.env.MOCK_MODE === 'true' });
});

app.use('/api/story', storyRouter);
app.use('/api/metrics', metricsRouter);

app.listen(PORT, () => {
  console.log(`\n🌙 BabyBedtimeTeller server running at http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.MOCK_MODE === 'true' ? '🎭 MOCK (no API key needed)' : '🤖 LIVE AI'}\n`);
});
