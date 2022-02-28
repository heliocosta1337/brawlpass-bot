require('dotenv').config()

const Client = require('./src/structures/Client')
const Webhook = require('./src/structures/Webhook')

const client = new Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGES',
    'GUILD_MEMBERS'
  ]
})

client.connectToDatabase().then(conn => {
  console.log(`Connected to database "${conn.connection.name}".`)

  new Webhook().listen().then(port => {
    console.log(`Webhook listening at :${port}.`)
    client.login(process.env.DISCORD_TOKEN)
  })
})