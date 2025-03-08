import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error(
    "MISTRAL_API_KEY is not defined in the environment variables."
  );
}

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Mistral AI with Express!");
});

app.post("/api/generate-questions", async (req, res) => {
  const { jobType, difficulty, numOfQuestions } = req.body;

  if (!jobType || !difficulty || !numOfQuestions) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const prompt = `
      Genera exactamente ${numOfQuestions} pregunta para una entrevista de trabajo para el puesto de ${jobType} de dificultad ${difficulty}.
      La pregunta debe ser clara, precisa y enfocada en las habilidades requeridas para el puesto.
      No incluyas listas ni explicaciones adicionales.
      `;

    // ✅ Llamada directa usando `axios`
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "open-mistral-7b", // Usa 'open-mixtral-8x7b' si tienes permisos
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const questions = response.data.choices[0].message.content
      .split("\n")
      .filter(Boolean);

    res.json({ questions });
  } catch (error) {
    console.error(
      "Error generating questions:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: error.response?.data || "Error generando preguntas" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
