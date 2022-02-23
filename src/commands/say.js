const Command = require('../structures/Command')
const { devs } = require('../../config.json')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      description: 'Send a specific message to a desired channel.',
      args: [
        {
          name: 'channel',
          type: 'CHANNEL',
          description: 'Target channel to send the message.',
          required: true
        },
        {
          name: 'message',
          type: 'STRING',
          description: 'Message content.',
          required: true
        }
      ]
    })
  }

  run = interaction => {
    const channel = interaction.options.getChannel('channel')

    if (!devs.includes(interaction.member.id)) return interaction.reply({ content: 'You have no permission for this.', ephemeral: true })
    if (!['GUILD_TEXT', 'GUILD_ANNOUNCEMENTS'].includes(channel.type)) return interaction.reply({ content: 'Please inform a text channel.', ephemeral: true })

    channel.send(interaction.options.getString('message'))
      .then(() => {
        interaction.reply({ content: `Message sent on \`#${channel.name}\`!`, ephemeral: true })
      })
      .catch(() => {
        interaction.reply({ content: 'Failed to send the message.', ephemeral: true })
      })
  }
}