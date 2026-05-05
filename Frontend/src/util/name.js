const adjectives = [
  "Crazy",
  "Sneaky",
  "Happy",
  "Angry",
  "Lazy",
  "Witty",
  "Funky",
  "Brave",
  "Chill",
  "Wild",
];

const nouns = [
  "Tiger",
  "Banana",
  "Ninja",
  "Penguin",
  "Cactus",
  "Wizard",
  "Potato",
  "Dragon",
  "Monkey",
  "Robot",
];

export function generateName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);

  return `${adj}${noun}${num}`;
}
