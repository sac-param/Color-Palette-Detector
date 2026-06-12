import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON size limits to support base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not defined. Please add it to your Secrets panel under Settings in the Google AI Studio UI."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Dominant Colors response schema
const colorDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    dominantColors: {
      type: Type.ARRAY,
      description: "List of the dominant colors detected in the image.",
      items: {
        type: Type.OBJECT,
        properties: {
          hex: {
            type: Type.STRING,
            description: "The exact hexadecimal code of the color, e.g. '#2A9D8F'. Should include the '#' prefix.",
          },
          rgb: {
            type: Type.OBJECT,
            description: "The RGB values of the color.",
            properties: {
              r: { type: Type.INTEGER, description: "Red channel value (0 to 255)" },
              g: { type: Type.INTEGER, description: "Green channel value (0 to 255)" },
              b: { type: Type.INTEGER, description: "Blue channel value (0 to 255)" },
            },
            required: ["r", "g", "b"],
          },
          name: {
            type: Type.STRING,
            description: "A human-friendly, specific name for this color, e.g. 'Emerald Green', 'Electric Blue', 'Mint Green'.",
          },
          percentage: {
            type: Type.INTEGER,
            description: "Approximate percentage (1 to 100) of the image's overall color footprint occupied by this color.",
          },
          description: {
            type: Type.STRING,
            description: "Brief description of where/what this color is in the image context.",
          },
        },
        required: ["hex", "rgb", "name", "percentage", "description"],
      },
    },
    colorSchemes: {
      type: Type.ARRAY,
      description: "Generated aesthetic color palettes/schemes centered around these dominant colors.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The style or type of the palette, e.g., 'Complementary Offset', 'Vibrant Monochromatic', 'Soothing Analogous', 'Symmetrical Triadic'.",
          },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "Color Hex code, e.g. '#264653'" },
                rgb: {
                  type: Type.OBJECT,
                  properties: {
                    r: { type: Type.INTEGER },
                    g: { type: Type.INTEGER },
                    b: { type: Type.INTEGER },
                  },
                  required: ["r", "g", "b"],
                },
                name: { type: Type.STRING, description: "Friendly name of the palette color, e.g. 'Charcoal Dark'" },
              },
              required: ["hex", "rgb", "name"],
            },
          },
        },
        required: ["name", "colors"],
      },
    },
    moodDescription: {
      type: Type.STRING,
      description: "A professional design commentary describing the mood, tone, and harmony of the detected image elements.",
    },
    themeSuggestions: {
      type: Type.STRING,
      description: "Concrete design layout, product design, home decor, or website theme ideas that fit this color palette perfectly.",
    },
  },
  required: ["dominantColors", "colorSchemes", "moodDescription", "themeSuggestions"],
};

// 2. HTTP API endpoints
app.post("/api/detect-colors", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image field in request body." });
    }

    // Extract mimeType and base64 string
    const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    let mimeType = "image/png";
    let base64Data = image;

    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: "Analyze the uploaded image. First, identify the major visual elements, tiles, or color clusters in the image. Detect their dominant colors with extreme accuracy (find the hexadecimal codes and RGB codes of the actual items or blocks in the image, such as the colorful squares/shapes on the table). Form a complete color palette containing these core dominant colors, their approximate percentage footprint, names, and localized descriptions. Then generate classic professional color schemes complementing this palette (Complementary, Monochromatic, Analogous, Triadic) and explain the mood and design suggestions.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: colorDetectionSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from color detection model.");
    }

    const result = JSON.parse(responseText.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Color detection endpoint error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process color detection.",
    });
  }
});

// Mock health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Configure Vite or Static files depending on mode
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
