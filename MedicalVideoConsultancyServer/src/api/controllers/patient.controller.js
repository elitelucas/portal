const httpStatus = require('http-status');
//const {PayU, Currency}  = require('@ingameltd/payu');
const APIError = require('../utils/APIError');
//const { smsConfig, paymentConfig, culqiConfing } = require('../../config/vars');
//const client = require('twilio')(smsConfig.Sid, smsConfig.authToken);
const Post = require('../models/post.model');
const path = require('path');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Payment = require('../models/payment.model');
const FeedbackProvider = require('../models/feedbackProvider.model');
const FeedbackApplication = require('../models/feedbackApplication.model');

//const { env, emailConfig } = require('../../config/vars');
const mime = require('mime');
const fs = require('fs');

//const nodemailer = require('nodemailer');
//const Culqi = require('culqi-node');
const logger = require('../../config/logger')

/**
 * @api v1/provider/roomName/: roomName
 * @param req
 * @param res
 * @param next
 * */
exports.checkRoomExist = (req, res, next) => {
  // console.log("checkRoomExist:",req.params,req.query)

  User.findOne(req.params).then(result => {
    if (result && result.status === 'active') {
      result['password'] = null;
      result['phoneNumber'] = null;
      result['cmp'] = null;
      result['createdAt'] = null;
      result['permission'] = null;
      result['updatedAt'] = null;
      result['email'] = null;
      res.status(httpStatus.OK).json(result)
    }
    else {
      res.status(httpStatus.NO_CONTENT).end()
    }
  }).catch(error => {
    console.log("checkRoomExist:", error)
    return next(new APIError(error));
  })
};

/**
 * Get payment method field from users collection
 * */

exports.getPayData = async (req, res) => {
  const providerId = req.params.userId;
  Payment.findById(providerId).then(result => {
    res.status(httpStatus.OK).json(result);
  }).catch(e => {
    return res.send(e)
  })
};

exports.fileUpload = async (req, res) => {
  const file = req.files.file;
  var fieldName = 'providerFiles';
  var rand_no = Math.floor(123123123123 * Math.random());
  const fileName = rand_no + file.name;
  const imagePath = path.join(__dirname + './../../public/consult/');
  if (req.body.key === 'newConsult') {
    file.mv(imagePath + fileName, function (error) {
      if (error) {
        console.log("file upload error", error)
      } else {
        res.status(httpStatus.CREATED).json(fileName);
      }
    });
  } else {
    file.mv(imagePath + fileName, function (error) {
      if (error) {
        console.log("file upload error", error)
      } else {
        Consult.findOne({}, {}, { sort: { createdAt: -1 } }).then(result => {
          if (req.body.key === 'patient')
            fieldName = 'patientFiles';
          result[fieldName].push(fileName);
          result.save().then(result2 => {
            console.log('result')
            console.log(result)
            res.status(httpStatus.CREATED).json(fileName);
          })
        })

      }
    });
  }
};

/**
 * @api v1/provider/patient
 * @params patientData
 * */

exports.updatePatient = async (req, res, next) => {
  try {
    const dni = req.body.dni;
    /*console.log("updatePatient dni:",dni)
    console.log("updatePatient:", req.body)*/
    //req.body.avatar = new Buffer(req.body.avatar.split(",")[1], "base64");
    const patient = await Patient.findOneAndUpdate({ dni: dni }, req.body, { new: true });
    return res.status(httpStatus.OK).json(patient);
  } catch (e) {
    return next(APIError(e))
  }
};

/**
 * @api v1/provider/patient/disconnect
 * @params patientData
 * */

exports.disconnectPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    logger.info('disconnectPatient:', patientId)
    const patient = await Patient.findOneAndUpdate(
      { _id: patientId },
      {
        "$set": {
          connection: false,
          state: false,
          calling: false,
          socketId: null,
          peerId: null
        }
      },
      { new: true }
    ).exec();
    return res.status(httpStatus.OK).json(patient);
  } catch (e) {
    return next(APIError(e))
  }
};

exports.getBlog = async (req, res) => {
  const id = req.params.userId;
  Post.find({ providerId: id }).sort({ createdAt: -1 }).then(result => {
    res.status(httpStatus.OK).json(result);
  }).catch(e => {
    return res.send(e)
  })
};

exports.createFeedback = async (req, res, next) => {
  try {
    const patientsData = await Patient.findById(req.body.patientId);
    const providerData = await User.findById(req.body.providerId);

    await new FeedbackProvider({
      patientId: patientsData._id,
      providerId: providerData._id,
      ranking: req.body.feeback.rankingProvider,
      comment: req.body.feeback.feedBackProvider
    }).save();

    await new FeedbackApplication({
      patientId: patientsData._id,
      providerId: providerData._id,
      ranking: req.body.feeback.rankingApp,
      comment: req.body.feeback.feedBackApp
    }).save();

    res.status(httpStatus.OK).send();
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
};

exports.getProviderState = async (req, res, next) => {
  try {
    const room = req.params.room;
    logger.info("getProviderState connect providerId : " + room);

    const SSE_RESPONSE_HEADER = {
      // 'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      // 'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(200, SSE_RESPONSE_HEADER);
    res.flushHeaders();
    const filter = [
      {
        $match: {
          operationType: 'update',
          'fullDocument.room': room
        }
      }
    ]

    const options = { fullDocument: 'updateLookup' };
    const changeStream = await User.watch(filter, options);

    changeStream.
      on('change', async (data) => {
        logger.info("change provider connect : " + data.fullDocument._id + " | " + data.fullDocument.connection + " | " + data.fullDocument.state);
        res.write(`event: message\n`);
        res.write("data:" + JSON.stringify(data.fullDocument) + "\n\n");
        res.write("\n");
      });

    const providerData = await User.findOne({ room: room, connection: true }).sort({ lastSeen: -1 });
    if (providerData) {
      logger.info("provider connect : " + providerData._id + " | " + providerData.connection + " | " + providerData.state);
      res.write("data:" + JSON.stringify(providerData) + "\n\n");
    }

    req.on("error", (err) => {
      logger.error("Error Close patient for room: " + room, err);
    });
    req.on("close", () => {
      logger.info("Close patient for room: " + room);
      changeStream.close();
    });
    req.on("end", () => {
      logger.info("End patient for room:" + room);
    });
  } catch (e) {
    logger.error(e);
    return next(new APIError(e));
  }

};

exports.download = async (req, res, next) => {

  const imagePath = path.join(__dirname + './../../public/');
  const filePath = imagePath + req.params.receiver + '\\';
  const filename = req.params.fileName;
  const file = filePath + filename;
  if (fs.existsSync(file)) {
    const mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  } else {
    console.log('There is no such files');
  }


};
