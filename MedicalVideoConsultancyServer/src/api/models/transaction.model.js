const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const transactionSchema = new Schema({
  orderId: String,
  orderCreateDate: Date,
  description: String,
  currencyCode: String,
  totalAmount: Number,
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  firstName: String,
  lastName: String,
  payMethod: String,
  status: String,
});

/**
 * @typedef Transaction
 * */

module.exports = mongoose.model('Transaction', transactionSchema)
