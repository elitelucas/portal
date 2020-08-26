const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
/**
 * Patient Schema
 * @Private
 * */

const Schema = mongoose.Schema;
const paymentState = ['ready', 'required', 'pending', 'skip', 'completed'];

const patientSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  dni: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength:8
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: Buffer,
    contentType: 'image/jpeg',
    default: ''
  },
  providerId: {
    type: String,
    match: [/^[a-fA-F0-9]{24}$/, 'Wrong provider id']
  },
  room: {
    type: String,
  },
  record: {
    type: String,
    required: false
  },
  transactionMail: {
    type: String,
    trim: true,
    default: '',
  },
  paymentType: {
    type: String,
    default:'-'
  },
  amountToPay: {
    type: Number,
    default: 0
  },
  paymentState: {
    type: String,
    enum: paymentState,
    default: 'ready'
  },
  consults: {
    type: Number
  },
  connection: {
    type: Boolean,
    default: false,
  },
  calling: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String
  },
  peerId: {
    type: String
  },
  lastSeen: {
    type: Date,
  }
}, {
  timestamps:true
});


patientSchema.statics = {
   checkDuplicateField(error) {
    let field = '';
   for(let key in error.keyValue) {
     field = key;
   }
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: field,
          location: 'body',
          messages: [field +' already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  }
};

/**
 * @typedef Patient
 * */
module.exports = mongoose.model('Patient', patientSchema);
