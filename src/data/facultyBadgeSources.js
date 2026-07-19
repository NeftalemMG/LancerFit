// Build-time require() map for the faculty crest badges. Metro resolves these
// paths at bundle time, so every file listed here must exist (all nine do:
// assets/facultyBadges/1.png .. 9.png, index-aligned to faculty1..faculty9).
//
// Kept in its own file (mirroring avatarSources.js) so the mapping lives in one
// place and the FacultyBadge component stays presentational.

export const FACULTY_BADGE_SOURCES = {
  faculty1: require("../../assets/facultyBadges/1.png"),
  faculty2: require("../../assets/facultyBadges/2.png"),
  faculty3: require("../../assets/facultyBadges/3.png"),
  faculty4: require("../../assets/facultyBadges/4.png"),
  faculty5: require("../../assets/facultyBadges/5.png"),
  faculty6: require("../../assets/facultyBadges/6.png"),
  faculty7: require("../../assets/facultyBadges/7.png"),
  faculty8: require("../../assets/facultyBadges/8.png"),
  faculty9: require("../../assets/facultyBadges/9.png"),
};

export function badgeSourceFor(facultyKey) {
  return FACULTY_BADGE_SOURCES[facultyKey] || null;
}