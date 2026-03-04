# BabyBedtimeTeller — Architecture Design & Implementation Plan

**Scope:** Local-only, fully functional, live Claude API connection
**Date:** 2026-03-03

---

## 1. System Overview

### Why a Backend Server (Even Locally)?

The browser cannot hold the Claude API key safely — it would be visible in DevTools to anyone on the machine. A local Express server acts as a secure proxy: the key lives in `.env`, the browser never sees it.

```
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│                 │  HTTP  │                      │  HTTPS │                 │
│  React Client   │ ──────▶│  Local Express       │ ──────▶│  Claude API     │
│  :5173          │  SSE   │  Server :3001        │        │  (Anthropic)    │
│                 │ ◀────── │                      │        │                 │
└─────────────────┘        └──────────┬───────────┘        └─────────────────┘
                                      │
                                      │ write
                                      ▼
                           ┌──────────────────────┐
                           │  SQLite (telemetry)  │
                           │  data/telemetry.db   │
                           └──────────────────────┘
```

**Data flow:**
1. User fills form → React sends `POST /api/story`
2. Server validates input, calls Claude with streaming enabled
3. Server pipes Claude's stream back to browser via **Server-Sent Events (SSE)**
4. Text renders word-by-word as it arrives (< 1s perceived wait)
5. On completion, server writes a telemetry record to SQLite

---

## 2. Project Structure

```
baby-bedtime-teller/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── StoryForm.jsx       # Input form
│   │   │   ├── StoryDisplay.jsx    # Streaming story renderer
│   │   │   └── MetricsBadge.jsx    # Dev-mode latency display
│   │   ├── hooks/
│   │   │   └── useStoryStream.js   # SSE consumer hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js              # Proxy /api to :3001
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── story.js                # POST /api/story  (SSE stream)
│   │   └── metrics.js              # GET  /api/metrics
│   ├── services/
│   │   ├── claude.js               # Claude API client + prompt builder
│   │   └── telemetry.js            # Write/query SQLite telemetry
│   ├── middleware/
│   │   ├── validate.js             # Input sanitization + schema check
│   │   └── rateLimit.js            # In-memory rate limiter
│   └── index.js                    # Express entrypoint
│
├── data/
│   └── telemetry.db                # SQLite (auto-created on first run)
│
├── .env                            # ANTHROPIC_API_KEY (never committed)
├── .env.example                    # Template for setup
├── .gitignore
└── package.json                    # Root: runs both client + server
```

---

## 3. Performance

### Streaming (Critical)
The biggest UX lever is **streaming**. Without it, parents wait 8–15 seconds staring at a spinner. With SSE streaming, text begins appearing within ~1 second.

- Server uses `claude.messages.stream()` from `@anthropic-ai/sdk`
- Server writes each `text_delta` as an SSE event: `data: {"chunk": "Once"}\n\n`
- Client `useStoryStream` hook reads the `EventSource`, appends each chunk to state
- React renders each new chunk instantly — no re-render of the whole story

### Prompt Sizing
Story length is controlled by explicit token limits in the Claude call:

| Length | max_tokens | Approx paragraphs |
|--------|-----------|-------------------|
| Short  | 350       | ~3                |
| Medium | 600       | ~5                |
| Long   | 900       | ~8                |

This caps generation time and cost per request.

