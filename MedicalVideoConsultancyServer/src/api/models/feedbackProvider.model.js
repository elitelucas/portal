const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const feedbackProviderSchema = new Schema({
  providerId: String,
  patientId: String,
  ranking: String,
  comment: String,
  patient:Object
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('feedback_provider', feedbackProviderSchema)
