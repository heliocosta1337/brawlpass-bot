const Command = require('../structures/Command')
const { MessageActionRow, MessageButton } = require('discord.js')
const moment = require('moment')
const embed = require('../../embed')
const emoji = require('../../emoji')
const brawlerModel = require('../models/brawler')
const modeModel = require('../models/gamemode')
const questModel = require('../models/quest')
const { GetRandomItemFromArray, GetRandomNumber } = require('../../utils')
const { questTypes, questCooldown } = require('../../config.json')

const genQuest = async () => {
  const brawlers = await brawlerModel.find()
  const modes = await modeModel.find()

  const brawler = GetRandomItemFromArray(brawlers).name
  const mode = GetRandomItemFromArray(modes).name
  const type = GetRandomItemFromArray(questTypes)

  let score_needed

  switch (type) {
    case 'win':
      score_needed = GetRandomNumber(4, 8)
      break
    case 'defeat':
      score_needed = GetRandomNumber(7, 16)
      break
    case 'deal':
      score_needed = GetRandomNumber(30000, 160000)
      break
  }

  return { brawler, mode, type, score_needed }
}

const actionRow = new MessageActionRow()
  .addComponents([
    new MessageButton()
      .setCustomId('quest_new')
      .setStyle('PRIMARY')
      .setLabel('New Quest')
  ])

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'quest',
      description: 'Shows current quest.',
      args: [
        {
          name: 'user',
          type: 'USER',
          description: 'The user to view the quest.'
        }
      ]
    })
  }

  setUserCooldown = userId => {
    this.client.questCooldown[userId] = moment() //TODO

    setTimeout(() => {
      this.client.questCooldown[userId] = null
    }, questCooldown)
  }

  run = async (interaction, profile) => {
    const user = interaction.options.getUser('user') || interaction.user
    const quest = await questModel.findOne({ user_id: user.id })

    if (quest) { //TODO: Add resign button
      interaction.reply({ embeds: [await embed.Quest(user, quest)] })
    } else {
      if (user.id == interaction.user.id) {
        const reply = await interaction.reply({ embeds: [await embed.Quest(user, null, true)], components: [actionRow], fetchReply: true })
        const collector = reply.createMessageComponentCollector({ time: 60000 })

        collector.on('collect', async int => {
          if (int.user.id != interaction.user.id) return int.reply({ content: `${emoji.X} **|** ${int.user} This is not your quest! Please use \`/quest\` command.`, ephemeral: true })

          const cooldown = this.client.questCooldown[interaction.user.id]
          if (cooldown) {
            if (profile.tickets > 0) {
              await profile.updateOne({ $inc: { tickets: -1 } })
            } else {
              return int.reply({
                embeds: [
                  embed.Error(`
                  Please wait **${(moment(cooldown).add(questCooldown).diff(moment()) / 1000).toFixed(0)}** seconds before getting a new quest.\n\n`
                    + `You can buy ${emoji.Tickets} tickets in \`/shop\` to skip this cooldown.`
                  )
                ],
                ephemeral: true
              })
            }
          }

          const newQuest = await genQuest()
          await questModel.create({ user_id: user.id, brawler: newQuest.brawler, mode: newQuest.mode, type: newQuest.type, score_needed: newQuest.score_needed })
            .then(async () => {
              this.setUserCooldown(interaction.user.id)
              interaction.editReply({ content: `${emoji.Quest} **|** ${interaction.user} You just got a **new** quest!`, embeds: [await embed.Quest(user, newQuest)], components: [] })
            })
            .catch(err => {
              if (err.code == 11000) int.reply({ content: `${emoji.X} **|** ${int.user} You already have a quest.`, ephemeral: true })
            })
        })

        collector.on('end', async () => {
          interaction.editReply({ components: [] })
        })
      } else {
        interaction.reply({ embeds: [await embed.Quest(user, null)] })
      }
    }
  }
}