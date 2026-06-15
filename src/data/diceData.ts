export interface DiceSpec {
  id: number;
  name: string;
  category: "core-green" | "green-ish" | "both" | "blue-ish" | "core-blue";
  defaultHex: string;
  description: string;
}

export interface Coordinates {
  tray: "left" | "right";
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
}

export interface DicePosition {
  diceId: number;
  tray: "left" | "right";
  row: number;
  col: number;
}

export interface SavedPattern {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Expert";
  positions: DicePosition[]; // Placement of the 15 dice
}

// Exactly 15 Constant Dice as described in the reference exhibit notes
export const CONSTANT_DICE_SPECS: DiceSpec[] = [
  // --- GREEN SPECTRUM ---
  {
    id: 1,
    name: "Dice 1 (Core Emerald)",
    category: "core-green",
    defaultHex: "#2E7D32", // Rich forest green
    description: "Highly pigmented pure physical Green dice."
  },
  {
    id: 2,
    name: "Dice 2 (Core Clover)",
    category: "core-green",
    defaultHex: "#4CAF50", // classic grass green
    description: "Secondary high-saturation pure Green dice."
  },
  {
    id: 3,
    name: "Dice 3 (Core Lime)",
    category: "core-green",
    defaultHex: "#8BC34A", // light Lime yellow green
    description: "High-value intense Lime Green dice."
  },
  {
    id: 4,
    name: "Dice 4 (Pine Green)",
    category: "green-ish",
    defaultHex: "#1B5E20", // dark green
    description: "Deep pine shade Greenish dice."
  },
  {
    id: 5,
    name: "Dice 5 (Neon Mint)",
    category: "green-ish",
    defaultHex: "#00E676", // high bright green
    description: "Luminous neon mint shade Greenish dice."
  },
  {
    id: 6,
    name: "Dice 6 (Sage Green)",
    category: "green-ish",
    defaultHex: "#66BB6A", 
    description: "Warm neutral Sage shade Greenish dice."
  },
  {
    id: 7,
    name: "Dice 7 (Pale Jade)",
    category: "green-ish",
    defaultHex: "#A5D6A7",
    description: "Very light jade tinted Greenish dice."
  },

  // --- FALLS UNDER BOTH ---
  {
    id: 8,
    name: "Dice 8 (Ocean Teal)",
    category: "both",
    defaultHex: "#00BFA5", // vibrant turquoise-teal
    description: "Vibrant marine teal dice that passes for both spectra."
  },
  {
    id: 9,
    name: "Dice 9 (Lagoon Cyan)",
    category: "both",
    defaultHex: "#26A69A", // turquoise medium
    description: "Quiet pool side turquoise-cyan of dual characteristics."
  },
  {
    id: 10,
    name: "Dice 10 (Desert Aquamarine)",
    category: "both",
    defaultHex: "#4DB6AC", // cyan soft
    description: "Pastel aquamarine, adaptable to green or blue environments."
  },

  // --- BLUE SPECTRUM ---
  {
    id: 11,
    name: "Dice 11 (Vibrant Cerulean)",
    category: "blue-ish",
    defaultHex: "#00ACC1", // cyan bright
    description: "High illumination cerulean Blueish dice."
  },
  {
    id: 12,
    name: "Dice 12 (Dark Teal-Blue)",
    category: "blue-ish",
    defaultHex: "#00796B", 
    description: "Dark moody petrol Blueish dice."
  },
  {
    id: 13,
    name: "Dice 13 (Core Sky)",
    category: "core-blue",
    defaultHex: "#03A9F4", 
    description: "Primary light sky-blue shade Core Blue dice."
  },
  {
    id: 14,
    name: "Dice 14 (Core Cobalt)",
    category: "core-blue",
    defaultHex: "#1E88E5", 
    description: "Primary standard blue pigment Core Blue dice."
  },
  {
    id: 15,
    name: "Dice 15 (Core Navy)",
    category: "core-blue",
    defaultHex: "#0D47A1", 
    description: "Primary deep indigo-navy shade Core Blue dice."
  }
];

