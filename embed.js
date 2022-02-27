const { MessageEmbed } = require('discord.js')
const emoji = require('./emoji')
const brawlerModel = require('./src/models/brawler')
const modeModel = require('./src/models/gamemode')
const { ParseNumber, GetRandomSadEmoji } = require('./utils')
const { positiveColor, negativeColor } = require('./config.json')

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
        .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() })
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
      .setAuthor({ name: `${user.username}'s quest`, iconURL: user.avatarURL() })
      .setDescription(description)
      .addField('Progress', `\`${ParseNumber(quest.score || 0)}\` **/** \`${ParseNumber(quest.score_needed)}\``)
      .setThumbnail(mode.image)
  }
}