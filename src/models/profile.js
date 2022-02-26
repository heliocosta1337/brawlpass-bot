const { model, Schema } = require('mongoose')
const moment = require('moment')

const rewardsDate = moment.utc().subtract(1, 'd').toDate()

module.exports = model('Profile', new Schema({
  user_id: { type: String, required: true, unique: true },
  user_name: { type: String, required: true },
  trophies: { type: Number, default: 0 },
  highestTrophies: { type: Number, default: 0 },
  daily: { type: Date, default: rewardsDate },
  weekly: { type: Date, default: rewardsDate },
  gems: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  damage: { type: Number, default: 0 }
}, { versionKey: false, timestamps: true }))