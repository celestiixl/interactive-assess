export const MOTIVATIONAL_MESSAGES = [
  "Great job! 🎉",
  "You nailed it! 🌟",
  "Excellent work! 🏆",
  "You're on fire! 🔥",
  "Brilliant! ⭐",
  "Outstanding! 🚀",
  "Perfect! 👏",
  "Awesome! 🎯",
  "Way to go! 🙌",
  "You've got this! 💪",
  "Fantastic! 🥳",
  "Superb! 🦸",
  "Keep it up! 👍",
  "Incredible! 🎊",
  "You're a star! ⭐",
];

export function getMotivationalMessage(): string {
  return MOTIVATIONAL_MESSAGES[
    Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  ];
}
