const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function inferSeverityLevel(conversationHistory) {
  const prompt = `
      Analyze the following conversation and determine the tone and emotion conveyed by the user in the latest message. Respond with one of the following categories: "neutral", "formal", "angry", or "friendly". 
  
      Conversation history:
      ${conversationHistory}
      
      Latest user's tone:
    `;

  try {
    const severityResponse = await generateResponse(prompt);
    const inferredTone = severityResponse.trim().toLowerCase();

    const validTones = ["neutral", "formal", "angry", "friendly"];
    return validTones.includes(inferredTone) ? inferredTone : "neutral";
  } catch (error) {
    console.error("Error inferring severity level:", error);
    return "neutral";
  }
}

async function generateResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating response from OpenAI:", error);
    throw new Error("Failed to generate response");
  }
}

module.exports = { generateResponse, inferSeverityLevel };
