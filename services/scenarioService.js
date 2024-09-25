const { generateResponse } = require("./openaiService");
const scenarioCategories = require("../scenarios/scenarioCategories");

async function generateResponseWithTone(conversationHistory, severityLevel) {
  let toneInstruction =
    "Respond like a real US client, using a natural, conversational, and informal tone.";

  if (severityLevel === "angry") {
    toneInstruction +=
      " You're feeling frustrated and upset, so express your dissatisfaction clearly, but keep it professional.";
  } else if (severityLevel === "formal") {
    toneInstruction +=
      " You're calm and composed, and should respond in a more formal, polite manner.";
  } else if (severityLevel === "neutral") {
    toneInstruction +=
      " You're relaxed and neutral, engaging in a friendly and approachable way.";
  }

  const prompt = `${toneInstruction}\n\nConversation so far:\n${conversationHistory}\nYour response:`;

  try {
    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    console.error("Error generating response with tone:", error);
    throw new Error("Failed to generate response");
  }
}

module.exports = {};

async function getCreativeScenario(category, role) {
  if (!scenarioCategories[category]) {
    throw new Error("Invalid scenario category selected");
  }

  const basePrompt = scenarioCategories[category].examplePrompt;
  const rolePrompt = role
    ? ` The role of the person asking is: "${role}".`
    : "";
  const completePrompt = `${basePrompt}${rolePrompt}`;

  try {
    const scenario = await generateResponse(completePrompt);
    return scenario;
  } catch (error) {
    console.error("Error generating scenario:", error);
    throw new Error("Failed to generate scenario");
  }
}

module.exports = { getCreativeScenario, generateResponseWithTone };
