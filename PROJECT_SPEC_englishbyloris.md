# englishbyloris — PROJECT_SPEC.md

## 1. Purpose of this document

This document defines the V1 product, UX, visual direction, content architecture, technical stack, data model and development rules for **englishbyloris**.

It is intended to be used in a new ChatGPT conversation whose job is to help develop the project with **Codex**, using short, effective, progressive prompts that avoid wasting tokens and avoid feature creep.

The specification below is the source of truth for V1 unless the user explicitly changes a decision.

---

# 2. Product vision

**englishbyloris** is a mobile-first web app for learning and practising English through short mini-games.

The product should feel like something the user opens for 2–5 minutes during free time, not like a traditional course platform.

Core idea:

> Learn English by playing short, focused games adapted to the user's level.

The app must feel:
- modern;
- elegant;
- slightly gamified;
- premium;
- simple;
- motivating;
- accessible;
- not childish;
- not school-like;
- not overloaded like a dashboard.

---

# 3. Main target

Initial target:
- English learners from **A1 to B2**;
- users who want short practice sessions;
- primary usage from smartphone;
- full responsive support for desktop.

The app must be designed **mobile-first**, but desktop must be a first-class experience rather than a stretched mobile layout.

---

# 4. V1 scope

V1 includes:

- Google authentication;
- first-use onboarding;
- English level selection: A1, A2, B1, B2;
- learning interests selection;
- Home;
- Games page;
- 3 mini-games;
- Daily Challenge;
- Results screen;
- Progress area;
- Weak Areas;
- My Mistakes;
- Profile;
- Light theme;
- Dark theme;
- XP;
- streak;
- accuracy;
- game history;
- adaptive difficulty;
- anti-repetition system;
- content library;
- responsive desktop/mobile UI;
- accessibility baseline;
- PWA-compatible structure.

The 3 games are:

1. **Word Rush**
2. **Verb Challenge**
3. **Describe It**

---

# 5. Explicitly out of scope for V1

Do not add these features unless the user explicitly changes scope:

- C1/C2;
- placement test;
- AI tutor;
- AI-generated live questions;
- multiplayer;
- friends;
- global leaderboard;
- community;
- traditional lessons/courses;
- separate Listening game;
- separate Speaking game;
- Real Life mode;
- achievements system beyond simple progress;
- payments/subscriptions;
- offline mode;
- push notifications;
- social features;
- native iOS/Android apps;
- speech recognition;
- free-writing AI correction;
- complex admin dashboard.

No feature creep.

---

# 6. Authentication

V1 authentication method:

- **Google OAuth**
- implemented through **Supabase Auth**

Flow:

```text
Landing
  ↓
Continue with Google
  ↓
Google OAuth
  ↓
New user?
  ├─ Yes → Onboarding
  └─ No  → Home
```

Traditional email/password authentication is not required in V1.

---

# 7. Onboarding

## 7.1 English level

The user chooses one level:

- A1 — Beginner
- A2 — Elementary
- B1 — Intermediate
- B2 — Upper Intermediate

The level can later be changed from Profile.

Important:

> The app must never automatically claim the user has advanced from one CEFR level to another.

Adaptive difficulty and CEFR level are separate concepts.

## 7.2 Learning interests

Initial interests:

- Vocabulary
- Verbs
- Adjectives

The user can choose one or more.

These interests influence recommendations and Daily Challenge composition, but must not block access to the other games.

---

# 8. Main navigation

Navigation items:

- Home
- Games
- Progress
- Profile

## Mobile

Use a bottom navigation bar.

## Desktop

Do **not** use a left sidebar.

Use a **floating bottom-centered navigation dock**:
- fixed near the bottom;
- centered horizontally;
- rounded pill style;
- compact width;
- visually elevated;
- blur/translucent surface allowed;
- sufficient bottom spacing so content is never covered.

## Gameplay

Hide the navigation dock during active gameplay.

