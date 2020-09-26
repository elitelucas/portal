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
  allergy: {
    type:String,
    default:''
  },
  complain: {
    type:String,
    default:''
  },
  timeOfDisease: {
    type:String,
    default:''
  },
  wayOfStart: {
    type:String,
    default:''
  },
  symptom: {
    type:Array,
    default:[]
  },
  history: {
    type:String,
    default:''
  },
  subjective: {
    type:String,
    default:''
  },
  objective: {
    type:String,
    default:''
  },
  assessment: {
    type:String,
    default:''
  },
  plan: {
    type:String,
    default:''
  },
  providerFiles: {
    type:Array,
    default:[]
  },
  patientFiles: {
    type:Array,
    default:[]
  },
  payment:Object,
  patient: Object,
},{
  timestamps:true
});

module.exports = mongoose.model('Consult', consultSchema);
