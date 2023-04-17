// todo(@joeysapp):
//    -> what do I want this thing to even do lol
//       e.g. fun stuff vs huge overbuilt/engineering thing.
// ## Review Site/PG structure for best practices (e.g. classes, etc.)
// - Function wrappers for Users, Presences, Events, Interactions 
//   - Comparison, printing, etc.
// - Store necessary information (PG?)
// NOTE: toString of a lot of things hide certain fields.
// Check here: https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/User

//  _______ __   __ __
// |   |   |  |_|__|  |
// |   |   |   _|  |  |
// |_______|____|__|__|
function Message(message) { }
function Interaction(interaction) { }
function Guild(guild) { }
function Presence(presence) { }
function Activity(activity) { }
function User(user) {
  this.userID = null;

  function constructor(user) {
    // lol { this } = ...user;
  }

  function toString() {
    /* Library for indent/pretty printing */
  }
}



// Helpful links:
// https://discordjs.guide/
// https://old.discordjs.dev/#/docs/discord.js/14.9.0/
// https://discord.com/developers/applications/

const { clientSecret, applicationID } = require('./env.json'); // Env vars instead

const sleep = require('node:timers/promises').setTimeout;
const { numToStr } = require('./utils/fmt.js');
const { genSeed, genI32 } = require('./lib/twister.js'); // Pseudo RNG for /roll

// Bot 'client' creation
const {
  Client,
  Events,
  Users,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
} = require('discord.js');
const bennoBot = new Client({
  // https://discord.com/developers/docs/topics/gateway#gateway-intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
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
  genSeed(new Date().getTime());
});

// https://discord.com/developers/docs/topics/gateway#presence-update
// https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/Client?scrollTo=e-presenceUpdate
bennoBot.on(Events.PresenceUpdate, async function(oldPres, newPres) {
  // note(@joeysapp): I think we need to establish a wss connection for this? or not?

  // Messy, just figuring stuff out atm
  const { userId: userID } = oldPres || newPres;
  let { status: oldStatus, activities: oldActivities, clientStatus: oldClientStatus } = oldPres || {};
  let { status: newStatus, activities: newActivities, clientStatus: newClientStatus } = newPres || {};
  console.log(`Events.PresenceUpdate({ userID: ${userID} })`);
  
  if (oldActivities && oldActivities.length) {
    const { name, details, state } = oldActivities[0];
    oldActivities = `[${name}] ${details} - ${state}`;
  }
  if (newActivities && newActivities.length) {
    const { name, details, state } = newActivities[0];
    newActivities = `[${name}] ${details} - ${state}`;
  }
  oldClientStatusString = '';
  Object.keys(oldClientStatus || {}).sort().forEach(function(k, idx) {
    oldClientStatusString += `${idx > 0 ? ', ' : ''}${k}: ${oldClientStatus[k]}`;
  });
  newClientStatusString = '';
  Object.keys(newClientStatus || {}).sort().forEach(function(k, idx) {
    newClientStatusString += `${idx > 0 ? ', ' : ''}${k}: ${newClientStatus[k]}`;
  });

  if (oldClientStatusString !== newClientStatusString) {
    console.log(` - ${oldClientStatusString}`);
    console.log(` > ${newClientStatusString}`);
  }
  if ((oldActivities && oldActivities.length || newActivities && newActivities.length) && (oldActivities !== newActivities)) {
    console.log(` - ${oldActivities}`);
    console.log(` > ${newActivities}`);
  }
});

bennoBot.on(Events.GuildMemberUpdate, async function(oldMember, newMember) {
  console.log('Events.GuildMemberUpdate', oldMember, newMember);
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
    if (sides <= 0) {
      wasDeferred = true;
      await interaction.deferReply({ ephemeral: false });
      await sleep(1000);
      await interaction.editReply(`Okay, dude, a die with ${sides} sides isn't possible. Are you high?`);
      return;
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
    let unit = 'day';
    if (genI32() % 2 === 0) {
      unit = 'year';
    }
    let rareString = '';
    if (genI32() % 100 < 15) {
      rareString = 'You really are a pal! ';
    }
    if (rareString && genI32() % 100 < 49) {
      rareString = 'I love hearing from you! ';
    }
    const accountCreatedAt = new Date(interaction.user.createdTimestamp);
    let accountAge = (new Date() - accountCreatedAt) / (1000 * 60 * 60 * 24 * (unit === 'year' ? 365 : 1));
    const guildJoinedAt = new Date(interaction.member.joinedTimestamp); 
    let guildTenure = (new Date() - guildJoinedAt) / (1000 * 60 * 60 * 24 * (unit === 'year' ? 365 : 1)); // milliseconds to days

    let percentageInGuild = guildTenure/accountAge;

    // Give us two significant digits
    percentageInGuild = Math.round(percentageInGuild * 10000) / 100;
    accountAge = Math.round(accountAge * 100) / 100;
    guildTenure = Math.round(guildTenure * 100) / 100;

    if (accountAge > 1000) accountAge = Math.round(accountAge);
    if (guildTenure > 1000) guildTenure = Math.round(guildTenure);

    let msg = '';
    if (guildTenure < accountAge * 0.25) {
      if (rareString) rareString = `I'll ask Yuan to take care of you. `;
      msg += `Please stop bothering me, ${interaction.user.username}. ${rareString}`;
      msg += `Your account is ${numToStr(accountAge)} ${unit}s old and you've only been here ${numToStr(guildTenure)} ${unit}s. `;
      msg += `That means you've been here only ${percentageInGuild}% of your time on Discord. Please work on your ratio.`;
    } else {
      msg += `Wow, ${interaction.user.username}, it's great to see you. ${rareString}`;
      msg += `Your account is ${numToStr(accountAge)} ${unit}s old and you've been with us for ${numToStr(guildTenure)} ${unit}s! `;
      msg += `You've been with us for ${percentageInGuild}% of your time on Discord.`;
    }
    responses.push(msg);
    // responses.push(`Please stop bothering me, ${interaction.user.username}. You've only been in this Discord for ${guildTenure} days.`);
  }

  let idx = 0;
  // note(@joeysapp): I think the editReply/defer stuff should only be used for actual network requests,
  //  - same with interaction.followUp
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
