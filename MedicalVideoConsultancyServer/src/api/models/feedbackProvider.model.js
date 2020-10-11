const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const feedbackProviderSchema = new Schema({
  providerId: String,
  patientId: String,
  raking: String,
  comment: String
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('feedback_provider', feedbackProviderSchema)
