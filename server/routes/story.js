import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateStory } from '../middleware/validate.js';
import { storyRateLimit } from '../middleware/rateLimit.js';
import { generateStory } from '../services/claude.js';
import { logRequest } from '../services/telemetry.js';

const router = Router();

router.post('/', storyRateLimit, validateStory, async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { name, age, characters, length } = req.storyInput;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  send({ type: 'start', requestId });

  let firstTokenAt = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let status = 'success';
  let errorType = null;

  try {
    for await (const event of generateStory({ name, age, characters, length })) {
      if (event.type === 'chunk') {
        if (!firstTokenAt) firstTokenAt = Date.now();
        send(event);
      } else if (event.type === 'done') {
        inputTokens = event.inputTokens;
        outputTokens = event.outputTokens;
        send({ type: 'done' });
      }
    }
  } catch (err) {
    status = 'error';
    errorType = err.status === 429 ? 'rate_limit' : 'api_error';
    send({ type: 'error', message: 'Something went wrong. Please try again.' });
    console.error('[story] error:', err.message);
  } finally {
    const totalMs = Date.now() - startTime;
    const ttft = firstTokenAt ? firstTokenAt - startTime : null;

    logRequest({
      id: requestId,
      created_at: startTime,
      child_age: age,
      story_length: length,
      characters_count: characters.split(',').length,
      status,
      error_type: errorType,
      time_to_first_token_ms: ttft,
      total_generation_ms: totalMs,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model_id: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    });

    console.log(
      `[story] id=${requestId.slice(0, 8)} age=${age} length=${length} ` +
      `ttft=${ttft ?? 'n/a'}ms total=${totalMs}ms ` +
      `tokens=in:${inputTokens}/out:${outputTokens} status=${status}`
    );

    res.end();
  }
});

// Client-side timing report
router.post('/complete', (req, res) => {
  res.json({ ok: true });
});

export default router;
