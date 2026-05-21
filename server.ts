import express from "express";
import path from "path";
import dns from "node:dns";
import { createServer as createViteServer } from "vite";

dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  async function callGroq(story: string, characters: string, style: string, count: number, groqKey: string) {
      if (!groqKey) throw new Error("Groq API key is required");

      const prompt = `You are a scriptwriter. Take the following story and break it down into EXACTLY ${count} scenes.
Apply the following character descriptions and art style to every scene description, so it can be fed directly to an image generator.
Story: ${story}
Characters: ${characters}
Art Style: ${style}

Format the output as a JSON array of strings, where each string is a highly descriptive scene prompt for an image generator (minimum 40 words per prompt). Make sure to include the art style and character descriptions in every single prompt. Do not number the scenes. Return ONLY the JSON array.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You must output ONLY a valid JSON array of strings. Do not include markdown formatting like ```json or any other text."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Groq Error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      
      if (content.startsWith("```json")) {
        content = content.replace(/^```json/i, "");
      }
      if (content.startsWith("```")) {
        content = content.replace(/^```/, "");
      }
      if (content.endsWith("```")) {
        content = content.replace(/```$/, "");
      }
      
      return JSON.parse(content.trim());
  }

  app.post("/api/generate-scenes", async (req, res) => {
    try {
      const { story, characters, style, count, groqKey } = req.body;
      
      if (!groqKey) {
        return res.status(400).json({ error: "Groq API key is required for generation." });
      }

      const scenes = await callGroq(story, characters, style, count, groqKey);
      res.json({ scenes });
    } catch (error: any) {
      console.error("Groq generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate scenes" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, nvidiaKey } = req.body;

      if (!nvidiaKey) {
        return res.status(400).json({ error: "Nvidia API Key is required" });
      }

      // Nvidia's NIM Image Generation API
      const response = await fetch(
        "https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo",
        {
          headers: {
            "Authorization": `Bearer ${nvidiaKey}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ 
            text_prompts: [
              { text: prompt, weight: 1 }
            ],
            seed: 0,
            steps: 2
          }),
        }
      );

      if (!response.ok) {
        let errorText = await response.text();
        try {
          const json = JSON.parse(errorText);
          if (json.detail) errorText = json.detail;
          if (json.error && typeof json.error === "string") errorText = json.error;
          else if (json.error?.message) errorText = json.error.message;
        } catch(e) {}
        console.error("Nvidia API Error Status:", response.status, "Body:", errorText);
        return res.status(response.status).json({ error: errorText, status: response.status });
      }

      const data = await response.json();
      console.log("Nvidia API Response Keys:", Object.keys(data));
      // if data has image
      let base64Data = "";
      if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
         base64Data = data.artifacts[0].base64;
      } else if (data.image) {
         base64Data = data.image; // sometimes it's just top level 'image'
      } else if (data.data && data.data[0] && data.data[0].b64_json) {
         base64Data = data.data[0].b64_json;
      } else if (data.b64_json) {
         base64Data = data.b64_json;
      }
      
      if (!base64Data) {
         console.error("Unrecognized Nvidia API response format:", JSON.stringify(data).substring(0, 500));
         return res.status(500).json({ error: "Invalid response from Nvidia API. Missing image data." });
      }

      const buffer = Buffer.from(base64Data, "base64");

      res.set("Content-Type", "image/jpeg");
      res.send(buffer);
    } catch (error: any) {
      console.error("Nvidia fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
