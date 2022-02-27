const { Client } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const { connect } = require('mongoose')
const { devServer } = require('../../config.json')

module.exports = class extends Client {
  constructor(options) {
    super(options)

    this.commands = []
    this.loadCommands()
    this.loadEvents()

    this.brawling = []
  }

  registerCommands() {
    if (process.env.DEV) {
      this.guilds.cache.get(devServer).commands.set(this.commands)
      console.log('Commands set in development server.')
    } else {
      this.application.commands.set(this.commands)
      console.log('Commands set in all servers.')
    }
  }

  loadCommands(path = 'src/commands') {
    const commands = readdirSync(path)

    for (const command of commands) {
      const cmdClass = require(join(process.cwd(), `${path}/${command}`))
      const cmd = new (cmdClass)(this)

      this.commands.push(cmd)
    }

    console.log('Loaded commands.')
  }

  loadEvents(path = 'src/events') {
    const events = readdirSync(path)

    for (const event of events) {
      const evtClass = require(join(process.cwd(), `${path}/${event}`))
      const evt = new (evtClass)(this)

      this.on(evt.name, evt.run)
    }

    console.log('Loaded event handlers.')
  }

  async connectToDatabase() {
    return await connect(process.env.MONGO_SRV)
  }
}