---

# 9. Home

The Home must remain focused and not become a dashboard.

Recommended content:

- greeting;
- current CEFR level;
- XP;
- streak;
- Daily Challenge;
- 3 game cards;
- one recommended weak area / practice suggestion.

Example structure:

```text
englishbyloris

Good evening, Loris
B1 · Intermediate

🔥 4 days
⭐ 1,240 XP

DAILY CHALLENGE
10 mixed questions
[ Play ]

YOUR GAMES
[ Word Rush ]
[ Verb Challenge ]
[ Describe It ]

KEEP PRACTICING
Present Perfect
62% accuracy
[ Practice ]
```

---

# 10. Games

## 10.1 Word Rush

Focus:
- vocabulary;
- quick recognition;
- definitions;
- word/image association;
- contextual vocabulary.

Possible exercise types:
- image → word;
- word → image;
- definition → word;
- sentence → missing word;
- audio → word where supported.

Level behaviour:

### A1
- image/word;
- basic vocabulary;
- simple everyday nouns/adjectives.

### A2
- common contextual vocabulary;
- travel, shopping, city, weather, hobbies.

### B1
- definitions;
- contextual vocabulary;
- work, technology, media, money, emotions.

### B2
- precise vocabulary in context;
- nuanced choices;
- abstract/general vocabulary.

Timer:
- may be used in Word Rush;
- should feel light, not stressful.

Typical session:
- 10 questions;
- about 2–3 minutes.

---

## 10.2 Verb Challenge

Focus:
- correct verb forms;
- tense selection;
- grammar in context.

Possible exercise types:
- choose correct form;
- fill the gap;
- choose correct tense;
- irregular verb;
- sentence correction.

Level progression:

### A1
- to be;
- to have;
- present simple;
- can/can't;
- common verbs.

### A2
- past simple;
- present continuous;
- future with will;
- going to;
- common irregular verbs.

### B1
- present perfect;
- past continuous;
- modal verbs;
- first/second conditional;
- gerunds/infinitives;
- common phrasal verbs.

### B2
- present perfect continuous;
- past perfect;
- conditionals;
- passive voice;
- reported speech;
- modal deduction;
- more advanced phrasal verbs.

Timer:
- no aggressive timer.

Feedback:
- when wrong, show the correct answer;
- include a short explanation of max 1–2 lines;
- explanations come from validated content, not live AI.

Typical session:
- 10 questions;
- about 3–4 minutes.

---

## 10.3 Describe It

Focus:
- adjectives;
- opposites;
- descriptions;
- adjective choice in context.

V1 exercise types:
- image → adjective;
- adjective → opposite;
- definition → adjective;
- sentence → adjective;
- synonym/meaning → adjective.

Level progression:

### A1
- colours;
- size;
- age;
- basic emotions;
- simple opposites.

### A2
- personality basics;
- weather adjectives;
- feelings;
- appearance;
- places;
- basic comparative concepts.

### B1
- personality;
- emotions;
- quality;
- situations;
- intensity;
- context-based adjectives.

### B2
- nuance;
- abstract qualities;
- behaviour;
- opinions;
- strong adjectives;
- synonyms.

V1 does **not** include speech recognition or AI free-response scoring.

Typical session:
- 10 questions;
- about 2–3 minutes.

---

# 11. Common game flow

All games share the same high-level structure:

```text
Game Intro
  ↓
10 Questions
  ↓
Immediate Feedback
  ↓
Game Results
```

## Game intro

Show:
- game name;
- level;
- topic (default: Mixed);
- 10 questions;
- estimated duration;
- Start button.

## Gameplay header

Minimal:

```text
×        Game Name        4 / 10
──────── progress ────────
```

## Correct answer feedback

Show:
- ✓
- correct state;
- XP earned;
- brief transition.

## Wrong answer feedback

