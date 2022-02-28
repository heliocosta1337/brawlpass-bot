const { model, Schema } = require('mongoose')

module.exports = model('Season', new Schema({
  name: { type: String, required: true, unique: true },
  emoji: { type: String },
  image: { type: String },
  color: { type: String },
  players: { type: [Object] }
}, { versionKey: false }))