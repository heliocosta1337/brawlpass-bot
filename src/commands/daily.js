const Command = require('../structures/Command')
const moment = require('moment')
const embed = require('../../embed')
const emoji = require('../../emoji')
const { HumanizeMilliseconds } = require('../../utils')
const { communityServerId, dailyReward } = require('../../config.json')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'daily',
      description: 'Gets a daily reward.'
    })
  }

  run = (interaction, profile) => {
    if (interaction.guild.id != communityServerId) {
      return interaction.reply({ embeds: [embed.Error('Daily rewards can only be claimed in Brawl Pass server.\n\nPlease use `/discord` to join.')], ephemeral: true })
    }

    const cooldown = moment(profile.daily)

    if (moment().diff(cooldown, 'minutes') > 1440) {
      profile.updateOne({ $inc: { gems: dailyReward }, $set: { daily: moment.utc().toDate() } })
        .then(() => { interaction.reply(`${emoji.Info} **|** ${interaction.user} You have just received ${emoji.Gem} **${dailyReward}** gems from your daily reward! 🎉`) })
        .catch(() => { interaction.reply({ content: `${emoji.X} **|** ${interaction.user} Failed to collect daily reward, please try again or contact the support if this error persists.`, ephemeral: true }) })
    } else {
      interaction.reply({
        content: `${emoji.X} **|** ${interaction.user} Please wait ${HumanizeMilliseconds(moment.duration(cooldown.diff(moment().subtract(1440, 'minutes'))).asMilliseconds())} before claiming this again.`,
        ephemeral: true
      })
    }
  }
}