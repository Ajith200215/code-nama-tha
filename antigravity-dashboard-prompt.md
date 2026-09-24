# Antigravity Prompt: Coding Platform Dashboard (DoDo-style UI)

> Attach the reference screenshot (DoDo dashboard) to Antigravity together with this file.
> Recreate its visual language exactly, but replace all learning/design content with the coding-platform content below.

---

## 0. Stack (change if you already chose another)

React + Vite + TypeScript, Tailwind CSS, lucide-react icons, Monaco Editor (problem page), React Router.
Font: **Outfit** (Google Fonts, weights 400/500/600/700). Closest free match to the reference typeface.

## 1. Design tokens (extracted from the reference)

```css
:root{
  --page:#C8CAC2;        /* outer grey-green backdrop */
  --panel:#FBFBF3;       /* big cream panels (sidebar, main) */
  --card:#FFFFFF;
  --ink:#1B1B1B;         /* headings, dark cards, primary buttons */
  --muted:#8A8C84;
  --line:#ECECE4;
  --lime:#D8F35E;        /* THE accent: active nav, rings, CTA, highlights */
  --lime-soft:#EEF9B8;
  --easy-bg:#DDF6C9;  --easy:#3E8E1F;
  --med-bg:#FFF1CC;   --med:#B27A00;
  --hard-bg:#FDE3DA;  --hard:#E0673F;
  --tag-blue:#D7E6FB; --tag-blue-ink:#2F5FA8;
  --r-panel:28px; --r-card:22px; --r-pill:999px;
  --shadow:0 8px 30px rgba(20,20,10,.06);
}
[data-theme="dark"]{
  --page:#0E0F0B; --panel:#171812; --card:#1F2018; --ink:#F4F5EC;
  --muted:#9A9C90; --line:#2A2B22; --lime:#D8F35E; --lime-soft:#2A3010;
}
```

Rules: no borders on cards (soft shadow only), 22-28px radii, pills for every tag/button, lime is the only accent colour, dark card (`--ink`) used once per section as a focal point.

## 2. Layout (desktop ≥1024px)

```
┌────────┬──────────────────────────────────────────┬──────────────┐
│Sidebar │ Top bar: topic tabs · search · theme · CTA│              │
│(white  ├───────────────────────────────┬──────────┤ Right column │
│ pill   │ Hero greeting + topic cards   │          │ Streak cal.  │
│ panel) │ Level progress cards (3)      │          │ Notifications│
│        │ Today's problems              │          │ Room card    │
│        │ My submissions                │          │              │
└────────┴───────────────────────────────┴──────────┴──────────────┘
```

Grid: `grid-cols-[230px_1fr_330px]`, outer padding 40px, 20px gaps, panels rounded 28px on `--page` backdrop.
Mobile: sidebar becomes bottom tab bar (Home, Problems, Rooms, Explain, Me), right column stacks under main, topic cards become horizontal scroll.

## 3. Content mapping (reference → coding platform)

