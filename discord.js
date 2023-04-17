// Helpful links:
// https://discordjs.guide/
// https://old.discordjs.dev/#/docs/discord.js/14.9.0/
// https://discord.com/developers/applications/

// Pseudo RNG for /roll
const { genSeed, genI32 } = require('./lib/twister.js');

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

bennoBot.on(Events.MessageCreate, async function(msg) {
  const {
    createdTimestamp,
    content,
    author,
    attachments,
    stickers,
    mentions,
  } = msg;
  console.log(`Events.MessageCreate(msg)\n- content: ${content}\n- author.username: ${author.username}\n@ ${new Date(createdTimestamp)}\n`);
});

bennoBot.on(Events.InteractionCreate, async function(interaction) {
  //  ______         __ __
  // |   __ \.-----.|  |  |
  // |      <|  _  ||  |  |
  // |___|__||_____||__|__|
  if (interaction.commandName === 'roll') {
    const sides = interaction.options.getInteger('sides');
    const seed = interaction.options.getInteger('seed');

    // todo(@joeysapp): just using Mersenne twister rng atm
    genSeed(seed || (new Date()).getTime());
    const result = (genI32()) % sides;

    const seedString = seed ? `seeded with ${seed} ` : '';
    const rollString = `A ${sides} sided die ${seedString}rolled a ${result}.`;
    await interaction.reply({
      content: rollString,
      ephemeral: false, // private reply
    });
  //  _______         ___
  // |_     _|.-----.'  _|.-----.
  //  _|   |_ |     |   _||  _  |
  // |_______||__|__|__|  |_____|
  } else if (interaction.commandName === 'info') {
    const accountCreatedAt = new Date(interaction.member.joinedTimestamp); 
    let accountAge = (new Date() - accountCreatedAt) / (1000 * 60 * 60 * 24); // ms to days
    accountAge = Math.round(daysOld * 100) / 100; // give us two sig digs

    const msg = `Please stop bothering me, ${interaction.user.username}. You've only been using Discord for ${accountAge} days.`;
    await interaction.reply(msg);
  }
});

const { tok } = require('./env.json');
bennoBot.login(tok);

// Handling ctrl-c to log the bot out
const process = require('process'); // https://nodejs.org/api/process.html
process.once('SIGINT', () => {
  console.log('\n ! process.once(SIGINT)\n -> bennoBot.destroy()');
  bennoBot.destroy();
  process.exit(0);
});
