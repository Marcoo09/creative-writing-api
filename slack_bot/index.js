const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // para poder usar desde localhost sin tener que deployar jijiijji
  appToken: process.env.APP_TOKEN
});


app.message("hola", async ({ command, say }) => {
  try {
    say("Tu nariz contra mis bolas, comiste soquete!");
  } catch (error) {
    console.error(error);
  }
});


(async () => {
  const port = 3000
  await app.start(process.env.PORT || port);
  console.log('Bolt app started!!');
})();
