const { MessageEmbed } = require('discord.js')
const moment = require('moment')
const emoji = require('./emoji')
const profileModel = require('./src/models/profile')
const seasonModel = require('./src/models/season')
const modeModel = require('./src/models/gamemode')
const brawlerModel = require('./src/models/brawler')
const { ParseNumber, GetRandomSadEmoji } = require('./utils')
const { communityServerInvite, botInvite, currentSeasonName, defaultColor, positiveColor, negativeColor } = require('./config.json')

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

  Info: () => {
    const tutorial = [
      `First you pick a quest **(**\`/quest\`**)** then you play matches **(**\`/brawl\`**)** until you complete your quest & rewards in return.`,
      `The above commands have a certain cooldown, you can buy ${emoji.Tickets} tickets **(**\`/shop\`**)** to bypass them.`,
      `You can view your balance & items using **(**\`/wallet\`**)** command.`
    ]

    return new MessageEmbed()
      .setColor(defaultColor)
      .setTitle('About Brawl Pass Bot')
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903444365213726/BrawlPassTicket.png')
      .setFooter({ text: 'This content is not affiliated with Supercell.' })
      .addField(`${emoji.Info} What is this?`, 'This is a discord bot designed to entertain people. The bot is a Brawl Pass simulator based on the Supercell game Brawl Stars, where you complete quests and get rewards in return.')
      .addField(`${emoji.Info} How to play?`, tutorial.join('\n\n'))
      .addField(`${emoji.Info} Need help?`, `Join our ${emoji.Brawlcord} server: ${communityServerInvite}`)
  },

  Discord: () => {
    return new MessageEmbed()
      .setColor(defaultColor)
      .setDescription(`👉 Click [here](${communityServerInvite}) to **join** our discord server.`)
  },

  Invite: () => {
    return new MessageEmbed()
      .setColor(defaultColor)
      .setDescription(`👉 Click [here](${botInvite}) to **invite** Brawl Pass Bot to your discord server.`)
  },

  Vote: () => {
    return new MessageEmbed()
      .setColor(defaultColor)
      .setDescription(`Voting helps bump us higher on bot lists, and in return you get ${emoji.Gem} gems as reward.`)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903487931318292/GreenHeart.png')
      .setFooter({ text: 'Rewards are automatically given after voting' })
      .addField(`${emoji.Gem} 75 gems every 12h`, '**Click [👉 here 👈](https://top.gg/bot/709524167917043742/vote) to proceed!**')
  },

  Matchmake: (mode, players) => {
    return new MessageEmbed()
      .setColor(mode.color || defaultColor)
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
    }).filter(Boolean)

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
      .addField('Past Seasons', pastSeasonsStats.length > 0 ? pastSeasonsStats.join('\n') : 'No stats')
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
  },

  Leaderboard: async type => {
    const profiles = await profileModel.find().limit(10).sort([[type, -1]])
    const embed = new MessageEmbed().setColor('#3fabfa').setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903533837451374/Leaderboard.png')

    let title
    let titleEmoji

    let rankings = ''

    profiles.forEach(p => {
      let rank = profiles.indexOf(p) + 1
      let score

      switch (type) {
        case 'highestTrophies':
          title = 'Highest Trophies'
          titleEmoji = emoji.TrophyHighest
          score = ParseNumber(p.highestTrophies)
          break
        case 'matches':
          title = 'Matches Played'
          titleEmoji = emoji.Matches
          score = ParseNumber(p.matches)
          break
        case 'wins':
          title = 'Matches Won'
          titleEmoji = emoji.HeroStar
          score = ParseNumber(p.wins)
          break
        case 'kills':
          title = 'Kills'
          titleEmoji = emoji.ColtGun
          score = ParseNumber(p.kills)
          break
        case 'damage':
          title = 'Damage Done'
          titleEmoji = emoji.Aim
          score = ParseNumber(p.damage)
          break
        case 'gems':
          title = 'Richest'
          titleEmoji = emoji.Gem
          score = ParseNumber(p.gems)
          break
      }

      if (rank == 1) rankings += `🥇 ${p.user_name} **|** ${titleEmoji} **${score}**\n`
      if (rank == 2) rankings += `🥈 ${p.user_name} **|** ${titleEmoji} **${score}**\n`
      if (rank == 3) rankings += `🥉 ${p.user_name} **|** ${titleEmoji} **${score}**\n`
      if (rank > 3) rankings += `\n**${rank}.** ${p.user_name} **|** ${titleEmoji} **${score}**`
    })

    embed.setTitle(`${titleEmoji} ${title}`)
    embed.setDescription(rankings)

    return embed
  },

  Season: season => {
    let topPlayers = season.players.sort((a, b) => b.quests - a.quests).slice(0, 10)
    let rankings = ''

    topPlayers.forEach(p => {
      let rank = topPlayers.indexOf(p) + 1

      if (rank == 1) rankings += `🥇 ${p.user_name} **|** ${emoji.CheckMark} **${ParseNumber(p.quests)}**\n`
      if (rank == 2) rankings += `🥈 ${p.user_name} **|** ${emoji.CheckMark} **${ParseNumber(p.quests)}**\n`
      if (rank == 3) rankings += `🥉 ${p.user_name} **|** ${emoji.CheckMark} **${ParseNumber(p.quests)}**\n`
      if (rank > 3) rankings += `\n**${rank}.** ${p.user_name} **|** ${emoji.CheckMark} **${ParseNumber(p.quests)}**`
    })

    return new MessageEmbed()
      .setColor(season.color)
      .setTitle(`${season.emoji} ${season.name} (${season.name == currentSeasonName ? 'Current' : 'Past'})`)
      .setDescription(rankings)
      .setThumbnail(season.image)
  }
}