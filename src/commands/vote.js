const Command = require('../structures/Command')
const embed = require('../../embed')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'vote',
      description: 'Vote for the bot and get rewards.'
    })
  }

  run = interaction => {
    interaction.reply({ embeds: [embed.Vote()] })
  }
}