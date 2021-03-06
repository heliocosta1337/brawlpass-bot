const { model, Schema } = require('mongoose')
const moment = require('moment')

module.exports = model('Profile', new Schema({
  user_id: { type: String, required: true, unique: true },
  user_name: { type: String, required: true },
  user_avatar: { type: String, required: true },
  votes: { type: Number, default: 0 },
  tickets: { type: Number, default: 2 },
  trophies: { type: Number, default: 0 },
  highestTrophies: { type: Number, default: 0 },
  daily: { type: Date, default: moment.utc().subtract(1, 'd').toDate() },
  weekly: { type: Date, default: moment.utc().subtract(7, 'd').toDate() },
  gems: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  damage: { type: Number, default: 0 }
}, { versionKey: false, timestamps: true }))