// TypeScript types for the Ecological Succession Visualizer
// TEKS: B.6D (mechanisms of change in ecosystems), B.11A (matter/energy flow)

/** The triggering disturbance event for secondary succession */
export interface DisturbanceEvent {
  id: string;
  name: string;
  location: string;
  year: number;
  description: string;
  /** 0–1 scale of disturbance severity */
  severity: number;
  type: "wildfire" | "flood" | "drought";
}

/** One phase of ecological recovery */
export interface SuccessionStage {
  id: string;
  /** Human-readable stage name, e.g. "Bare Ground", "Pioneer Species" */
  name: string;
  /** Number of years after the disturbance event */
  yearsAfterDisturbance: number;
  /** 2–4 dominant species present at this stage */
  dominantSpecies: string[];
  /** 0–1: low = degraded, 1 = rich/healthy soil */
  soilHealth: number;
  /** 0–1: 0 = open sky, 1 = full closed canopy */
  canopyCover: number;
  /** 0–1: Shannon-style index of species richness */
  biodiversityIndex: number;
  /** One-sentence ecological explanation of this stage */
  description: string;
  /** Connection to TEKS B.6D or B.11A */
  ecologicalNote: string;
}

/** A complete named succession scenario */
export interface SuccessionScenario {
  id: string;
  name: string;
  disturbance: DisturbanceEvent;
  /** Exactly 5 stages ordered by yearsAfterDisturbance */
  stages: SuccessionStage[];
  /** TEKS codes covered, e.g. ["B.6D", "B.11A"] */
  teks: string[];
  /** Real-world anchor sentence for the phenomenon hook */
  phenomenon: string;
}
