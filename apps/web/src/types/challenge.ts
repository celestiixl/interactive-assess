export interface Challenge {
  id: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  realWorldTag: "Your Body" | "Texas Ecosystem" | "Current Event" | "Your Community";
  modes: {
    video?: { url: string; caption: string };
    interactive?: { type: "drag-drop" | "clickable"; data: any };
    visual?: { imageUrl: string; altText: string };
    text: {
      question: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
    };
  };
  xpReward: number;
}

export interface StudentProfile {
  name: string;
  nameLocked: boolean;
  classCode: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  topicAccuracy: Record<string, { correct: number; total: number }>;
  preferredMode: "video" | "interactive" | "visual" | "text";
}

export type ChallengeMode = StudentProfile["preferredMode"];
