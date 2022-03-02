const Command = require('../structures/Command')
const { MessageActionRow, MessageButton } = require('discord.js')
const moment = require('moment')
const embed = require('../../embed')
const emoji = require('../../emoji')
const profileModel = require('../models/profile')
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
    this.client.questCooldown[userId] = moment()

    setTimeout(() => {
      this.client.questCooldown[userId] = null
    }, questCooldown)
  }

  run = async (interaction, profile) => {
    const user = interaction.options.getUser('user') || interaction.user
    const quest = await questModel.findOne({ user_id: user.id })

    const actionRow = new MessageActionRow()
      .addComponents([
        new MessageButton()
          .setCustomId(quest ? 'quest_del' : 'quest_new')
          .setStyle(quest ? 'DANGER' : 'PRIMARY')
          .setLabel(quest ? 'Resign' : 'New')
      ])

    const reply = await interaction.reply({ embeds: [await embed.Quest(user, quest)], components: user.id == profile.user_id ? [actionRow] : null, fetchReply: true })
    const collector = reply.createMessageComponentCollector({ time: 180000 })

    collector.on('collect', async int => {
      if (int.user.id != profile.user_id) return int.reply({ content: `${emoji.X} **|** ${int.user} This is not your quest! Please use \`/quest\` command.`, ephemeral: true })

      if (int.customId == 'quest_new') {
        const cooldown = this.client.questCooldown[profile.user_id]
        if (cooldown) {
          profile = await profileModel.findOne({ user_id: profile.user_id })
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
        questModel.create({ user_id: user.id, brawler: newQuest.brawler, mode: newQuest.mode, type: newQuest.type, score_needed: newQuest.score_needed })
          .then(async () => {
            this.setUserCooldown(profile.user_id)
            interaction.editReply({ content: `${emoji.Quest} **|** ${interaction.user} You just got a **new** quest!`, embeds: [await embed.Quest(user, newQuest)], components: [] })
          })
          .catch(err => {
            if (err.code == 11000) int.reply({ content: `${emoji.X} **|** ${int.user} You already have a quest.`, ephemeral: true })
          })
      }

      if (int.customId == 'quest_del') {
        quest.deleteOne()
          .then(async () => {
            await interaction.editReply({ embeds: [await embed.Quest(user, null)], components: [] })
            int.reply({ content: `${emoji.Quest} **|** ${int.user} Your quest has been resigned.`, ephemeral: true })
          })
          .catch(() => {
            int.reply({ content: `${emoji.X} **|** ${int.user} Failed to resign your quest, please try again or contact the support if this error persists.`, ephemeral: true })
          })
      }
    })

    collector.on('end', () => {
      interaction.editReply({ components: [] })
    })
  }
}