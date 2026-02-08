export type ReportingCategory = {
  id: "RC1" | "RC2" | "RC3" | "RC4";
  name: string;
  description: string;
  teks: string[];
};

export const REPORTING_CATEGORIES: ReportingCategory[] = [
  { id: "RC1", name: "Cell Structure & Function", description: "Cells, biomolecules, organelles, membranes, transport.", teks: ["BIO.5A","BIO.5B","BIO.5C","BIO.5D","BIO.5E"] },
  { id: "RC2", name: "Mechanisms of Genetics", description: "DNA/RNA, protein synthesis, inheritance, mutations.", teks: ["BIO.6A","BIO.6B","BIO.7A","BIO.7B"] },
  { id: "RC3", name: "Biological Evolution & Classification", description: "Evidence of evolution, natural selection, classification.", teks: ["BIO.9A","BIO.9B","BIO.9C"] },
  { id: "RC4", name: "Biological Processes & Systems", description: "Energy flow, respiration/photosynthesis, systems, ecology.", teks: ["BIO.8A","BIO.8B","BIO.10A","BIO.10B"] },
];

export function teksToRc(teksCode: string): ReportingCategory["id"] | null {
  const code = teksCode.trim().toUpperCase();
  for (const rc of REPORTING_CATEGORIES) {
    if (rc.teks.map((t) => t.toUpperCase()).includes(code)) return rc.id;
  }
  return null;
}
