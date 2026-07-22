//
// STATIC DATA — ported verbatim from the prototype's <script>.
//

export const FACULTIES = [
  { id: "cs", name: "Computer Science", short: "Code & systems", c: "#4A93D8" },
  { id: "eng", name: "Engineering", short: "Build & design", c: "#E07A5F" },
  { id: "sci", name: "Science", short: "Research & lab", c: "#4FB587" },
  {
    id: "biz",
    name: "Odette Business",
    short: "Strategy & trade",
    c: "#A98BC9",
  },
  { id: "kin", name: "Kinesiology", short: "Sport & movement", c: "#D8A94A" },
  { id: "nur", name: "Nursing", short: "Care & health", c: "#E08FB4" },
];

export const AVATARS = [
  "Vanguard",
  "Tempest",
  "Bastion",
  "Specter",
  "Solstice",
  "Atlas",
];

export const initialQuests = [
  {
    id: "cardio",
    icon: "bolt",
    title: "Cardio Burner",
    sub: "20 min on any cardio machine",
    cur: 14,
    max: 20,
    xp: 60,
    gold: false,
  },
  {
    id: "squat",
    icon: "bar",
    title: "Leg Day Loyalist",
    sub: "3 sets in the squat rack",
    cur: 3,
    max: 3,
    xp: 80,
    gold: true,
    claimable: true,
  },
  {
    id: "buddy",
    icon: "crew",
    title: "Bring a Squadmate",
    sub: "Check in with a friend",
    cur: 0,
    max: 1,
    xp: 120,
    gold: false,
  },
  {
    id: "swim",
    icon: "wave",
    title: "Lancer Laps",
    sub: "Swim 10 lengths of the pool",
    cur: 6,
    max: 10,
    xp: 90,
    gold: false,
  },
  {
    id: "early",
    icon: "sun",
    title: "Dawn Patrol",
    sub: "Check in before 8:00 AM",
    cur: 2,
    max: 3,
    xp: 150,
    gold: true,
  },
];

// Unsplash photos (free license), same IDs as the prototype.
const U = (id) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
export const PH = {
  stairs: U("1576678927484-cc907957088c"),
  running: U("1502904550040-7534597429ae"),
  cycling: U("1534787238916-9ba6764efd4f"),
  swimming: U("1530549387789-4c1017266635"),
  gym: U("1534438327276-14e5300c3a48"),
  yoga: U("1545205597-3d9d02c29597"),
};

// Fallback gradient endpoints per category (used behind slow images).
export const FALLBACK = {
  Running: ["#1b4f72", "#0e3252"],
  Cycling: ["#1d5b54", "#0e3a35"],
  Swimming: ["#16557d", "#0c3350"],
  Gym: ["#5a4326", "#332514"],
  Yoga: ["#4a3a63", "#28213a"],
};

