const Command = require('../structures/Command')
const embed = require('../../embed')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'discord',
      description: 'Gets a invite link to the community server.'
    })
  }

  run = interaction => {
    interaction.reply({ embeds: [embed.Discord()] })
  }
}