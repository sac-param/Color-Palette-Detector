export interface ColorItem {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  name: string;
  percentage: number;
  description: string;
}

export interface ColorScheme {
  name: string;
  colors: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    name: string;
  }[];
}

export interface DetectedBlock {
  id: string;
  group: "left" | "right";
  row: number;
  col: number;
  colorHex: string;
  colorName: string;
  rgb: { r: number; g: number; b: number };
}

export interface ColorDetectionResult {
  dominantColors: ColorItem[];
  colorSchemes: ColorScheme[];
  moodDescription: string;
  themeSuggestions: string;
  detectedBlocks?: DetectedBlock[];
}

export interface ColorDetectionRequest {
  image: string; // base64 data URL
}
