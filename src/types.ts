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

export interface ColorDetectionResult {
  dominantColors: ColorItem[];
  colorSchemes: ColorScheme[];
  moodDescription: string;
  themeSuggestions: string;
}

export interface ColorDetectionRequest {
  image: string; // base64 data URL
}
