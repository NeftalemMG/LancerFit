// src/data/authOptions.js
//
// Options for the sign-up form. Nationality now covers every country (226) via
// the shared COUNTRIES dataset, each shown with its flag emoji. Faculties carry
// a stable `key` (faculty1..faculty9) used to theme the user's avatar + accent
// color everywhere in the app.

import { COUNTRIES } from "./countries";

// Faculty order is FIXED — the index maps to the avatar folders (Faculty 1..9)
// and the accent palette in facultyTheme.js. Do not reorder without updating both.
export const FACULTY_OPTIONS = [
  { key: "faculty1", label: "Faculty of Arts, Humanities and Social Sciences", value: "Faculty of Arts, Humanities and Social Sciences" },
  { key: "faculty2", label: "Faculty of Education", value: "Faculty of Education" },
  { key: "faculty3", label: "Faculty of Engineering", value: "Faculty of Engineering" },
  { key: "faculty4", label: "Faculty of Graduate Studies", value: "Faculty of Graduate Studies" },
  { key: "faculty5", label: "Faculty of Human Kinetics", value: "Faculty of Human Kinetics" },
  { key: "faculty6", label: "Faculty of Law", value: "Faculty of Law" },
  { key: "faculty7", label: "Faculty of Nursing", value: "Faculty of Nursing" },
  { key: "faculty8", label: "Odette School of Business", value: "Odette School of Business" },
  { key: "faculty9", label: "Faculty of Science", value: "Faculty of Science" },
];

// Look up a faculty's theme key from its stored value string.
export const FACULTY_KEY_BY_VALUE = FACULTY_OPTIONS.reduce((acc, f) => {
  acc[f.value] = f.key;
  return acc;
}, {});

// Nationality options: every country, flag first in the label so the dropdown
// shows "🇨🇦  Canada". `value` is the lowercase ISO code we persist.
export const NATIONALITY_OPTIONS = COUNTRIES.map((c) => ({
  label: `${c.flag}  ${c.label}`,
  value: c.code,
}));