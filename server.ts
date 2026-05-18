import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '10mb' }));

// AI Chat Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are AgroSmart AI, an expert agricultural assistant. Provide advice on crop management, disease prevention, and sustainable farming. Keep responses helpful and concise. Support multiple languages like English, Urdu, Hindi, and Punjabi.",
      },
    });

    // In a real app we'd load history into the chat object, 
    // for this demo we'll just send the message.
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Disease Detection (Image Analysis)
app.post("/api/analyze-plant", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const prompt = "Analyze this plant leaf for diseases. Identify the crop, the disease (if any), confidence percentage, treatment recommendations, and organic alternatives. Return the result in a structured JSON format.";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            disease: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            treatments: { type: Type.ARRAY, items: { type: Type.STRING } },
            organicAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["crop", "disease", "confidence", "treatments"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Weather & Market updates (using Search Grounding)
app.get("/api/landscape-updates", async (req, res) => {
  try {
    const { location } = req.query;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide current weather for ${location || 'Punjab, Pakistan'} and live market prices for major crops like Wheat, Rice, and Cotton in that region. Format as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weather: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING },
                humidity: { type: Type.NUMBER },
                windSpeed: { type: Type.NUMBER }
              }
            },
            marketPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  pricePerKg: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
                }
              }
            }
          }
        }
      }
    });
    res.json(JSON.parse(response.text));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgroSmart AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
