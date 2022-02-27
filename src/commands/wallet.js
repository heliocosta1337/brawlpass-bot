const Command = require('../structures/Command')
const embed = require('../../embed')
const profileModel = require('../models/profile')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'wallet',
      description: 'Shows wallet.',
      args: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user to view the wallet.'
        }
      ]
    })
  }

  run = async interaction => {
    const user = interaction.options.getUser('user') || interaction.user
    const profile = await profileModel.findOne({ user_id: user.id })

    interaction.reply({ embeds: [embed.Wallet(profile)], ephemeral: profile == null })
  }
}