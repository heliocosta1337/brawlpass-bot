const Command = require('../structures/Command')
const embed = require('../embed')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      description: 'Gets the bot\'s invite link.'
    })
  }

  run = interaction => {
    interaction.reply({ embeds: [embed.Invite()] })
  }
}