const { MessageEmbed } = require('discord.js')

module.exports = {
  Matchmake: (color, mode, players, totalPlayers) => {
    return new MessageEmbed()
      .setColor(color || '#ffe25b')
      .setTitle(mode)
      .setDescription(`Looking for players: \`${players}\` **/** \`${totalPlayers}\``)
      .setThumbnail('https://cdn.discordapp.com/attachments/946615161983238184/946615792793964584/LoadingStar.gif')
  },

  Error: message => {
    return new MessageEmbed()
      .setColor('#f01818')
      .setTitle('Error')
      .setDescription(message)
      .setThumbnail('https://cdn.discordapp.com/attachments/831902713343246336/831903461637488690/CloseButton.png')
  }
}