// Each challenge's `leaderboard` is a short slice of top participants for
// THAT challenge (same entry shape as LB: n, f, xp, av, fl). `userEntry`
// + `userRank` describe the signed-in player's own standing, and are
// only surfaced by the UI once the player has actually joined.
export const CHALLENGES = [
  {
    id: "run",
    type: "Running",
    title: "5K Around Campus",
    sub: "Log 5 km this week",
    xp: 300,
    joined: 32,
    img: PH.running,
    avs: [1, 3, 4],
    days: 7,
    desc: "Cover 5 km on foot anywhere on campus before Sunday. Treadmill counts, but outdoor laps of the riverfront earn the bonus.",
    leaderboard: [
      { n: "Kanade U.", f: "eng", xp: 2140, av: 1, fl: "pk" },
      { n: "Fady P.", f: "kin", xp: 1540, av: 4, fl: "ca" },
      { n: "Priya S.", f: "nur", xp: 1210, av: 5, fl: "in" },
    ],
    userEntry: { n: "Neftalem", f: "cs", xp: 980, av: 0, fl: "et" },
    userRank: 6,
  },
  {
    id: "spin",
    type: "Cycling",
    title: "Spin Sprint",
    sub: "3 spin classes",
    xp: 260,
    joined: 18,
    img: PH.cycling,
    avs: [2, 5, 0],
    days: 7,
    desc: "Clip into three spin classes at the Toldo Centre this week. Each session auto-logs from the studio bikes.",
    leaderboard: [
      { n: "Sandra O.", f: "eng", xp: 3105, av: 2, fl: "fr" },
      { n: "Mike M.", f: "sci", xp: 2960, av: 5, fl: "ca" },
      { n: "Dario L.", f: "sci", xp: 1390, av: 2, fl: "br" },
      { n: "Jonah T.", f: "biz", xp: 980, av: 1, fl: "ca" },
    ],
    userEntry: { n: "Neftalem", f: "cs", xp: 720, av: 0, fl: "et" },
    userRank: 5,
  },
  {
    id: "swim",
    type: "Swimming",
    title: "Lap Legends",
    sub: "Swim 2 km total",
    xp: 280,
    joined: 24,
    img: PH.swimming,
    avs: [4, 1, 3],
    days: 10,
    desc: "Bank 2 km of total distance in the pool. Lengths stack across as many visits as you need.",
    leaderboard: [
      { n: "Mike M.", f: "sci", xp: 2960, av: 5, fl: "ca" },
      { n: "Priya S.", f: "nur", xp: 1210, av: 5, fl: "in" },
      { n: "F. Phillips", f: "kin", xp: 1105, av: 4, fl: "ng" },
    ],
    userEntry: { n: "Neftalem", f: "cs", xp: 640, av: 0, fl: "et" },
    userRank: 9,
  },
  {
    id: "lift",
    type: "Gym",
    title: "Iron Circuit",
    sub: "4 strength sessions",
    xp: 320,
    joined: 41,
    img: PH.gym,
    avs: [0, 2, 5],
    days: 7,
    desc: "Complete four strength sessions on the main floor. A session counts once you log 20+ minutes.",
    leaderboard: [
      { n: "L. Nguyen", f: "biz", xp: 2810, av: 3, fl: "cn" },
      { n: "Kanade U.", f: "eng", xp: 2140, av: 1, fl: "pk" },
      { n: "Faisal A.", f: "eng", xp: 2140, av: 1, fl: "pk" },
    ],
    userEntry: { n: "Neftalem", f: "cs", xp: 1980, av: 0, fl: "et" },
    userRank: 4,
  },
  {
    id: "yoga",
    type: "Yoga",
    title: "Morning Flow",
    sub: "5 yoga sessions",
    xp: 240,
    joined: 27,
    img: PH.yoga,
    avs: [3, 4, 1],
    days: 14,
    desc: "Roll out the mat five times this fortnight. Any studio class or a logged home flow qualifies.",
    leaderboard: [
      { n: "Arabs", f: "cs", xp: 1820, av: 3, fl: "in" },
      { n: "Fady P.", f: "kin", xp: 1540, av: 4, fl: "ca" },
      { n: "Dario L.", f: "sci", xp: 1390, av: 2, fl: "br" },
    ],
    userEntry: { n: "Neftalem", f: "cs", xp: 1120, av: 0, fl: "et" },
    userRank: 7,
  },
];

export const LB = {
  friends: [
    { n: "Kanade U.", f: "eng", xp: 2140, av: 1, fl: "pk" },
    { n: "Neftalem", f: "cs", xp: 1980, av: 0, fl: "et", you: true },
    { n: "Arabs", f: "cs", xp: 1820, av: 3, fl: "in" },
    { n: "Fady P.", f: "kin", xp: 1540, av: 4, fl: "ca" },
    { n: "Dario L.", f: "sci", xp: 1390, av: 2, fl: "br" },
    { n: "Priya S.", f: "nur", xp: 1210, av: 5, fl: "in" },
    { n: "Jonah T.", f: "biz", xp: 980, av: 1, fl: "ca" },
  ],
  faculty: [
    { n: "Kinesiology", f: "kin", xp: 48210, av: 4, fl: "ca", grp: true },
    { n: "Engineering", f: "eng", xp: 44730, av: 1, fl: "ca", grp: true },
    {
      n: "Computer Science",
      f: "cs",
      xp: 41950,
      av: 0,
      fl: "ca",
      grp: true,
      you: true,
    },
    { n: "Science", f: "sci", xp: 38400, av: 2, fl: "ca", grp: true },
    { n: "Odette Business", f: "biz", xp: 33120, av: 3, fl: "ca", grp: true },
    { n: "Nursing", f: "nur", xp: 30880, av: 5, fl: "ca", grp: true },
  ],
  campus: [
    { n: "F. Phillips", f: "kin", xp: 3320, av: 4, fl: "ng" },
    { n: "Sandra O.", f: "eng", xp: 3105, av: 2, fl: "fr" },
    { n: "Mike M.", f: "sci", xp: 2960, av: 5, fl: "ca" },
    { n: "L. Nguyen", f: "biz", xp: 2810, av: 3, fl: "cn" },
    { n: "Faisal A.", f: "eng", xp: 2140, av: 1, fl: "pk" },
    { n: "Pogba P.", f: "cs", xp: 1980, av: 0, fl: "et", you: true, rank: 23 },
  ],
};

export const initialState = {
  name: "Neftalem",
  avatar: 0,
  faculty: FACULTIES[0],
  flag: "ca",
  level: 7,
  xp: 1240,
  xpMax: 2000,
  streak: 12,
  lifetime: 14820,
  workouts: 87,
  checkedIn: false,
  joinedTower: false,
};

export const fmt = (n) => Number(n).toLocaleString("en-CA");
