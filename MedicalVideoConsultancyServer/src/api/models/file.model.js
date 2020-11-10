const mongoose = require('mongoose');
/**
 * File Schema
 * @private
 */
const fileSchema = new mongoose.Schema({
  provider: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
  },
  fileName: {
    type: String,
  },
  typeCollection: {
    type: Object,
  },
  user: {
    type: Object,
  },
  status: {
    type: String,
  },
  reportFile: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('File', fileSchema);
