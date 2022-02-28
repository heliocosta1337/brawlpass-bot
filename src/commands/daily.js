const Command = require('../structures/Command')
const moment = require('moment')
const emoji = require('../../emoji')
const { HumanizeMilliseconds } = require('../../utils')
const { dailyReward } = require('../../config.json')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'daily',
      description: 'Gets a daily reward.'
    })
  }

  run = (interaction, profile) => {
    const cooldown = moment(profile.daily)

    if (moment().diff(cooldown, 'minutes') > 1440) {
      profile.updateOne({ $inc: { gems: dailyReward }, $set: { daily: moment.utc().toDate() } })
        .then(() => { interaction.reply(`${emoji.Info} **|** ${interaction.user} You have just received ${emoji.Gem} **${dailyReward}** gems from your daily reward! 🎉`) })
        .catch(() => { interaction.reply({ content: `${emoji.X} **|** ${interaction.user} Failed to collect daily reward.`, ephemeral: true }) })
    } else {
      interaction.reply({
        content: `${emoji.X} **|** ${interaction.user} Please wait ${HumanizeMilliseconds(moment.duration(cooldown.diff(moment().subtract(1440, 'minutes'))).asMilliseconds())} before claiming this again.`,
        ephemeral: true
      })
    }
  }
}