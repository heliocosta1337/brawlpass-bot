const Command = require('../structures/Command')
const { MessageActionRow, MessageSelectMenu } = require('discord.js')
const moment = require('moment')
const embed = require('../../embed')
const emoji = require('../../emoji')
const questModel = require('../models/quest')
const seasonModel = require('../models/season')
const gamemodeModel = require('../models/gamemode')
const brawlerModel = require('../models/brawler')
const { GetRandomNumber, GetRandomPercentage, GetRandomItemFromArray } = require('../../utils')
const { currentSeasonName, brawlCooldown } = require('../../config.json')

const delay = time => new Promise(resolve => setTimeout(resolve, time))

const endBattle = async (profile, brawler, mode) => {
  const quest = await questModel.findOne({ user_id: profile.user_id })

  if (GetRandomPercentage() > 25) {
    const trophies = GetRandomNumber(4, 8)
    const gems = GetRandomNumber(2, 12)
    const kills = GetRandomNumber(1, 4)
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
        const season = await seasonModel.findOne({ name: currentSeasonName })

        if (season) {
          const seasonPlayer = season.players.find(p => p.user_id == profile.user_id)

          if (seasonPlayer) {
            const playerIndex = season.players.indexOf(seasonPlayer)
            await season.updateOne({ $inc: { [`players.${playerIndex}.quests`]: 1 }, $set: { [`players.${playerIndex}.user_name`]: profile.user_name } })
          } else {
            await season.updateOne({ $push: { players: { user_id: profile.user_id, user_name: profile.user_name, quests: 1 } } })
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

  toggleUserBrawling = (userId, status) => {
    status ? this.client.brawling.push(userId) : delete this.client.brawling[this.client.brawling.indexOf(userId)]
  }

  setUserCooldown = userId => {
    this.client.brawlCooldown[userId] = moment().toISOString()

    setTimeout(() => {
      this.client.brawlCooldown[userId] = null
    }, brawlCooldown)
  }

  run = async (interaction, profile) => {
    if (this.client.brawling.includes(interaction.user.id)) return interaction.reply({ content: `${emoji.X} **|** ${interaction.user} Please wait until your last match finishes.`, ephemeral: true })

    const cooldown = this.client.brawlCooldown[interaction.user.id]
    if (cooldown) {
      if (profile.tickets > 0) {
        await profile.updateOne({ $inc: { tickets: -1 } })
      } else {
        return interaction.reply({
          embeds: [
            embed.Error(`
            Please wait **${(moment(cooldown).add(brawlCooldown).diff(moment()) / 1000).toFixed(0)}** seconds before brawling again.\n\n`
              + `You can buy ${emoji.Tickets} tickets in \`/shop\` to skip this cooldown.`
            )
          ],
          ephemeral: true
        })
      }
    }

    this.toggleUserBrawling(interaction.user.id, true)

    const gamemodes = await gamemodeModel.find()
    const brawlers = await brawlerModel.find()

    const quest = await questModel.findOne({ user_id: profile.user_id })
    const brawler = quest ? await brawlerModel.findOne({ name: quest.brawler }) : GetRandomItemFromArray(brawlers)

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
      interaction.editReply({ embeds: [await endBattle(profile, brawler, selectedMode)] })

      this.setUserCooldown(interaction.user.id)
      this.toggleUserBrawling(interaction.user.id, false)
    })

    collector.on('end', (collected, reason) => {
      if (reason == 'time') {
        if (collected.size == 0) interaction.editReply({ content: `${emoji.ColtGun} **|** ${interaction.user}'s match was cancelled.`, components: [] })
        this.toggleUserBrawling(interaction.user.id, false)
      }
    })
  }
}