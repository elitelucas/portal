const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultSchema = new Schema({
  patientId: String,
  birthDate: Date,
  providerId : String,
  dni: {
    type: String,
    required: true,
  },
  allergy: Object,
  complain: Object,
  timeOfDisease: Object,
  wayOfStart: Object,
  symptom: Object,
  history: Object,
  subjective: Object,
  objective: Object,
  assessment: Object,
  plan: Object,
  files: Array,
  createDate: Date,
  patient: Object,
});

module.exports = mongoose.model('Consult', consultSchema);
