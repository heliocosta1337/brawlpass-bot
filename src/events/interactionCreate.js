const Event = require('../structures/Event')
const profileModel = require('../models/profile')
const { ParseDiscordName } = require('../utils')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  run = async interaction => {
    if (interaction.user.bot) return

    const avatar = interaction.user.avatarURL() || interaction.user.defaultAvatarURL
    const name = ParseDiscordName(interaction.user.tag)

    let profile = await profileModel.findOne({ user_id: interaction.user.id })
    if (!profile) profile = await profileModel.create({ user_id: interaction.user.id, user_name: name, user_avatar: avatar })

    await profile.updateOne({ $set: { user_name: name, user_avatar: avatar } })

    if (interaction.isCommand()) {
      const cmd = this.client.commands.find(c => c.name == interaction.commandName)
      if (cmd) cmd.run(interaction, profile)
    }
  }
}