const { model, Schema } = require('mongoose')

module.exports = model('Brawler', new Schema({
  name: { type: String, required: true, unique: true },
  emoji: { type: String },
}, { versionKey: false }))