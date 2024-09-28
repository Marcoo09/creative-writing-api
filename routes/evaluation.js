const express = require("express");
const router = express.Router();
const { generateResponse, transcribe } = require("../services/openaiService");
const { analyzeResponse } = require("../utils/responseUtils");
const {
  getCreativeScenario,
  generateConversationalResponse,
} = require("../services/scenarioService");
const scenarioCategories = require("../scenarios/scenarioCategories");
const { inferSeverityLevel } = require("../services/openaiService");
const { upload } = require("../middleware/upload");

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

router.post("/respond", upload.single("audio"), async (req, res) => {
  const { candidateId, userMessage } = req.body;

  if (!userSessions[candidateId]) {
    return res.status(400).json({ error: "Session not found or expired." });
  }

  try {
    let userInputMessage = userMessage;

    if (req.file) {
      try {
        userInputMessage = await transcribe(req.file);
        console.log("userInputMessage", userInputMessage);
      } catch (error) {
        console.error("Error transcribing audio:", error);
        return res
          .status(500)
          .json({ error: "Failed to transcribe the audio file" });
      }
    }

    userSessions[candidateId].interactions.push({
      role: "user",
      message: userInputMessage,
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

    const systemResponse = await generateConversationalResponse(
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

  const feedbackPrompt = `
    Please analyze the following conversation, providing feedback in a structured format with the following sections:
    
    1. **Feedback**: Provide a general overview of how the conversation went, focusing on creativity, fluency, adaptability, and overall communication effectiveness.
    2. **Points to Improve**: Highlight specific areas where the user can improve their responses, communication style, or content.
    3. **Tone Corrections**: Identify any instances where the tone was inappropriate, inconsistent, or could be improved to sound more natural or appropriate for the situation.
    4. **Typos**: List any spelling or grammatical errors found in the user's responses.

    Conversation history:
    ${conversationHistory}
    
    Provide the structured feedback now:
  `;

  generateResponse(feedbackPrompt)
    .then((structuredFeedback) => {
      res.json({ structuredFeedback });

      delete userSessions[candidateId];
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to generate feedback." });
    });
});

module.exports = router;