Show:
- ✕
- selected wrong answer;
- correct answer;
- concise explanation when useful;
- Continue CTA if reading time is needed.

## Exit

If the user tries to exit an active game:

```text
Leave game?

Your current progress will not be counted.

[ Keep playing ]
[ Leave ]
```

---

# 12. Results screen

Show only useful information:

- score, e.g. 8/10;
- accuracy;
- XP earned;
- best answer streak;
- one weak area when applicable.

Actions:

- Play again;
- Review mistakes;
- Back home.

Avoid excessive charts or celebration effects.

---

# 13. Daily Challenge

The Daily Challenge is not a fourth game.

It is a mixed session.

Initial composition:

- 4 Word Rush;
- 3 Verb Challenge;
- 3 Describe It.

Total:
- 10 questions.

Rules:
- adapted to the user's CEFR level;
- may favour weak concepts and interests;
- bonus XP only once per day;
- can be completed once per day for bonus;
- normal games remain freely playable.

Initial bonus:
- +50 XP.

This value can be tuned later.

---

# 14. Progress

Show a concise learning overview.

Core metrics:
- total XP;
- games played;
- overall accuracy;
- streak;
- performance by game/skill;
- strongest areas;
- weak areas.

Avoid turning this area into a heavy BI dashboard.

Useful visual components:
- progress bars;
- small trend charts;
- compact rings where useful.

Avoid decorative pie charts.

---

# 15. Weak Areas

The system should identify weaker concepts based on actual performance.

Example:

```text
Present Perfect — 61%
Phrasal Verbs — 66%
Work Vocabulary — 69%
```

Each weak area can expose:

`Practice`

which starts a focused session for that concept/topic.

---

# 16. My Mistakes

The app must support review of mistakes without endlessly repeating the exact same sentence.

For a wrong answer, store:
- question;
- user answer;
- correct answer;
- concept;
- topic;
- mistake count;
- last mistake date.

Key rule:

> Repeat the concept, not necessarily the exact question.

Example:

```text
Mistake:
I've ___ this movie before.

Concept:
Present Perfect — experience

Future review:
Use a different sentence belonging to the same concept first.
```

The exact original question can occasionally return later.

---

# 17. XP

Initial rules:

- correct answer: +10 XP;
- difficulty 3: optional +2 XP;
- perfect game: +20 XP;
- Daily Challenge completion: +50 XP.

Do not give XP for:
- login;
- opening the app;
- opening Profile;
- passive activity.

XP must represent actual practice.

Server must calculate XP. The client must not be trusted to submit arbitrary XP values.

---

# 18. Streak

A day counts when the user completes at least one game.

Rules:

```text
last_activity_date = yesterday
→ streak + 1

last_activity_date = today
→ no change

last_activity_date < yesterday
→ streak = 1
```

Timezone handling must be correct for the user.

Opening the app alone does not preserve a streak.

---

# 19. Adaptive difficulty

Each question has:

- CEFR level: A1–B2;
- difficulty: 1, 2, or 3;
- skill;
- topic;
- concept.

The user's selected CEFR level remains stable unless manually changed.

Difficulty is dynamic.

Initial logic:

```text
recent concept accuracy > 85%
→ increase probability of harder questions

60%–85%
→ maintain difficulty

< 60%
→ increase probability of easier questions
```

Do not change difficulty based on a single answer. Use a recent window of performance.

---

# 20. Question Engine

Question selection must run server-side.

Input:

```text
user
game
CEFR level
optional topic
```

The engine considers:
- CEFR level;
- current difficulty;
- weak concepts;
- question history;
- recently seen questions;
- mistakes;
- unseen content.

## Initial 10-question mix

Indicative starting rule:

- 4 unseen/new questions;
- 3 normal/reinforcement questions;
- 2 weak-concept questions;
- 1 mistake/review question.

These ratios are tunable and are not absolute.

## Anti-repetition

