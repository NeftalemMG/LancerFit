// 
// ACTIVITY CATALOG — the TLC's real program areas.
//
// Scoring rule (from the TLC brief):
//   1 minute of physical activity = 1 point.
//
// Shape of the data:
//   AREAS[] — the five top-level activity areas. Each has:
//     id     unique key
//     name   display title
//     icon   key into <SportIcon> (custom SVG, see components/SportIcons.js)
//     accent which palette accent the area tints with ('gold' | 'blue'
//            | 'green' | 'plum' | 'coral')
//     subs[] the loggable activities inside that area
//
//   BONUS[] — the "facility exploration" challenge bonuses. These are
//     flat point awards, not per-minute.
//
// 

export const AREAS = [
  {
    id: 'pool',
    name: 'Pool',
    icon: 'pool',
    accent: 'blue',
    subs: [
      { id: 'fitlane',   name: 'Fit Lanes',          icon: 'lane' },
      { id: 'shallow',   name: 'Shallow Aquafit',    icon: 'aqua' },
      { id: 'deep',      name: 'Deep Water Aquafit', icon: 'deep' },
      { id: 'leisure',   name: 'Leisure Swim',       icon: 'leisure' },
      { id: 'rec',       name: 'Recreational Swim',  icon: 'recswim' },
      { id: 'lessons',   name: 'Swim Lessons',       icon: 'lessons' },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness Centre',
    icon: 'dumbbell',
    accent: 'gold',
    subs: [
      { id: 'cardio',    name: 'Cardio',             icon: 'treadmill', hint: 'Treadmill · elliptical · stepmill · bikes' },
      { id: 'strength',  name: 'Strength',           icon: 'barbell' },
      { id: 'flex',      name: 'Flexibility & Stretch', icon: 'stretch' },
      { id: 'boxing',    name: 'Boxing',             icon: 'boxing' },
    ],
  },
  {
    id: 'group',
    name: 'Group Fitness',
    icon: 'group',
    accent: 'plum',
    subs: [
      { id: 'spin',      name: 'Spin',         icon: 'spin' },
      { id: 'lancerlift',name: 'Lancer Lift',  icon: 'barbell' },
      { id: 'bootcamp',  name: 'Bootcamp',     icon: 'bootcamp' },
      { id: 'kickbox',   name: 'Kickboxing',   icon: 'boxing' },
      { id: 'hyrox',     name: 'HYROX',        icon: 'hyrox' },
      { id: 'yoga',      name: 'Yoga',         icon: 'yoga' },
      { id: 'zumba',     name: 'Zumba',        icon: 'zumba' },
      { id: 'karate',    name: 'Karate',       icon: 'karate' },
    ],
  },
  {
    id: 'courts',
    name: 'Open Rec & Courts',
    icon: 'court',
    accent: 'green',
    subs: [
      { id: 'pickleball',name: 'Pickleball',   icon: 'paddle' },
      { id: 'badminton', name: 'Badminton',    icon: 'shuttle' },
      { id: 'tabletennis',name: 'Table Tennis',icon: 'paddle' },
      { id: 'volleyball',name: 'Volleyball',   icon: 'volleyball' },
      { id: 'basketball',name: 'Basketball',   icon: 'basketball' },
      { id: 'track',     name: 'Walking Track',icon: 'track' },
    ],
  },
  {
    id: 'intramural',
    name: 'Intramural Leagues',
    icon: 'trophy',
    accent: 'coral',
    subs: [
      { id: 'imbasket',  name: 'Basketball',   icon: 'basketball' },
      { id: 'imvolley',  name: 'Volleyball',   icon: 'volleyball' },
      { id: 'soccer',    name: 'Soccer',       icon: 'soccer' },
      { id: 'futsal',    name: 'Futsal',       icon: 'soccer' },
      { id: 'flagfb',    name: 'Flag Football',icon: 'football' },
    ],
  },
];

// Facility-exploration bonus challenges (flat point awards).
export const BONUS = [
  { id: 'visit2',  label: 'Visit 2 activity areas in one day',  pts: 25 },
  { id: 'visit3',  label: 'Visit 3 activity areas in one day',  pts: 50 },
  { id: 'visit4',  label: 'Visit all 4 activity areas in one day', pts: 100 },
  { id: 'streak3', label: 'Attend 3 consecutive days',          pts: 50 },
  { id: 'streak7', label: 'Attend 7 consecutive days',          pts: 150 },
  { id: 'monthly', label: 'Complete a monthly fitness challenge', pts: 250 },
  { id: 'friend',  label: 'Bring a friend',                     pts: 25 },
];

// quick-pick durations offered in the log flow (minutes)
export const DURATIONS = [15, 20, 30, 45, 60, 90];