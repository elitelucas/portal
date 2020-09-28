const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const paysubcriptionSchema = new Schema({
  plan: String,
  chargeId: String,
  providerId:String,
  createDate: Date,
  description: String,
  currencyCode: String,
  amount: Number,
  card: Number,
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  status: String,
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('Paysubcription', paysubcriptionSchema)
