const express = require('express')
const Database = require('../structures/Database')
const emoji = require('../../emoji')
const profileModel = require('../models/profile')
const { webhookPort, communityServerId, communityServerVotesChannelId, botId, voteReward } = require('../../config.json')

const port = process.env.PORT || webhookPort
const app = express()
app.use(express.json())

let shardingManager

app.post('/vote', async (req, res) => {
  if (req.headers.authorization == process.env.TOPGG_SECRET) {
    if (req.body?.bot != botId || req.body?.type != 'upvote') return res.status(400).end()

    const profile = await profileModel.findOne({ user_id: req.body.user })

    if (profile) {
      await profile.updateOne({ $inc: { gems: voteReward, votes: 1 } })

      if (shardingManager) {
        await shardingManager.broadcastEval((c, { serverId, channelId, profile, upVote }) => {
          c.guilds.cache.get(serverId)?.channels.cache.get(channelId)?.send(`${upVote} **${profile.user_name}** has just voted! Total votes: **${profile.votes + 1}** 🎉`)
        }, { context: { serverId: communityServerId, channelId: communityServerVotesChannelId, profile: profile, upVote: emoji.Upvote } })
      }

      console.log(`New vote received from ID ${req.body.user}!`)
      res.status(200).end()
    } else {
      res.status(404).end()
    }
  } else {
    res.status(403).end()
  }
})

app.get('*', (req, res) => {
  res.status(204).end()
})

module.exports = class {
  init(manager) {
    shardingManager = manager
    return new Promise(resolve => {
      new Database().init().then(() => {
        app.listen(port, () => {
          resolve(port)
        })
      })
    })
  }
}