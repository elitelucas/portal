const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const logger = require('../../config/logger')
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
  age:{
    type:Number
  },
  dni: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength:8
  },
  key: {
    type: String
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
  /*token: {
    type: String
  },*/
  lastSeen: {
    type: Date,
  },
  role: {
    type: String
  },
  reason: {
    type: String,
    required: true,
  },
  typeAttetion: {
    type: Number,
    required: true,
  },
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
  },
  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, dni } = options;
    if (!email && !dni ) throw new APIError({ message: 'An email is required to generate a token' });
    const patient = await this.findOne({ dni: dni }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (dni) {
      if (patient && await patient.passwordMatches(dni)) {
        const token = patient.token();
        logger.info("generate token patient: " + patient._id + " - "+ token );
        return { accessToken: token };
      }
    } else {
      err.message = 'Incorrect email or password';
    }
    throw new APIError(err);
  },
};


/**
 * Methods
 */
patientSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'fullName', 'email', 'dni'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },

  async passwordMatches(dni) {
    /*console.log("passwordMatches")
    console.log(dni)
    console.log(this.dni)*/
    return dni == this.dni;
  },
});

/**
 * @typedef Patient
 * */
module.exports = mongoose.model('Patient', patientSchema);
