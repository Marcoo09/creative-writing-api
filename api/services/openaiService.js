const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function inferSeverityLevel(conversationHistory) {
  const prompt = `
      Analyze the following conversation and determine the tone and emotion conveyed by the user in the latest message. Respond with one of the following categories: "neutral", "formal", "angry", or "friendly". Be as realistic and accurate as possible; do not exaggerate the tone.
  
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

async function transcribe(file) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.path),
      model: "whisper-1",
      language: "en",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw error;
  } finally {
    // Clean up the uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting the uploaded file:", err);
    });
  }
}

module.exports = { generateResponse, inferSeverityLevel, transcribe };
