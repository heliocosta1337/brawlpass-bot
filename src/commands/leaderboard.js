const Command = require('../structures/Command')
const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const embed = require('../../embed')
const emoji = require('../../emoji')

const actionRow = new MessageActionRow()
  .addComponents([
    new MessageSelectMenu()
      .setCustomId('select_stat')
      .setPlaceholder('Select one')
      .addOptions([
        { label: 'Highest Trophies', value: 'highestTrophies', emoji: emoji.TrophyHighest },
        { label: 'Matches Played', value: 'matches', emoji: emoji.Matches },
        { label: 'Wins', value: 'wins', emoji: emoji.HeroStar },
        { label: 'Kills', value: 'kills', emoji: emoji.ColtGun },
        { label: 'Damage Done', value: 'damage', emoji: emoji.Aim },
        { label: 'Most Rich', value: 'gems', emoji: emoji.Gem }
      ])
  ])

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      description: 'Shows best players.'
    })
  }

  run = async (interaction, profile) => {
    await interaction.deferReply()

    const reply = await interaction.editReply({ embeds: [await embed.Leaderboard('highestTrophies')], components: [actionRow], fetchReply: true })
    const collector = reply.createMessageComponentCollector({ filter: m => m.user.id == profile.user_id, time: 180000 })

    collector.on('collect', async int => {
      await int.deferUpdate()
      interaction.editReply({ embeds: [await embed.Leaderboard(int.values[0])] })
    })

    collector.on('end', async () => {
      interaction.editReply({ components: [] })
    })
  }
}