import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set high JSON body limit to support base64 image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client lazily to handle missing API keys gracefully
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to transform an uploaded image into a Perler Bead pet
app.post("/api/generate-bead-pet", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
       res.status(400).json({ error: "Missing imageBase64 data in request body" });
       return;
    }

    const ai = getAiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: imageBase64,
      },
    };

    const promptText = `
Analyze this uploaded image of a character/mascot and convert it into an adorable, cohesive, pixelated 16x16 Perler Bead (拼豆) sprite.
Focus on capturing the character's primary features (hair, face, costume colors, iconic items) with a clean black outline and balanced colors.

You MUST return a JSON object following this exact schema:
{
  "name": "A cute Chinese name for this pixel pet, either guessed/identified or creatively generated",
  "description": "A heartwarming 1-2 sentence description or backstory in Chinese explaining who they are and how happy they are to be your desktop pet",
  "beadGrid": [
    // Must be exactly a 16x16 2D array (16 rows, each having exactly 16 strings).
    // Each string must be EITHER a hex color (e.g. "#FF99A0", "#000000", "#FFFFFF") OR the exact word "transparent" to indicate empty/transparent space.
    // Ensure the outer margins of the grid are transparent so the character is isolated and floats neatly.
  ],
  "primaryColor": "A single representative vibrant hex color for this character's theme"
}
`;

    let response;
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Sending request to Gemini model: ${model} (attempt ${attempt}/2)...`);
          response = await ai.models.generateContent({
            model: model,
            contents: [imagePart, { text: promptText }],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "A cute name in Chinese for the character.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A cute 1-2 sentence description in Chinese.",
                  },
                  beadGrid: {
                    type: Type.ARRAY,
                    description: "A 16x16 grid where each row has 16 cells. Cells are either hex colors (e.g. '#FF0000') or 'transparent'.",
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                    },
                  },
                  primaryColor: {
                    type: Type.STRING,
                    description: "Primary theme hex color.",
                  },
                },
                required: ["name", "description", "beadGrid", "primaryColor"],
              },
            },
          });
          // If we successfully got a response, break out of the retry loop
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Attempt with ${model} failed (attempt ${attempt}/2):`, err.message || err);
          
          // Wait briefly before retrying
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      }
      // If we got a valid response from the current model, break the outer loop
      if (response) {
        break;
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to communicate with Gemini API after retries and model fallbacks.");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    // Parse response
    const parsed = JSON.parse(resultText);

    // Standardize beadGrid: convert "transparent" to null
    if (Array.isArray(parsed.beadGrid)) {
      parsed.beadGrid = parsed.beadGrid.map((row: any) => {
        if (Array.isArray(row)) {
          return row.map((cell: any) => {
            if (typeof cell === "string") {
              const lower = cell.toLowerCase().trim();
              if (lower === "transparent" || lower === "null" || lower === "" || !lower.startsWith("#")) {
                return null;
              }
              return cell;
            }
            return null;
          });
        }
        return Array(16).fill(null);
      });
    }

    res.json({
      success: true,
      pet: {
        name: parsed.name || "神秘新推",
        description: parsed.description || "一个为你加油打气的神秘像素拼豆宠物！",
        gridSize: 16,
        beadGrid: parsed.beadGrid,
        activeOutfitId: null,
      },
    });
  } catch (error: any) {
    console.error("Error generating bead pet:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to communicate with Gemini API or process the image.",
    });
  }
});

// Configure Vite middleware or production static files serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from production dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server with Vite:", err);
});
