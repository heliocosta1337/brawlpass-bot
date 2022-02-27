const Event = require('../structures/Event')
const profileModel = require('../models/profile')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  run = async interaction => {
    if (interaction.user.bot) return

    const avatar = interaction.user.avatarURL() || interaction.user.defaultAvatarURL
    let profile = await profileModel.findOne({ user_id: interaction.user.id })

    if (!profile) profile = await profileModel.create({ user_id: interaction.user.id, user_name: interaction.user.tag, user_avatar: avatar })

    if (profile.user_name != interaction.user.tag) await profile.updateOne({ $set: { user_name: interaction.user.tag } })
    if (profile.user_avatar != avatar) await profile.updateOne({ $set: { user_avatar: avatar } })

    if (interaction.isCommand()) {
      const cmd = this.client.commands.find(c => c.name == interaction.commandName)
      if (cmd) cmd.run(interaction, profile)
    }
  }
}