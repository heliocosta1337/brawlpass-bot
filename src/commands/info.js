const Command = require('../structures/Command')
const embed = require('../embed')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      description: 'Shows information about how the bot works.'
    })
  }

  run = interaction => {
    interaction.reply({ embeds: [embed.Info()] })
  }
}