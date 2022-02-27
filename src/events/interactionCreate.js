const Event = require('../structures/Event')
const profileModel = require('../models/profile')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  run = async interaction => {
    if (interaction.isCommand()) {
      let profile = await profileModel.findOne({ user_id: interaction.user.id })

      if (!profile) profile = await profileModel.create({ user_id: interaction.user.id, user_name: interaction.user.tag })
      if (profile.name != interaction.user.tag) await profile.updateOne({ $set: { user_name: interaction.user.tag } })

      const cmd = this.client.commands.find(c => c.name == interaction.commandName)
      if (cmd) cmd.run(interaction)
    }
  }
}