const Command = require('../structures/Command')
const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const embed = require('../../embed')
const emoji = require('../../emoji')
const profileModel = require('../models/profile')
const questModel = require('../models/quest')
const seasonModel = require('../models/season')
const gamemodeModel = require('../models/gamemode')
const brawlerModel = require('../models/brawler')
const { GetRandomNumber, GetRandomPercentage } = require('../../utils')
const { currentSeason } = require('../../config.json')

const delay = time => new Promise(resolve => setTimeout(resolve, time))

const endBattle = async (userId, brawler, mode) => {
  const profile = await profileModel.findOne({ user_id: userId })
  const quest = await questModel.findOne({ user_id: userId })

  if (GetRandomPercentage() > 25) {
    const trophies = GetRandomNumber(4, 8)
    const gems = GetRandomNumber(2, 12)
    const kills = GetRandomNumber(1, 6)
    const damage = GetRandomNumber(3700, 31000)

    let questCompleted
    const newTrophiesTotal = profile.trophies + trophies

    if (quest?.mode == mode.name) {
      let scoreToAdd

      switch (quest.type) {
        case 'win':
          scoreToAdd = 1
          break
        case 'defeat':
          scoreToAdd = kills
          break
        case 'deal':
          scoreToAdd = damage
          break
      }

      if (quest.score + scoreToAdd >= quest.score_needed) {
        const season = await seasonModel.findOne({ name: currentSeason })

        if (season) {
          const seasonPlayer = season.players.find(p => p.user_id == userId)

          if (seasonPlayer) {
            await season.updateOne({ $inc: { [`players.${season.players.indexOf(seasonPlayer)}.quests`]: 1 } })
          } else {
            await season.updateOne({ $push: { players: { user_id: userId, quests: 1 } } })
          }
        }

        await quest.deleteOne()
        questCompleted = true
      } else {
        await quest.updateOne({ $inc: { score: scoreToAdd } })
      }
    }

    await profile.updateOne({
      $inc: { trophies, gems: questCompleted ? gems : 0, matches: 1, wins: 1, kills, damage },
      $set: { highestTrophies: newTrophiesTotal > profile.highestTrophies ? newTrophiesTotal : profile.highestTrophies }
    })

    return embed.MatchResult(brawler, mode, { win: true, questCompleted, trophies, gems, kills, damage })
  } else {
    const trophies = GetRandomNumber(3, 5)

    await profile.updateOne({ $inc: { trophies: profile.trophies > 0 ? -trophies : 0, matches: 1 } })
    return embed.MatchResult(brawler, mode, { trophies })
  }
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'brawl',
      description: 'Starts a match.'
    })
  }

  run = async interaction => {
    const gamemodes = await gamemodeModel.find()
    const brawler = await brawlerModel.findOne({ name: 'Shelly' }) //TODO

    const actionRow = new MessageActionRow()
      .addComponents([
        new MessageSelectMenu()
          .setCustomId('select_mode')
          .setPlaceholder('Select a game mode')
          .addOptions(gamemodes.map(b => { return { label: b.name, value: b.name, emoji: b.emoji } }))
      ])

    const reply = await interaction.reply({ content: `${emoji.ColtGun} **|** ${interaction.user}'s match`, components: [actionRow], fetchReply: true })
    const collector = reply.createMessageComponentCollector({ time: 30000 })

    collector.on('collect', async int => {
      if (int.user.id != interaction.user.id) return int.reply({ content: `${emoji.X} **|** ${int.user} This is not your match! Please use \`/brawl\` command.`, ephemeral: true })

      const selectedMode = gamemodes.find(g => g.name == int.values[0])

      for (let i = 0; i < selectedMode.players; i++) {
        const matchmakeEmbed = embed.Matchmake(selectedMode, i + 1)

        interaction.editReply({ embeds: [matchmakeEmbed], components: [] })
        await delay(Math.floor(Math.random() * 1000) + 100)
      }

      interaction.editReply({ embeds: [embed.Match(brawler, selectedMode)] })

      await delay(GetRandomNumber(2000, 8000))
      interaction.editReply({ embeds: [await endBattle(interaction.user.id, brawler, selectedMode)] })
    })

    collector.on('end', (collected, reason) => {
      if (reason == 'time') interaction.editReply({ content: `${emoji.ColtGun} **|** ${interaction.user}'s match was cancelled.`, components: [] })
    })
  }
}