Initial rule:
- avoid questions seen in the most recent ~40 questions.

If the pool becomes too small, relax the rule gradually rather than failing to start a game.

Important:

> Repetition of a concept is desirable. Repetition of the exact sentence too often is not.

---

# 21. Content strategy

Use a hybrid development workflow:

> AI-assisted content generation during development + validation + storage in database.

Do **not** generate live user questions with AI in V1.

Workflow:

```text
AI-assisted generation
  ↓
Structured JSON
  ↓
Schema validation
  ↓
Duplicate/similarity checks
  ↓
Human/automated review
  ↓
Database import
  ↓
User gameplay
```

Benefits:
- lower runtime cost;
- no generation latency;
- more consistent CEFR level;
- safer grammar quality;
- reproducible content;
- easier QA.

---

# 22. Content target

Indicative initial content target:

- A1: ~450 variants;
- A2: ~550 variants;
- B1: ~750 variants;
- B2: ~750 variants.

Total:
- approximately 2,500 variants.

This number is a planning target, not a hard requirement.

The real objective is enough variety to prevent obvious repetition.

---

# 23. Content taxonomy

Use this hierarchy:

```text
CEFR
  ↓
Skill
  ↓
Topic
  ↓
Concept
  ↓
Content
  ↓
Exercise Variant
```

Example:

```text
B1
→ Grammar
→ Present Perfect
→ Experience
→ verb: visit
→ "I've visited London several times."
```

---

# 24. Example vocabulary content

```json
{
  "word": "airport",
  "level": "A2",
  "category": "travel",
  "definition": "A place where planes take off and land.",
  "example": "We arrived at the airport at six.",
  "synonyms": [],
  "antonyms": [],
  "image_path": null,
  "audio_path": null
}
```

One vocabulary record may support multiple question types:
- image → word;
- word → image;
- definition → word;
- sentence → missing word;
- audio → word.

---

# 25. Example grammar content

```json
{
  "concept": "present-perfect-experience",
  "level": "B1",
  "difficulty": 2,
  "verb": "see",
  "prompt": "I've ___ this film before.",
  "correct_answer": "seen",
  "distractors": ["see", "saw", "seeing"],
  "explanation": "Use the past participle after have/has.",
  "tags": ["present-perfect", "irregular-verbs"]
}
```

Concept and exercise must remain separate entities.

---

# 26. Visual direction

The visual identity is confirmed at a high level.

The app should be:
- clean;
- modern;
- premium;
- mature;
- slightly tech;
- lightly gamified.

Avoid:
- mascots;
- childish illustrations;
- cartoon-heavy UI;
- excessive gradients;
- rainbow colour systems;
- random hero photography;
- mountains/scenery used as decorative backgrounds;
- visual clutter;
- SaaS dashboard aesthetic.

No logo is defined yet.

For now use only the text wordmark:

`englishbyloris`

Do not invent or generate a logo during implementation.

---

# 27. Themes

Only two themes exist:

- **Light**
- **Dark**

There is no "System" theme option.

The user can switch theme from Profile.

Theme preference should be persisted.

Default first-use theme: **NON CONFERMATO**.

Both themes must share:
- the same layout;
- the same component hierarchy;
- the same spacing;
- the same UX.

Only visual tokens change.

---

# 28. Visual foundations

## Dark mode — initial direction

Suggested starting tokens:

```text
Background            #0E1210
Background secondary  #131915
Surface               #18201B
Surface elevated      #202A23
Border                #303A33
Text primary          #F4F6F2
Text secondary        #A6B0A8
Brand                 #B7E879
Brand strong          #9DD85D
```

## Light mode — initial direction

```text
Background            #F5F5F0
Background secondary  #ECEDE7
Surface               #FFFFFF
Surface elevated      #FAFBF8
Border                #DADDD5
Text primary          #151815
Text secondary        #687068
Brand                 #78A946
Brand strong          #608C35
```

