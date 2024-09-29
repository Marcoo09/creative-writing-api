# **Conversational Evaluation Project**

This project consists of two main components:

1. **API**: An API that handles conversations with the LLM for evaluating candidates and employees.
2. **Slackbot**: A Slackbot that integrates with the API to provide an interactive experience for users directly within Slack.

## **Prerequisites**

- **Node.js**: Ensure you have Node.js installed (version 14.x or later).
- **npm**: Node Package Manager should be available (comes with Node.js).

## **Setup Instructions**

### **1. Clone the Repository**

### **2. Running the API**

The API is located in the `api` folder.

#### **Environment Variables**

You need to create a `.env` file inside the `api` folder with the following environment variables:

```env
# .env file in the api folder
OPENAI_API_KEY=your-openai-api-key
PORT=5000  # Or any port you prefer
```

Install the dependencies and start the API

```bash
cd api
npm install
node index.js
```

### **3. Running the slackbot**

The Slackbot is located in the `slack_bot` folder.

#### **Environment Variables**

Create a `.env` file inside the `slack_bot` folder with the following environment variables:

```env
# .env file in the slack_bot folder
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=your-slack-bot-token
APP_TOKEN=your-app-level-token
API_BASE_URL=http://localhost:5000  # Assuming the API is running on localhost:5000
```

Install dependencies and start the llackbot

```bash
cd slack_bot
npm install
node index.js
```
