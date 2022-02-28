const { ShardingManager } = require('discord.js')
const Database = require('./src/structures/Database')
const Webhook = require('./src/structures/Webhook')

require('dotenv').config()

new Database().init().then(conn => {
  console.log(`Connected to database "${conn.connection.name}".`)

  new Webhook().init().then(port => {
    console.log(`Webhook listening at :${port}.`)

    const manager = new ShardingManager('./bot.js', { token: process.env.DISCORD_TOKEN })

    manager.on('shardCreate', shard => console.log(`Shard #${shard.id} launched.`))
    manager.spawn()
  })
})