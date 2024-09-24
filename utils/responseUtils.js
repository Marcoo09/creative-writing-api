const { generateResponse } = require("../services/openaiService");

// Basic detection of LLM-generated content
function analyzeResponse(response) {
  const commonPhrases = [
    "As an AI language model",
    "In conclusion",
    "It's important to note",
  ];
  let flagged = false;

  commonPhrases.forEach((phrase) => {
    if (response.includes(phrase)) flagged = true;
  });

  return flagged;
}

module.exports = { analyzeResponse };
