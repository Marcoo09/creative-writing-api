const { generateResponse } = require("./openaiService");
const scenarioCategories = require("../scenarios/scenarioCategories");

async function getCreativeScenario(category, role) {
  if (!scenarioCategories[category]) {
    throw new Error("Invalid scenario category selected");
  }

  let clientInstruction = `You are a client or colleague initiating a conversation with someone in a professional but conversational context. Write the first message or email that the person will respond to, based on the scenario category "${category}".`;

  if (role) {
    clientInstruction += ` The person you are messaging has the role of "${role}".`;
  }

  clientInstruction +=
    " Make it sound as realistic, natural, and appropriate as possible, reflecting an authentic client inquiry, task, or concern that someone would need to respond to.";

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
    "You are participating in this conversation as an experienced, assertive colleague or manager with the authority to take decisive actions. Respond in a real, confident, and unfiltered manner, as if you are genuinely involved in this situation.";

  if (inferredTone === "angry") {
    toneInstruction +=
      " The user is being rude or angry. You do not need to tolerate disrespect or inappropriate behavior. Respond with firmness and authority, and if necessary, make it clear that such behavior is unacceptable. If the rudeness continues, do not hesitate to warn the user about the consequences or even end the interaction as a real manager would.";
  } else if (inferredTone === "friendly") {
    toneInstruction +=
      " The user is friendly, so engage warmly and reciprocate, but maintain your professional authority. You're not here to be overly accommodating; you're here to guide and direct as needed.";
  } else if (inferredTone === "formal") {
    toneInstruction +=
      " The user is being formal, so respond in a way that reflects your experience and position, ensuring that you maintain control of the conversation.";
  } else {
    toneInstruction +=
      " Maintain a neutral tone as an experienced professional. You should be assertive and clear, and you do not need to tolerate any behavior that would be unacceptable in a real workplace.";
  }

  toneInstruction +=
    " Remember, you have the authority to set boundaries, correct behavior, or even terminate the conversation if the user continues to be disrespectful or unprofessional. You are not their subordinate, and your primary role is to manage the situation as you see fit.";

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
