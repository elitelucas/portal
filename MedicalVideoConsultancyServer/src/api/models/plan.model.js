const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const planSchema = new Schema({
  type: String,
  planId: String,
  name: String,
  description: String,
  amount: Number,
  currency_code: String,
  interval: String,
  interval_count: Number,
  limit: Number,
  trial_days: Number,
  createDate: Date,
  status: String,
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('Plan', planSchema)
