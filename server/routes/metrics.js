import { Router } from 'express';
import { getMetrics } from '../services/telemetry.js';

const router = Router();

router.get('/', (req, res) => {
  const metrics = getMetrics();
  if (!metrics) return res.json({ message: 'No telemetry data yet. Generate some stories first!' });
  res.json(metrics);
});

export default router;
