# BabyBedtimeTeller — Product Requirements Document

**Version:** 1.0
**Date:** March 2026
**Status:** Draft

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Business Success Metrics](#2-business-success-metrics)
3. [Personas & Key User Journeys](#3-personas--key-user-journeys)
4. [Technical Success Metrics](#4-technical-success-metrics)
5. [Scope of MVP](#5-scope-of-mvp)
6. [Tech Considerations](#6-tech-considerations)
7. [UI Style](#7-ui-style)
8. [Corner Cases](#8-corner-cases)

---

## 1. Problem Statement

### Background

Parents of young children (ages 3–5) face one of the most exhausting moments of their day at bedtime. After a full day of work, caregiving, and household responsibilities, they are expected to summon the energy and creativity to tell a calming, engaging bedtime story — often while the child resists sleep.

### Core Problem

**Parents are exhausted at end of day and simply want their child to fall asleep as quickly as possible.** The bedtime routine is a daily pressure point with two compounding pain points:

1. **The creativity tax** — Coming up with a new, engaging, and calming story every night is mentally draining for tired parents.
2. **The dependency problem** — Children rely on a parent being physically present and actively performing the story. If the parent has to leave (second child, work call, their own sleep needs), the routine breaks down.

### What We're Solving

BabyBedtimeTeller eliminates both pain points by generating personalized, sleep-optimized bedtime stories on demand — narrated by a soothing AI voice that a child can listen to independently, without a parent needing to be in the room.

For parents who prefer to read aloud themselves, a **Parent Read-Along Mode** provides the story as text, removing the creative burden while keeping them in the ritual.

### Who Is Not the Problem

- Parents who enjoy the creative bedtime storytelling ritual and want to preserve it
- Children who require physical comfort (not just audio) to fall asleep
- Children outside the 3–5 age range (out of MVP scope)

---

## 2. Business Success Metrics

### Acquisition
| Metric | MVP Target (Month 3) |
|---|---|
| Total registered users | 5,000 |
| Weekly new signups | 500+ |
| Story generations (including anonymous) | 20,000+ |

### Engagement & Retention
| Metric | Target |
|---|---|
| D7 retention | ≥ 35% |
| D30 retention | ≥ 20% |
| Avg. stories generated per active user/week | ≥ 3 |
| % of sessions where audio plays to completion | ≥ 65% |
| % of users who return the next night | ≥ 40% |

### Monetization (Freemium)
| Metric | Target |
|---|---|
| Free → Premium conversion rate | ≥ 5% |
| Monthly Recurring Revenue (MRR) at Month 6 | $X (to be defined) |
| Premium churn rate (monthly) | ≤ 8% |

### Sleep Outcome Proxy
| Metric | Target |
|---|---|
| % of sessions where story plays fully before sleep sounds activate | ≥ 70% |
| Average time from story start to session end (proxy for sleep onset) | ≤ 20 min |
| User-reported satisfaction (in-app survey) | ≥ 4.2 / 5.0 |

---

## 3. Personas & Key User Journeys

### Persona 1 — The Depleted Parent

**Name:** Sarah, 34
**Occupation:** Working mom, two kids (ages 3 and 5)
**Context:** Gets home at 6:30pm, manages dinner, bath, and bedtime solo several nights a week. By 8pm she has nothing left.
**Goal:** Get both kids to sleep with minimal effort so she can decompress
**Frustration:** "I love storytelling but some nights I just can't. I feel guilty reaching for my phone but I have nothing to give."
**Tech comfort:** High — uses apps daily, has no patience for friction
**Device:** iPhone, sometimes tablet propped up in child's room

#### Journey 1A — AI Voice Mode (Premium)

```
1. TRIGGER
   Sarah finishes bath time. Child is in bed. It's 8:10pm.

2. OPEN APP
   Opens BabyBedtimeTeller on phone. Taps "Generate Story."

3. CONFIGURE (< 30 seconds)
   Selects theme: "Animals in the forest"
   Story length: Medium (~5 min)
   One tap to confirm.

4. INITIATE PLAYBACK
   Sarah taps the single large Play button.
   Story auto-generates and begins playing immediately.
   Screen dims to dark mode.

5. HAND OFF & LEAVE
   Sarah places the device on the nightstand and walks out.
   The AI voice narrates the story — calm, warm, gradually slowing.

6. STORY ENDS
   Story fades naturally. Background sleep sounds (soft rain) begin.
   Audio continues until the app's auto-stop timer expires.

7. OUTCOME
   Child is asleep. Sarah did not have to stay in the room.
```

#### Journey 1B — Parent Read-Along Mode (Free)

```
1. TRIGGER
   Same context. Sarah wants to be present but has no story ideas.

2. OPEN APP
   Opens app, taps "Generate Story."
   Selects theme: "Space adventure"

3. STORY DISPLAYS AS TEXT
   A beautifully formatted story appears on screen.
   Large, readable font. Night-mode display.

4. SARAH READS ALOUD
   She reads the story to her child at her own pace.
   No AI voice. She's in control of pacing and performance.

5. OUTCOME
   Child falls asleep. Sarah had a story ready in seconds
   without any creative effort.
```

---

### Persona 2 — The Child Listener

**Name:** Leo, 4 years old
**Context:** Loves stories about dinosaurs and dragons. Sometimes gets out of bed after parents leave.
**Goal:** Be entertained until he falls asleep
**Behavior:** Can't read, limited fine motor coordination, responds to voice and sound
**Key need:** Does not need to touch the app for it to work

#### Journey 2A — Autonomous Listening

```
1. Parent has already started the story (Journey 1A above).
   Leo is in bed, device is playing.

2. LISTENING
   Leo listens to the story. The narration is warm, slightly slow.
   Illustrations gently appear as the story progresses.

3. VOICE INTERACTION (optional)
   Leo whispers "tell me more about the dragon."
   App recognizes voice input and gently weaves in a brief response
   without breaking the sleep-inducing flow.

4. SLEEP SOUNDS TRANSITION
   Story ends. Soft rain sounds fade in.
   Leo is asleep or close to it.

5. OUTCOME
   Leo did not need a parent in the room.
   Screen stayed dark. Audio continued gently.
```

---

### Persona 3 — The Co-Parent / Grandparent

**Name:** David, 62 (grandfather babysitting)
**Context:** Watching the grandchild for the evening. Not confident making up stories.
**Goal:** Get the child to bed without feeling lost or incompetent
**Key need:** Extremely simple flow — no learning curve

#### Journey 3A — First-Time Anonymous Use

```
1. David opens the web app on his phone. No account. No login.

2. ZERO CONFIGURATION
   He taps "Generate a story" — the app picks sensible defaults
   (age-appropriate theme, medium length).

3. STORY PLAYS
   He presses Play. The story starts immediately.
   He places the phone near the child and waits.

4. OUTCOME
   Child falls asleep. David did not need to understand settings,
   log in, or make any decisions beyond one tap.
```

---

## 4. Technical Success Metrics

| Metric | Target |
|---|---|
| Story generation time (text) | ≤ 4 seconds |
| Time to first audio byte (TTS streaming) | ≤ 2 seconds after generation |
| AI image generation time | ≤ 6 seconds (non-blocking, loads after audio starts) |
| App availability / uptime | ≥ 99.5% |
| Voice command recognition success rate | ≥ 80% for clear child speech |
| Audio completion rate (story plays to end) | ≥ 90% of initiated sessions |
| TTS naturalness rating (internal eval) | ≥ 4.0 / 5.0 |
| Story content safety pass rate | 100% (zero inappropriate outputs in production) |
| Core Web Vitals — LCP | ≤ 2.5s |
| Core Web Vitals — CLS | ≤ 0.1 |

---

## 5. Scope of MVP

### In Scope

#### Story Generation
- [ ] AI-generated bedtime stories (LLM-powered) for ages 3–5
- [ ] Theme selection: 5 free themes (e.g. forest animals, ocean, dinosaurs, fairies, space) + 10+ premium themes
- [ ] Medium story length (~5 min listen time, ~400–600 words)
- [ ] Sleep-optimized narrative arc: starts engaging, gradually slows in pace, characters fall asleep by the end
- [ ] Gradual narration slow-down: AI voice speed decreases by ~20% over the course of the story

#### Two Core Modes
- [ ] **AI Voice Mode (Premium):** Story auto-plays via ElevenLabs-style AI voice upon parent initiating playback
- [ ] **Parent Read-Along Mode (Free):** Story displayed as formatted text for parent to read aloud

#### Audio & Post-Story Experience
- [ ] Sleep sound fade-in after story ends (soft rain, white noise, gentle lullaby — user selects)
- [ ] Screen auto-dims to near-black 10 seconds after playback begins
- [ ] Auto-stop timer: audio stops after 30 minutes if no interaction

#### Voice Interaction (Premium)
- [ ] Child can make simple voice requests mid-story (e.g. "more dragons")
- [ ] App acknowledges and gently incorporates request without disrupting sleep arc
- [ ] Wake word or continuous listening (TBD — see tech considerations)

#### AI Illustrations (Premium)
- [ ] 2–3 AI-generated images per story, displayed as soft transitions
- [ ] Images load non-blocking (audio starts first, images appear within 6s)
- [ ] Age-appropriate, soft art style consistent with dreamy UI

#### Accounts & Story Saving
- [ ] Anonymous generation: no account required
- [ ] Optional sign-up (email or Google OAuth)
- [ ] Logged-in users: save up to 5 stories (free) / unlimited (premium)
- [ ] Saved stories playable offline (premium, after initial load)

#### Freemium Model
| Feature | Free | Premium |
|---|---|---|
| Story generation | ✓ (3/day) | ✓ Unlimited |
| Parent Read-Along Mode (text) | ✓ | ✓ |
| AI Voice narration | ✗ | ✓ |
| AI Illustrations | ✗ | ✓ |
| Sleep sound fade-in | ✗ | ✓ |
| Voice interaction | ✗ | ✓ |
| Theme selection | 5 basic themes | 15+ themes |
| Story saving | ✗ | ✓ |
| Screen auto-dim | ✓ | ✓ |

### Out of Scope for MVP
- Native iOS / Android app
- Multiple child profiles per account
- Custom character creation (e.g. add a pet or sibling)
- Multi-language support
- Parental dashboard / sleep tracking
- Story sharing (link-based)
- Social / community features
- Integration with smart speakers (Alexa, Google Home)

---

## 6. Tech Considerations

### Stack Recommendation (Web App)
| Layer | Recommendation | Notes |
|---|---|---|
| Frontend | Next.js (React) | SSR for fast initial load, good PWA support |
| Hosting | Vercel | Easy CI/CD, edge network |
| LLM (story gen) | Claude (claude-sonnet-4-6) | Strong narrative quality, safety filters |
| TTS / Voice | ElevenLabs | Best-in-class naturalness, streaming API |
| Image gen | DALL-E 3 or Stability AI | Soft, illustrated art style; non-blocking |
| Voice recognition | Web Speech API (browser-native) | Free, no extra dependency; limited on iOS Safari |
| Auth | Supabase Auth (or Clerk) | Fast to implement, supports Google OAuth |
| Database | Supabase (Postgres) | Story storage, user profiles |
| Payments | Stripe | Industry standard, easy subscription setup |
| Audio | Howler.js | Reliable cross-browser audio management |

### Critical Technical Flags

#### 1. Browser Autoplay Restriction ⚠️
Web browsers block audio from auto-playing without a prior user gesture. The app **cannot** start playing audio the instant it loads — a parent must tap at least once (the Play button) before audio begins. This is a hard browser security constraint and cannot be worked around. Design must accommodate a clear, single-tap Play action.

#### 2. Web Speech API on iOS Safari ⚠️
The Web Speech API (for voice recognition) has limited and inconsistent support on iOS Safari. Child voice commands may not work reliably on iPhones without a fallback. Consider:
- Testing on target devices early
- Offering a "tap to add more" fallback for voice interaction
- Evaluating a third-party speech SDK (e.g. Deepgram) as an alternative

#### 3. Continuous Listening vs. Wake Word
For child voice interaction, decide between:
- **Continuous listening:** Always on, higher battery/compute cost, more false positives from room noise
- **Wake word:** Child says "Hey Story" — more deliberate but adds friction for a 3–5 year old
- **Recommendation for MVP:** Short polling window after each story chapter ends — listen for 5 seconds, then continue

#### 4. LLM Content Safety
All story outputs must pass content safety filtering before display. Implement:
- Claude's built-in safety settings at max moderation
- A secondary keyword/pattern check for edge cases
- Zero-tolerance policy: if a story fails safety check, silently regenerate rather than surface error to child

#### 5. ElevenLabs Streaming Latency
ElevenLabs supports streaming TTS — audio can begin playing while the full audio is still being generated. Use streaming to hit the ≤ 2s time-to-first-audio target. Buffer at least 5 seconds of audio before playback starts to prevent mid-story stalls.

#### 6. AI Image Generation Cost & Speed
DALL-E 3 images take 5–15 seconds to generate. To avoid blocking the experience:
- Start story audio immediately
- Generate images in parallel (non-blocking)
- Display a soft animated placeholder until images load
- Cache images per story session to avoid re-generation

#### 7. Screen Dimming on Web
JavaScript cannot force system-level screen brightness. Instead:
- Overlay a near-black semi-transparent layer over the UI after playback starts
- Keep one small, dim touch area visible in case parent needs to pause
- Add a "wake screen" tap gesture that lifts the overlay temporarily

---

## 7. UI Style

### Direction: Soft & Dreamy

The visual design should feel like stepping into a quiet, cozy night. It should be calming for both the exhausted parent and the sleepy child — low stimulation, warm, and gentle.

### Color Palette
- **Primary background:** Deep midnight blue (`#0D1B2A`) — night sky
- **Surface cards:** Soft lavender mist (`#E8E0F0`) — gentle, not harsh white
- **Accent:** Warm moon gold (`#F4C976`) — stars, highlights
- **Text:** Soft cream (`#F5F0E8`) on dark, `#2C1F3E` on light
- **Sleep sounds / ambient:** Muted sage green (`#8BAF9A`)

### Typography
- **Display / headings:** Rounded serif (e.g. Lora or Playfair Display) — storybook feel
- **Body / story text:** Comfortable reading serif, large line-height (1.9) for easy read-along
- **UI elements:** Inter or Nunito — clean, friendly

### Design Principles
- **One thing per screen** — never overwhelm a tired parent with options
- **Large tap targets** — minimum 56px for all interactive elements (parent using phone while half asleep)
- **No bright whites** — all surfaces use warm, muted tones to protect night vision
- **Animation:** Slow, gentle transitions only (stars twinkling, clouds drifting) — nothing jarring
- **Illustrations:** Watercolor-style, soft edges, dreamy characters

### Key Screens
1. **Home** — Minimal: App name, "Generate a Story" CTA, one-line value prop
2. **Configure** — Theme picker (illustrated cards), length toggle, mode toggle (AI Voice / Read-Along)
3. **Playback** — Full-screen dark experience: story text fades in gently, AI illustration as ambient background, audio controls minimally visible at bottom
4. **Story complete** — Soft fade to sleep sounds screen with a single dim pulsing moon icon

---

## 8. Corner Cases

### Story Generation
| Scenario | Handling |
|---|---|
| LLM generates inappropriate content | Silent regeneration; never surface the failed output to the child |
| LLM takes > 8 seconds to respond | Show a gentle animated "brewing your story..." screen; timeout at 15s and offer retry |
| Same theme selected repeatedly | Inject variation seeds into the prompt to ensure different stories each time |
| Story too long or too short | Validate word count (350–700 words) before sending to TTS; regenerate if out of range |

### Audio & Playback
| Scenario | Handling |
|---|---|
| Browser blocks autoplay | Parent must tap Play; design a clear, prominent, single-action screen for this |
| Audio fails to load (network issue) | Fall back to Read-Along Mode automatically; notify parent with a soft banner |
| Child makes loud noise mid-story | Voice detection must use confidence threshold (≥ 0.8) to avoid false positives from crying, coughing |
| ElevenLabs API is down | Fall back to browser-native TTS (Web Speech API) as emergency backup — lower quality but functional |
| Device locked by OS during playback | Use Web Audio API + wake lock request to prevent screen/audio interruption where possible |

### Voice Interaction
| Scenario | Handling |
|---|---|
| Child's speech not recognized (age, accent) | Silent no-op — story continues uninterrupted; do not play an error sound |
| Child asks for something inappropriate | Filter voice input; respond with a gentle redirect woven into the story narrative |
| Multiple voices in room (parents talking) | Apply voice activity detection to only process child-level audio (lower amplitude, higher pitch) |
| Child says "stop" or "no more" | Pause playback; show soft prompt for parent |

### Authentication & Data
| Scenario | Handling |
|---|---|
| Anonymous user tries to save a story | Prompt to create account with a soft, non-blocking modal |
| User loses internet mid-story (anonymous) | Story text already rendered — continue Read-Along; audio may buffer/stall; show gentle offline indicator |
| Premium subscription lapses | Gracefully downgrade to free tier; saved stories remain accessible in read-only mode |
| User deletes account | Hard delete all personal data within 30 days (GDPR/CCPA compliance) |

### Device & Platform
| Scenario | Handling |
|---|---|
| iOS Safari Web Speech API unsupported | Disable voice interaction feature gracefully; show "Voice not supported on this browser" with upgrade hint |
| Screen dimming CSS blocked by browser | Fail gracefully — UI remains visible; this is a nice-to-have, not a blocker |
| Very slow internet (generating images) | Images are non-blocking; show soft shimmer placeholder; story audio plays regardless |
| Parent accidentally closes the browser tab | Story state is not recoverable (anonymous); logged-in users can reload and resume from saved story |

### Child Safety & Content
| Scenario | Handling |
|---|---|
| Child interacts with payment UI | All payment flows are parent-gated and not reachable from the playback screen |
| Story contains character death or scary elements | Prompt engineering enforces: no death, no monsters, no conflict without peaceful resolution, no loud sound effects in the story text |
| Parent reports a problematic story | In-app report button (accessible to logged-in users); flagged stories reviewed and prompt updated within 24h |

---

*End of PRD v1.0 — BabyBedtimeTeller*
