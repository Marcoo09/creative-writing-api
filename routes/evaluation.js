const express = require("express");
const router = express.Router();
const { generateResponse } = require("../services/openaiService");
const { analyzeResponse } = require("../utils/responseUtils");

let userSessions = {};

router.post("/start", (req, res) => {
  const { candidateId } = req.body;
  const prompt =
    "Write a persuasive email to convince a client to renew their contract.";

  userSessions[candidateId] = {
    startTime: Date.now(),
    prompt: prompt,
  };

  res.json({ prompt });
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

module.exports = router;
