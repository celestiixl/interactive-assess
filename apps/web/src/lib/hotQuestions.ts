export type HotQuestion = {
  id: string;
  teks?: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

export const HOT_QUESTIONS: HotQuestion[] = [
  {
    id: "b13a-01",
    teks: "B.13A",
    prompt:
      "In a kelp forest, sea otters eat sea urchins. If sea otters are removed, what is the most likely outcome over time?",
    choices: [
      "Sea urchin population decreases and kelp increases",
      "Sea urchin population increases and kelp decreases",
      "Both populations stay the same because producers control everything",
      "Kelp decreases first, causing urchins to decrease",
    ],
    answerIndex: 1,
    explanation:
      "Without predators, urchins increase and overgraze kelp, reducing ecosystem stability.",
  },
  {
    id: "b13a-02",
    teks: "B.13A",
    prompt:
      "Two species of birds use the same nesting sites. Over time, nesting success decreases for both species. Which relationship is shown?",
    choices: ["Mutualism", "Commensalism", "Competition", "Parasitism"],
    answerIndex: 2,
    explanation:
      "Both species are harmed because they compete for the same limited resource.",
  },
];
