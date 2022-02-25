const Command = require('../structures/Command')
const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const { Matchmake } = require('../../embed')
const { ColtGun, X } = require('../../emoji')
const gamemodeModel = require('../models/gamemode')
const brawlerModel = require('../models/brawler')

const delay = time => new Promise(resolve => setTimeout(resolve, time))

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'brawl',
      description: 'Starts a match.'
    })
  }

  run = async interaction => {
    const gamemodes = await gamemodeModel.find()
    const brawler = await brawlerModel.findOne({ name: 'Shelly' })

    const actionRow = new MessageActionRow()
      .addComponents([
        new MessageSelectMenu()
          .setCustomId('select_mode')
          .setPlaceholder('Select a game mode')
          .addOptions(gamemodes.map(b => { return { label: b.name, value: b.name, emoji: b.emoji } }))
      ])

    const reply = await interaction.reply({ content: `${ColtGun} **|** ${interaction.user}'s Match**:** \`Selecting mode\``, components: [actionRow], fetchReply: true })
    const collector = reply.createMessageComponentCollector({ max: 1, time: 30000 })

    collector.on('collect', async int => {
      if (!int.user.id == interaction.user.id) return int.reply({ content: `${X} **|** ${int.user} This is not your match! Please use \`/brawl\` command.`, ephemeral: true })

      const selectedMode = gamemodes.find(g => g.name == int.values[0])

      for (let i = 0; i < selectedMode.players; i++) {
        const matchMakeEmbed = Matchmake(selectedMode.color, `${selectedMode.emoji} ${selectedMode.name}`, i + 1, selectedMode.players)

        interaction.editReply({ content: `${ColtGun} **|** ${interaction.user}'s Match**:** \`In matchmake\``, embeds: [matchMakeEmbed], components: [] })
        await delay(Math.floor(Math.random() * 1000) + 100)
      }

      interaction.editReply({ content: `${ColtGun} **|** ${interaction.user}'s Match**:** \`Battling\``, embeds: [] }) //TODO
    })

    collector.on('end', (collected, reason) => {
      if (reason == 'time') interaction.editReply({ content: `${ColtGun} **|** ${interaction.user}'s match was cancelled.`, components: [] })
    })
  }
}