const { MessageEmbed } = require('discord.js')
const brawlerModel = require('./src/models/brawler')
const modeModel = require('./src/models/gamemode')
const { ParseNumber } = require('./utils')

module.exports = {
  Success: message => {
    return new MessageEmbed()
      .setColor('#2cdc18')
      .setTitle('Success')
      .setDescription(message)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903453433036891/CheckMark.png')
  },

  Error: message => {
    return new MessageEmbed()
      .setColor('#f01818')
      .setTitle('Error')
      .setDescription(message)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903461637488690/CloseButton.png')
  },

  Matchmake: (color, mode, players, totalPlayers) => {
    return new MessageEmbed()
      .setColor(color || '#ffe25b')
      .setTitle(mode)
      .setDescription(`Looking for players: \`${players}\` **/** \`${totalPlayers}\``)
      .setThumbnail('https://cdn.discordapp.com/attachments/946615161983238184/946615792793964584/LoadingStar.gif')
  },

  Quest: async (user, quest, self) => {
    if (!quest) {
      return new MessageEmbed()
        .setColor('#f01818')
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
      .addField('Progress', `\`${quest.score || 0}\` **/** \`${ParseNumber(quest.score_needed)}\``)
      .setThumbnail(mode.image)
  }
}