import type { DragDropItem } from "@/components/items/DragDrop";

export const RC1_DRAGDROP: DragDropItem = {
  id: "rc1-dd-1",
  type: "dragdrop",
  stem: "Sort the cell structures by their primary function.",
  teks: ["BIO.5A", "BIO.5B"],
  cards: [
    { id: "nucleus", text: "Nucleus" },
    { id: "mitochondria", text: "Mitochondria" },
    { id: "ribosome", text: "Ribosome" },
    { id: "cell-membrane", text: "Cell membrane" },
  ],
  zones: [
    {
      id: "genetic",
      label: "Genetic control",
      accepts: ["nucleus"],
    },
    {
      id: "energy",
      label: "Energy conversion",
      accepts: ["mitochondria"],
    },
    {
      id: "protein",
      label: "Protein synthesis",
      accepts: ["ribosome"],
    },
    {
      id: "boundary",
      label: "Cell boundary",
      accepts: ["cell-membrane"],
    },
  ],
};
