const express = require('express')
const Database = require('../structures/Database')
const profileModel = require('../models/profile')
const { webhookPort, botId, voteReward } = require('../../config.json')

const port = process.env.PORT || webhookPort
const app = express()
app.use(express.json())

app.post('/vote', async (req, res) => {
  if (req.headers.authorization == process.env.TOPGG_SECRET) {
    if (req.body?.bot != botId || req.body?.type != 'upvote') return res.status(400).end()

    const profile = await profileModel.findOne({ user_id: req.body.user })

    if (profile) {
      await profile.updateOne({ $inc: { gems: voteReward, votes: 1 } })
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
  init() {
    return new Promise(resolve => {
      new Database().init().then(() => {
        app.listen(port, () => {
          resolve(port)
        })
      })
    })
  }
}