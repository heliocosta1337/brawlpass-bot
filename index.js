const { ShardingManager } = require('discord.js')
const Webhook = require('./src/structures/Webhook')

require('dotenv').config()

new Webhook().init().then(port => {
  console.log(`Webhook listening at :${port}.`)

  const manager = new ShardingManager('./bot.js', { token: process.env.DISCORD_TOKEN })

  manager.on('shardCreate', shard => console.log(`Shard #${shard.id} launched.`))
  manager.spawn()
})