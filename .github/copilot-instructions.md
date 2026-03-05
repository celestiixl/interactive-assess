# BioSpark – GitHub Copilot Instructions

> Drop this file at `.github/copilot-instructions.md` in the BioSpark repo.
> Copilot will use it as persistent context for all code suggestions.

---

## 1. Project Identity

**BioSpark** is a high-school Biology learning platform built for FBISD (Fort Bend ISD) students.
It is a Next.js (App Router) application with TypeScript, Tailwind CSS, and a local-first persistence model.
All curriculum content, TEKS standards, vocabulary, learning progressions, and assessment logic must
align with the **FBISD Biology curriculum documents** described in this file.

---

## 2. Curriculum Source of Truth

### Units currently loaded (more units will be added)

| Unit | Title | Date Range | Instructional Days |
|------|-------|------------|-------------------|
| 1 | Biomolecules and Cells | Aug 12 – Sep 18 | 26 |
| 2 | Nucleic Acids and Protein Synthesis | Sep 10 – Oct 9 | 11 |

> When generating new units, lessons, question banks, or content, always check this file
> for the authoritative concept structure, TEKS codes, vocabulary, and learning progressions.

---

## 3. Unit 1 – Biomolecules and Cells

### Concept Sequence (teach in this order)
1. **Lab Safety** (3 days) — B.1D, B.1B, B.3A
2. **Biomolecules and Cells** (10 days) — B.5A (priority), B.5B (priority)
3. **Cellular Processes** (5 days) — B.5C, B.11B (priority)
4. **Energy Conversions in Cells** (8 days) — B.11A (priority)

### Priority TEKS (bold in curriculum; gate mastery unlock on these)
- `B.5A` – relate functions of carbohydrates, lipids, proteins, nucleic acids to cell structure/function
- `B.5B` – compare/contrast prokaryotic vs eukaryotic cells, including endosymbiotic theory
- `B.11A` – explain matter conservation and energy transfer in photosynthesis & cellular respiration using models/equations
- `B.11B` – investigate/explain the role of enzymes in facilitating cellular processes
- `B.1D` – use appropriate lab tools (microscopes, gel electrophoresis, PCR, etc.)
- `B.1B` – plan and conduct descriptive, comparative, and experimental investigations
- `B.3A` – develop explanations supported by data and models

### Concept 1: Lab Safety
**Learning Intentions:** Explain and follow safety rules as they apply to lab/field investigations.

**Success Criteria (students can):**
- Identify safety equipment in the classroom
- Explain how and when to use safety equipment
- Explain procedures for an injury
- Explain procedures for broken glass/equipment

**Essential Questions:**
- Why is safety important in science?
- Does science have the answer for everything?

**Key Vocabulary:**
- Everyday: rules, safety, flame, fire, sink, protection, long hair, water, footwear, lotion, soap, rag, alcohol
- Academic: laboratory, equipment, field, investigation, horseplay, procedures
- Content-specific: Safety Data Sheet, Fume Hood, Safety Shower, First Aid Kit, Safety Apron, Hazards,
  Flammability, Corrosive, Radioactivity, Disposal, Recycle, Test tubes, Tongs, Fire Blanket

**Common Misconceptions to address in lesson content:**
- Safety equipment is optional or only for specific experiments
- Odorless/harmless-looking chemicals are safe
- Food/drink is allowed in the lab
- Students fear reporting accidents — platform should reinforce psychological safety messaging
- All chemicals behave similarly
- Labels/instructions don't need to be read

### Concept 2: Biomolecules and Cells
**Learning Intentions:**
- Discover the four types of biomolecules in the human body
- Explain how biomolecules are fundamental building blocks of living organisms

**Success Criteria (students can):**
- List the hierarchy of cell specialization: cell → tissue → organ → organ system → organism
- Recognize differences in plant vs animal cells
- Explain specific functions of each biomolecule in cellular context
- Understand carbohydrates are made of subunits (monomers/polymers)
- Explain significance of starch, glycogen, cellulose, and glucose
- Construct models of molecular structures

**Essential Questions:**
- How do the functions of biomolecules determine their roles within a cell?
- What are the key biomolecules that constitute living organisms?
- How do carbohydrates function as energy sources and structural components?
- What is the significance of lipids in membranes, energy storage, and signaling?