Exact values can be tuned during implementation.

---

# 29. Game colours

Initial identity:

```text
Word Rush       violet
Verb Challenge  amber/orange
Describe It     blue
```

Suggested starting colours:

```text
Word Rush       #8063D9
Verb Challenge  #D8893A
Describe It     #4D8ED8
```

Use these as restrained accents, not full-page colour floods.

---

# 30. Background treatment

Replace decorative landscape imagery with subtle abstract gradients.

Use:
- soft radial gradients;
- muted glow;
- low-contrast colour transitions;
- no heavy texture;
- no photographic scenery as page background.

Dark mode can have slightly more glow.

Light mode should remain soft and airy rather than pure white everywhere.

---

# 31. Typography

Use one clean sans-serif family.

Preferred direction:
- Geist or Inter.

Indicative scale:

```text
Hero desktop      48–64px
Hero mobile       36–44px
Page title        28–40px
Section heading   20–24px
Body              16px
Small             14px
Caption           12px
```

Avoid gaming/display fonts.

---

# 32. Spacing and shape

Spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
80
```

Radius:

```text
Small controls     10px
Buttons            14px
Cards              18–22px
Large game cards   24px
Navigation dock    pill / 999px
```

---

# 33. Game cards

The 3 game cards are key visual elements.

Common structure:

```text
CATEGORY
visual element
GAME NAME
short description
duration / metadata
Play →
```

Use UI-based visuals rather than decorative photography where possible.

Examples:

Word Rush:
- letter tiles;
- word fragments.

Verb Challenge:
- stacked verb forms;
- sentence fragments.

Describe It:
- speech / description / abstract frame visual.

---

# 34. Buttons and states

Primary CTA:
- strong brand emphasis;
- 48–52px typical height;
- mobile full-width when appropriate.

Secondary CTA:
- lower contrast;
- subtle surface/border.

Answer buttons must support:
- default;
- hover;
- selected;
- correct;
- incorrect;
- disabled.

Correct/incorrect states must never rely on colour only:
- use ✓;
- use ✕;
- use text.

---

# 35. Floating navigation dock

Desktop:
- fixed;
- bottom-centered;
- roughly 64px high;
- rounded;
- subtle elevation;
- blur/transparency allowed;
- compact width.

Items:
- Home;
- Games;
- Progress;
- Profile.

Mobile:
- same visual language;
- adapted to safe-area.

Gameplay:
- hidden.

---

# 36. Motion

Use restrained micro-interactions:

- hover: ~150ms;
- buttons: ~120ms;
- cards: ~180–220ms;
- page UI: ~200–300ms;
- progress animations: ~300–500ms.

Avoid:
- excessive bounce;
- cartoon movement;
- constant glow animation;
- distracting motion.

Respect:

`prefers-reduced-motion`.

---

# 37. Accessibility

Target:
- **WCAG 2.2 AA**

Requirements:
- sufficient colour contrast;
- visible keyboard focus;
- keyboard navigation;
- ~44x44 minimum touch targets;
- semantic HTML;
- accessible labels;
- alt text for meaningful images;
- never communicate state only through colour;
- reduced-motion support;
- zoom-friendly layouts.

---

# 38. Responsive behaviour

Mobile-first.

Indicative breakpoints:

```text
Mobile   < 640
Tablet   640–1024
Desktop  > 1024
Wide     > 1440
```

Desktop content max-width:
- approximately 1200–1320px.

Gameplay max-width:
- approximately 600–720px.

Do not make gameplay stretch across wide monitors.

---

# 39. Technical stack

Confirmed V1 direction:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **PostgreSQL**
- **Supabase Auth**
- **Google OAuth**
- **Supabase Storage**
- **Vercel**
- optional shadcn/ui primitives where useful
- custom product components for the app UI

Do not add a separate backend framework unless a real need emerges.

No FastAPI for V1.

---

# 40. Component strategy

Use shared reusable components.

Examples:

```text
GameCard
AnswerButton
ProgressBar
BottomDock
XPIndicator
StreakCard
LevelCard
GameIntro
GameResult
WeakAreaCard
MistakeCard
ThemeToggle
```

shadcn/ui, if used, should provide low-level primitives only.

The app must not visually look like a default shadcn template.

---

# 41. State management

Start with:
- React state;
- Next.js server state.

Do not introduce Redux.

Do not introduce Zustand unless real client-state complexity appears later.

---

# 42. Database model

Recommended V1 tables:

```text
profiles
games
topics
concepts
questions
question_options

