const { App } = require("@slack/bolt");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const { startConversation, respond, endConversation, getCategories } = require('./network');
const { Session } = require('./models');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // para poder usar desde localhost sin tener que deployar jijiijji
  appToken: process.env.APP_TOKEN
});

app.command('/categories', async ({ ack, respond }) => {
  await ack();

  const categories = await getCategories();
  let res = "";
  for (const key in categories) {
    if (categories.hasOwnProperty(key)) {
      res += `${key}: ${categories[key].description}\n`;
    }
  }

  await respond({text: res});
});

app.command('/start', async ({ command, ack, respond }) => {
  await ack();

  const user = command.user_name;
  const userId = command.user_id;
  const params = command.text.trim().split(",");
  const category = params[0];
  const role = params[1];

  const session = await Session.create({
    id: uuidv4(),
    userName: user,
    userId: userId,
    role: role,
    category: category,
    ongoing: true,
    createdAt: new Date(),
  });

  const scenario = await startConversation(session.id, session.category, session.role);

  await respond({text: scenario});
});

app.message(async ({ message, say }) => {
  if (!message.subtype || message.subtype !== 'bot_message') {
    const session = await Session.findOne({
      where: {
        userId: message.user,
        ongoing: true,
      },
      order: [['createdAt', 'DESC']],
    });

    if (session) {
      const systemResponse = await respond(session.id, message.text);
      await say(systemResponse);
    } else {
      await say('No active session found. Please start a new session using the /start command or use /help to get more information');
    }
  }
});

app.command('/end', async ({ command, ack, respond }) => {
  await ack();

  const userId = command.user_id;
  const session = await Session.findOne({
    where: {
      userId: userId,
      ongoing: true,
    },
    order: [['createdAt', 'DESC']],
  });

  if (session) {
    const feedback = await endConversation(session.id);
    await session.update({ ongoing: false })

    await respond({text: feedback});
  } else {
    await respond({text: 'No active session found. Please start a new session using the /start command or use /help to get more information'});
  }
});

(async () => {
  const port = 3000
  await app.start(process.env.PORT || port);
  console.log('Bolt app started!!');
})();
