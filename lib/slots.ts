// §F5 structured slot fields.
// The DB schema is shared across named slots: period_note, meal_note,
// mood, energy. The UI swaps labels per slot so the deck's "Sömn /
// Frukost / Humör / Energi" framing reads naturally on morgon while
// "Förmiddagen / Lunch / Humör / Energi" reads naturally on lunch.

export type NamedSlot = "morgon" | "lunch" | "eftermiddag";
export type Slot = NamedSlot | "snabbnotering";

export const SLOT_TITLES: Record<NamedSlot, string> = {
  morgon: "Morgonuppdatering",
  lunch: "Lunchuppdatering",
  eftermiddag: "Eftermiddagsuppdatering",
};

export const MOOD_LABEL = "Humör";
export const ENERGY_LABEL = "Energi";

export const SLOT_FIELD_LABELS: Record<
  NamedSlot,
  { period: string; meal: string }
> = {
  morgon: { period: "Sömn", meal: "Frukost" },
  lunch: { period: "Förmiddagen", meal: "Lunch" },
  eftermiddag: { period: "Eftermiddagen", meal: "Mellanmål" },
};