// Existing Saved Exhibit Patterns for the user to compare against
export const DEFAULT_SAVED_PATTERNS: SavedPattern[] = [
  {
    id: "pat-1",
    name: "Symmetrical Sorter",
    description: "The classic standard sorted configuration. The core/ish dice reside in their primary domains nicely stacked.",
    difficulty: "Easy",
    positions: [
      { diceId: 1, tray: "left", row: 0, col: 0 },
      { diceId: 2, tray: "left", row: 0, col: 1 },
      { diceId: 3, tray: "left", row: 0, col: 2 },
      { diceId: 4, tray: "left", row: 1, col: 0 },
      { diceId: 5, tray: "left", row: 1, col: 1 },
      { diceId: 6, tray: "left", row: 1, col: 2 },
      { diceId: 7, tray: "left", row: 2, col: 0 },
      { diceId: 8, tray: "left", row: 2, col: 1 },
      
      { diceId: 9, tray: "right", row: 2, col: 1 },
      { diceId: 10, tray: "right", row: 2, col: 2 },
      { diceId: 11, tray: "right", row: 1, col: 0 },
      { diceId: 12, tray: "right", row: 1, col: 1 },
      { diceId: 13, tray: "right", row: 0, col: 0 },
      { diceId: 14, tray: "right", row: 0, col: 1 },
      { diceId: 15, tray: "right", row: 0, col: 2 }
    ]
  },
  {
    id: "pat-2",
    name: "Diamond Gate",
    description: "A gorgeous layout creating central diamond structures within each tray using core dice.",
    difficulty: "Medium",
    positions: [
      { diceId: 1, tray: "left", row: 0, col: 1 },
      { diceId: 2, tray: "left", row: 1, col: 0 },
      { diceId: 3, tray: "left", row: 1, col: 2 },
      { diceId: 4, tray: "left", row: 2, col: 1 },
      { diceId: 5, tray: "left", row: 1, col: 1 },
      { diceId: 6, tray: "left", row: 0, col: 0 },
      { diceId: 7, tray: "left", row: 2, col: 2 },
      { diceId: 8, tray: "left", row: 0, col: 2 },

      { diceId: 9, tray: "right", row: 0, col: 0 },
      { diceId: 10, tray: "right", row: 2, col: 0 },
      { diceId: 11, tray: "right", row: 1, col: 1 },
      { diceId: 12, tray: "right", row: 0, col: 2 },
      { diceId: 13, tray: "right", row: 0, col: 1 },
      { diceId: 14, tray: "right", row: 1, col: 0 },
      { diceId: 15, tray: "right", row: 2, col: 1 }
    ]
  },
  {
    id: "pat-3",
    name: "The Dual Cross",
    description: "A professional symmetric cross layout that emphasizes architectural layout alignment.",
    difficulty: "Medium",
    positions: [
      { diceId: 1, tray: "left", row: 0, col: 1 },
      { diceId: 2, tray: "left", row: 1, col: 1 },
      { diceId: 3, tray: "left", row: 2, col: 1 },
      { diceId: 4, tray: "left", row: 1, col: 0 },
      { diceId: 5, tray: "left", row: 1, col: 2 },
      { diceId: 6, tray: "left", row: 0, col: 0 },
      { diceId: 7, tray: "left", row: 2, col: 2 },
      { diceId: 8, tray: "right", row: 2, col: 2 }, // neutral teal over to blue side

      { diceId: 9, tray: "right", row: 1, col: 0 },
      { diceId: 10, tray: "right", row: 1, col: 2 },
      { diceId: 11, tray: "right", row: 0, col: 0 },
      { diceId: 12, tray: "right", row: 2, col: 0 },
      { diceId: 13, tray: "right", row: 0, col: 1 },
      { diceId: 14, tray: "right", row: 1, col: 1 },
      { diceId: 15, tray: "right", row: 2, col: 1 }
    ]
  },
  {
    id: "pat-4",
    name: "Cascading River",
    description: "An editorial wave representing fluids flowing from green valleys into crystal blue pools.",
    difficulty: "Expert",
    positions: [
      { diceId: 1, tray: "left", row: 0, col: 0 },
      { diceId: 2, tray: "left", row: 1, col: 1 },
      { diceId: 3, tray: "left", row: 2, col: 2 },
      { diceId: 4, tray: "left", row: 1, col: 0 },
      { diceId: 5, tray: "left", row: 2, col: 1 },
      { diceId: 6, tray: "left", row: 0, col: 1 },
      { diceId: 7, tray: "left", row: 0, col: 2 },
      { diceId: 8, tray: "left", row: 1, col: 2 },

      { diceId: 9, tray: "right", row: 1, col: 0 },
      { diceId: 10, tray: "right", row: 2, col: 0 },
      { diceId: 11, tray: "right", row: 0, col: 1 },
      { diceId: 12, tray: "right", row: 1, col: 1 },
      { diceId: 13, tray: "right", row: 0, col: 0 },
      { diceId: 14, tray: "right", row: 2, col: 1 },
      { diceId: 15, tray: "right", row: 2, col: 2 }
    ]
  }
];

// Helper to determine Euclidean distance in RGB color space
export function findClosestDiceId(r: number, g: number, b: number): number {
  let closestId = 1;
  let minDistance = Infinity;

  for (const dice of CONSTANT_DICE_SPECS) {
    // Parse hexadecimal color
    const diceRgb = hexToRgb(dice.defaultHex);
    if (!diceRgb) continue;

    const distance = Math.sqrt(
      Math.pow(r - diceRgb.r, 2) +
      Math.pow(g - diceRgb.g, 2) +
      Math.pow(b - diceRgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestId = dice.id;
    }
  }

  return closestId;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}
