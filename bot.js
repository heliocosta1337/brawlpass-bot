const Client = require('./src/structures/Client')

const client = new Client({
  intents: [
    'GUILD_MEMBERS'
  ]
})

client.login(process.env.DISCORD_TOKEN)