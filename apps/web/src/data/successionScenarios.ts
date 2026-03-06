// Succession scenario data for BioSpark Ecological Succession Visualizer
// Two scenarios: Bastrop Wildfire 2011, Houston Flooding (Harvey-style 2017)
// Each scenario has exactly 5 stages ordered by yearsAfterDisturbance
// TEKS B.6D — mechanisms of change in ecosystems
// TEKS B.11A — matter/energy flow (Tier 1 boundary: no aerobic/anaerobic detail, no Krebs cycle)

import type { SuccessionScenario } from "@/types/succession";

export const successionScenarios: SuccessionScenario[] = [
  // ── Scenario 1: Bastrop Wildfire 2011 ──────────────────────────────────
  {
    id: "bastrop-wildfire-2011",
    name: "Bastrop Wildfire 2011",
    disturbance: {
      id: "bastrop-fire",
      name: "Bastrop Complex Fire",
      location: "Lost Pines Forest, Bastrop, TX",
      year: 2011,
      description:
        "The most destructive wildfire in Texas history burned 96% of Bastrop State Park's 6,565-acre Lost Pines Forest on September 4, 2011, destroying habitat and killing thousands of animals.",
      severity: 0.96,
      type: "wildfire",
    },
    teks: ["B.6D", "B.11A"],
    phenomenon:
      "On September 4, 2011, the Bastrop Complex Fire swept through the Lost Pines Forest — an isolated loblolly pine ecosystem 100 miles from the main East Texas Piney Woods. The blaze consumed 96% of Bastrop State Park and forced the evacuation of 5,500 residents. Park officials estimated full forest recovery would take approximately 70 years.",
    stages: [
      {
        id: "bastrop-stage-0",
        name: "Bare/Charred Ground",
        yearsAfterDisturbance: 0,
        dominantSpecies: ["ash residue", "bare mineral soil"],
        soilHealth: 0.1,
        canopyCover: 0.0,
        biodiversityIndex: 0.05,
        description:
          "Immediately after the fire, only scorched soil and ash remain; all organic matter has been consumed and the ground is open to erosion.",
        ecologicalNote:
          "B.6D: A severe disturbance resets ecosystem structure to near zero, initiating secondary succession from exposed mineral soil. B.11A: Carbon stored in biomass is released as CO₂ during combustion, cycling matter back to the atmosphere.",
      },
      {
        id: "bastrop-stage-1",
        name: "Pioneer Colonizers",
        yearsAfterDisturbance: 1,
        dominantSpecies: ["native grasses", "bracken fern", "fireweed"],
        soilHealth: 0.25,
        canopyCover: 0.05,
        biodiversityIndex: 0.2,
        description:
          "Within one to two years, fast-growing pioneer plants colonize bare ground, begin rebuilding soil organic matter through root growth and leaf litter.",
        ecologicalNote:
          "B.6D: Pioneer species are adapted to high-disturbance, low-competition environments and drive the first phase of community recovery. B.11A: Photosynthesis in pioneer plants begins converting atmospheric CO₂ back into organic matter, restarting the local carbon cycle.",
      },
      {
        id: "bastrop-stage-2",
        name: "Early Shrubland",
        yearsAfterDisturbance: 3,
        dominantSpecies: [
          "yaupon holly",
          "native grasses",
          "young oaks",
          "wildflowers",
        ],
        soilHealth: 0.45,
        canopyCover: 0.2,
        biodiversityIndex: 0.45,
        description:
          "Shrubs and early woody plants establish, increasing shade and soil stability while supporting a growing community of insects and small animals.",
        ecologicalNote:
          "B.6D: Facilitation occurs as pioneer plants improve soil conditions, enabling less-tolerant shrubs and young trees to establish. B.11A: Increasing plant biomass stores more energy and matter, and food web complexity begins to grow.",
      },
      {
        id: "bastrop-stage-3",
        name: "Mixed Young Forest",
        yearsAfterDisturbance: 8,
        dominantSpecies: [
          "loblolly pine seedlings",
          "yaupon",
          "post oak",
          "painted bunting habitat",
        ],
        soilHealth: 0.65,
        canopyCover: 0.5,
        biodiversityIndex: 0.65,
        description:
          "Young loblolly pines and oaks form a mixed canopy; the Arbor Day Foundation replanted 4 million loblolly pines by 2016, accelerating forest recovery.",
        ecologicalNote:
          "B.6D: Competitive exclusion begins as taller trees shade out pioneer species, shifting community composition toward shade-tolerant species. B.11A: Increasing canopy supports more complex energy pyramids as herbivores and predators return.",
      },
      {
        id: "bastrop-stage-4",
        name: "Climax Lost Pines Forest",
        yearsAfterDisturbance: 70,
        dominantSpecies: [
          "loblolly pine",
          "post oak",
          "Houston toad",
          "painted bunting",
        ],
        soilHealth: 0.95,
        canopyCover: 0.92,
        biodiversityIndex: 0.9,
        description:
          "After approximately 70 years, a mature Lost Pines climax community is restored with full canopy, diverse understory, rich soil, and the return of sensitive species like the Houston toad.",
        ecologicalNote:
          "B.6D: The climax community represents a stable, self-sustaining ecosystem where species composition no longer changes dramatically over time — the endpoint of secondary succession. B.11A: Mature forests cycle matter and energy efficiently through complex food webs and nutrient cycles.",
      },
    ],
  },

  // ── Scenario 2: Houston Flooding (Harvey-style 2017) ───────────────────
  {
    id: "houston-flooding-2017",
    name: "Houston Flooding (Harvey 2017)",
    disturbance: {
      id: "harvey-flood",
      name: "Hurricane Harvey Flood",
      location: "Houston Bayou Corridor, Harris County, TX",
      year: 2017,
      description:
        "Hurricane Harvey dropped over 51 inches of rain in four days across the Houston metro area in August 2017, inundating bayou corridors, wetlands, and riparian zones with prolonged flooding.",
      severity: 0.7,
      type: "flood",
    },
    teks: ["B.6D", "B.11A"],
    phenomenon:
      "In August 2017, Hurricane Harvey stalled over Houston and released a record 51 inches of rain in four days. The resulting floods submerged the city's bayou ecosystems and riparian corridors for weeks, uprooting vegetation, creating anaerobic soil conditions, and disrupting the complex food webs that depend on healthy wetland habitats.",
    stages: [
      {
        id: "harvey-stage-0",
        name: "Bare Saturated Soil",
        yearsAfterDisturbance: 0,
        dominantSpecies: ["standing water", "bare saturated soil"],
        soilHealth: 0.1,
        canopyCover: 0.0,
        biodiversityIndex: 0.05,
        description:
          "Prolonged inundation strips vegetation, compacts and saturates soil, and leaves bare, oxygen-depleted substrate along bayou banks.",
        ecologicalNote:
          "B.6D: Flood disturbance removes existing plant communities and resets succession along the riparian zone. B.11A: Waterlogged soils disrupt normal nutrient cycling as decomposition slows in low-oxygen conditions.",
      },
      {
        id: "harvey-stage-1",
        name: "Aquatic Pioneer Plants",
        yearsAfterDisturbance: 1,
        dominantSpecies: ["sedges", "cattails", "smartweed", "water hyacinth"],
        soilHealth: 0.2,
        canopyCover: 0.05,
        biodiversityIndex: 0.2,
        description:
          "Flood-tolerant pioneer plants rapidly recolonize wet margins, stabilizing banks and beginning the return of aquatic invertebrates.",
        ecologicalNote:
          "B.6D: Hydrophytic pioneer species are specially adapted to waterlogged soils, making them first colonizers of flooded riparian zones. B.11A: Root mats of pioneer plants begin reintroducing organic matter and oxygen to soils through decomposition.",
      },
      {
        id: "harvey-stage-2",
        name: "Shrub Wetland",
        yearsAfterDisturbance: 4,
        dominantSpecies: [
          "buttonbush",
          "water willow",
          "sedges",
          "Gulf Coast waterdog",
        ],
        soilHealth: 0.4,
        canopyCover: 0.2,
        biodiversityIndex: 0.45,
        description:
          "Woody shrubs like buttonbush establish along water edges, creating structural habitat for amphibians, fish, and birds.",
        ecologicalNote:
          "B.6D: Shrub wetland represents a mid-successional stage where increased structural complexity supports greater biodiversity. B.11A: Shrubs create layered canopy and root zones that support more diverse decomposer communities and nutrient cycling.",
      },
      {
        id: "harvey-stage-3",
        name: "Young Riparian Forest",
        yearsAfterDisturbance: 15,
        dominantSpecies: [
          "bald cypress",
          "water tupelo",
          "swamp rose",
          "great blue heron",
        ],
        soilHealth: 0.65,
        canopyCover: 0.55,
        biodiversityIndex: 0.65,
        description:
          "Bald cypress and tupelo establish a young riparian canopy, providing nesting habitat and shade that moderates water temperature.",
        ecologicalNote:
          "B.6D: Canopy-forming trees drive competitive exclusion of pioneer species and create the structural conditions characteristic of mature riparian forests. B.11A: Cypress 'knees' aerate root zones, supporting decomposers and re-establishing efficient nutrient cycling.",
      },
      {
        id: "harvey-stage-4",
        name: "Climax Riparian Forest",
        yearsAfterDisturbance: 50,
        dominantSpecies: [
          "bald cypress",
          "Gulf Coast waterdog",
          "wood duck",
          "river otter",
        ],
        soilHealth: 0.9,
        canopyCover: 0.88,
        biodiversityIndex: 0.88,
        description:
          "A mature bald cypress–tupelo swamp forest forms the climax community, supporting sensitive species including Gulf Coast waterdogs and river otters.",
        ecologicalNote:
          "B.6D: The climax riparian forest is a stable, species-rich community where further succession slows — demonstrating the endpoint of flood-driven secondary succession. B.11A: Fully restored wetland food webs efficiently cycle matter and energy through producers, consumers, and decomposers.",
      },
    ],
  },
];
