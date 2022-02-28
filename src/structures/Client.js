const { Client } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const { devServerId } = require('../../config.json')

module.exports = class extends Client {
  constructor(options) {
    super(options)

    this.commands = []
    this.loadCommands()
    this.loadEvents()

    this.brawling = []
    this.brawlCooldown = {}
    this.questCooldown = {}
  }

  registerCommands() {
    if (process.env.DEV) {
      const devServer = this.guilds.cache.get(devServerId)
      if (devServer) devServer.commands.set(this.commands)
    } else {
      this.application.commands.set(this.commands)
    }
  }

  loadCommands(path = 'src/commands') {
    const commands = readdirSync(path)

    for (const command of commands) {
      const cmdClass = require(join(process.cwd(), `${path}/${command}`))
      const cmd = new (cmdClass)(this)

      this.commands.push(cmd)
    }
  }

  loadEvents(path = 'src/events') {
    const events = readdirSync(path)

    for (const event of events) {
      const evtClass = require(join(process.cwd(), `${path}/${event}`))
      const evt = new (evtClass)(this)

      this.on(evt.name, evt.run)
    }
  }
}