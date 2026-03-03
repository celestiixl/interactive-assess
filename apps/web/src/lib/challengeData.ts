import type { Challenge } from "@/types/challenge";

export const LEVEL_TITLES = [
  "Cell Apprentice",
  "DNA Decoder",
  "Ecosystem Ranger",
  "Genome Guardian",
  "Apex Predator",
] as const;

export const BADGE_MILESTONES: Array<{ key: string; label: string; description: string }> = [
  { key: "first-correct", label: "First Spark", description: "Get your first correct answer." },
  { key: "streak-5", label: "Flame Keeper", description: "Reach a 5-day streak." },
  { key: "xp-100", label: "Centurion", description: "Earn 100 total XP." },
  { key: "xp-300", label: "Lab Legend", description: "Earn 300 total XP." },
  { key: "mastery-cell", label: "Cell Specialist", description: "Reach 80% in Cell Biology." },
];

export const DAILY_HOOKS = [
  "Houston air quality swings can stress lungs. Your respiratory system responds with real-time cell signaling.",
  "Fire ants reshape local food webs in Texas parks. Predator-prey balance is biology in action.",
  "Live oak trees recycle carbon every day. Photosynthesis powers the ecosystems around your community.",
  "Rio Grande ecosystem shifts affect fish populations and biodiversity from microbes to birds.",
  "Your cells are building proteins right now. Gene expression never really clocks out.",
];

export const CHALLENGE_WHY_MATTERS: Record<string, string> = {
  "cell-1": "Membrane transport controls hydration and nutrient flow in every tissue.",
  "cell-2": "Mitochondria output directly impacts athletic performance and fatigue.",
  "cell-3": "Cell specialization is why neurons and skin cells can do totally different jobs.",
  "photo-1": "Plants in Texas grasslands feed the food web by capturing sunlight.",
  "photo-2": "Cellular respiration is how your body turns food into usable energy.",
  "photo-3": "Carbon cycling links your breathing to global climate systems.",
  "eco-1": "Food-web shifts can change pest control and crop health in Texas communities.",
  "eco-2": "Invasive species can alter biodiversity and ecosystem stability quickly.",
  "eco-3": "Water quality in the Rio Grande affects fish, birds, and human communities.",
  "gen-1": "Inherited traits influence risk factors and visible characteristics in families.",
  "gen-2": "DNA mutations can be harmful, helpful, or neutral based on context.",
  "gen-3": "Protein synthesis errors can impact growth, immunity, and metabolism.",
  "body-1": "Homeostasis keeps your internal conditions stable even when environments change.",
  "body-2": "The immune system identifies and removes threats through cellular coordination.",
  "body-3": "Nervous signaling controls reaction time, memory, and movement right now.",
};