### Local Dev Performance
- Vite proxies `/api` to `localhost:3001` (no CORS overhead in dev)
- SQLite writes are async and non-blocking (don't slow the response)
- No unnecessary middleware on the hot path

---

## 4. Security

| Risk | Mitigation |
|------|-----------|
| API key exposure | Stored in `.env` (server-side only), excluded from git |
| Prompt injection via user input | Input sanitized + max length enforced; user data injected into prompt as labelled data, not instructions |
| Runaway API costs | `max_tokens` hard cap per request; in-memory rate limit: 10 req/min per IP |
| XSS in story output | Story text rendered via React `textContent` — never set as raw HTML |
| CORS | Server only accepts requests from `localhost:5173` |
| Accidental secret commit | `.gitignore` covers `.env`; `.env.example` provides safe template |

### Input Validation Rules (server-side, via Zod)
```
name:        string, 1–50 chars, HTML stripped
age:         integer, 1–10
characters:  string, 1–200 chars, HTML stripped
length:      enum ["short", "medium", "long"]
```

Any request failing validation returns `400` with a safe error message — Claude is never called.

---

## 5. Data Modeling

### Core Entities

#### `story_requests` (SQLite table)
Captures every generation attempt for observability and prompt tuning.

```sql
CREATE TABLE story_requests (
  id                     TEXT PRIMARY KEY,  -- UUID v4
  created_at             INTEGER NOT NULL,  -- Unix ms timestamp
  child_age              INTEGER NOT NULL,
  story_length           TEXT NOT NULL,     -- 'short' | 'medium' | 'long'
  characters_count       INTEGER NOT NULL,  -- number of characters/themes provided

  -- Outcome
  status                 TEXT NOT NULL,     -- 'success' | 'error' | 'aborted'
  error_type             TEXT,              -- null on success

  -- Latency (primary success metric)
  time_to_first_token_ms INTEGER,           -- form submit to first word on screen
  total_generation_ms    INTEGER,           -- form submit to story complete

  -- Token usage (cost awareness)
  input_tokens           INTEGER,
  output_tokens          INTEGER,

  -- Model
  model_id               TEXT NOT NULL      -- e.g. 'claude-sonnet-4-6'
);
```

**What we deliberately exclude from storage:**
- Child's name, characters text, story content — no PII, no generated content persisted
- No user identity — fully anonymous

#### Data Lifecycle
- Records are **write-once** (no updates after insert)
- Local SQLite grows ~200 bytes per request
- At 10,000 records (~2MB): auto-archive old DB, start fresh (simple rotation)
- No deletion policy needed — records are non-sensitive

---

## 6. Observability

### Success Metric: "Under 30 seconds from landing to story"

We instrument two latency windows:

```
User clicks "Generate"
        │
        ├── [time_to_first_token_ms] ──▶ First word appears on screen
        │
        └── [total_generation_ms] ──────▶ Story fully complete
```

Both are measured client-side (most accurate for user experience) and sent to the server on stream completion via `POST /api/story/complete`.

### Metrics Endpoint
`GET /api/metrics` returns a JSON summary:

```json
{
  "period": "last_7_days",
  "total_requests": 142,
  "success_rate": 0.97,
  "p50_time_to_first_token_ms": 820,
  "p95_time_to_first_token_ms": 1800,
  "p50_total_generation_ms": 6400,
  "p95_total_generation_ms": 12000,
  "requests_under_30s_pct": 0.99,
  "by_length": {
    "short":  { "p50_ms": 3200 },
    "medium": { "p50_ms": 6400 },
    "long":   { "p50_ms": 9800 }
  },
  "error_breakdown": {
    "validation_error": 2,
    "api_error": 2
  }
}
```

This tells us directly whether we're hitting the 30-second target, and which story lengths are closest to the limit.

### Console Logging (Dev)
Each request logs a structured line on completion:
```
[story] id=abc123 age=4 length=medium ttft=812ms total=6240ms tokens=in:180/out:420 status=success
```

---

## 7. API Design

### `POST /api/story`
Initiates story generation. Returns an SSE stream.

**Request body:**
```json
{
  "name": "Lily",
  "age": 4,
  "characters": "a friendly dragon, the moon",
  "length": "medium"
}
```

**Response:** `Content-Type: text/event-stream`
```
data: {"type":"start","requestId":"abc123"}

data: {"type":"chunk","text":"Once upon a time"}

data: {"type":"chunk","text":", in a land"}

data: {"type":"done","inputTokens":180,"outputTokens":412}
```

On error:
```
data: {"type":"error","message":"Something went wrong. Please try again."}
```

### `GET /api/metrics`
Returns the observability summary JSON. No auth needed (local only).

### `POST /api/story/complete`
Client sends timing data after stream ends:
```json
{
  "requestId": "abc123",
  "timeToFirstTokenMs": 812,
  "totalGenerationMs": 6240
}
```

---

## 8. Prompt Design

The prompt is core product logic. It runs server-side only (never exposed to client).

```
System:
You are a warm, imaginative children's bedtime story author.
Write a soothing bedtime story for a {age}-year-old child.
Use simple, age-appropriate vocabulary.
The story should be calming and end with the child peacefully falling asleep.
Length: {lengthInstruction}
Write only the story text — no title, no preamble.

User:
The child's name is {name}.
Include these characters or themes: {characters}.
```

**Length instructions by selection:**
- Short: "3 short paragraphs, around 80 words"
- Medium: "5 paragraphs, around 150 words"
- Long: "7–8 paragraphs, around 250 words"

---

## 9. Implementation Plan

### Phase 1 — Project Scaffold
- [ ] Init monorepo with root `package.json` (use `concurrently` to run both)
- [ ] `client/` — Vite + React scaffold
- [ ] `server/` — Express + `@anthropic-ai/sdk` + `better-sqlite3` + `zod` installed
- [ ] `.env` + `.env.example` + `.gitignore`
- [ ] Vite proxy config (`/api` → `:3001`)
- [ ] Verify: `GET /api/health` returns `{ ok: true }`

### Phase 2 — Core Story Generation
- [ ] `server/services/claude.js` — prompt builder + streaming call
- [ ] `server/routes/story.js` — SSE endpoint wiring
- [ ] `server/middleware/validate.js` — Zod schema validation
- [ ] `server/middleware/rateLimit.js` — 10 req/min in-memory limiter
- [ ] Test end-to-end with `curl` before touching the frontend

### Phase 3 — Frontend
- [ ] `StoryForm.jsx` — controlled form with all 4 fields
- [ ] `useStoryStream.js` — EventSource hook, manages stream lifecycle + abort
- [ ] `StoryDisplay.jsx` — renders streaming text, handles loading/error states
- [ ] Connect: form submit → hook → display
- [ ] Apply chosen UI design (Concept 2: Night Sky)

### Phase 4 — Telemetry
- [ ] SQLite init via `better-sqlite3`
- [ ] `server/services/telemetry.js` — createRecord, updateRecord, aggregate queries
- [ ] Wire into story route (insert on stream start, update on stream end)
- [ ] `POST /api/story/complete` — receive client-side timing, patch record
- [ ] `GET /api/metrics` — aggregate query + JSON response

### Phase 5 — Polish & Error Handling
- [ ] Client: graceful error states (API down, validation failure, network abort)
- [ ] Client: abort in-flight request if user re-submits before stream ends
- [ ] Server: catch Claude API errors → emit safe SSE error event
- [ ] Confirm no PII reaches telemetry DB
- [ ] Full manual end-to-end test of happy path + error paths

### Phase 6 — Local Setup Docs
- [ ] `README.md` — install, add API key, `npm start`
- [ ] Cold-start verification: fresh clone → works in < 5 commands

---

## 10. Tech Stack Summary

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React + Vite | Fast dev server, component model |
| Backend | Node.js + Express | Lightweight, matches frontend language |
| AI | Claude API (`claude-sonnet-4-6`) | Best quality/speed for creative text |
| Streaming | Server-Sent Events (SSE) | Simpler than WebSockets for one-way stream |
| Telemetry DB | SQLite via `better-sqlite3` | Zero-config, local, fast, no daemon needed |
| Validation | Zod | Schema validation with precise error messages |
| Rate Limiting | `express-rate-limit` | Simple in-memory, no Redis needed locally |
| Dev runner | `concurrently` | Single `npm start` runs client + server |
