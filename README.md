# bennoBot
A lightweight Discord bot using the [Discord API v14.x.x](https://discord.js.org/) and several other libraries to implement features I or friends have wanted.

## Notes
- Generals
  - This is a fun project, and not a huge over-engineered headache
- Technicals
  - Discord
    - DiscordObject.toString() often does not show everything!

## Roadmap
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
- [npm/discord.js](https://github.com/discordjs/discord.js)
- [npm/markov-chain](https://github.com/bdchauvette/markov-chains)

## Documentation
* https://discordjs.guide/
* https://discord.com/developers/applications/

* https://old.discordjs.dev/#/docs/discord.js/14.9.0/
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/Activity
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/Presence
* https://old.discordjs.dev/#/docs/discord.js/14.9.0/class/User
