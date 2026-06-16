## LancerFit

A gamified fitness app for the University of Windsor Toldo Lancer Centre. This
repository is the **frontend** built with React Native and Expo, targeting both
iOS and Android from a single codebase.

Here is the backend Repo: [LancerFit Backend](https://github.com/Ujk768/lancer-fit-backend.git)
---

### What is in here

The app reproduces the full prototype flow:

- **Onboarding** - pick a knight avatar, choose a faculty, set a display name.
- **Home** - XP/level hero card, Toldo check-in, daily quests, weekly activity bars.
- **Challenges** - featured Tower Challenge, browseable challenge cards, daily quests.
- **Leaderboard** - Friends / Faculty / Campus toggle, top-three podium, ranked rows.
- **Badges** - Multiple badges across six shape styles, earned and locked states, detail sheet.
- **Profile** - Progress ring, lifetime stats, settings rows, link into Badges.
- **Tab bar** - Home, Challenges, a center "log workout" action, Ranks, Profile.

Every avatar, badge, faculty crest, flag, and quest glyph is drawn with
`react-native-svg`, so the artwork is vector and scales cleanly on any screen.

---

### Prerequisites

You need three things regardless of platform:

1. **Node.js**, version 20 or newer (LTS recommended).
2. **A package manager** — `npm` ships with Node, which is all you need.
3. **The Expo Go app** on whatever phone you want to test on, or a simulator.

You do **not** need Xcode or Android Studio just to see the app on a physical
phone. Expo Go covers that. You only need the heavier tooling if you want to run
an on-computer simulator, which is explained in the optional sections below.

This project is pinned to **Expo SDK 54**. Make sure the Expo Go app on your
phone is a version that supports SDK 54. Installing the current Expo Go from the
App Store or Play Store is normally fine.

---

### Setup on a MacBook

This is the primary path. Follow it top to bottom the first time.

#### 1. Install Node

If you do not already have Node, the cleanest way on a Mac is with Homebrew.

Check whether you have Homebrew:

```bash
brew --version
```

If that prints nothing useful, install it:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node:

```bash
brew install node
```

Confirm it worked:

```bash
node --version
npm --version
```

`node --version` should print v20 or higher.

#### 2. Clone the project onto your machine

Clone the `LancerFit` repo and cd into it. 

```bash
git clone https://github.com/NeftalemMG/LancerFIt.git
cd ~/LancerFit
```


#### 3. Install the dependencies

```bash
npm install
```


#### 4. Start the development server

```bash
npx expo start
```

A QR code and a menu of options appear in the terminal. The Metro bundler is now
running and watching your files. Leave this terminal open while you work.

#### 5. Open the app on your iPhone

1. Install **Expo Go** from the App Store on your iPhone.
2. Make sure your iPhone and your MacBook are on the **same Wi-Fi network**.
3. Open the iPhone Camera app and point it at the QR code in the terminal.
4. Tap the notification that appears. It opens the app inside Expo Go.

The first load takes a little while because the bundle is built and sent over.
After that, saving a file refreshes the app automatically.

#### 6. (Optional) Run the iOS Simulator instead of a phone

If you would rather see it on your Mac:

1. Install **Xcode** from the App Store. This is a large download.
2. Open Xcode once and let it install its command line components when prompted.
3. With `npx expo start` running, press **`i`** in that terminal.

Expo opens the iOS Simulator, installs Expo Go into it, and launches the app.

---

### Testing on Android

Anyone on the team with an Android phone can test without installing Android
Studio. The person running the dev server still does the `npm install` and
`npx expo start` steps above; the Android tester only needs the phone.

#### Option A: physical Android phone (simplest)

1. Install **Expo Go** from the Google Play Store.
2. Connect the phone to the **same Wi-Fi network** as the computer running
   `npx expo start`.
3. Open Expo Go and choose **Scan QR code**.
4. Scan the QR code shown in the terminal.

The app loads inside Expo Go. This is the recommended way for teammates to try
it on their own devices.

If the phone and computer are on networks that cannot see each other (common on
locked-down campus or office Wi-Fi), start the server in tunnel mode instead so
the connection is routed over the internet:

```bash
npx expo start --tunnel
```

Then scan the new QR code. Tunnel mode is slower but works across networks.

#### Option B: Android emulator on a computer

This needs Android Studio and is only worth it if you do not have a physical
Android phone.

1. Install **Android Studio** from `https://developer.android.com/studio`.
2. During setup, let it install the Android SDK and an emulator system image.
3. Open Android Studio, go to the **Device Manager**, and create a virtual
   device (any recent Pixel is fine). Start it so the emulator window is open.
4. With `npx expo start` running in your terminal, press **`a`**.

Expo installs Expo Go into the running emulator and launches the app.

---

### Everyday commands

Once setup is done, these are all you normally use:

```bash
npx expo start        # start the dev server (then press i / a, or scan the QR)
npx expo start -c     # same, but clears the Metro cache if things act stale
```

While the server runs, in that terminal:

- press `i` to open the iOS Simulator
- press `a` to open the Android emulator
- press `r` to reload the app
- press `w` to open it in a web browser

---

### Project structure

```
LancerFit/
├── App.js                      App entry: loads fonts, mounts providers, renders the shell
├── app.json                    Expo config: name, icons, splash, dark theme, orientation
├── babel.config.js             Babel preset for Expo
├── package.json                Dependencies and scripts (pinned to Expo SDK 54)
├── assets/                     App icon, adaptive icon, splash, favicon
└── src/
    ├── theme/
    │   ├── tokens.js           Colors, radii, shadows, the tint() color helper
    │   └── typography.js       Space Grotesk (display) and Inter (body) font maps
    ├── data/
    │   └── appData.js          All static data: profile, quests, challenges, leaderboard, badges
    ├── context/
    │   └── AppContext.js       App state: XP, level, streak, quests, toast, bottom-sheet control
    ├── components/
    │   ├── AppShell.js         Screen router, phone background, status bar, mounts tab bar + overlays
    │   ├── TabBar.js           Bottom tab bar with the center gold action button
    │   ├── Overlays.js         Toast and the animated bottom sheet, plus the log-workout sheet
    │   ├── KnightAvatar.js     The six SVG knight avatars
    │   ├── Badge.js            The twelve SVG badges and their shapes
    │   ├── Glyphs.js           Faculty crests, country flags, quest glyphs
    │   ├── icons.js            The monoline UI icon set
    │   ├── ui.js               Shared building blocks: Card, PressScale, ProgressBar, headers
    │   ├── ChallengeSheet.js   Challenge detail bottom sheet
    │   └── BadgeSheet.js       Badge detail bottom sheet
    └── screens/
        ├── OnboardingScreen.js
        ├── HomeScreen.js
        ├── ChallengesScreen.js
        ├── LeaderboardScreen.js
        ├── BadgesScreen.js
        └── ProfileScreen.js
```

#### Where to change things

- **Colors and spacing** live in `src/theme/tokens.js`. Change them in one place
  and the whole app follows.
- **The data on screen** lives in `src/data/appData.js`. Edit a quest, a
  challenge, or the leaderboard there. This is also the file the backend person
  will eventually replace with live API calls.
- **App state and actions** (gaining XP, checking in, claiming a quest) live in
  `src/context/AppContext.js`.

---

### Troubleshooting

**The QR code scans but the app never loads.**
Phone and computer are probably on networks that cannot reach each other. Stop
the server and restart it with `npx expo start --tunnel`, then scan again.

**Metro shows a stale or broken screen after edits.**
Stop the server and restart with `npx expo start -c` to clear the cache.

**`npm install` fails partway through.**
Delete `node_modules` and the lockfile, then reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

**Fonts look like the default system font.**
The app holds the screen blank until Space Grotesk and Inter finish loading. If
it stays on the system font, fully close and reopen the app in Expo Go so the
fonts re-register.

**Expo Go says the project needs a different SDK.**
The Expo Go on the phone is older or newer than SDK 54. Update Expo Go from the
store, or align the SDK if your team decides to move versions.