| Reference | Replace with |
|---|---|
| Logo "DoDo" | Platform logo + name |
| Profile block | Avatar, user name, college, 🔥 day streak |
| Nav: Dashboard, Workspace, Statistics, Contacts, Calendar, Notifications, Messages | Dashboard, Problems, Practice Levels, Rooms, Code Explainer, AI Topic Problems, Leaderboard, Notifications (badge) |
| Help center dark card | "Stuck? Ask AI mentor" dark card, lime `?` badge, button "Open mentor" |
| Top tabs (UX/UI, Illustration, Typography) | Topic tabs: Arrays, Strings, Recursion, DP (active = underlined + bold) |
| Search "Search or type command" | "Search problems or press ⌘K" |
| Light/Dark toggle | Same, wires to `data-theme` |
| Black "Add new board" | Black "Create room" |
| Hero "Hi, Michael! What do you want to learn today?" | "Hi, {name}! What do you want to **solve** today?" (lime highlight on *solve*) + subtitle "Pick a level, write the code, and level up." |
| Dashed `+` card | Dashed `+` card → "Generate AI problems from your topics" |
| 4 illustration cards | Topic cards: Arrays, Strings, Loops, Recursion. Each: geometric lime/yellow/lavender SVG shapes (circles, rounded rects, triangles), title, "42 problems" |
| 3 progress ring cards | Level cards per topic: ring % , "Arrays", "Level 2 of 4", small text "6/10 solved", lime "Continue" button |
| To-do list (dark + light card, avatars, Edit/Share) | **Today's problems**: dark card = Room daily problem (title, difficulty pill, level chip, room avatars); light card = AI-generated problem. Header actions: Edit topics, Share room |
| My assignments rows | **My submissions**: problem icon, title + date, "Runtime 02 ms", progress line = test cases passed, `8/9`, level chip (L3/L2/L1/L0), attempts count. Dashed row "+ Generate new AI problem" |
| Calendar week strip + events | **Streak calendar**: week strip, today = lime circle, solved days = small lime dot; list below = "Daily problem · Weekly Sprint room · 10:30" |
| Notifications card | Room updates: "Rahul solved Two Sum in 4 min", "New daily problem posted", Clear button |
| Board meeting card (Reschedule / Accept invite) | **Room card**: room name, rank "You're #3", buttons "Leaderboard" (outline) + "Open room" (lime) |

## 4. Coding-platform-specific components to add (same style)

1. **LevelSwitcher**: 4 pills `Level 3 · Level 2 · Level 1 · Level 0`. Active = lime fill, others `--panel`. User can open any level anytime.
2. **DifficultyPill**: Easy / Medium / Hard using the `--easy/--med/--hard` pairs.
3. **LevelPassModal**: centred white card, lime confetti shapes, "Level 2 cleared! Next: Level 1". Fail state: soft red pill + "Practise Level 2 again".
4. **ProgressRing**: SVG ring, lime stroke, % in centre.

```tsx
// ProgressRing.tsx
export function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--lime)" strokeWidth="5"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dy=".35em" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">{value}%</text>
    </svg>
  );
}
```

```tsx
// LevelSwitcher.tsx
const levels = [3, 2, 1, 0];
export function LevelSwitcher({ active, onChange }: { active: number; onChange: (l: number) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-[var(--panel)] p-1">
      {levels.map(l => (
        <button key={l} onClick={() => onChange(l)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition
            ${active === l ? 'bg-[var(--lime)] text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
          Level {l}
        </button>
      ))}
    </div>
  );
}
```

```js
// tailwind.config.js (extend)
theme: { extend: {
  fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
  borderRadius: { panel: '28px', card: '22px' },
  boxShadow: { soft: '0 8px 30px rgba(20,20,10,.06)' },
}}
```

## 5. Build phases (test each, then push to GitHub)

**Phase 1: Shell.** Tokens, Outfit font, backdrop + sidebar + top bar + light/dark toggle, responsive (bottom nav on mobile). Static, no data.
**Phase 2: Dashboard page.** Hero, topic cards, level progress cards, Today's problems, My submissions, right column. Use mock JSON in `/src/data/mock.ts`.
**Phase 3: Problem page.** Same tokens: left panel = problem + LevelSwitcher + DifficultyPill, right panel = Monaco editor + Run/Submit (lime) + result console. Add LevelPassModal.
**Phase 4: Rooms + Explainer + AI Topics pages** reusing the same cards, pills, dashed "+" cards.

## 6. Instructions to Antigravity

- Match the reference pixel-for-pixel in spacing, radii, shadows and typography before adding features.
- Keep every colour in CSS variables; no hard-coded hex inside components.
- Componentize: `Sidebar`, `TopBar`, `TopicCard`, `LevelCard`, `ProblemCard`, `SubmissionRow`, `StreakCalendar`, `RoomCard`, `NotificationItem`.
- Illustrations on topic cards: inline SVG geometric shapes only (no external images).
- Show a screenshot at 1440px and 390px after Phase 1 and Phase 2 for review.
