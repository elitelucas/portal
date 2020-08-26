const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let transferSchema = new Schema({
  name:String,
  size: Number,
  type: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);
