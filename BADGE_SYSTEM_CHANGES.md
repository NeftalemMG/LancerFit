# Badge System — What Changed

Documents all changes made to implement the new badge data model and display system. The badge awarding engine is out of scope and tracked separately.

---

## Files Changed

### `src/data/appData.js`

**`BADGES` array — complete schema redesign.**

Old schema per badge: `id`, `name`, `shape` (SVG shape key), `col` (hex accent), `earned` (bool), `date` (string), `cur` / `max` (only on unearned), `desc`

New schema per badge:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique descriptive string key (e.g. `'century_club'`) |
| `name` | `string` | Display title |
| `icon` | `require(...)` or `null` | PNG asset. `null` until the asset exists — Badge shows a styled placeholder |
| `completionCriteria` | `number` | Progress target. Use `1` for boolean-style. Replaces `max` |
| `expValue` | `number` | XP awarded on completion — new field |
| `secret` | `boolean` | If `true`, hidden from UI until earned |
| `excludes` | `string[]` | Badge IDs blocked permanently once this one is earned |
| `desc` | `string` | Unchanged |

Removed fields: `shape`, `col`, `earned`, `date`, `cur`, `max`

Badge IDs updated to descriptive strings:

| Old ID | New ID |
|--------|--------|
| `charge` | `first_charge` |
| `iron` | `iron_week` |
| `dawn` | `dawn_patrol` |
| `laps` | `pool_shark` |
| `squad` | `squad_captain` |
| `tower` | `tower_conqueror` |
| `frost` | `frost_lancer` |
| `pr` | `new_heights` |
| `loyal` | `semester_strong` |
| `cent` | `century_club` |
| `night` | `night_watch` |
| `gauntlet` | `the_gauntlet` |

Three new mutually exclusive competition badges added: `gold_lancer`, `silver_lancer`, `bronze_lancer`. Each has the other two in its `excludes` array — earning one permanently blocks the other two from appearing.

`first_charge` is the first badge wired to a real PNG asset (`assets/badges/trophy.png`). All others remain `icon: null` until assets are ready.

---

**`USER_BADGES` array — new export (simulates the join table).**

```js
{ userID: 'neftalem', badgeID: 'first_charge', progress: 1, completedAt: 'Sep 14' }
```

| Field | Notes |
|-------|-------|
| `userID` | Hardcoded to `'neftalem'` — wire to real auth later |
| `badgeID` | Foreign key into `BADGES` |
| `progress` | Current count toward `completionCriteria` |
| `completedAt` | Optional date string, only present on fully earned rows |

Badges with no row here have implicit `progress: 0` (not started).

---

### `src/context/AppContext.js`

Added `useMemo` to React import. Added `BADGES` and `USER_BADGES` to data import.

Added inside `AppProvider`:

```js
const [userBadges, setUserBadges] = useState(USER_BADGES);
```

Added `displayBadges` — a `useMemo` that recomputes whenever `userBadges` changes. It:

1. Builds a map from `badgeID → USER_BADGES row` for O(1) lookup
2. Finds all earned badge IDs (`progress >= completionCriteria`)
3. Builds the blocked set by walking each earned badge's `excludes` array
4. Enriches every badge with computed fields: `progress`, `isComplete`, `isBlocked`, `completedAt`
5. Filters out: blocked badges, and secret+incomplete badges
6. Sorts the visible list: **complete → in-progress → not started**

Exposed on context value: `displayBadges`, `userBadges`, `setUserBadges`

`setUserBadges` is the hook the future awarding engine will call to write earned/updated rows.

---

### `src/components/Badge.js`

**Rewritten twice** — current version renders three fully distinct visual states.

**Exports:**
- `default Badge` — the component
- `badgeAccent(id)` — returns the hex accent color for a given badge ID (used by `BadgesScreen` to color the in-grid progress bar)

**Per-badge accent colors** are defined in a module-level `ACCENT` map inside `Badge.js`. This is purely a display concern — it does not live in the data layer. When PNG icons arrive (transparent PNGs), the gradient background tinted by this color will show through naturally.

**Three visual states:**

| State | Condition | Appearance |
|-------|-----------|------------|
| Not started | `progress === 0 && !isComplete` | Dark gray frame, padlock SVG icon |
| In progress | `progress > 0 && !isComplete` | Accent-tinted frame (`accent + '14'` bg, `accent + '44'` border), initials at 66% opacity |
| Complete | `isComplete` | `LinearGradient` frame (`accent + '38'` → `accent + '18'`), full-color accent initials or PNG icon |

**Placeholder text** (shown when `badge.icon` is `null`): two-letter initials derived from the first letter of each word in the badge name (e.g. `'Pool Shark'` → `'PS'`, `'The Gauntlet'` → `'TG'`). More distinctive than a single character — no two current badges share the same initials.

**Props:** `badge` (enriched object from `displayBadges`), `size` (default `68`)

---

### `src/components/BadgeSheet.js`

Updated field references to match new schema:

| Old | New |
|-----|-----|
| `b.earned` | `b.isComplete` |
| `b.date` | `b.completedAt` (rendered as `Earned · Apr 05`, gracefully omitted if absent) |
| `b.cur / b.max` | `b.progress / b.completionCriteria` |

No structural changes — layout and styles are unchanged.

---

### `src/screens/BadgesScreen.js`

**Data:**
- Removed `import { BADGES } from '../data/appData'` — reads from context only
- Added `displayBadges` from `useApp()` — pre-sorted and pre-filtered by context
- Stats row (Earned / Total / In progress) derived from `displayBadges` at render time — was hardcoded `9`, `12`, `3`

**Grid layout:**
- Cell width: `(Dimensions.get('window').width - 60) / 3` — explicit fixed width so exactly 3 columns always fit. The 60px accounts for 40px scroll padding + 20px for two 10px column gaps.
- Gap: `gap: 10` (replaces `justifyContent: 'space-between'` + percentage widths) — consistent 10px gutters both horizontally and vertically.

**Cell content per badge (top → bottom):**
1. `<Badge>` — the rounded frame with icon/initials or padlock
2. `<ProgressBar>` — only rendered when `!b.isComplete && b.progress > 0`. Fills the full inner cell width, colored with `badgeAccent(b.id)` to match the badge frame.
3. Badge name — `colors.text3` when incomplete, `colors.text` when earned.

Removed the redundant `!b.isComplete && { opacity: 0.55 }` from the Card wrapper — `Badge` now owns all visual state internally, so stacking both would have multiplied the opacity to ~0.25.

---

### `src/screens/ProfileScreen.js`

- Added `displayBadges` to `useApp()` destructuring
- Badge summary line ("9 of 12 earned · 3 in progress") now computed from `displayBadges` — was a hardcoded string

---

## What's still hardcoded / deferred

- `icon: null` on 14 of 15 badges — replace each with `require('../../assets/badges/<id>.png')` as assets are created. `first_charge` is already wired.
- `userID: 'neftalem'` in `USER_BADGES` — needs to reference real authenticated user
- `USER_BADGES` is a static array — needs to be loaded from and written to a backend/database
- Badge awarding engine (detecting when criteria are met and writing to `USER_BADGES`) is a separate workstream
