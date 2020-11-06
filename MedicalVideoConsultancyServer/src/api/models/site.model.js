const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const siteSchema = new Schema({
  type: String,
  name: String,
  contact: String,
  address: String,
  check: Number,
  active: Boolean,
  notes: String,
  requirement: String,
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('Site', siteSchema)
