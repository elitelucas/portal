const mongoose = require('mongoose');

/**
 *  Room schema
 *  @Private
 * *//*
const Schema = mongoose.Schema;
const roomSchema = new Schema({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  },
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  text1: {
    type: String,
    default: ''
  },
  text2: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  }
},
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Room', roomSchema);
*/