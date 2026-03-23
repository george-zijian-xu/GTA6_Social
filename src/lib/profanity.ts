const BLOCKED_WORDS = [
  "damn", "hell", "shit", "fuck", "ass", "bitch", "bastard",
  "dick", "piss", "crap", "cunt", "idiot", "retard", "slut",
  "whore", "nigger", "faggot",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
}
