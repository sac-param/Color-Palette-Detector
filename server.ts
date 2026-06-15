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

// 1. Direct Visual Compare response schema
const diceComparisonSchema = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      description: "List of comparison results, one for each input rack dice slot.",
      items: {
        type: Type.OBJECT,
        properties: {
          dieId: {
            type: Type.INTEGER,
            description: "The ID number of the rack dice slot (1 to 15) that was compared.",
          },
          exists: {
            type: Type.BOOLEAN,
            description: "True if a die/block matching this exact appearance, colors, texture, or pattern exists in the main puzzle image. Otherwise false.",
          },
          confidence: {
            type: Type.INTEGER,
            description: "Confidence percentage (0 to 100) of this visual matching.",
          },
          reason: {
            type: Type.STRING,
            description: "Brief human explanation of where the matched die is located on the board or why it is missing.",
          },
          box2d: {
            type: Type.ARRAY,
            description: "An array of 4 integers [ymin, xmin, ymax, xmax] from 0 to 100 representing percentages of the bounding box where the matching die/block is found in the MAIN TARGET PUZZLE IMAGE. For example, [20, 30, 35, 45]. If exists is false, return [0, 0, 0, 0].",
            items: { type: Type.INTEGER },
          },
        },
        required: ["dieId", "exists", "confidence", "reason", "box2d"],
      },
    },
    moodDescription: {
      type: Type.STRING,
      description: "Overall summary of the verification analysis of the physical dice layout.",
    },
  },
  required: ["matches", "moodDescription"],
};

// 2. HTTP API endpoints
app.post("/api/detect-colors", async (req, res) => {
  try {
    const { image, rackDice } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image field in request body." });
    }

    // Extract mimeType and base64 string for the puzzle image
    const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    let mimeType = "image/png";
    let base64Data = image;

    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    const ai = getGeminiClient();

    const parts: any[] = [];
    parts.push({ text: "MAIN TARGET PUZZLE IMAGE:\nBelow is the primary puzzle picture showing the arrangement of blue and green colored groups/dices." });
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });

    const parsedDice = Array.isArray(rackDice) ? rackDice : [];

    if (parsedDice.length === 0) {
      return res.json({
        matches: [],
        moodDescription: "No reference specimens are registered or uploaded in your 15 Dice Rack. Upload some close-up photos above to trace them inside the puzzle board.",
      });
    }

    // Add each reference die image
    parsedDice.forEach((die: any) => {
      const dieMatch = die.imageUrl?.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      let dieMime = "image/png";
      let dieBase64 = die.imageUrl;
      if (dieMatch) {
        dieMime = dieMatch[1];
        dieBase64 = dieMatch[2];
      }

      parts.push({ text: `\nREFERENCE SINGLE DIE PHOTO (SLOT #${die.id}):` });
      parts.push({
        inlineData: {
          mimeType: dieMime,
          data: dieBase64,
        }
      });
    });

    parts.push({
      text: `Task Instructions:
1. Examine the MAIN TARGET PUZZLE IMAGE.
2. For each of the uploaded REFERENCE SINGLE DIE PHOTOS (each identified by their Slot #), look for a counterpart in the MAIN TARGET PUZZLE IMAGE.
3. Compare the detailed appearance, exact color shade (e.g. lime, clover, mint greens or sky, cobalt, teal blues), and surface attributes.
4. Set "exists" to true if the die is present in the main puzzle image. Write a friendly, helpful "reason" detailing its match stability and approximate location (or lack thereof).
5. If the die exists in the puzzle image, estimate its bounding box coordinates (ymin, xmin, ymax, xmax) on the MAIN TARGET PUZZLE IMAGE. These coordinates must be integers scaled from 0 to 100 representing percentage offsets (e.g., [15, 45, 25, 55] means Top: 15%, Left: 45%, Bottom: 25%, Right: 55%). If exists is false, set box2d to [0, 0, 0, 0].
6. Set confidence from 0 to 100 based on how clear your observation is.
7. Return the final structured output conforming strictly to the requested schema.`
    });

    let response;
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let success = false;

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      const attempt = i + 1;
      console.log(`[Gemini API] Attempt ${attempt}: calling model '${modelName}'...`);

      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: diceComparisonSchema,
          },
        });

        if (response?.text) {
          success = true;
          console.log(`[Gemini API] Success on attempt ${attempt} with model '${modelName}'`);
          break; // Exit loop on success
        }
        throw new Error(`Empty response text received from model '${modelName}'`);
      } catch (err: any) {
        lastError = err;
        const errStr = `${err.message || ""} ${err.status || ""} ${err.statusCode || ""} ${String(err)} ${err.stack || ""}`;
        console.warn(`[Gemini API] Attempt ${attempt} failed with model '${modelName}':`, errStr);

        // Treat 400 structures or Bad Requests as permanent client-side or configuration issues
        const is400 = errStr.includes("400") || errStr.toLowerCase().includes("bad request") || errStr.toLowerCase().includes("invalid_argument");
        if (is400) {
          console.error(`[Gemini API] Permanent 400 error caught. Aborting fallback sequence.`);
          throw err;
        }

        // Wait with exponential backoff on transient errors (503, 429, etc.) before next attempt
        if (i < modelsToTry.length - 1) {
          const backoffMs = Math.min(1000 * Math.pow(2, i), 4000);
          console.log(`[Gemini API] Backing off for ${backoffMs}ms before next fallback attempt...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    if (!success) {
      throw lastError || new Error("All model fallback attempts failed.");
    }

    const responseText = response?.text;
    if (!responseText) {
      throw new Error("Empty response received from pattern matching model.");
    }

    const result = JSON.parse(responseText.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Pattern comparison endpoint error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process visual content pattern matching.",
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
