const Command = require('../structures/Command')
const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const embed = require('../embed')
const seasonModel = require('../models/season')
const { currentSeasonName } = require('../../config.json')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'season',
      description: 'Shows current and past seasons stats.'
    })
  }

  run = async (interaction, profile) => {
    await interaction.deferReply()

    const seasons = await seasonModel.find()

    const actionRow = new MessageActionRow()
      .addComponents([
        new MessageSelectMenu()
          .setCustomId('select_season')
          .setPlaceholder('Select one')
          .addOptions(seasons.map(s => { return { label: s.name, value: s.name, description: s.name == currentSeasonName ? 'Current' : null, emoji: s.emoji } }))
      ])

    const reply = await interaction.editReply({ embeds: [embed.Season(seasons.find(s => s.name == currentSeasonName))], components: [actionRow], fetchReply: true })
    const collector = reply.createMessageComponentCollector({ filter: m => m.user.id == profile.user_id, time: 180000 })

    collector.on('collect', async int => {
      await int.deferUpdate()
      interaction.editReply({ embeds: [embed.Season(seasons.find(s => s.name == int.values[0]))] })
    })

    collector.on('end', () => {
      interaction.editReply({ components: [] })
    })
  }
}