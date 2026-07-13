// src/data/facultyTheme.js
//
// Maps each faculty to (a) its accent color — matching the "Design System"
// and (b) resolves its level-up avatar image.
//
// LEVELS: 5 avatar tiers. Player's Lancer level maps to a tier so the avatar
// evolves: Squire(1) -> Knight(2) -> Hero(3) -> Legend(4) -> Lancer(5).

import { AVATAR_SOURCES } from "./avatarSources";

export const FACULTY_THEME = {
  faculty1: { name: "Arts, Humanities & Social Sciences", accent: "#C8102E", accentSoft: "rgba(200,16,46,0.16)", accentLine: "rgba(200,16,46,0.40)" },
  faculty2: { name: "Education",                          accent: "#2A6EBB", accentSoft: "rgba(42,110,187,0.16)", accentLine: "rgba(42,110,187,0.40)" },
  faculty3: { name: "Engineering",                        accent: "#0E7A5F", accentSoft: "rgba(14,122,95,0.16)",  accentLine: "rgba(14,122,95,0.40)" },
  faculty4: { name: "Graduate Studies",                   accent: "#F2B705", accentSoft: "rgba(242,183,5,0.16)",  accentLine: "rgba(242,183,5,0.42)" },
  faculty5: { name: "Human Kinetics",                     accent: "#6B3FA0", accentSoft: "rgba(107,63,160,0.16)", accentLine: "rgba(107,63,160,0.40)" },
  faculty6: { name: "Law",                                accent: "#C05A1B", accentSoft: "rgba(192,90,27,0.16)",  accentLine: "rgba(192,90,27,0.40)" },
  faculty7: { name: "Nursing",                            accent: "#7F9AC0", accentSoft: "rgba(127,154,192,0.18)",accentLine: "rgba(127,154,192,0.44)" },
  faculty8: { name: "Odette School of Business",          accent: "#7A1F2B", accentSoft: "rgba(122,31,43,0.18)",  accentLine: "rgba(122,31,43,0.42)" },
  faculty9: { name: "Science",                            accent: "#2E8B84", accentSoft: "rgba(46,139,132,0.16)", accentLine: "rgba(46,139,132,0.40)" },
};

export const TIER_NAMES = ["Squire", "Knight", "Hero", "Legend", "Lancer"];

export function tierForLevel(level = 1) {
  if (level >= 20) return 5;
  if (level >= 14) return 4;
  if (level >= 8) return 3;
  if (level >= 3) return 2;
  return 1;
}

export function tierName(level = 1) {
  return TIER_NAMES[tierForLevel(level) - 1];
}

// Returns an image source for faculty + level, or null if art isn't added yet.
export function getAvatarSource(facultyKey, level = 1) {
  if (!facultyKey) return null;
  const tier = tierForLevel(level);
  return AVATAR_SOURCES?.[facultyKey]?.[tier - 1] ?? null;
}

export function themeForFaculty(facultyKey) {
  return FACULTY_THEME[facultyKey] || {
    accent: "#4A93D8", accentSoft: "rgba(74,147,216,0.16)", accentLine: "rgba(74,147,216,0.4)", name: "",
  };
}