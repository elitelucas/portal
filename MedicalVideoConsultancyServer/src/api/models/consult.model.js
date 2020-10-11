const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultSchema = new Schema({
  patientId: String,
  createDate: Date,
  providerId : String,
  providerAttetionId : String,
  dni: {
    type: String,
    required: true,
  },
  reason: {
    type:String,
    default:''
  },
  typeAttetion: {
    type: Number
  },
  payAmount: {
    type: Number
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
  status: {
    type:String,
    default:'create'
  },
  typeAttetion: {
    type:String
  },
  reason: {
    type:String
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
