const Command = require('../structures/Command')
const { MessageActionRow, MessageButton } = require('discord.js')
const embed = require('../../embed')
const emoji = require('../../emoji')
const profileModel = require('../models/profile')

const buyTicket = (profile, price, amount) => {
  return new Promise(async resolve => {
    if (profile.gems < price) return resolve(`${emoji.X} **|** Not enough balance.`)

    await profile.updateOne({ $inc: { gems: -price, tickets: amount } })
      .then(() => { resolve(`${emoji.Shop} **|** Your purchase was successful.`) })
      .catch(() => { resolve(`${emoji.X} **|** Your purchase failed, please try again or contact the support if this error persists.`) })
  })
}

const actionRow = new MessageActionRow()
  .addComponents([
    new MessageButton()
      .setCustomId('buy_ticket_1')
      .setStyle('SUCCESS')
      .setEmoji(emoji.Ticket),
    new MessageButton()
      .setCustomId('buy_ticket_20')
      .setStyle('SUCCESS')
      .setEmoji(emoji.Tickets)
  ])

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'shop',
      description: 'Opens the shop.'
    })
  }

  run = async interaction => {
    const reply = await interaction.reply({ embeds: [embed.Shop(true)], components: [actionRow], fetchReply: true })
    const collector = reply.createMessageComponentCollector({ time: 120000 })

    collector.on('collect', async int => {
      const profile = await profileModel.findOne({ user_id: int.user.id })

      if (!profile) return

      switch (int.customId) {
        case 'buy_ticket_1':
          int.reply({ content: await buyTicket(profile, 10, 1), ephemeral: true })
          break
        case 'buy_ticket_20':
          int.reply({ content: await buyTicket(profile, 180, 20), ephemeral: true })
          break
      }
    })

    collector.on('end', () => {
      interaction.editReply({ embeds: [embed.Shop(false)], components: [] })
    })
  }
}