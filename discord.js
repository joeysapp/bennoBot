// Helpful links:
// https://discordjs.guide/
// https://old.discordjs.dev/#/docs/discord.js/14.9.0/
// https://discord.com/developers/applications/

const { clientSecret, applicationID } = require('./env.json');
const sleep = require('node:timers/promises').setTimeout;
const { genSeed, genI32 } = require('./lib/twister.js'); // Pseudo RNG for /roll

// Bot 'client' creation
const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
} = require('discord.js');
const bennoBot = new Client({
  // https://discord.com/developers/docs/topics/gateway#gateway-intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions, // _ADD, _REMOVE, _REMOVE_ALL, _REMOVE_EMOJI
    GatewayIntentBits.GuildMessageTyping, // TYPING_START
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent, // messages.read, needs to be authed
  ],
});

bennoBot.once(Events.ClientReady, function(currentClient) {
  console.log(`Events.ClientReady: ${currentClient.user.tag} is now listening for interactions`);
});

bennoBot.on(Events.PresenceUpdate, async function(oldPres, newPres) {
  console.log('Events.PresenceUpdate', oldPres, newPres);
});

bennoBot.on(Events.MessageUpdate, async function(oldMsg, newMsg) {
  const { createdTimestamp, content, author: { username, id, }, attachments, stickers, mentions, content: oldContent } = oldMsg;
  const { content: newContent, editedTimestamp } = newMsg;
  const ts = new Date(editedTimestamp).toLocaleString();
  console.log(`Events.MessageUpdate({ @${username} at ${ts} })`);
  console.log(` - "${oldContent}"`);
  console.log(` > "${newContent}"`);
});

bennoBot.on(Events.MessageCreate, async function(msg) {
  const { createdTimestamp, content, author: { username, id: userID, }, attachments, stickers, mentions } = msg;
  if (userID === applicationID) return;
  const ts = new Date(createdTimestamp).toLocaleString();

  console.log(`Events.MessageCreate({ @${username} at ${ts}})`);
  console.log(` + "${content}"`);
});

bennoBot.on(Events.InteractionCreate, async function(interaction) {
  const {
    commandName,
    id,
    user: {
      username,
      id: userID,
    },
  } = interaction;

  let cmdString = `/${commandName} `;
  interaction.options.data.forEach(function(opt, idx) {
    const { name, value, type } = opt;
    cmdString += `${name}=${value} `;
  });
  console.log(`Events.InteractionCreate({ id: ${id} })`);
  console.log(` + ${cmdString}`);
  console.log(` - @${username} [${userID}]`);
  
  const responses = [];
  let wasDeferred = false;
  if (interaction.commandName === 'roll') {
    //  ______         __ __
    // |   __ \.-----.|  |  |
    // |      <|  _  ||  |  |
    // |___|__||_____||__|__|
    const sides = interaction.options.getInteger('sides');
    const seed = interaction.options.getInteger('seed');
    if (sides > 1000) {
      wasDeferred = true;
      await interaction.deferReply({ ephemeral: false });
      await sleep(1000);
    }
    genSeed(seed || (new Date()).getTime());
    const result = (genI32()) % sides;
    const seedString = seed ? `seeded with ${seed} ` : '';
    responses.push(`A ${sides}-sided die ${seedString}rolled a ${result}.`);
  } else if (interaction.commandName === 'info') {
    //  _______         ___
    // |_     _|.-----.'  _|.-----.
    //  _|   |_ |     |   _||  _  |
    // |_______||__|__|__|  |_____|
    const accountCreatedAt = new Date(interaction.member.joinedTimestamp); 
    let accountAge = (new Date() - accountCreatedAt) / (1000 * 60 * 60 * 24); // milliseconds to days
    accountAge = Math.round(accountAge * 100) / 100; // Give us two significant digits

    responses.push(`Please stop bothering me, ${interaction.user.username}.\nYou've only been using Discord for ${accountAge} days.`);
  }

  let idx = 0;
  if (wasDeferred) {
    await interaction.editReply(responses[idx])
      .then(function(resInt) {
        console.log(`Events.InteractionCreate({ id: ${id} })`);
        console.log(` -> "${responses[idx]}"`);
      });
  } else {
    await interaction.reply(responses[idx])
      .then(async function(finishedInteraction) {
        console.log(`Events.InteractionCreate({ id: ${id} })`);
        console.log(` -> "${responses[idx]}"`);
        // if (responses.length > 1) {
        //   await interaction.followUp(responses[1]);
        // }
      });
  }
});

bennoBot.login(clientSecret);
// Handling ctrl-c to log the bot out
const process = require('process'); // https://nodejs.org/api/process.html
process.once('SIGINT', () => {
  console.log('\n ! process.once(SIGINT)\n -> bennoBot.destroy()');
  bennoBot.destroy();
  process.exit(0);
});
