import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const dataFile = path.join("./", "history.json");

function saveToHistory(prompt, text, image_url, category) {
  const history = fs.existsSync(dataFile)
    ? JSON.parse(fs.readFileSync(dataFile))
    : [];
  history.push({ prompt, text, image_url, category, createdAt: new Date().toISOString() });
  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2));
}

app.get("/", (req, res) => {
  res.send("✅ Backend AI Văn Hóa đang hoạt động!");
});

app.post("/generate-content", async (req, res) => {
  const { prompt, category } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là một nhà viết nội dung văn hóa chuyên nghiệp, hãy tạo đoạn mô tả đầy cảm xúc từ prompt người dùng."
        },
        {
          role: "user",
          content: `Viết một đoạn truyền thông hoặc văn học mô tả: ${prompt}`,
        },
      ],
    });

    const text = gptResponse.choices[0].message.content.trim();

    saveToHistory(prompt, text, null, category);

    res.json({ text, image_url: null });
  } catch (err) {
    console.error("Error generating GPT content:", err);
    res.status(500).json({ error: "Failed to generate content." });
  }
});

app.get("/history", (req, res) => {
  try {
    const history = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Unable to load history." });
  }
});

app.get("/dashboard-summary", (req, res) => {
  try {
    const history = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];

    const total = history.length;
    const latest = history.slice(-5).reverse();
    const keywords = {};

    history.forEach((entry) => {
      const words = entry.prompt.toLowerCase().split(/\s+/);
      words.forEach((w) => {
        if (w.length > 3) keywords[w] = (keywords[w] || 0) + 1;
      });
    });

    const trendingKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    res.json({ total, latest, trendingKeywords });
  } catch (err) {
    res.status(500).json({ error: "Unable to load dashboard data." });
  }
});

app.get("/stats-by-category", (req, res) => {
  try {
    const history = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile))
      : [];

    const stats = {};
    history.forEach((entry) => {
      const cat = entry.category || "khac";
      stats[cat] = (stats[cat] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    console.error("Lỗi khi thống kê category:", err);
    res.status(500).json({ error: "Không thể thống kê category." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
