const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const cardSchema = new Schema({
  description: String,
  cardId: String,
  card_number: Number,
  providerId: String,
  createDate: Date,
  status: String,
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('Card', cardSchema)
