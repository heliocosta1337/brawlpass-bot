const { model, Schema } = require('mongoose')

module.exports = model('Season', new Schema({
  name: { type: String, required: true, unique: true },
  players: { type: [Object] },
  emoji: { type: String },
  image: { type: String },
  color: { type: String }
}, { versionKey: false }))