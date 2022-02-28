const Command = require('../structures/Command')
const moment = require('moment')
const emoji = require('../../emoji')
const { HumanizeMilliseconds } = require('../../utils')
const { weeklyReward } = require('../../config.json')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'weekly',
      description: 'Gets a weekly reward.'
    })
  }

  run = (interaction, profile) => {
    const cooldown = moment(profile.weekly)

    if (moment().diff(cooldown, 'minutes') > 10080) {
      profile.updateOne({ $inc: { gems: weeklyReward }, $set: { weekly: moment.utc().toDate() } })
        .then(() => { interaction.reply(`${emoji.Info} **|** ${interaction.user} You have just received ${emoji.Gem} **${weeklyReward}** gems from your weekly reward! 🎉`) })
        .catch(() => { interaction.reply({ content: `${emoji.X} **|** ${interaction.user} Failed to collect weekly reward.`, ephemeral: true }) })
    } else {
      interaction.reply({
        content: `${emoji.X} **|** ${interaction.user} Please wait ${HumanizeMilliseconds(moment.duration(cooldown.diff(moment().subtract(10080, 'minutes'))).asMilliseconds())} before claiming this again.`,
        ephemeral: true
      })
    }
  }
}