**Key Vocabulary:**
- Everyday: critique, consume, component, sustain, sequence, disperse, transmit, falsify, wilt, mechanism,
  regulate, projection, bulk, disruption
- Academic: energy, function, model, organic, structure, synthesis, investigation, permeable, semipermeable
- Content-specific: amino acid, catalyst, carbohydrate, biomolecule, deoxyribose, fatty acid, lipid, enzyme,
  macromolecule, monomer, nucleic acid, nucleotide, nitrogenous base, peptide bond, polymer, nucleus

**Learning Progression:**
| Level | Description |
|-------|-------------|
| Developing | Identifies basic cell structures; recognizes prokaryotic vs eukaryotic categorization |
| Progressing | Describes key differences between cell types; categorizes organisms correctly |
| Proficient | Compares/contrasts complexity; explains endosymbiotic theory |
| Advanced | Analyzes evolutionary significance; connects to biotechnology and medicine |

**Common Misconceptions:**
- All fats are unhealthy
- Protein only comes from animal sources
- Carbohydrates only serve as energy (not structural/signaling)
- DNA is only in the cell nucleus (also in mitochondria; RNA is throughout cell)
- Natural and processed sugars are equivalent
- Biomolecules exist independently (not interconnected)
- Subunits always bond the same way
- Students misidentify elements representing each biomolecule
- Students confuse organelle structure/function with cellular process roles

### Concept 3: Cellular Processes (Homeostasis & Transport)
**Learning Intentions:** Describe how cells maintain homeostasis through cellular transport.

**Success Criteria (students can):**
- Identify examples of active and passive transport
- Explain passive diffusion, facilitated diffusion, active transport, endocytosis/exocytosis
- Explain how cellular transport maintains homeostasis
- Evaluate experimental results and identify sources of error

**Essential Questions:**
- How does transport of molecules into/out of a cell relate to homeostasis?
- What are the different ways substances move into/out of cells?
- How do cellular membranes regulate these processes?

**TEA Boundary for B.11B:** Students are NOT expected to memorize names/functions of specific enzymes
or describe exact mechanisms in Tier 1 instruction.

**Key Vocabulary:**
- Everyday: cells, energy, transform, structure, reaction
- Academic: nucleotide, organelle, enzyme, nucleus, cell membrane, DNA, RNA, plasma membrane
- Content-specific: Golgi apparatus, mitochondria, endoplasmic reticulum, ribosome

**Common Misconceptions:**
- All substances use active transport
- Active transport always moves low → high concentration
- Osmosis only occurs in plant cells
- All molecules freely pass through cell membrane
- Cells always gain water through osmosis

### Concept 4: Energy Conversions in Cells
**Learning Intentions:** Comprehend photosynthesis and cellular respiration as they relate to energy conservation.

**Success Criteria (students can):**
- Write balanced equations for photosynthesis and cellular respiration
- Create models illustrating key steps and components
- Explain matter conservation by tracing atom movement
- Compare/contrast inputs, outputs, energy transformations of both processes
- Apply understanding to explain how these processes support life on Earth

**TEA Boundary for B.11A:** Students are NOT expected to know aerobic vs anaerobic respiration differences
or internal processes like Krebs cycle or electron transport chain in Tier 1.

**Key Vocabulary:**
- Academic: cellular respiration, photosynthesis, glycolysis, mitochondria, homeostasis, autotroph,
  heterotroph, chloroplast, membrane
- Content-specific: feedback mechanism, aerobic respiration, anaerobic respiration, electron transport chain,
  light-dependent reaction, light-independent reaction, fermentation

**Learning Progression:**
| Level | Description |
|-------|-------------|
| Developing | Recognizes matter/energy in both processes; states energy comes from sun/food |
| Progressing | Describes how matter/energy move; explains reactants/products |
| Proficient | Uses balanced equations; demonstrates matter conservation; uses models to compare |
| Advanced | Applies to ecosystems; analyzes disruptions (deforestation, cellular dysfunction) |

