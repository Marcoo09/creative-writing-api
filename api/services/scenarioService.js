const { generateResponse } = require("./openaiService");
const scenarioCategories = require("../scenarios/scenarioCategories");

async function getCreativeScenario(category, role) {
  if (!scenarioCategories[category]) {
    throw new Error("Invalid scenario category selected");
  }

  let clientInstruction = `You are a client or colleague initiating a conversation with someone in a professional but conversational context. Pretend you are a real person in a work situation who has a genuine need or concern. Keep your message concise and specific.`;

  if (role) {
    clientInstruction += ` The person you are messaging has the role of "${role}".`;
  }

  clientInstruction += ` Start the conversation with a request, concern, or instruction that is typical for your role, using a tone that reflects your position and experience. Avoid overly formal or robotic language.`;

  try {
    const scenario = await generateResponse(clientInstruction);
    return scenario.trim();
  } catch (error) {
    console.error("Error generating scenario:", error);
    throw new Error("Failed to generate scenario");
  }
}

async function generateConversationalResponse(
  conversationHistory,
  inferredTone
) {
  let toneInstruction =
    "You are participating in this conversation as an experienced, assertive colleague or manager with the authority to take decisive actions. Respond in a real, confident, and unfiltered manner, as if you are genuinely involved in this situation. Keep your responses concise, to the point, and avoid unnecessary repetition.";

  if (inferredTone === "angry") {
    toneInstruction +=
      " The user is being rude or angry. Address the issue firmly and directly, without tolerating disrespect. If needed, be clear about consequences but remain professional.";
  } else if (inferredTone === "friendly") {
    toneInstruction +=
      " The user is friendly, so respond warmly but avoid being overly accommodating. Maintain your role as an experienced professional.";
  } else if (inferredTone === "formal") {
    toneInstruction +=
      " The user is being formal, so respond professionally, with authority. Ensure your responses reflect your experience and position.";
  } else {
    toneInstruction +=
      " Maintain a neutral, clear, and assertive tone. Do not over-explain or be excessively accommodating.";
  }

  toneInstruction +=
    " Remember, you have the authority to set boundaries, correct behavior, or even end the conversation if the user is unprofessional. Respond in no more than 2-3 sentences. Avoid unnecessary details and repetition.";

  const prompt = `${toneInstruction}\n\nConversation so far:\n${conversationHistory}\nYour response:`;

  try {
    const response = await generateResponse(prompt);
    return response.trim();
  } catch (error) {
    console.error("Error generating conversational response:", error);
    throw new Error("Failed to generate response");
  }
}

module.exports = {
  getCreativeScenario,
  generateConversationalResponse,
};
