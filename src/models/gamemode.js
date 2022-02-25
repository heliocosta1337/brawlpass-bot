const { model, Schema } = require('mongoose')

module.exports = model('GameMode', new Schema({
  name: { type: String, required: true, unique: true },
  players: { type: Number, required: true },
  emoji: { type: String },
  image: { type: String },
  color: { type: String }
}, { versionKey: false }))