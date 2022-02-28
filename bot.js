const Client = require('./src/structures/Client')

const client = new Client({
  intents: [
    'GUILDS'
  ]
})

client.login(process.env.DISCORD_TOKEN)