**Common Misconceptions:**
- All energy comes directly from food (not from ATP conversion)
- ATP is stored long-term
- Mitochondria are the sole energy producers
- Energy is not released during photosynthesis (it's stored as glucose; released in respiration)
- More food consumed = more energy produced

---

## 4. Unit 2 – Nucleic Acids and Protein Synthesis

### Concept Sequence (teach in this order)
1. **DNA, RNA, and Protein Synthesis** (7 days) — B.7A, B.7C (priority)
2. **Gene Expression** (4 days) — B.7B (priority)

### Priority TEKS
- `B.7A` – identify DNA components; explain how nucleotide sequence specifies traits; examine scientific explanations for DNA origin
- `B.7B` – describe significance of gene expression; explain protein synthesis using DNA/RNA models
- `B.7C` – identify and illustrate changes in DNA; evaluate significance of those changes

**TEA Boundary for B.7C:** Students are NOT expected to understand chromosomal mutations in Tier 1.

### Concept 1: DNA, RNA, and Protein Synthesis
**Learning Intentions:**
- How nucleotide sequence specifies traits (central dogma)
- Scientific explanations for DNA origin
- How cells undergo protein synthesis to form polypeptides

**Success Criteria (students can):**
- State and identify molecules in a DNA nucleotide in a diagram
- State and identify molecules in an RNA nucleotide in a diagram
- Name the four types of RNA
- Describe three differences between RNA and DNA
- Name the type of bond on the DNA backbone
- Describe base pairing rules for DNA (A-T, C-G)
- Describe the role of hydrogen bonds in DNA structure
- Describe stages of DNA replication
- Explain the role of enzymes (Helicase, DNA Polymerase) in replication
- Explain and demonstrate transcription and translation using a model
- Transcribe mRNA from a DNA strand using base pairing rules
- Use a codon chart to determine protein sequence from mRNA
- Explain how different proteins can be expressed from one gene
- Define a gene mutation
- Describe two possible effects of nucleotide insertions and deletions
- Explain what is involved in thermal cycling of PCR

**Key Vocabulary:**
- Everyday: human being, characteristic, traits, appearance, offspring
- Academic: DNA, RNA, genetic code, chromosome, nucleus, nucleic acid, gene, test tube,
  monomer, polymer, nucleotide, polypeptide
- Content-specific: transcription, translation, codon, anticodon, antiparallel, base pairs,
  central dogma, double helix, mRNA, tRNA, rRNA, helicase, DNA polymerase, RNA polymerase

**Learning Progression:**
| Level | Description |
|-------|-------------|
| Developing | Recognizes DNA can change; identifies basic mutation types with limited explanation |
| Progressing | Illustrates how sequence changes alter proteins; connects to genetic disorders |
| Proficient | Models mutation types; predicts impact on gene expression/protein structure |
| Advanced | Assesses significance in evolution/biotech; interprets genomics/CRISPR case studies |

**Common Misconceptions:**
- DNA is only composed of nucleotides (overlooks sugar-phosphate backbone role)
- Nitrogenous bases in DNA are interchangeable (base pairing is complementary: A-T, C-G)
- Students confuse hydrogen bonds vs covalent bonds in double helix
- All DNA codes for proteins (some is regulatory, non-coding, or repetitive)
- Any mutation always produces visible phenotype change
- DNA has always existed in its current form

### Concept 2: Gene Expression
**Learning Intentions:**
- Examine steps in gene expression to recognize normal vs abnormal cellular processes
- Explain how different proteins can be expressed from one gene

**Success Criteria (students can):**
- Explain mechanism by which different proteins can be expressed from one gene
- Define a gene mutation
- Describe two possible effects of nucleotide insertions and deletions
- Articulate importance of gene expression in cellular function, development, and environmental response
- Understand gene expression involves transcription (DNA → RNA) and translation (RNA → protein)
- Recognize gene expression is regulated (activated or repressed in specific contexts)

**Key Vocabulary:**
- Everyday: protein, characteristics, traits, regulate, process, offspring, replicate
- Academic: mutation, gene, cancer, chromosome, DNA, RNA, transcription, translation
- Content-specific: gene expression, genome, lac operon, epigenetics, genotype, phenotype,
  promoter, mutation, point mutation, frameshift mutation, missense mutation

**Learning Progression:**
| Level | Description |
|-------|-------------|
| Developing | Identifies genes as DNA segments for traits; recognizes RNA in protein production |
| Progressing | Describes transcription/translation; identifies mRNA/tRNA/rRNA roles |
| Proficient | Explains full process with models; connects gene expression to observable traits |
| Advanced | Evaluates regulatory mechanisms; applies to genetic diseases/mRNA vaccines |

**Common Misconceptions:**
- Gene expression = only making proteins (also includes transcription, RNA processing, post-translational mods)
- DNA directly codes proteins (mRNA is the intermediary)
- RNA and DNA are identical molecules (RNA is single-stranded, uses ribose and uracil)
- Genetic code is always read the same way (exceptions and context-dependent variations exist)
- Each gene codes for a single protein (alternative splicing produces isoforms)
- All mutations change protein sequence (silent, missense, and nonsense mutations differ)

---

## 5. BioSpark Platform Architecture Reference

When generating code, always respect this existing route/component structure:

### Routes
```
/student/dashboard              — mastery donut, TEKS color key, quick links
/student/learning-hub           — standalone learning hub
/student/learn                  — curriculum roadmap hub
/student/learn/[unitId]         — unit chapter page
/student/learn/[unitId]/[lessonSlug] — lesson runtime/player
/student/assignments            — assignment list with filters
/student/learn/standards        — TEKS heatmap + weakest standards
/student/learn/interventions    — intervention queue
/student/guardian               — parent snapshot
/student/profile                — student mastery surface
/teacher/dashboard              — teacher entry point
/teacher/learning-controls      — unit visibility, pacing, period playlists
/teacher/learning-analytics     — funnel + stuck-point analytics
/teacher/import-curriculum      — JSON import validator
/teacher/content-quality        — versioning/approval/changelog
```

### API Routes
```
/api/mastery
/api/assignments
/api/assignments/[assignmentId]/responses
/api/assignments/[assignmentId]/summary
/api/check
/api/attempts
/api/score/cer
/api/score/short
/api/student/validate-name
/api/translate
/api/health
```

### Key Existing Capabilities
- Mastery visualization: adaptive donut/ring using TEKS/unit proficiency data
- Learning progress: stored locally (percent complete, check score, attempts, time spent, last visited)
- Learning settings: stored locally (visible units, pacing mode, playlists by class period)
- Lesson player: section completion, quick-check scoring, attempts, completion gating, read-aloud
- TEKS heatmap generation and weakest-TEKS identification
- Intervention queue generation
- Learning funnel/stuck-point computations
- Guardian snapshot computations
- Lesson unlock logic based on prior mastery/progress

---

## 6. Content Generation Rules

When Copilot generates lesson content, questions, or explanations, follow these rules:

### Question generation
- Always tag questions with the correct TEKS code (e.g., `teks: "B.5A"`)
- Include a `learningLevel` field: `"developing" | "progressing" | "proficient" | "advanced"`
- Include a `conceptId` matching the unit/concept structure above
- For misconception-targeting questions, add `misconceptionTarget: true` and specify which misconception

### Lesson content TypeScript interface
```ts
interface Lesson {
  id: string;
  unitId: string;           // e.g., "unit-1"
  conceptId: string;        // e.g., "concept-2-biomolecules"
  slug: string;
  title: string;
  teks: string[];           // e.g., ["B.5A", "B.5B"]
  isPriorityTEKS: boolean;
  gradingPeriod: number;
  learningIntentions: string[];
  successCriteria: string[];
  vocabulary: {
    everyday: string[];
    academic: string[];
    contentSpecific: string[];
  };
  misconceptions: string[];
  sections: LessonSection[];
  quickChecks: QuickCheck[];
  interventionTier: 2 | 3 | null;
}
```

### Vocabulary display
- Always display vocabulary in three tiers: Everyday Language, Academic Words, Content Specific
- Content-specific vocabulary should be highlighted/bolded in lesson text on first use

### Learning progression gating
- Students at "developing" level should NOT see advanced content
- Lesson unlock logic must check prior mastery before revealing next lesson
- Priority TEKS (`B.5A`, `B.5B`, `B.11A`, `B.11B`, `B.7A`, `B.7B`, `B.7C`) gate unit completion

### Intervention triggers
- Trigger Tier 2 intervention if student scores < 70% on a concept quick-check
- Trigger Tier 3 intervention if student scores < 50% or has 2+ failed attempts
- Intervention content should map to the curriculum-specified strategies:
  - Tier 2: graphic organizers, concept maps, model building
  - Tier 3: one-on-one tutoring scaffolds, sentence starters, simplified materials

### Assessment alignment
- All formative tasks must align to the concept's culminating formative task structure
- CER (Claim-Evidence-Reasoning) scoring is available via `/api/score/cer`
- Short-answer scoring via `/api/score/short`

---

## 7. TEKS Reference Quick-Lookup

| Code | Skill Verb(s) | TEA Priority |
|------|---------------|--------------|
| B.1A | Ask questions, define problems | SEP |
| B.1B | Plan and conduct investigations | SEP (Priority) |
| B.1D | Use appropriate lab tools | SEP (Priority) |
| B.1G | Develop and use models | SEP |
| B.2A | Identify model advantages/limitations | SEP |
| B.3A | Develop explanations with data/models | SEP (Priority) |
| B.3B | Communicate explanations | SEP |
| B.5A | Relate biomolecule functions to cell structure | **Priority Content** |
| B.5B | Compare prokaryotic vs eukaryotic cells | **Priority Content** |
| B.5C | Investigate homeostasis through transport | Content |
| B.7A | Identify DNA components; explain nucleotide sequence | Content |
| B.7B | Describe gene expression; explain protein synthesis | **Priority Content** |
| B.7C | Identify/illustrate DNA changes; evaluate significance | **Priority Content** |
| B.11A | Explain matter conservation in photosynthesis/respiration | **Priority Content** |
| B.11B | Investigate/explain enzyme roles | **Priority Content** |

---

## 8. Coding Conventions for BioSpark

- **Framework:** Next.js 14+ App Router, TypeScript strict mode
- **Styling:** Tailwind CSS utility classes only (no arbitrary values unless necessary)
- **State:** Local-first via `localStorage` wrappers; do not add external DB calls without existing API routes
- **Components:** Server components by default; add `"use client"` only when interactivity requires it
- **Data fetching:** Use existing API routes — do not create new DB schemas without teacher approval
- **TEKS tags:** Always use the canonical string format `"B.5A"` (not `"b5a"`, `"B5A"`, etc.)
- **Unit IDs:** Use kebab-case: `"unit-1"`, `"unit-2"` etc.
- **Lesson slugs:** Use kebab-case matching the concept: `"lab-safety"`, `"biomolecules-intro"`, `"cell-transport"`, etc.
- **Accessibility:** All interactive elements must have ARIA labels; use semantic HTML
- **Dark mode:** All new UI must support dark mode via existing theme tokens
- **Do not** hardcode student names, scores, or class data — use mock data utilities or API hooks

---

## 9. Upcoming Units (stubs — curriculum docs not yet uploaded)

These units will be added to the curriculum as documents are provided.
Generate placeholder route stubs only — do not generate lesson content without curriculum docs.

| Unit | Placeholder Title |
|------|-------------------|
| 3 | (TBD) |
| 4 | (TBD) |
| 5 | (TBD) |
| 6 | (TBD) |
| 7 | (TBD) |
| 8 | (TBD) |

---

## 10. Pull Request Standards

Every PR that touches UI must include visual documentation in the description. When drafting or reviewing a PR, always include a **Visual changes** section and prompt the author to fill it in with a screenshot or screen recording before merging.

For new components, the visual documentation should show at minimum the default/empty state and one populated or interactive state. For changes that affect both the student and teacher experience, show both.

When generating a PR description, flag any UI files changed in the diff and explicitly remind the author which views need to be screenshotted. If the change is subtle — a spacing fix, a color change, a loading state — note that in the PR description so reviewers know what to look for.

---

## 11. Hard Constraints — Do Not Violate

- Do not generate lesson content that contradicts the TEA Boundaries specified above
- Do not require students to know aerobic vs anaerobic respiration details, Krebs cycle, or ETC in Tier 1
- Do not require memorization of specific enzyme names/mechanisms in Tier 1 (B.11B boundary)
- Do not require understanding of chromosomal mutations in Tier 1 (B.7C boundary)
- Do not invent TEKS codes — use only codes listed in this file
- Do not skip the misconception layer in lesson content — it is required by curriculum design
- Do not flatten the three-tier vocabulary structure
- Do not bypass lesson unlock logic — students must meet mastery thresholds to progress
