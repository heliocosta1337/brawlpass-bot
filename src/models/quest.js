const { model, Schema } = require('mongoose')
const { questTypes } = require('../../config.json')

module.exports = model('Quest', new Schema({
  user_id: { type: String, required: true, unique: true },
  brawler: { type: String, required: true },
  mode: { type: String, required: true },
  type: { type: String, enum: questTypes, required: true },
  score: { type: Number, default: 0 },
  score_needed: { type: Number, required: true }
}, { versionKey: false }))