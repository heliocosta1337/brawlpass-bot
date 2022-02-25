const Command = require('../structures/Command')
const { MessageEmbed } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'Check uptime and latency.'
    })
  }

  run = interaction => {
    let uptime = this.client.uptime

    let days = Math.floor(uptime / 86400000)
    let hours = Math.floor(uptime / 3600000) % 24
    let minutes = Math.floor(uptime / 60000) % 60
    let seconds = Math.floor(uptime / 1000) % 60

    const embed = new MessageEmbed()
      .setTitle('Pong!')
      .addField('Latency', `${this.client.ws.ping}ms.`, true)
      .addField('Uptime', `**${days}**d **${hours}**h **${minutes}**m **${seconds}**s.`, true)

    interaction.reply({ embeds: [embed] })
  }
}