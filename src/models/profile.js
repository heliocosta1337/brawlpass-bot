const { model, Schema } = require('mongoose')

module.exports = model('Profile', new Schema({
  id: { type: String, required: true, unique: true },
  trophies: { type: Number, default: 0 },
  highestTrophies: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  damage: { type: Number, default: 0 }
}, { versionKey: false, timestamps: true }))