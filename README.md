# bennoBot
A lightweight Discord bot using the [Discord API v14.x.x](https://discord.js.org/) and several other libraries to implement features I or friends have wanted.

## Notes
- Generals
  - This is a fun project, and not a huge over-engineered headache
- Technicals
  - Discord
    - `discord.js` is slated to be deprecated, `@discordjs/core` et. all is the upcoming version.
    - `DiscordObject.toString()` often does not show everything.

## Roadmap
- *Better project organization*
- *Submodule attempt #352*
- Simple Markov-based text generation
  - Corpus is what exactly?

- Super simple poll creation/usage/deletion/history
- Games
  - Mafia (Very simple, roles and day/night cycles?)
  - Go (Image generation reqs)
- Weather queries (via zipcode?)
  - Wunderground is likely a simple REST/scraping deal. https://www.wunderground.com/about/data
- WolframQueries - https://products.wolframalpha.com/simple-api/documentation
- General bot communication/status
  - Notes: https://discordjs.guide/popular-topics/faq.html#how-do-i-check-the-bot-s-ping

## todo
1. Go over site+db structure to review where I last was at

  - Submodule it out somehow (?)
  - Consider db's usage/reqs/extension
    - e.g. site<->discord shoutbox
2. *Definitely* wrappers for things applicable to site+db, e.g. SpotifyTrack, WeatherEvent

  - Helpful prototype functions vs. external objects, e.g.
    - Set operations (graph theory)
    - Algebraic operations (e.g. message comparison)
    - Pretty printing
2. _Maybe_ functional wrappers for API objects, e.g.

  - Discord Users, Presences, Events, Interactions, etc.
  - Genius Artists, Albums, Tracks


## Dependencies
- **js/discord.js** - Primary API used to run bennoBot
  - [github.com/discordjs/discord.js](https://github.com/discordjs/discord.js)
  - [npmjs.com/package/discord.js](https://www.npmjs.com/package/discord.js)
  - Added at 2023-04-16
- **js/markov-chain**
  - [github.com/bdchauvette/markov-chains](https://github.com/bdchauvette/markov-chains)
  - [npmjs.com/package/markov-chains](https://www.npmjs.com/package/markov-chains)
  - Added at 2023-04-21
- **js/dotenv** - Ease of life library to load in environment variables
  - [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)
  - [npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv)
  - Added at 2023-04-21
  

## Documentation
* https://discordjs.guide/
* https://discord.com/developers/applications/

* https://old.discordjs.dev/#/docs/discord.js/14.9.0/
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/Activity
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/Presence
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/User
