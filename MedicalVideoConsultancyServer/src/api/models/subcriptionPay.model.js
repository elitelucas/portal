const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const subcriptionPaySchema = new Schema({
  planId: {
    type: String
  },
  plan: {
    type: String
  },
  currency: {
    type: String
  },
  chargeId: {
    type: String
  },
  providerId:{
    type: String
  },
  createDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  description: {
    type: String
  },
  amount:  {
    type: Number
  },
  card: {
    type: Number
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  planId: {
    type: String
  },
  chargeId: {
    type: String
  },
  subcriptionId: {
    type: String
  },
  cardId: {
    type: String
  },
  status: {
    type: String
  },
  subcriptionStatus: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('SubcriptionPay', subcriptionPaySchema)
