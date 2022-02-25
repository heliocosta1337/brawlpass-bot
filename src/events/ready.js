const Event = require('../structures/Event')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'ready'
    })
  }

  run = () => {
    this.client.registerCommands()
    console.log(`Connected to Discord as "${this.client.user.tag}" in ${this.client.guilds.cache.size} servers.`)
  }
}