game_sessions
session_answers

user_concept_progress
user_question_history

mistakes
daily_challenge_completions
```

---

# 43. profiles

Core fields:

```text
id
display_name
avatar_url
english_level
theme
xp
current_streak
longest_streak
last_activity_date
onboarding_completed
created_at
updated_at
```

Theme values:

```text
light
dark
```

---

# 44. games

V1 records:

```text
word-rush
verb-challenge
describe-it
```

Suggested fields:

```text
id
slug
name
description
is_active
```

---

# 45. topics

Suggested fields:

```text
id
game_id
name
slug
cefr_level
```

Examples:
- Travel;
- Food;
- Technology;
- Present Perfect;
- Past Simple;
- Emotions;
- Personality.

---

# 46. concepts

Represents what is actually being learned.

Suggested fields:

```text
id
game_id
topic_id
name
slug
cefr_level
```

Example:

```text
Game: Verb Challenge
Topic: Present Perfect
Concept: Present Perfect — Life Experience
```

---

# 47. questions

Suggested fields:

```text
id
game_id
topic_id
concept_id
cefr_level
difficulty
question_type
prompt
correct_answer
explanation
image_path
audio_path
is_active
created_at
```

Difficulty:
- 1;
- 2;
- 3.

Possible `question_type` values:

```text
multiple_choice
image_choice
definition_choice
opposite
sentence_gap
audio_choice
```

---

# 48. question_options

Suggested fields:

```text
id
question_id
text
is_correct
position
```

Do not use fixed columns such as `answer_1`, `answer_2`, etc.

---

# 49. game_sessions

Suggested fields:

```text
id
user_id
game_id
cefr_level
difficulty
started_at
completed_at
questions_count
correct_count
xp_earned
is_daily_challenge
```

Incomplete sessions must be distinguishable from completed sessions.

---

# 50. session_answers

Suggested fields:

```text
id
session_id
question_id
concept_id
selected_answer
is_correct
response_time_ms
xp_earned
answered_at
```

---

# 51. user_concept_progress

Suggested fields:

```text
user_id
concept_id
questions_answered
correct_answers
incorrect_answers
current_difficulty
last_practiced_at
```

Accuracy may be calculated instead of redundantly stored.

---

# 52. user_question_history

Used for anti-repetition.

Suggested fields:

```text
user_id
question_id
times_seen
times_correct
times_wrong
last_seen_at
```

---

# 53. mistakes

Suggested fields:

```text
user_id
question_id
concept_id
wrong_answer
correct_answer
mistake_count
last_mistake_at
resolved
```

---

# 54. daily_challenge_completions

Suggested fields:

```text
user_id
date
session_id
completed
bonus_xp
```

Used to prevent duplicate bonus rewards.

---

# 55. Security

Use Supabase Row Level Security.

A user must not be able to:
- read another user's private progress;
- modify another user's sessions;
- directly assign XP;
- directly manipulate streak;
- forge game results.

Sensitive mutations must be validated server-side.

Never trust the browser for XP calculation.

---

# 56. Storage

Use Supabase Storage for:
- exercise images;
- optional pre-generated audio;
- other controlled content assets.

Suggested structure:

```text
exercise-images/
  vocabulary/
  adjectives/

