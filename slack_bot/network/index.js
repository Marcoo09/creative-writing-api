require("dotenv").config();
const baseUrl = process.env.API_BASE_URL;

async function getCategories() {
  const apiResponse = await fetch(`${baseUrl}/categories`);
  const categories = await apiResponse.json();

  return categories;
}

async function startConversation(sessionId, category, role) {
  const apiResponse = await fetch(`${baseUrl}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: sessionId, category, role }),
  });

  const result = await apiResponse.json();
  const scenario = result.scenario;

  return scenario;
}

async function respond(sessionId, message) {
  const apiResponse = await fetch(`${baseUrl}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: sessionId, userMessage: message }),
  });

  const result = await apiResponse.json();
  const systemResponse = result.systemResponse;

  return systemResponse;
}

async function endConversation(sessionId) {
  const apiResponse = await fetch(`${baseUrl}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: sessionId }),
  });

  const result = await apiResponse.json();
  const feedback = result.structuredFeedback;

  return feedback;
}

module.exports = { startConversation, respond, endConversation, getCategories };
