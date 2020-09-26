const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const paymentSchema = new Schema({
    providerId: {
        type: String,
        match: [/^[a-fA-F0-9]{24}$/, 'Wrong provider id']
      },
    QRimg:Array,
    account:Array,
    url:Array,
},
{
    timestamps:true
  })

  module.exports = mongoose.model('Payment', paymentSchema);