exercise-audio/
```

Store paths/references in the database.

---

# 57. Audio

V1 audio implementation is **NON CONFERMATO**.

Possible options:
1. browser SpeechSynthesis API;
2. pre-generated audio files.

If SpeechSynthesis is used, test quality and consistency on:
- Safari/iPhone;
- Chrome/Android;
- desktop browsers.

Audio must not block the first release if it becomes unreliable.

---

# 58. Repository structure

One repository.

Suggested structure:

```text
englishbyloris/
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── types/
├── styles/
├── public/
├── scripts/
│   └── content/
├── supabase/
│   └── migrations/
└── tests/
```

Do not split frontend/backend into separate repositories for V1.

---

# 59. Content tooling

Suggested scripts:

```text
scripts/content/generate-content.ts
scripts/content/validate-content.ts
scripts/content/detect-duplicates.ts
scripts/content/import-content.ts
```

Generated content should pass:
- schema validation;
- CEFR consistency checks where possible;
- duplicate checks;
- near-duplicate/similarity checks;
- option validation;
- correct-answer validation.

Avoid batches like:

```text
I went to London.
I went to Paris.
I went to Rome.
I went to Madrid.
```

These are technically different but pedagogically repetitive.

---

# 60. Testing

Recommended tools:

- Vitest;
- React Testing Library;
- Playwright.

Priority tests:

## Unit
- XP calculations;
- streak logic;
- adaptive difficulty;
- anti-repetition;
- question selection;
- weak concept calculation.

## Component
- AnswerButton states;
- GameCard;
- navigation dock;
- results;
- theme toggle.

## E2E
- Google-auth callback flow where testable;
- onboarding;
- start game;
- complete game;
- results;
- progress update;
- review mistakes;
- theme switch.

---

# 61. Deployment

Recommended:

```text
GitHub
  ↓
