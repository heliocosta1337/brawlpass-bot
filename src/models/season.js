const { model, Schema } = require('mongoose')

module.exports = model('Season', new Schema({
  name: { type: String, required: true, unique: true },
  emoji: { type: String },
  players: { type: [{ id: String, quests: Number }] }
}, { versionKey: false }))