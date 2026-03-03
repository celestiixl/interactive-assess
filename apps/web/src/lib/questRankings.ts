export type QuestLeaderRow = {
  name: string;
  avatar: string;
  xp: number;
  classCode: string;
  team: "A" | "B";
};

export const QUEST_LEADER_ROWS: QuestLeaderRow[] = [
  { name: "Zoe", avatar: "🌿", xp: 516, classCode: "BIO-7A", team: "A" },
  { name: "Maya", avatar: "🦊", xp: 505, classCode: "BIO-7A", team: "B" },
  { name: "Aria", avatar: "🦎", xp: 499, classCode: "BIO-7B", team: "A" },
  { name: "Ethan", avatar: "🦅", xp: 485, classCode: "BIO-8A", team: "B" },
  { name: "Riley", avatar: "🐬", xp: 478, classCode: "BIO-8A", team: "A" },
  { name: "Milo", avatar: "🦠", xp: 465, classCode: "BIO-7B", team: "A" },
  { name: "Jalen", avatar: "🦉", xp: 453, classCode: "BIO-7B", team: "B" },
  { name: "Kai", avatar: "🧬", xp: 439, classCode: "BIO-8A", team: "A" },
  { name: "Sofia", avatar: "🐙", xp: 425, classCode: "BIO-8A", team: "B" },
  { name: "Noah", avatar: "🦈", xp: 402, classCode: "BIO-7A", team: "B" },
  { name: "Liam", avatar: "🐢", xp: 390, classCode: "BIO-7B", team: "A" },
  { name: "Isabella", avatar: "🦋", xp: 376, classCode: "BIO-7A", team: "B" },
];
