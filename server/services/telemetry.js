import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const LOG_FILE = path.join(DATA_DIR, 'telemetry.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function logRequest(record) {
  ensureDataDir();
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(record) + '\n');
  } catch {
    // Telemetry is non-critical — never break the app over it
  }
}

export function getMetrics() {
  ensureDataDir();
  if (!fs.existsSync(LOG_FILE)) return null;

  const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n').filter(Boolean);
  const records = lines
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);

  if (!records.length) return null;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = records.filter((r) => r.created_at > sevenDaysAgo);
  const successes = recent.filter((r) => r.status === 'success');

  const percentile = (arr, p) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * p)];
  };

  const ttfts = successes.map((r) => r.time_to_first_token_ms).filter(Boolean);
  const totals = successes.map((r) => r.total_generation_ms).filter(Boolean);

  const byLength = {};
  for (const len of ['short', 'medium', 'long']) {
    const sub = successes
      .filter((r) => r.story_length === len)
      .map((r) => r.total_generation_ms)
      .filter(Boolean);
    byLength[len] = { p50_ms: percentile(sub, 0.5) };
  }

  const errorBreakdown = {};
  recent
    .filter((r) => r.status !== 'success')
    .forEach((r) => {
      const key = r.error_type || 'unknown';
      errorBreakdown[key] = (errorBreakdown[key] || 0) + 1;
    });

  return {
    period: 'last_7_days',
    total_requests: recent.length,
    success_rate: recent.length ? successes.length / recent.length : 0,
    p50_time_to_first_token_ms: percentile(ttfts, 0.5),
    p95_time_to_first_token_ms: percentile(ttfts, 0.95),
    p50_total_generation_ms: percentile(totals, 0.5),
    p95_total_generation_ms: percentile(totals, 0.95),
    requests_under_30s_pct: totals.length
      ? totals.filter((t) => t < 30000).length / totals.length
      : null,
    by_length: byLength,
    error_breakdown: errorBreakdown,
  };
}
