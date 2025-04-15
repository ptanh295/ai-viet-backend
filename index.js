// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const dataFile = path.join("./", "history.json");

function saveToHistory(prompt, text, image_url) {
  const history = fs.existsSync(dataFile)
    ? JSON.parse(fs.readFileSync(dataFile))
    : [];
  history.push({ prompt, text, image_url, createdAt: new Date().toISOString() });
  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2));
}

app.post("/generate-content", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const gptResponse = await openai.createChatCompletion({
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

    const text = gptResponse.data.choices[0].message.content.trim();

    const imageResponse = await openai.createImage({
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const image_url = imageResponse.data.data[0].url;

    saveToHistory(prompt, text, image_url);

    res.json({ text, image_url });
  } catch (err) {
    console.error("Error generating content:", err);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
