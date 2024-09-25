const express = require("express");
const router = express.Router();
const { generateResponse } = require("../services/openaiService");
const { analyzeResponse } = require("../utils/responseUtils");
const {
  getCreativeScenario,
  generateResponseWithTone,
} = require("../services/scenarioService");
const scenarioCategories = require("../scenarios/scenarioCategories");
const { inferSeverityLevel } = require("../services/openaiService");

let userSessions = {};

router.post("/start", async (req, res) => {
  const { candidateId, category, role } = req.body;
  if (!scenarioCategories[category]) {
    return res.status(400).json({ error: "Invalid category selected" });
  }

  try {
    const scenario = await getCreativeScenario(category, role);

    userSessions[candidateId] = {
      startTime: Date.now(),
      prompt: scenario,
      category: category,
      role: role,
      interactions: [],
    };

    res.json({
      categoryDescription: scenarioCategories[category].description,
      scenario,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate a scenario" });
  }
});

router.post("/respond", async (req, res) => {
  const { candidateId, userMessage } = req.body;

  if (!userSessions[candidateId]) {
    return res.status(400).json({ error: "Session not found or expired." });
  }

  try {
    userSessions[candidateId].interactions.push({
      role: "user",
      message: userMessage,
    });

    const conversationHistory = userSessions[candidateId].interactions
      .map(
        (interaction) =>
          `${interaction.role === "user" ? "User" : "System"}: ${
            interaction.message
          }`
      )
      .join("\n");

    const inferredSeverityLevel = await inferSeverityLevel(conversationHistory);

    const systemResponse = await generateResponseWithTone(
      conversationHistory,
      inferredSeverityLevel
    );

    userSessions[candidateId].interactions.push({
      role: "system",
      message: systemResponse,
    });

    res.json({ systemResponse, inferredSeverityLevel });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate a response" });
  }
});

router.post("/submit", async (req, res) => {
  const { candidateId, response } = req.body;

  if (!userSessions[candidateId]) {
    return res.status(400).json({ error: "Session not found or expired." });
  }

  const responseTime =
    (Date.now() - userSessions[candidateId].startTime) / 1000;

  const feedbackPrompt = `Provide a detailed analysis of the following text in terms of creativity, fluency, and adaptability:\n\n"${response}"`;
  const feedback = await generateResponse(feedbackPrompt);

  const isLLMGenerated = analyzeResponse(response);

  res.json({
    feedback,
    responseTime,
    flaggedAsLLMGenerated: isLLMGenerated,
  });

  delete userSessions[candidateId];
});

router.post("/finish", (req, res) => {
  const { candidateId } = req.body;

  if (!userSessions[candidateId]) {
    return res.status(400).json({ error: "Session not found or expired." });
  }

  const session = userSessions[candidateId];
  const conversationHistory = session.interactions
    .map(
      (interaction) =>
        `${interaction.role === "user" ? "User" : "System"}: ${
          interaction.message
        }`
    )
    .join("\n");

  const feedbackPrompt = `Provide an analysis of the following conversation in terms of creativity, fluency, adaptability, and overall communication effectiveness:\n\n${conversationHistory}`;

  generateResponse(feedbackPrompt)
    .then((feedback) => {
      res.json({ feedback });

      delete userSessions[candidateId];
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to generate feedback." });
    });
});

module.exports = router;
