const Event = require('../structures/Event')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'ready'
    })
  }

  updateStats = () => {
    if (!global.statsUpdater) {
      global.statsUpdater = setInterval(() => {
        return this.client.shard.fetchClientValues('guilds.cache.size')
          .then(results => {
            fetch('https://top.gg/api/bots/709524167917043742/stats', { method: 'POST', headers: { 'Authorization': process.env.TOPGG_TOKEN }, body: JSON.stringify({ server_count: results.reduce((acc, guildCount) => acc + guildCount, 0) }) })
          })
          .catch(() => { })
      }, 300000)
    }
  }

  run = () => {
    this.client.registerCommands()
    if (!process.env.DEV) this.updateStats()
  }
}