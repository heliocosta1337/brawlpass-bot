const { ShardingManager } = require('discord.js')
const Webhook = require('./src/structures/Webhook')

require('dotenv').config()

const manager = new ShardingManager('./bot.js', { token: process.env.DISCORD_TOKEN })

new Webhook().init(manager).then(port => {
  console.log(`Webhook listening at :${port}.`)

  manager.on('shardCreate', shard => console.log(`Shard #${shard.id} launched.`))
  manager.spawn()
})