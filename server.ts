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
    const { message, history, language } = req.body;
    console.log("Chat Request:", { message, language });
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are AgroSmart AI, an expert agricultural assistant specializing in Pakistan's farming ecosystem. 
        Current user language: ${language || 'en'}.
        Primary regions: Punjab, Sindh, KPK, Balochistan.
        Primary crops: Wheat (Gandum), Rice (Chawal), Cotton (Kapaas), Sugarcane (Kamad), Maize (Makai).
        Provide advice on crop management, Rabi/Kharif timing, pest control (both chemical and organic), and irrigation.
        Keep responses helpful, professional, and concise. 
        Respond in the language requested. Support English, Urdu, Hindi and Punjabi.`,
      },
      history: (history || []).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.parts[0].text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    if (!result.text) {
      throw new Error("No response received from AI model");
    }
    const text = result.text;
    console.log("Chat Response obtained, length:", text?.length);
    res.json({ text });
  } catch (error: any) {
    console.error("Chat API Error Details:", error);
    res.status(500).json({ error: error.message || "Internal AI Error" });
  }
});

// Disease Detection (Image Analysis)
app.post("/api/analyze-plant", async (req, res) => {
  try {
    const { imageBase64, language } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided" });
    }

    console.log("Analyze Plant Request received. Language:", language);

    const prompt = `You are a plant pathologist specializing in South Asian crops (Pakistan). 
    Analyze this image and identify the following in ${language === 'ur' ? 'Urdu' : 'English'}:
    1. The crop name.
    2. The disease or pest affecting it.
    3. Confidence level (0-100).
    4. Recommended treatments available in local Pakistani markets.
    5. Organic/Home-made alternatives.
    6. Severity level.
    
    Return the result strictly as JSON.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ]
      },
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
          required: ["crop", "disease", "confidence", "treatments", "organicAlternatives", "severity"]
        }
      }
    });

    const parsedText = response.text;
    console.log("Analyze Plant Response:", parsedText);
    
    if (!parsedText) {
      throw new Error("No text response from model");
    }

    try {
      res.json(JSON.parse(parsedText));
    } catch (e) {
      console.error("Parse Error in analyze-plant:", e, "Text:", parsedText);
      res.status(500).json({ error: "Failed to parse plant diagnosis. AI returned invalid JSON." });
    }
  } catch (error: any) {
    console.error("Plant analysis API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze plant" });
  }
});

// Weather & Market updates (using Search Grounding)
app.get("/api/landscape-updates", async (req, res) => {
  try {
    const { location, language } = req.query;
    console.log("Landscape Request for:", location || 'Lahore, Pakistan', "Language:", language);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `Search for today's current weather in ${location || 'Lahore, Pakistan'} and today's live Mandi prices (Jinnah Mandi, Akbari Mandi, etc.) for major Pakistani crops. Return all crop names and descriptions in ${language === 'ur' ? 'Urdu' : 'English'}. Prices should be in Rs per 40kg (Maund) and provide a numeric value too. Also provide a 5-day estimated price history for each crop for charting purposes. Return strictly as JSON.` }] }],
      config: {
        tools: [{ googleSearch: {} } as any],
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
                  price: { type: Type.STRING },
                  numericPrice: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ["up", "down", "stable"] },
                  history: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING },
                        price: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsedText = response.text;
    try {
      const parsed = JSON.parse(parsedText);
      console.log("Landscape Data Fetched:", !!parsed.weather, parsed.marketPrices?.length);
      res.json(parsed);
    } catch (e) {
      console.error("Parse Error in landscape:", e, "Text:", parsedText);
      res.status(500).json({ error: "Failed to parse landscape data" });
    }
  } catch (error: any) {
    console.error("Landscape API Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch landscape updates" });
  }
});

// Agri-Calendar Endpoint
app.get("/api/agri-calendar", async (req, res) => {
  try {
    const { crop, location, language } = req.query;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `Generate a seasonal agriculture calendar for ${crop || 'Wheat and Rice'} in ${location || 'Punjab, Pakistan'}. Return lahat labels and activities in ${language === 'ur' ? 'Urdu' : 'English'}. Include all 12 months with specific activities like Land Preparation, Sowing, First Irrigation, Urea/DAP application, and Harvesting. Format strictly as JSON.` }] }],
      config: {
        tools: [{ googleSearch: {} } as any],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calendar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  crop: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    const parsedText = response.text;
    try {
      res.json(JSON.parse(parsedText));
    } catch (e) {
      console.error("Parse Error in agri-calendar:", e, "Text:", parsedText);
      res.status(500).json({ error: "Failed to parse calendar data" });
    }
  } catch (error: any) {
    console.error("Calendar API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate agri-calendar" });
  }
});

// Pakistan Govt Schemes Endpoint
app.get("/api/govt-schemes", async (req, res) => {
  try {
    const { language } = req.query;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `List current Pakistan government agriculture schemes and subsidies in ${language === 'ur' ? 'Urdu' : 'English'}. Include title, description, and eligibility. Format strictly as JSON.` }] }],
      config: {
        tools: [{ googleSearch: {} } as any],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  eligibility: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    const parsedText = response.text;
    try {
      res.json(JSON.parse(parsedText));
    } catch (e) {
      console.error("Parse Error in govt-schemes:", e, "Text:", parsedText);
      res.status(500).json({ error: "Failed to parse schemes data" });
    }
  } catch (error: any) {
    console.error("Schemes API Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch schemes" });
  }
});

// SMART MARKET INTELLIGENCE API
app.get("/api/market-intelligence", async (req, res) => {
  try {
    const { city, category, language } = req.query;
    console.log("Market Intelligence Request:", { city, category, language });

    const prompt = `Perform a deep search for current agricultural market intelligence in ${city || 'Pakistan'}.
    Return everything including labels, names, and insights in ${language === 'ur' ? 'Urdu' : 'English'}.
    Include:
    1. Mandatory Mandi Prices for common crops in Pakistan.
    2. Supply Prices: Urea, DAP, Pesticides, Seeds.
    3. AI Forecasting: A 30-day price prediction.
    4. Market Recommendation: 'Best time to sell' or 'Hold' advice in the chosen language.
    5. Demand Analytics.
    
    Return the data strictly as JSON. All numeric prices in Rs per 40kg (Maund) for crops and per bag for fertilizers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} } as any],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lastUpdated: { type: Type.STRING },
            city: { type: Type.STRING },
            mandiPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  currentPrice: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["bullish", "bearish", "stable"] },
                  prediction30d: { type: Type.NUMBER },
                  recommendation: { type: Type.STRING },
                  demandLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  history: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING },
                        price: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            supplies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  availability: { type: Type.STRING }
                }
              }
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedText = response.text;
    try {
      res.json(JSON.parse(parsedText));
    } catch (e) {
      console.error("Parse Error in market-intelligence:", e, "Text:", parsedText);
      res.status(500).json({ error: "Failed to parse market intelligence data" });
    }
  } catch (error: any) {
    console.error("Market Intelligence API Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch market intelligence" });
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
