const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chartSchema = new Schema({
  dni: String,
  disease: String,
  medication: String,
  surgery: String,
  familyHistory: String,
  toxic: String
});

module.exports = mongoose.model('Chart', chartSchema);
