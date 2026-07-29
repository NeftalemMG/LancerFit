LancerFit mobile
================

The student app for LancerFit, the gamified fitness platform for the Toldo
Lancer Centre at the University of Windsor. Students log activity, join campus
challenges, clear daily quests, earn XP and badges, watch a knight avatar
progress through five tiers, and compete on faculty and campus leaderboards.

React Native on Expo SDK 54. JavaScript, not TypeScript.


Quick Start
-----------

	npm install
	echo "EXPO_PUBLIC_API_URL=http://<lan-ip>:8000/api" > .env
	npx expo start

	npx expo start --android
	npx expo start --ios
	npx expo start --tunnel     # when the device is not on the same network

EXPO_PUBLIC_API_URL must end in /api and must be reachable from the device.
localhost points at the phone itself, not at your machine.

Push notifications and the pedometer need a real device. They do not work in a
simulator.


Essential Documentation
-----------------------

All maintainer documentation lives in docs/:

* docs/architecture.md     - entry, providers, navigation, state
* docs/screens.md          - every screen and what it reads
* docs/api-layer.md        - services, tokens, refresh, sockets, push
* docs/design-system.md    - tokens, type, avatars, components
* docs/gamification-ui.md  - XP, levels, tiers, quests, badges on the client
* docs/operations.md       - environment, device setup, build
* docs/maintenance.md      - known gaps, dead code, traps, work queue

Read docs/architecture.md first. The provider order in App.js is not
negotiable and docs/architecture.md explains why.


Layout
------

	App.js                fonts, providers, push gate, hands off to AppShell
	src/components/       shared UI, sheets, avatars, charts
	src/context/          AuthContext and AppContext
	src/navigation/       auth stack and app tabs plus stack
	src/screens/          one file per screen
	src/services/         API clients, token store, sockets, local stores
	src/data/             static maps: faculties, countries, avatar sources
	src/hooks/            pedometer, gym proximity, push registration
	src/theme/            colour tokens and typography
	assets/               avatars, faculty badges, animations, brand


Conventions
-----------

* No emoji in UI copy. Flag characters on the leaderboard are data.
* No em dashes in UI copy.
* No external icon library. Icons are hand-drawn SVG in components/Glyphs.js,
  components/icons.js and components/SportIcons.js.
* Colours come from src/theme/tokens.js. No literal hex in a screen.
* Every network call goes through src/services/. Screens never call fetch.
* Server values are displayed, not recomputed. The API sends level, XP to
  next, streak and avatar tier; the client renders them.