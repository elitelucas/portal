const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const feedbackApplicationSchema = new Schema({
  providerId: String,
  patientId: String,
  ranking: String,
  comment: String
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('feedback_application', feedbackApplicationSchema)
