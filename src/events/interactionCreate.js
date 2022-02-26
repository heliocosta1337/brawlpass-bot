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
      if (!(await profileModel.findOne({ id: interaction.user.id }))) await profileModel.create({ user_id: interaction.user.id, user_name: interaction.user.tag })

      const cmd = this.client.commands.find(c => c.name == interaction.commandName)
      if (cmd) cmd.run(interaction)
    }
  }
}