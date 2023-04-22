// import {
//   SocketConnection,
//   FileCache, Database, Site,
//   http, path
// } from './db-nodemon/library.mjs';

function DiscordStatus(status) {
  // online, away, dnd, (null/undefined/nothing at all)
  this.desktop = status.desktop ? status.desktop : '';
  this.mobile =  status.mobile ? status.mobile : '';
}
DiscordStatus.prototype.toString = function foobar() {
  return `desktop=${this.desktop}\tmobile=${this.mobile}`;
}

import { numToStr } from './utils/fmt.js';
import { genSeed, genI32 } from './src/external/mersenne-twister.js';

import {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from 'discord.js';
import { User } from 'discord.js';
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
    GatewayIntentBits.MessageContent,
  ],
});
let selfID = null;
let selfUsername = null;
let selfAvatar = null;
bennoBot.once(Events.ClientReady, function(currentClient) {
  console.log(`Events.ClientReady: ${currentClient.user.tag} is now listening for interactions`);
  selfID = currentClient.user.id;
  selfUsername = currentClient.user.username;
  selfAvatar = currentClient.user.avatar;
  genSeed(new Date().getTime());
});

bennoBot.on(Events.InteractionCreate, async function(interaction) {
  const {
    commandName,
    id,
    user: { username, id: userID },
    createdAt,
  } = interaction;

  let cmdString = `/${commandName} `;
  interaction.options.data.forEach(function(opt, idx) {
    const { name, value, type } = opt;
    cmdString += `${name}=${value} `;
  });
  const ts = new Date(createdAt);

  console.log(`[${ts.toLocaleTimeString()}] Events.InteractionCreate({ @${username} })`);
  console.log(` + ${cmdString}`);

  let members = interaction.member.guild.members;  
  const responses = []; // All sent in sequence for now? vs. just concat?
  let wasDeferred = false; // For future network/db reqs
  let ephemeral = false;
  if (interaction.commandName === 'slap') {
    let slapee = interaction.options.getUser('slapee');
    console.log(interaction, members);
    if (!slapee) { slapee = interaction.user; }

    let msg = '';
    let adj = ['wet', 'dry', 'toasty', 'moisty', 'vicious', 'angry', 'enormous', 'itsy-bitsy', 'huge',
               'cute', 'slimy', 'hurtful', 'boisterous', 'clever', 'spiked'];
    let n = ['trout', 'pike', 'salmon', 'octopus', 'catfish', 'monkfish', 'baby shark', 'stingray',
             'shrimp', 'boot'];
    adj = adj[(genI32() % adj.length)];
    n = n[(genI32() % n.length)];
    let foo = 'aeiou'.indexOf(adj[0]) !== -1 ? 'an' : 'a';
    // msg = `${selfUsername} slapped ${slapee.username} with ${foo} ${adj} ${n}.`;
    msg = `${interaction.user.username} slapped ${slapee.username} with ${foo} ${adj} ${n}.`;
    responses.push(msg);
  } else if (interaction.commandName === 'weather') {

  } else if (interaction.commandName === 'activity') {

  } else if (interaction.commandName === 'roll') {
    const sides = interaction.options.getInteger('sides');
    const seed = interaction.options.getInteger('seed');
    if (sides <= 0) {
      responses.push(`Hey man. A "rollable" die with ${sides} sides isn't possible. Are you high?`);
    } else {
      genSeed(seed || (new Date()).getTime());
      const result = ((genI32()) % sides) + 1;
      const seedString = seed ? `seeded with ${seed} ` : '';
      responses.push(`A ${sides}-sided die ${seedString}rolled a ${result}.`);
    }
  } else if (interaction.commandName === 'played') {
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
      let snarkyComment = '';
      snarkyComment = 'Please stop bothering me';

      msg += `${snarkyComment}, ${interaction.user.username}. ${rareString}`;
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

  // lol, if somehow we didn't generate any string.
  if (!responses[0]) responses.push('wat'); 

  console.log(`[${ts.toLocaleTimeString()}] Events.MessageCreate({ @${username} })`);
  let idx = 0;
  if (wasDeferred) {
    // todo(@joeysapp): This will be used with loading/network commands, e.g. weather or rswiki #@%!
    // Also, interaction.followUp('yeet');
    await interaction.editReply(responses[idx])
      .then(function(resInt) {
        console.log(` -> "${responses[idx]}"`);
      });
  } else {
    await interaction.reply({ content: responses[idx], ephemeral })
      .then(async function(finishedInteraction) {
        console.log(` -> "${responses[idx]}"`);
      });
  }
});

// ================================================================================
// This tells the bot how to interpret any given message (but not "slash commands"!)
bennoBot.on(Events.MessageCreate, async function(msg) {
  const { createdTimestamp, content, author: { username, id: userID, }, attachments, stickers, mentions } = msg;
  if (userID === process.env.DISCORD_BENNOBOT_ID) return;
  const ts = new Date(createdTimestamp);

  // Did this message contain a User mention, and was it aimed at us?

  console.log(`[${ts.toLocaleTimeString()}] Events.MessageCreate({ @${username} })`);
  console.log(` + "${content}"`);
});

bennoBot.on(Events.MessageUpdate, async function(oldMsg, newMsg) {
  const { createdTimestamp, content, author: { username, id, }, attachments, stickers, mentions, content: oldContent } = oldMsg;
  const { content: newContent, editedTimestamp } = newMsg;
  const ts = new Date(editedTimestamp);
  console.log(`[${ts.toLocaleTimeString()}] Events.MessageUpdate({ @${username} })`);
  console.log(` - "${oldContent}"`);
  console.log(` > "${newContent}"`);
});

// https://discord.com/developers/docs/topics/gateway#presence-update
bennoBot.on(Events.PresenceUpdate, async function(oldPres, newPres) {
  const { userId: userID, user: { username } } = oldPres || newPres;
  let { status: oldStatus, activities: oldActivities, clientStatus: oldClientStatus } = oldPres || {};
  let { status: newStatus, activities: newActivities, clientStatus: newClientStatus } = newPres || {};

  // console.log(newActivities); // You can have multiple activities at once, e.g. Spotify+RuneLite
  let ts = (new Date());
  
  if (oldActivities && oldActivities.length) {
    const { name, details, state } = oldActivities[0];
    oldActivities = `(${name}) ${details} - ${state}`;
  }
  if (newActivities && newActivities.length) {
    const { name, details, state } = newActivities[0];
    newActivities = `(${name}) ${details} - ${state}`;
  }
  let oldClientStatusString = new DiscordStatus(oldPres ? oldPres.clientStatus : {});
  let newClientStatusString = new DiscordStatus(newPres ? newPres.clientStatus : {});

  const whatChanged = oldClientStatusString !== newClientStatusString ? 'Status' : 'Activities';
  console.log(`[${ts.toLocaleTimeString()}] Events.PresenceUpdate({ @${username}.${whatChanged} })`);

  if (oldClientStatusString !== newClientStatusString) {
    console.log(` - old: ${oldClientStatusString}\n - new: ${newClientStatusString}`);
  }
  if ((oldActivities && oldActivities.length || newActivities && newActivities.length) && (oldActivities !== newActivities)) {
    console.log(` - old: ${oldActivities}\n - new: ${newActivities}`);
  }
});

bennoBot.on(Events.GuildMemberUpdate, async function(oldMember, newMember) {
  console.log('Events.GuildMemberUpdate', oldMember, newMember);
});

import dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import process from 'node:process'; // https://nodejs.org/api/process.html
bennoBot.login(process.env.DISCORD_BENNOBOT_SECRET);
process.once('SIGINT', () => {
  console.log('\n ! process.once(SIGINT)\n -> bennoBot.destroy()');
  bennoBot.destroy();
  process.exit(0);
});
