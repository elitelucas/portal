const mongoose = require('mongoose');
/**
 * File Schema
 * @private
 */
const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  }
});

module.exports = mongoose.model('Type', typeSchema);
