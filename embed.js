const { MessageEmbed } = require('discord.js')
const moment = require('moment')
const emoji = require('./emoji')
const seasonModel = require('./src/models/season')
const modeModel = require('./src/models/gamemode')
const brawlerModel = require('./src/models/brawler')
const { ParseNumber, GetRandomSadEmoji } = require('./utils')
const { currentSeasonName, defaultColor, positiveColor, negativeColor } = require('./config.json')

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
    const embed = new MessageEmbed()
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
        .setTitle(`Oh No ${GetRandomSadEmoji()}`)
        .addField('You Lost', `${emoji.Trophy} \`-${result.trophies}\``)

      return embed
    }
  },

  Quest: async (user, quest, self) => {
    if (!quest) {
      return new MessageEmbed()
        .setColor(negativeColor)
        .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() || user.defaultAvatarURL })
        .setDescription(!self ? 'No quest.' : 'No quest.\n\nClick the button to get a new one!')
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
    if (!profile) {
      return new MessageEmbed()
        .setColor(defaultColor)
        .setTitle('Unknown player')
        .setDescription('This user has never used the bot.')
    }

    const seasons = await seasonModel.find()

    const currentSeason = seasons.find(s => s.name == currentSeasonName)
    const pastSeasons = seasons.filter(s => s.name != currentSeasonName)

    const allTimeStats = [
      `${emoji.TrophyHighest} **${ParseNumber(profile.highestTrophies, true)}** Highest trophies`,
      `${emoji.Matches} **${ParseNumber(profile.matches, true)}** Matches played`,
      `${emoji.HeroStar} **${ParseNumber(profile.wins, true)}** Wins`,
      `${emoji.ColtGun} **${ParseNumber(profile.kills, true)}** Kills`,
      `${emoji.Aim} **${ParseNumber(profile.damage, true)}** Damage done`,
      `${emoji.CheckMark} **${ParseNumber(0, true)}** Quests completed`
    ]

    const currentSeasonStats = [
      `${currentSeason.emoji} ${currentSeason.name}`,
      `${emoji.Trophy} **${ParseNumber(profile.trophies, true)}** Trophies`,
      `${emoji.CheckMark} **${ParseNumber(currentSeason.players.find(p => p.user_id == profile.user_id)?.quests || 0)}** Quests completed`
    ]

    const pastSeasonsStats = pastSeasons.map(s => {
      const seasonPlayer = s.players.find(p => p.user_id == profile.user_id)
      if (seasonPlayer) return `${s.emoji} ${s.name} (${emoji.CheckMark} **${ParseNumber(seasonPlayer.quests)}**)`
    })

    const misc = [
      `${emoji.Upvote} Votes: **${ParseNumber(profile.votes)}**`,
      `${emoji.Brawlcord} Player since: **${moment(profile.createdAt).fromNow()}**`,
      `👀 Last seen: **${moment(profile.updatedAt).fromNow()}**`
    ]

    return new MessageEmbed()
      .setColor(defaultColor)
      .setAuthor({ name: `${profile.user_name}'s profile`, iconURL: profile.user_avatar })
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903566590509128/Profile.png')
      .addField('All Time Stats', allTimeStats.join('\n'), true)
      .addField('Current Season', currentSeasonStats.join('\n'), true)
      .addField('Past Seasons', pastSeasonsStats.filter(Boolean).length > 0 ? pastSeasonsStats.join('\n') : 'No stats')
      .addField('Misc', misc.join('\n'))
  },

  Wallet: profile => {
    if (!profile) {
      return new MessageEmbed()
        .setColor(defaultColor)
        .setTitle('Unknown wallet')
        .setDescription('This user has never used the bot.')
    }

    return new MessageEmbed()
      .setColor(defaultColor)
      .setAuthor({ name: `${profile.user_name}'s wallet`, iconURL: profile.user_avatar })
      .addField('Gems', `${emoji.Gem} \`${ParseNumber(profile.gems)}\``)
      .addField('Tickets', `${emoji.Ticket} \`${ParseNumber(profile.tickets)}\``)
  },

  Shop: buttonsTip => {
    const embed = new MessageEmbed()
      .setColor(defaultColor)
      .setTitle(`${emoji.Shop} Shopping ${emoji.Shop}`)
      .addField(`${emoji.Ticket} Ticket (1x)`, `${emoji.Gem} \`10\``, true)
      .addField(`${emoji.Tickets} Ticket (20x)`, `${emoji.Gem} \`180\``, true)

    if (buttonsTip) embed.setDescription('Click the button to buy an item.')

    return embed
  }
}