export const CHALLENGES: Challenge[] = [
  {
    id: "cell-1",
    topic: "Cell Biology",
    difficulty: 1,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/URUJD5NEXC8", caption: "Cell membrane transport quick explainer." },
      interactive: { type: "clickable", data: { prompt: "Click the structure that controls what enters/leaves the cell.", hotspots: [{ id: "nucleus", label: "Nucleus" }, { id: "membrane", label: "Cell membrane" }, { id: "ribosome", label: "Ribosome" }], correctId: "membrane" } },
      visual: { imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=60", altText: "Microscope image suggesting cell structures." },
      text: { question: "Which cell structure regulates what enters and exits the cell?", choices: ["Nucleus", "Cell membrane", "Mitochondrion", "Golgi apparatus"], correctIndex: 1, explanation: "The cell membrane is selectively permeable and controls transport." },
    },
    xpReward: 10,
  },
  {
    id: "cell-2",
    topic: "Cell Biology",
    difficulty: 2,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/7J4LXs-oDCU", caption: "ATP production in mitochondria." },
      interactive: { type: "drag-drop", data: { prompt: "Match organelle to function.", labels: ["Mitochondrion", "Ribosome", "Nucleus"], targets: ["ATP production", "Protein synthesis", "Stores DNA"], correctMap: { "ATP production": "Mitochondrion", "Protein synthesis": "Ribosome", "Stores DNA": "Nucleus" } } },
      visual: { imageUrl: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=900&q=60", altText: "Lab visualization of cells." },
      text: { question: "During intense exercise, which organelle activity increases most?", choices: ["Lysosome digestion", "Mitochondrial ATP production", "Chromosome condensation", "Cell wall synthesis"], correctIndex: 1, explanation: "Muscle cells require more ATP, so mitochondrial respiration rises." },
    },
    xpReward: 25,
  },
  {
    id: "cell-3",
    topic: "Cell Biology",
    difficulty: 3,
    realWorldTag: "Current Event",
    modes: {
      video: { url: "https://www.youtube.com/embed/gFuEoxh5hd4", caption: "Stem cells and differentiation." },
      interactive: { type: "clickable", data: { prompt: "Select the best explanation for why stem cells matter in medicine.", hotspots: [{ id: "same", label: "All cells always have identical structures and functions" }, { id: "differentiate", label: "Unspecialized cells can become specialized cell types" }, { id: "immune", label: "They permanently stop immune responses" }], correctId: "differentiate" } },
      visual: { imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=60", altText: "Microscope laboratory setting." },
      text: { question: "Why are stem cells important in tissue repair research?", choices: ["They are always prokaryotic", "They can differentiate into specialized cells", "They do not divide", "They only exist in plants"], correctIndex: 1, explanation: "Stem cells can become specialized cells, supporting repair and regeneration studies." },
    },
    xpReward: 50,
  },
  {
    id: "photo-1",
    topic: "Photosynthesis & Respiration",
    difficulty: 1,
    realWorldTag: "Texas Ecosystem",
    modes: {
      video: { url: "https://www.youtube.com/embed/sQK3Yr4Sc_k", caption: "Photosynthesis basics." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=900&q=60", altText: "Green leaves in sunlight." },
      text: { question: "Which reactant is required for photosynthesis?", choices: ["Oxygen", "Carbon dioxide", "ATP only", "Nitrogen gas"], correctIndex: 1, explanation: "Photosynthesis uses carbon dioxide and water with light energy to make glucose." },
    },
    xpReward: 10,
  },
  {
    id: "photo-2",
    topic: "Photosynthesis & Respiration",
    difficulty: 2,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/00jbG_cfGuQ", caption: "Cellular respiration in human cells." },
      interactive: { type: "drag-drop", data: { prompt: "Place process in correct organelle.", labels: ["Cellular respiration", "Photosynthesis"], targets: ["Mitochondria", "Chloroplast"], correctMap: { Mitochondria: "Cellular respiration", Chloroplast: "Photosynthesis" } } },
      text: { question: "True or False: Cellular respiration occurs in mitochondria and releases ATP.", choices: ["True", "False"], correctIndex: 0, explanation: "Respiration in mitochondria generates ATP from glucose." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=900&q=60", altText: "Runner representing energy use in cells." },
    },
    xpReward: 25,
  },
  {
    id: "photo-3",
    topic: "Photosynthesis & Respiration",
    difficulty: 3,
    realWorldTag: "Current Event",
    modes: {
      video: { url: "https://www.youtube.com/embed/j7M5trAB2QQ", caption: "Carbon cycle and climate." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1475776408506-9a5371e7a068?auto=format&fit=crop&w=900&q=60", altText: "Atmospheric clouds over landscape." },
      text: { question: "Fill in the blank: In the carbon cycle, plants remove ______ from the atmosphere.", choices: ["methane", "carbon dioxide", "oxygen", "nitrogen"], correctIndex: 1, explanation: "Photosynthesis removes atmospheric carbon dioxide and stores carbon in biomass." },
    },
    xpReward: 50,
  },
  {
    id: "eco-1",
    topic: "Ecosystems",
    difficulty: 1,
    realWorldTag: "Texas Ecosystem",
    modes: {
      video: { url: "https://www.youtube.com/embed/vpTHi7O66pI", caption: "Food webs and energy transfer." },
      interactive: { type: "clickable", data: { prompt: "Choose the producer in this simple Texas food web.", hotspots: [{ id: "hawk", label: "Red-tailed hawk" }, { id: "oak", label: "Live oak tree" }, { id: "ant", label: "Fire ant" }], correctId: "oak" } },
      text: { question: "In a Texas food web, which organism is a producer?", choices: ["Live oak tree", "Fire ant", "Frog", "Heron"], correctIndex: 0, explanation: "Producers make their own food using photosynthesis." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=60", altText: "Forest ecosystem scene." },
    },
    xpReward: 10,
  },
  {
    id: "eco-2",
    topic: "Ecosystems",
    difficulty: 2,
    realWorldTag: "Your Community",
    modes: {
      video: { url: "https://www.youtube.com/embed/6M4P7uM5w6Q", caption: "Invasive species effects." },
      text: { question: "If an invasive species rapidly increases, what is most likely first?", choices: ["Biodiversity instantly rises", "Native populations may decline", "Nutrient cycles stop", "All predators disappear"], correctIndex: 1, explanation: "Invasive species often outcompete natives, reducing biodiversity." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=60", altText: "Wildlife habitat." },
    },
    xpReward: 25,
  },
  {
    id: "eco-3",
    topic: "Ecosystems",
    difficulty: 3,
    realWorldTag: "Texas Ecosystem",
    modes: {
      video: { url: "https://www.youtube.com/embed/GK_vRtHJZu4", caption: "Water quality and aquatic ecosystems." },
      interactive: { type: "drag-drop", data: { prompt: "Match indicator to likely ecosystem condition.", labels: ["High dissolved oxygen", "Algal bloom"], targets: ["Healthier fish populations", "Possible eutrophication"], correctMap: { "Healthier fish populations": "High dissolved oxygen", "Possible eutrophication": "Algal bloom" } } },
      text: { question: "Rio Grande dissolved oxygen drops sharply. Most likely short-term impact?", choices: ["Fish stress increases", "Primary production stops globally", "Water turns sterile", "No ecological effect"], correctIndex: 0, explanation: "Low dissolved oxygen can stress or kill aquatic organisms quickly." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=60", altText: "River ecosystem." },
    },
    xpReward: 50,
  },
  {
    id: "gen-1",
    topic: "Genetics & Heredity",
    difficulty: 1,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/Mehz7tCxjSE", caption: "Genes and traits basics." },
      text: { question: "A trait controlled by two alleles is inherited from where?", choices: ["Only the mother", "Only the father", "One allele from each parent", "The environment only"], correctIndex: 2, explanation: "For typical Mendelian traits, one allele is inherited from each parent." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=900&q=60", altText: "DNA model imagery." },
    },
    xpReward: 10,
  },
  {
    id: "gen-2",
    topic: "Genetics & Heredity",
    difficulty: 2,
    realWorldTag: "Current Event",
    modes: {
      video: { url: "https://www.youtube.com/embed/8m6hHRlKwxY", caption: "Mutations and variation." },
      interactive: { type: "clickable", data: { prompt: "Pick the statement that best describes a mutation.", hotspots: [{ id: "alwaysbad", label: "Mutations are always harmful" }, { id: "variation", label: "Mutations can introduce genetic variation" }, { id: "neverpassed", label: "Mutations can never be inherited" }], correctId: "variation" } },
      text: { question: "True or False: All DNA mutations are harmful.", choices: ["True", "False"], correctIndex: 1, explanation: "Mutations can be harmful, neutral, or beneficial." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=60", altText: "DNA sequence visualization." },
    },
    xpReward: 25,
  },
  {
    id: "gen-3",
    topic: "Genetics & Heredity",
    difficulty: 3,
    realWorldTag: "Your Community",
    modes: {
      video: { url: "https://www.youtube.com/embed/oefAI2x2CQM", caption: "Protein synthesis: transcription and translation." },
      interactive: { type: "drag-drop", data: { prompt: "Order these steps.", labels: ["DNA is transcribed", "mRNA exits nucleus", "Ribosome translates codons"], targets: ["Step 1", "Step 2", "Step 3"], correctMap: { "Step 1": "DNA is transcribed", "Step 2": "mRNA exits nucleus", "Step 3": "Ribosome translates codons" } } },
      text: { question: "Which process directly reads mRNA codons to build a protein?", choices: ["Replication", "Translation", "Diffusion", "Fermentation"], correctIndex: 1, explanation: "Ribosomes translate mRNA codons into amino acid sequences." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=900&q=60", altText: "Biology lab setting." },
    },
    xpReward: 50,
  },
  {
    id: "body-1",
    topic: "Human Body Systems",
    difficulty: 1,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/qWTRMklPC3U", caption: "Homeostasis basics." },
      text: { question: "When you sweat on a hot Texas day, your body is maintaining:", choices: ["Mutation rate", "Homeostasis", "Speciation", "Photosynthetic rate"], correctIndex: 1, explanation: "Sweating helps regulate temperature to maintain homeostasis." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=60", altText: "Student exercising outdoors." },
    },
    xpReward: 10,
  },
  {
    id: "body-2",
    topic: "Human Body Systems",
    difficulty: 2,
    realWorldTag: "Current Event",
    modes: {
      video: { url: "https://www.youtube.com/embed/PSRJfaAYkW4", caption: "Immune response overview." },
      interactive: { type: "clickable", data: { prompt: "Select the body system most directly responsible for producing antibodies.", hotspots: [{ id: "immune", label: "Immune system" }, { id: "skeletal", label: "Skeletal system" }, { id: "digestive", label: "Digestive system" }], correctId: "immune" } },
      text: { question: "Which system produces targeted defenses like antibodies?", choices: ["Nervous", "Digestive", "Immune", "Excretory"], correctIndex: 2, explanation: "The immune system generates specific responses including antibodies." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=60", altText: "Medical environment image." },
    },
    xpReward: 25,
  },
  {
    id: "body-3",
    topic: "Human Body Systems",
    difficulty: 3,
    realWorldTag: "Your Body",
    modes: {
      video: { url: "https://www.youtube.com/embed/3oef68YabD0", caption: "Neurons and signal transmission." },
      interactive: { type: "drag-drop", data: { prompt: "Match neuron structure to role.", labels: ["Dendrite", "Axon", "Myelin sheath"], targets: ["Receives signal", "Sends signal away", "Insulates for faster transmission"], correctMap: { "Receives signal": "Dendrite", "Sends signal away": "Axon", "Insulates for faster transmission": "Myelin sheath" } } },
      text: { question: "A damaged myelin sheath most directly slows which process?", choices: ["DNA replication", "Nerve impulse conduction", "Protein digestion", "Bone growth"], correctIndex: 1, explanation: "Myelin insulation increases speed of nerve signal transmission." },
      visual: { imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=60", altText: "Brain and neural concept image." },
    },
    xpReward: 50,
  },
];

export function xpForDifficulty(difficulty: 1 | 2 | 3): number {
  if (difficulty === 1) return 10;
  if (difficulty === 2) return 25;
  return 50;
}

export function levelFromXP(xp: number): number {
  return Math.max(1, Math.floor(Math.max(0, xp) / 100) + 1);
}

export function levelTitle(level: number): string {
  const index = Math.max(0, Math.min(LEVEL_TITLES.length - 1, level - 1));
  return LEVEL_TITLES[index];
}

export function getTodaysHook(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return DAILY_HOOKS[dayOfYear % DAILY_HOOKS.length];
}
