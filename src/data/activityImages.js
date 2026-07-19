// src/data/activityImages.js
//
// A curated Unsplash photo per activity, keyed by the sub-activity `id` with a
// fallback by `icon` type, then a final generic fitness fallback. URLs use
// Unsplash's image CDN with sizing params (w=400, q=70) so they load fast and
// look crisp in the small activity tiles. Stable URLs — no API key needed.
//
// To swap an image: replace the URL. To add one for a new activity: add its id.

const U = (id, opts = "w=400&h=260&fit=crop&q=70") =>
  `https://images.unsplash.com/${id}?${opts}`;

// By specific activity id.
export const ACTIVITY_IMAGE_BY_ID = {
  // Pool
  fitlane:    U("photo-1530549387789-4c1017266635"),
  shallow:    U("photo-1560090995-01632a28895b"),
  deep:       U("photo-1600965962361-9035dbfd1c50"),
  leisure:    U("photo-1519315901367-f34ff9154487"),
  rec:        U("photo-1571902943202-507ec2618e8f"),
  lessons:    U("photo-1622629797619-c100e3e67e2e"),
  // Fitness Centre
  cardio:     U("photo-1538805060514-97d9cc17730c"),
  strength:   U("photo-1534438327276-14e5300c3a48"),
  flex:       U("photo-1544367567-0f2fcb009e0b"),
  boxing:     U("photo-1549719386-74dfcbf7dbed"),
  // Group Fitness
  spin:       U("photo-1534258936925-c58bed479fcb"),
  lancerlift: U("photo-1517836357463-d25dfeac3438"),
  bootcamp:   U("photo-1518611012118-696072aa579a"),
  kickbox:    U("photo-1544367567-0f2fcb009e0b"),
  hyrox:      U("photo-1571019614242-c5c5dee9f50b"),
  yoga:       U("photo-1544367567-0f2fcb009e0b"),
  zumba:      U("photo-1508700115892-45ecd05ae2ad"),
  karate:     U("photo-1555597673-b21d5c935865"),
  // Courts
  pickleball: U("photo-1626224583764-f87db24ac4ea"),
  badminton:  U("photo-1626224583764-f87db24ac4ea"),
  tabletennis:U("photo-1534158914592-062992fbe900"),
  volleyball: U("photo-1612872087720-bb876e2e67d1"),
  basketball: U("photo-1546519638-68e109498ffc"),
  track:      U("photo-1571008887538-b36bb32f4571"),
  // Intramural
  imbasket:   U("photo-1546519638-68e109498ffc"),
  imvolley:   U("photo-1612872087720-bb876e2e67d1"),
  soccer:     U("photo-1551958219-acbc608c6377"),
  futsal:     U("photo-1551958219-acbc608c6377"),
  flagfb:     U("photo-1566577739112-5180d4bf9390"),
};

// By icon type (fallback when an id has no explicit image).
export const ACTIVITY_IMAGE_BY_ICON = {

  pool: U("photo-1519315901367-f34ff9154487"),
  lane: U("photo-1530549387789-4c1017266635"),
  aqua: U("photo-1560090995-01632a28895b"),
  treadmill: U("photo-1538805060514-97d9cc17730c"),
  barbell: U("photo-1534438327276-14e5300c3a48"),
  stretch: U("photo-1544367567-0f2fcb009e0b"),
  boxing: U("photo-1549719386-74dfcbf7dbed"),
  spin: U("photo-1534258936925-c58bed479fcb"),
  bootcamp: U("photo-1518611012118-696072aa579a"),
  yoga: U("photo-1544367567-0f2fcb009e0b"),
  basketball: U("photo-1546519638-68e109498ffc"),
  volleyball: U("photo-1612872087720-bb876e2e67d1"),
  soccer: U("photo-1551958219-acbc608c6377"),
  track: U("photo-1571008887538-b36bb32f4571"),
  paddle: U("photo-1534158914592-062992fbe900"),
  shuttle: U("photo-1626224583764-f87db24ac4ea"),
  
};

const GENERIC_FALLBACK = U("photo-1517836357463-d25dfeac3438");

// Resolve the best image for a sub-activity.
export function imageForActivity(sub) {
  if (!sub) return GENERIC_FALLBACK;
  return (
    ACTIVITY_IMAGE_BY_ID[sub.id] ||
    ACTIVITY_IMAGE_BY_ICON[sub.icon] ||
    GENERIC_FALLBACK
  );
}

// A generic image for a user's custom "Other" activity.
export const CUSTOM_ACTIVITY_IMAGE = U("photo-1517963879433-6ad2b056d712");