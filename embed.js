const { MessageEmbed } = require('discord.js')
const moment = require('moment')
const emoji = require('./emoji')
const brawlerModel = require('./src/models/brawler')
const modeModel = require('./src/models/gamemode')
const { ParseNumber, GetRandomSadEmoji } = require('./utils')
const { defaultColor, positiveColor, negativeColor } = require('./config.json')

module.exports = {
  Success: message => {
    return new MessageEmbed()
      .setColor(positiveColor)
      .setTitle('Success')
      .setDescription(message)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903453433036891/CheckMark.png')
  },

  Error: message => {
    return new MessageEmbed()
      .setColor(negativeColor)
      .setTitle('Error')
      .setDescription(message)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903461637488690/CloseButton.png')
  },

  Matchmake: (mode, players) => {
    return new MessageEmbed()
      .setColor(mode.color || '#ffe25b')
      .setTitle(`${mode.emoji} ${mode.name}`)
      .setDescription(`Looking for players: \`${players}\` **/** \`${mode.players}\``)
      .setThumbnail('https://cdn.discordapp.com/attachments/946615161983238184/946615792793964584/LoadingStar.gif')
  },

  Match: (brawler, mode) => {
    return new MessageEmbed()
      .setColor(mode.color)
      .setTitle('⚔️ Battling... ⚔️')
      .addField('Brawler', `${brawler.emoji} ${brawler.name}`, true)
      .addField('Game Mode', `${mode.emoji} ${mode.name}`, true)
  },

  MatchResult: (brawler, mode, result) => {
    let embed = new MessageEmbed()
      .addField('Brawler', `${brawler.emoji} ${brawler.name}`, true)
      .addField('Game Mode', `${mode.emoji} ${mode.name}`, true)

    if (result.win) {
      embed
        .setColor(positiveColor)
        .setTitle('🎉 You Won! 🎉')
        .addField('Trophies', `${emoji.Trophy} \`+${result.trophies}\``)
        .addField('Kills', `${emoji.ColtGun} \`${result.kills}\``)
        .addField('Damage', `${emoji.Aim} \`${ParseNumber(result.damage)}\``)

      if (result.questCompleted) embed.addField(`${emoji.CheckMark} Quest Completed`, `Reward: ${emoji.Gem} \`${result.gems}\``)
      return embed
    } else {
      embed
        .setColor(negativeColor)
        .setTitle(`Oh No... ${GetRandomSadEmoji()}`)
        .addField('You Lost', `${emoji.Trophy} \`-${result.trophies}\``)

      return embed
    }
  },

  Quest: async (user, quest, self) => {
    if (!quest) {
      return new MessageEmbed()
        .setColor(negativeColor)
        .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() || user.defaultAvatarURL })
        .setDescription(!self ? 'No quest.' : 'No quest.\nClick the button to get a new one!')
    }

    const brawler = await brawlerModel.findOne({ name: quest.brawler })
    const mode = await modeModel.findOne({ name: quest.mode })

    const scoreNeeded = ParseNumber(quest.score_needed, true)
    let description

    switch (quest.type) {
      case 'win':
        description = `Win **${scoreNeeded}** games`
        break
      case 'defeat':
        description = `Defeat **${scoreNeeded}** enemies`
        break
      case 'deal':
        description = `Deal **${scoreNeeded}** points of damage`
        break
    }

    description += ` with ${brawler.emoji} **${brawler.name}** in ${mode.emoji} **${mode.name}** mode.`

    return new MessageEmbed()
      .setColor(mode.color)
      .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() || user.defaultAvatarURL })
      .setDescription(description)
      .addField('Progress', `\`${ParseNumber(quest.score || 0)}\` **/** \`${ParseNumber(quest.score_needed)}\``)
      .setThumbnail(mode.image)
  },

  Profile: async profile => {
    const allTimeStats = [
      `${emoji.TrophyHighest} **${ParseNumber(profile.highestTrophies, true)}** Highest trophies`,
      `${emoji.Matches} **${ParseNumber(profile.matches, true)}** Matches played`,
      `${emoji.HeroStar} **${ParseNumber(profile.wins, true)}** Wins`,
      `${emoji.ColtGun} **${ParseNumber(profile.kills, true)}** Kills`,
      `${emoji.Aim} **${ParseNumber(profile.damage, true)}** Damage done`,
      `${emoji.CheckMark} **${ParseNumber(0, true)}** Quests completed`
    ]

    const currentSeason = [
      `//TODO`
    ]

    const pastSeasons = [
      `//TODO`
    ]

    const misc = [
      `${emoji.Brawlcord} Player since: **${moment(profile.createdAt).fromNow()}**`,
      `👀 Last seen: **${moment(profile.updatedAt).fromNow()}**`,
      `${emoji.Upvote} Votes: **${ParseNumber(profile.votes)}**`
    ]

    return new MessageEmbed()
      .setColor(defaultColor)
      .setAuthor({ name: `${profile.user_name}'s profile`, iconURL: profile.user_avatar })
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903566590509128/Profile.png')
      .addField('All Time Stats', allTimeStats.join('\n'), true)
      .addField('Current Season', currentSeason.join('\n'), true)
      .addField('Past Seasons', pastSeasons.join('\n'))
      .addField('Misc', misc.join('\n'))
  }
}