Vercel
```

Supabase provides:
- PostgreSQL;
- Auth;
- Storage.

Use environment variables correctly.

Do not expose Supabase service-role secrets to the browser.

---

# 62. PWA direction

Build the V1 with PWA-compatible structure:
- mobile metadata;
- installable manifest if useful;
- app-like mobile layout.

Full offline support is not part of V1.

Native apps are not part of V1.

---

# 63. Product rules to preserve during implementation

1. Mobile-first.
2. Desktop is still visually complete.
3. No desktop sidebar.
4. Use floating bottom-centered dock on desktop.
5. Hide dock during gameplay.
6. Only Light and Dark themes.
7. No logo yet; use text wordmark only.
8. No mountains/scenic background art.
9. Prefer abstract subtle gradients.
10. Keep Home focused.
11. Keep gameplay minimal.
12. Do not add features outside V1.
13. Adaptive difficulty must not change CEFR automatically.
14. Avoid exact-question repetition.
15. Prefer concept-level reinforcement.
16. No live AI exercise generation in V1.
17. Server validates XP and progress.
18. Accessibility is part of implementation, not a later patch.

---

# 64. Suggested implementation phases

The exact order may be adjusted by the development assistant, but a sensible sequence is:

## Phase 1 — Foundation
- create Next.js + TypeScript project;
- Tailwind;
- app structure;
- design tokens;
- Light/Dark themes;
- shared layout;
- responsive foundations.

## Phase 2 — Auth + data foundation
- Supabase project integration;
- Google OAuth;
- profiles;
- onboarding state;
- RLS;
- migrations.

## Phase 3 — Core navigation
- Home;
- Games;
- Progress;
- Profile;
- mobile bottom nav;
- desktop floating dock.

## Phase 4 — Content schema
- games/topics/concepts/questions/options;
- seed/sample content;
- validation;
- content scripts.

## Phase 5 — Gameplay foundation
- game intro;
- common game shell;
- question rendering;
- answer validation;
- results.

## Phase 6 — Implement 3 games
- Word Rush;
- Verb Challenge;
- Describe It.

## Phase 7 — Progress system
- sessions;
- answers;
- XP;
- streak;
- accuracy;
- weak areas;
- My Mistakes.

## Phase 8 — Question Engine
- adaptive difficulty;
- anti-repetition;
- unseen/weak/review mix;
- focused practice.

## Phase 9 — Daily Challenge
- mixed session;
- once-per-day bonus;
- completion tracking.

## Phase 10 — Quality
- accessibility;
- responsive QA;
- Light/Dark QA;
- unit/component/E2E tests;
- performance;
- error/empty/loading states.

## Phase 11 — Content scale-up
- expand question library;
- validation;
- duplicate detection;
- real content coverage A1–B2.

## Phase 12 — Deploy
- Vercel;
- production Supabase config;
- OAuth callback URLs;
- final QA.

---

# 65. Definition of done for V1

V1 is done when:

- users can sign in with Google;
- new users complete onboarding;
- users can choose A1–B2;
- users can select learning interests;
- Light and Dark themes work;
- Home/Games/Progress/Profile are complete;
- desktop uses bottom-centered floating navigation;
- mobile navigation works correctly;
- all 3 games are playable;
- sessions contain 10 questions;
- questions adapt to CEFR and dynamic difficulty;
- obvious repetition is controlled;
- results save correctly;
- XP is server-validated;
- streak works;
- Daily Challenge works;
- Progress works;
- weak areas work;
- My Mistakes works;
- focused practice works;
- RLS protects user data;
- mobile usability is strong;
- desktop remains polished;
- accessibility baseline is met;
- tests cover critical logic;
- production deployment is stable.

---

# 66. Instructions for the new ChatGPT development conversation

Use this document as the source of truth.

Act as:
- Senior Full-Stack Engineer;
- Next.js Architect;
- Supabase/PostgreSQL Engineer;
- Product Engineer;
- UX-conscious Frontend Engineer;
- Codex development coordinator.

The user's goal is to build the project with Codex.

## Required working method

Do not dump the entire implementation in one enormous prompt.

Instead:

1. inspect the current repository state before proposing work;
2. determine the smallest coherent next milestone;
3. explain what will be built and why;
4. provide a **short but sufficiently precise Codex prompt**;
5. ask the user to run Codex and return the result/log/diff;
6. review what Codex actually changed;
7. verify tests/build/migrations where relevant;
8. fix problems before moving on;
9. keep prompts compact to reduce token usage;
10. periodically recommend starting a new ChatGPT context window when the current context becomes too large.

Do not assume Codex succeeded just because it says it did.

Require evidence:
- changed files;
- build output;
- test output;
- migration status;
- runtime behaviour where relevant.

## Prompt style for Codex

Prompts should generally include:
- current goal;
- exact scope;
- relevant files/architecture;
- constraints;
- acceptance criteria;
- tests/checks to run.

Avoid repeating the entire PROJECT_SPEC in every prompt.

Reference the spec instead.

Example style:

```text
Implement Phase X of PROJECT_SPEC.md.

Scope:
- ...
- ...
- ...

Constraints:
- ...
- ...

Acceptance criteria:
- ...
- ...

Run:
- npm test
- npm run build

Do not implement anything outside this scope.
```

## Context-control rule

When enough work has accumulated that the conversation may become noisy or error-prone:

- stop;
- summarize current project status;
- list completed phases;
- list pending phases;
- list known issues;
- provide a compact handoff prompt for a new ChatGPT conversation.

This is required to reduce hallucinations and token waste.

---

# 67. First task for the new conversation

Before writing code, the new ChatGPT conversation should:

1. read this document;
2. confirm the V1 scope;
3. inspect the repository if one already exists;
4. if no repository exists, propose the exact initial project setup;
5. produce only the **first Codex prompt** needed to begin Phase 1.

Do not generate all future prompts at once.

Proceed milestone by milestone.
