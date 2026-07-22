# LancerFit — Codebase Map

React Native / Expo app for the University of Windsor's Toldo Lancer Centre. Gamified gym check-in: XP, levels, quests, challenges, leaderboard, badges.

---

## Entry Points

| File | Role |
|------|------|
| `App.js` | Root. Loads fonts (Space Grotesk + Inter via `useFonts`), holds the splash screen, wraps everything in `SafeAreaProvider` + `AppProvider`, then renders `AppShell`. |
| `app.json` | Expo config (bundle ID, splash, icons). |
| `babel.config.js` | Babel preset for Expo. |

---

## `src/`

### `context/`

**`AppContext.js`** — single source of truth. Exposes via `useApp()`:

| Exported value | What it does |
|----------------|--------------|
| `player` / `updatePlayer` | Player profile state (name, avatar, faculty, level, XP, streak, workouts, flags) |
| `addXP(n)` | Adds XP, handles level-up logic, fires toast on level-up |
| `checkIn()` | Marks gym visit, bumps streak + workouts, awards 75 XP |
| `quests` / `bumpQuest` / `claimQuest` | Daily quest list and interactions |
| `challenges` / `joinedChals` / `joinChallenge` | Featured challenges and join state |
| `joinTower()` | Joins the Tower Challenge (injects a gold quest) |
| `toast` / `toastMsg` / `toastY` / `toastOpacity` | Animated toast notification system |
| `sheet` / `openSheet` / `closeSheet` | Generic bottom sheet — pass any JSX as `content` |

---

### `data/`

**`appData.js`** — all static mock data (replace with API responses later):

| Export | Contents |
|--------|----------|
| `FACULTIES` | 6 faculties with id, name, short description, hex color |
| `AVATARS` | 6 avatar name strings |
| `initialQuests` | 5 starting quests with progress, XP reward, icon key |
| `CHALLENGES` | 5 featured challenges (running, cycling, swimming, gym, yoga) with Unsplash images |
| `PH` | Unsplash photo URL map (`stairs`, `running`, `cycling`, `swimming`, `gym`, `yoga`) |
| `FALLBACK` | Gradient fallback pairs per challenge type (used when images are slow) |
| `LB` | Leaderboard data — `friends`, `faculty`, `campus` arrays |
| `BADGES` | 12 badge definitions (9 earned, 3 in-progress) with shape, color, desc |
| `initialState` | Default player object (Neftalem, level 7, 1240 XP, 12-day streak) |
| `fmt(n)` | Locale number formatter (`en-CA`) |

---

### `theme/`

**`tokens.js`** — design tokens:
- `colors` — full palette: navy backgrounds (`bg0`/`bg1`/`bg2`), card surfaces, text grays, `blue`/`gold`/`green`/`coral`/`plum` accents, podium metals (`medalGold`, `medalSilver`, `medalBronze`)
- `radius` — `lg: 22`, `md: 16`, `sm: 12`
- `shadow` — `card`, `pop`, `accent(rgba)` — RN shadow + elevation objects
- `tint(hex, alpha)` — converts a hex color to `rgba(...)` for faculty tinting

**`typography.js`** — font aliases:
- `disp` — Space Grotesk (`regular / medium / semibold / bold`)
- `body` — Inter (`regular / medium / semibold`)
- `type` — pre-built style objects: `h1`, `bigTitle`, `eyebrow`, `sectionLabel`, `num`

---

### `screens/`

| Screen | File | Key features |
|--------|------|--------------|
| **Onboarding** | `OnboardingScreen.js` (157 lines) | Name input, avatar picker (6 options), faculty selector. Calls `onEnter(name)` → `AppShell.enterApp()` |
| **Home** | `HomeScreen.js` (212 lines) | Hero XP bar, streak counter, check-in button, featured Tower Challenge card, daily quests list with bump/claim |
| **Challenges** | `ChallengesScreen.js` (194 lines) | Scrollable list of featured challenges; tapping opens `ChallengeSheet` in the bottom sheet |
| **Leaderboard** | `LeaderboardScreen.js` (137 lines) | 3-tab view (Friends / Faculty / Campus), podium for top 3, ranked list below |
| **Badges** | `BadgesScreen.js` (65 lines) | Opens `BadgeSheet` (full-screen sheet); triggered from Profile |
| **Profile** | `ProfileScreen.js` (159 lines) | Avatar, stats, faculty display, link to Badges, reset/logout |

---

### `components/`

| File | What it does |
|------|--------------|
| `AppShell.js` | Router — holds `screen` state, renders the active screen, shows/hides `TabBar`, renders `Toast` + `Sheet` overlays. Also handles the log-workout flow via `openSheet`. |
| `TabBar.js` | Fixed bottom bar: Home · Challenges · [gold FAB = Log workout] · Ranks · Profile. Active tab highlighted in gold. |
| `Overlays.js` | `Toast` (animated slide-up notification), `Sheet` (animated bottom drawer with veil), `LogWorkoutSheet` (manual vs sync choice). |
| `Badge.js` | Individual badge renderer — 5 shapes (`shield`, `hex`, `medal`, `pennant`, `star/diamond`) drawn with SVG. |
| `BadgeSheet.js` | Full-screen badge collection grid; scrollable, shows earned + in-progress badges. |
| `ChallengeSheet.js` | Bottom sheet content for a challenge detail view — image header, description, join button. |
| `KnightAvatar.js` | SVG knight helmet illustration used throughout for player avatar display. |
| `Glyphs.js` | Small SVG glyphs (quest icons: `bolt`, `bar`, `crew`, `wave`, `sun`, `flag`). |
| `icons.js` | Stroke-based SVG icons: `HomeIcon`, `ChallengesIcon`, `RanksIcon`, `ProfileIcon`, `PlusIcon`, `SyncIcon`. |
| `ui.js` | Shared primitives: `PressScale` (animated press wrapper), `Row`, `Col`, and other layout helpers. |

---

## Navigation Model

No navigation library — screen state lives in `AppShell`:

```
'onboard' → OnboardingScreen
'home'    → HomeScreen
'quests'  → ChallengesScreen
'board'   → LeaderboardScreen
'badges'  → BadgesScreen      (tab highlights 'profile')
'profile' → ProfileScreen
```

Transitions are immediate state swaps. The FAB in the tab bar opens a sheet rather than navigating.

---

## Assets

`assets/` — four standard Expo images: `icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`.

---

## Dependencies (key ones)

| Package | Used for |
|---------|----------|
| `expo` | Build toolchain, splash screen, status bar |
| `expo-linear-gradient` | Card gradients, FAB, sheet backgrounds |
| `react-native-svg` | Badge shapes, knight avatar, custom icons |
| `react-native-safe-area-context` | Edge insets |
| `@expo-google-fonts/space-grotesk` | Display typeface |
| `@expo-google-fonts/inter` | Body typeface |

---

## What's Hardcoded / Not Yet Wired

- All player data is in-memory (resets on app restart).
- Leaderboard, challenges, and badges are static arrays in `appData.js`.
- Check-in is a button tap — no real gym proximity check.
- Unsplash URLs are embedded directly in `appData.js`.
- No backend, no auth, no persistence layer yet.
