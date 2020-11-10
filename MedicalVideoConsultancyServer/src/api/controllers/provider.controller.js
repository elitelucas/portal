const httpStatus = require('http-status');
//const {PayU, Currency}  = require('@ingameltd/payu');
const APIError = require('../utils/APIError');
const { smsConfig, paymentConfig, culqiConfing } = require('../../config/vars');
const client = require('twilio')(smsConfig.Sid, smsConfig.authToken);
const path = require('path');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Transaction = require('../models/transaction.model');
const Consult = require('../models/consult.model');
const Chart = require('../models/chart.model');
const Paysubcription = require('../models/paysubcription.model');
const Plan = require('../models/plan.model');
const Card = require('../models/card.model');
const FeedbackProvider = require('../models/feedbackProvider.model');
const FeedbackApplication = require('../models/feedbackApplication.model');
const File = require('../models/file.model');
const Type = require('../models/type.model');

const { date } = require('joi');
const { env, emailConfig } = require('../../config/vars');
const mime = require('mime');
const fs = require('fs');

const nodemailer = require('nodemailer');
const Culqi = require('culqi-node');
const logger = require('../../config/logger')


/**
 * @api v1/provider/invite-by-sms.
 * @param req
 * @param res
 * @param next
 * */


//  portal start
exports.uploadFile = async (req, res) => {
  const file = req.files.file;
  const provider = req.body.provider;
  const type = req.body.type;

  var rand_no = Math.floor(123123123123 * Math.random());
  const fileName = rand_no + file.name;
  console.log('__dirname')
  console.log(__dirname)
  const filePath = path.join(__dirname + './../../public/provider/');

  file.mv(filePath + fileName,async function (error) {
    if (error) {
      console.log("file upload error", error)
    } else {
      const newFile = await new File({ fileName, provider, type, status: 'pending' }).save();
      const user = await User.findById(newFile.provider);
      const typeCollection = await Type.findById(newFile.type);
      newFile.user = user;
      newFile.typeCollection = typeCollection;
      res.status(httpStatus.CREATED).json(newFile)

    }
  });

};

exports.uploadReportFile = async (req, res) => {
  const file = req.files.file;
  var rand_no = Math.floor(123123123123 * Math.random());
  const fileName = rand_no + file.name;

  const filePath = path.join(__dirname + './../../public/provider/');

  file.mv(filePath + fileName, async function (error) {
    if (error) {
      console.log("file upload error", error)
    } else {
      const existReportFile = await File.findById(req.body.fileId);
      if (existReportFile.reportFile) {
        const file = await File.findByIdAndUpdate(req.body.fileId, { reportFile: fileName }, { new: true });
        res.status(httpStatus.CREATED).json(file)
      } else {
        const file = File.findById(req.body.fileId).then(result => {
          result.reportFile = fileName;
          result.save().then(result2 => {
            res.status(httpStatus.CREATED).json(result2)
          })
        })

      }
    }
  });

};

exports.getFileType = async (req, res) => {
  const fileType = await Type.find();
  res.status(httpStatus.OK).json(fileType)
};

exports.getAllFiles = async (req, res) => {
  const files = await File.find();
  await Promise.all(files.map(async (f) => {
    const type = await Type.findById(f.type);
    f.typeCollection = type;
    const user = await User.findById(f.provider);
    f.user = user;
  }));
  res.status(httpStatus.OK).json(files)
};

exports.getUploadedFiles = async (req, res) => {
  const files = await File.find({ provider: req.params.provider });
  await Promise.all(files.map(async (f) => {
    const type = await Type.findById(f.type);
    f.typeCollection = type;
    const user = await User.findById(f.provider);
    f.user = user;
  }));
  res.status(httpStatus.OK).json(files)
};

exports.getOneFile = async (req, res) => {
  var files = await File.findById(req.params.fileId);

  const type = await Type.findById(files.type);
  files.typeCollection = type;
  const user = await User.findById(files.provider);
  files.user = user;

  res.status(httpStatus.OK).json(files)
};

exports.download = async (req, res, next) => {

  const filePath = path.join(__dirname + './../../public/provider/');
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


exports.changeType = async (req, res) => {
  console.log('req.body')
  console.log(req.body)

  const file = await File.findByIdAndUpdate(req.body.fileId, { type: req.body.type }, { new: true });
  const type = await Type.findById(req.body.type);

  res.status(httpStatus.OK).json(type)
};

exports.changeStatus = async (req, res) => {

  const file = await File.findByIdAndUpdate(req.body.fileId, { status: req.body.status }, { new: true });
  res.status(httpStatus.OK).json(req.body.status)
};

exports.deleteFile = async (req, res) => {
  console.log('req.params')
  console.log(req.params)

  const file = await File.findByIdAndDelete(req.params.fileId);
  res.status(httpStatus.OK).json('ok');
};





//portal end


exports.inviteBySMS = (req, res, next) => {
  const smsData = req.body;
  const content = smsData.smsContent;
  const phoneNumber = smsData.phoneNumber;
  client.messages.create({ from: smsConfig.sender, body: content, to: phoneNumber })
    .then(result => {
      res.status(httpStatus.OK).send(result)
    }).catch(e => {
      console.log("SMS failed to sent", e);
      return next(APIError(e))
    })
};


/**
 * @api v1/provider/mediaUpload
 * @param req
 * @param res
 * @param next
 * */
exports.uploadMedia = async (req, res, next) => {
  const file = req.files.file;
  const userId = req.body._id;
  const name = req.body.room;
  const media = req.body.media;
  const filePath = media === 'image' ? path.join(__dirname + './../../public/images/') : path.join(__dirname + './../../public/videos/');
  const room = new Room({ userId: userId, [media]: file.name, name: name });
  await file.mv(filePath + file.name, function (error) {
    if (error) {
      return next(new APIError(error))
    } else {
      Room.findOne({ userId: userId }).exec().then((result1) => {
        if (result1) {
          Room.findOneAndUpdate({ userId: userId }, { [media]: file.name }, { new: true }).then(result2 => {
            if (result2) {
              // console.log("Updated new"+media+" successfully", result2);
              res.status(httpStatus.OK).send({ [media]: file.name })
            }
          }).catch(error => {
            // console.log("Upload failed to update" + media, error);
            return next(new APIError(error))
          })
        } else {
          room.save().then(result => {
            //console.log("New" +media+ " uploaded successfully");
            if (result) res.status(httpStatus.CREATED).send({ [media]: file.name })
          });
        }
      });
    }
  });
};

/**
 * @api v1/provider/room/:userId
 * @param req
 * @param res
 * @param next
 * */
exports.getRoomData = (req, res, next) => {
  const userId = req.params.userId;
  //console.log("getRoomData userId:"+userId)
  Room.findOne({ userId: userId }).then(result => {
    //console.log("getRoomData: ",result)
    if (result) {
      result['password'] = null;
      res.status(httpStatus.OK).json(result);
    }
    else
      res.status(httpStatus.NO_CONTENT).send({ message: 'No available data' })
  }, error => { return next(new APIError(error)) })
};

/**
 * @api v1/provider/text/:userId
 * @param req
 * @param res
 * @param next
 * */
exports.changeRoomField = (req, res, next) => {
  const userId = req.query.userId;
  const field = req.body.field;
  const value = req.body.value;
  const name = "asd"//req.body.name ;
  Room.findOne({ userId: userId }).then(result => {
    if (result) Room.findOneAndUpdate({ userId: userId }, { name: name, [field]: value }, { new: true })
      .then(result1 => {
        res.status(httpStatus.OK).json(result1)
      });
    else {
      new Room({ userId: userId, name: name, [field]: value }).save().then(result2 => {
        res.status(httpStatus.CREATED).json(result2)
      });
    }
  }).catch(error => {
    return next(new APIError(error))
  })
};
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
 * @api v1/provider/patients-all
 * */

exports.getAllPatients = async (req, res, next) => {
  try {
    const value = req.query.value;
    let sendArr = [];
    const patients = await Patient.find({ providerId: value }).sort({ fullName: -1, createdAt: -1 });
    await Promise.all(patients.map(async (p) => {
      let consult = await Consult.findOne({ patientId: p._id }).sort({ createdAt: -1 });
      let consultCount = await Consult.count({ patientId: p._id });
      sendArr.push(
        {
          id: p._id,
          dni: p.dni,
          fullName: p.fullName,
          consultCnt: (undefined == consultCount) ? null : consultCount,
          lastConsult: (undefined == consult) ? null : consult.createdAt
        }
      );
    }));
    sendArr.sort((a, b) => {
      if (null != a.lastConsult) return -1;
      if (null != b.lastConsult) return 1;
      if (b.lastConsult > a.lastConsult) return -1;
      return 0;
    });
    res.status(httpStatus.OK).json(sendArr);
  } catch (e) {
    console.log("getAllPatients:", e);
    return next(new APIError(e));
  }
};



/**
 * @api v1/provider/patientByField
 * @update patient's last seen
 * */

//I added

exports.getInitPatients = async (req, res, next) => {
  try {
    const value = req.query.value;
    let sendArr = [];
    const patients = await Patient.find({ providerId: value }).sort({ fullName: -1, createdAt: -1 });
    await Promise.all(patients.map(async (p) => {
      let consult = await Consult.findOne({ patientId: p._id }).sort({ createdAt: -1 });
      let consultCount = await Consult.count({ patientId: p._id });
      sendArr.push(
        {
          id: p._id,
          dni: p.dni,
          fullName: p.fullName,
          consultCnt: (undefined == consultCount) ? null : consultCount,
          lastConsult: (undefined == consult) ? null : consult.createdAt
        }
      );
    }));
    sendArr.sort((a, b) => {
      if (null != a.lastConsult) return -1;
      if (null != b.lastConsult) return 1;
      if (b.lastConsult > a.lastConsult) return -1;
      return 0;
    });
    res.status(httpStatus.OK).json(sendArr);
  } catch (e) {
    console.log("getAllPatients:", e);
    return next(new APIError(e));
  }
};

exports.getFilterPatients = async (req, res, next) => {
  {
    const providerId = req.params.providerId;
    const filterValue = req.params.filterValue;
    const key = req.params.key;

    if (key === 'dni')
      patient = await Patient.findOne({ dni: filterValue }).exec();
    else
      patient = await Patient.findOne({ fullName: filterValue }).exec();
    if (patient) {
      consultCnt = await Consult.countDocuments({ dni: patient.dni }).exec();

      var sendObj = {
        id: patient._id,
        dni: patient.dni,
        fullName: patient.fullName,
        consultCnt: consultCnt,
        lastConsult: patient.lastSeen
      }
      res.status(httpStatus.OK).json([sendObj]);
    } else {
      res.status(httpStatus.OK).json('fail');
    }

  }
};

exports.getInitConsult = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    console.log('patientId')
    console.log(patientId)
    consult = await Consult.find({ patientId })
      .sort({ createdAt: -1 }).limit(10).exec();
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", error);
    return next(APIError(e));
  }
};

exports.getConsult = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    logger.info("getConsultByProvider providerId :" + providerId + " - startDate:" + startDate + " - endDate:" + endDate);
    let consult = null;
    if (startDate == undefined && startDate == undefined) {
      consult = await Consult.find({ providerId }).limit(10).sort({ createdAt: -1 }).exec();
    } else {
      consult = await Consult.find({ providerId, createdAt: { "$gte": new Date(startDate + "T00:00:00"), "$lt": new Date(endDate + "T23:59:59") } })
        .sort({ createdAt: -1 }).exec();
    }
    await Promise.all(consult.map(async (c) => {
      const patient = await Patient.findById(c.patientId);
      c.patient = patient;
    }));
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", e);
    return next(new APIError(e));
  }
};

exports.getConsultByProvider = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    logger.info("getConsultByProvider providerId :" + providerId + " - startDate:" + startDate + " - endDate:" + endDate);
    let consult = null;
    if (startDate == undefined && startDate == undefined) {
      consult = await Consult.find({ providerId }).limit(10).sort({ createdAt: -1 }).exec();
    } else {
      consult = await Consult.find({ providerId, createdAt: { "$gte": new Date(startDate + "T00:00:00"), "$lt": new Date(endDate + "T23:59:59") } })
        .sort({ createdAt: -1 }).exec();
    }
    await Promise.all(consult.map(async (c) => {
      const patient = await Patient.findById(c.patientId);
      c.patient = patient;
    }));
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", e);
    return next(new APIError(e));
  }
};



exports.getConsultByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    logger.info("getConsultByPatient patientId :" + patientId + " - startDate:" + startDate + " - endDate:" + endDate);
    let consult = null;
    if (startDate == undefined && startDate == undefined) {
      consult = await Consult.find({ patientId }).limit(10).sort({ createdAt: -1 }).exec();
    } else {
      consult = await Consult.find({ patientId, createdAt: { "$gte": new Date(startDate + "T00:00:00"), "$lt": new Date(endDate + "T23:59:59") } })
        .sort({ createdAt: -1 }).exec();
    }
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", e);
    return next(new APIError(e));
  }
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

exports.uploadCkImage = async (req, res) => {
  const file = req.files.attachment;
  var rand_no = Math.floor(123123123123 * Math.random());
  const fileName = rand_no + file.name;
  const imagePath = path.join(__dirname + './../../public/images/');
  file.mv(imagePath + fileName, function (error) {
    if (error) {
      console.log("file upload error", error)
    } else {
      res.status(httpStatus.CREATED).json(fileName);
    }
  });
};


exports.getSignature = async (req, res) => {
  const providerId = req.params.providerId;
  const user = await User.findById(providerId).exec();
  /*console.log('user.sigImgSrc')
  console.log(user.sigImgSrc)*/
  if (user.sigImgSrc)
    res.status(httpStatus.CREATED).json(user.sigImgSrc);
  else {
    res.status(httpStatus.NOT_FOUND).send();
  }

  // if(user.sigImgSrc){
  //   const filename=user.sigImgSrc;

  //   const imagePath = path.join(__dirname + './../../public/images/');

  //   const file = imagePath+filename;

  //   if(fs.existsSync(file)){
  //     const mimetype = mime.lookup(file);

  //     res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  //     res.setHeader('Content-type', mimetype);

  //     var filestream = fs.createReadStream(file);
  //     filestream.pipe(res);
  //   }else
  //   console.log('There is no such file.')
  // }else{
  //   console.log("Error: there is no such field in users collection")
  // }

};



exports.mail = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: false,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password
      }
    });

    var mailOptions = {
      from: emailConfig.username,
      to: req.body.email,
      subject: req.body.subject,
      html: req.body.html
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.status(httpStatus.CREATED).json('sent successfully');
      }
    });
  } catch (error) {
    next(error);
  }
}
//I added end

exports.getPatient = async (req, res, next) => {
  try {
    console.log('req.query')
    console.log(req.query)
    const key = req.query.key;
    const value = req.query.value;
    logger.info("getPatient key:" + key + " - value:" + value)
    let patient;
    if (key == "id") {
      patient = await Patient.findById(value).exec();
      res.status(httpStatus.OK).json(patient);
    } else {
      switch (value) {
        case '*':
          let keyMap = {};
          key.split(",").forEach(function (k, index) {
            // console.log('message index ', index,k);
            keyMap[k] = 1;
          });
          //console.log("getPatient keyMap:",keyMap," - value:",value)
          patient = await Patient.find({}).select(keyMap).exec();
          if (patient) res.status(httpStatus.OK).json(patient);
          break;

        default:
          patient = await Patient.findOne({ [key]: value }).exec();
          if (patient) {
            const lastSeen = Date.now();
            const updated = await Patient.findOneAndUpdate({ [key]: value }, { lastSeen: lastSeen }, { new: true });
            console.log('updated')
            console.log(updated)
            if (updated) res.status(httpStatus.OK).json(updated);
          } else {
            res.status(httpStatus.NO_CONTENT).send()
          }
      }
    }

  } catch (e) {
    console.log("getPatient:", e);
    return next(new APIError(e));
  }
};

exports.checkPatient = async (req, res, next) => {
  try {
    const dni = req.params.dni;

    const patient = await Patient.findOne({ dni }).exec();
    if (patient) {
      res.status(httpStatus.OK).json(patient);
    } else {
      res.status(httpStatus.OK).json('fail');
    }

  } catch (e) {
    console.log("getPatient:", error);
    return next(APIError(e));
  }
};

exports.postPatient = async (req, res, next) => {
  try {
    console.log('req.body')
    console.log(req.body)
    const dni = req.body.data.dni;
    const room = req.body.data.room;
    const newConsult = req.body.data.newConsult === 'newConsult' ? true : false;
    const reason = req.body.data.reason;
    const firstName = req.body.data.firstName;
    const lastName = req.body.data.lastName;
    const email = req.body.data.email;
    const phoneNumber = req.body.data.phoneNumber;

    const patient = await Patient.findOne({ dni });
    if (patient) {
      const updatePatient = await Patient.findOneAndUpdate(
        { dni },
        {
          "$set": {
            room,
            newConsult,
            reason,
            fullName: firstName + ' ' + lastName,
            email,
            phoneNumber
          }
        },
        { new: true }
      ).exec();

      res.status(httpStatus.OK).json(updatePatient);
    } else {
      const newPatient = await new Patient({
        dni,
        room,
        newConsult,
        reason,
        fullName: firstName + ' ' + lastName,
        email,
        phoneNumber
      }).save();
      res.status(httpStatus.OK).json(newPatient);
    }





  } catch (e) {
    console.log("getPatient:", error);
    return next(APIError(e));
  }
};

/**
 * @api v1/provider/patient
 * @params patientData
 * */

exports.updatePatient = async (req, res, next) => {
  try {
    const dni = req.body.dni;
    //console.log("updatePatient dni:",dni)
    console.log("updatePatient:", req.body)
    //req.body.avatar = new Buffer(req.body.avatar.split(",")[1], "base64");
    const patient = await Patient.findOneAndUpdate({ dni: dni }, req.body, { new: true });
    return res.status(httpStatus.OK).json(patient);
  } catch (e) {
    return next(APIError(e))
  }
};

exports.updatePatientOnChart = async (req, res, next) => {
  try {
    const dni = req.body.dni;
    const patient = await Patient.findOneAndUpdate({ dni: dni }, req.body, { new: true });
    return res.status(httpStatus.OK).json(patient);
  } catch (e) {
    return next(APIError(e))
  }
};

/**
 * @api v1/provider/patients-waiting/:room
 * @param req
 * @param res
 * @param next
 * */

exports.getWaitingPatientsData = async (req, res, next) => {
  try {
    const room = req.params.room;
    const patientsData = await Patient.find({ room: room, connection: true }).sort({ lastSeen: -1 });
    return res.status(httpStatus.OK).json(patientsData)
  } catch (e) {
    return next(APIError(e));
  }
};


/**
 * @api v1/provider/patients-recent
 * */
exports.getRecentPatientsData = async (req, res, next) => {
  try {
    const recentPatients = await Patient.find({}).sort({ lastSeen: -1 }).limit(10);
    if (recentPatients) res.status(httpStatus.OK).json(recentPatients);
  } catch (e) {
    return next(new APIError(e))
  }
};

/**
 * @api v1/provider/patients-all
 * */
exports.getAllPatientsData = async (req, res, next) => {
  try {
    const room = req.params.room;
    const allPatients = await Patient.find({ room: room }).sort({ lastSeen: -1 });
    if (allPatients) res.status(httpStatus.OK).json(allPatients);
  } catch (e) {
    return next(new APIError(e))
  }
};


/**
 * @api v1/provider/resetState
 * @params model, field 'to reset'
 * */

exports.resetState = async (req, res, next) => {
  try {
    const modelToReset = req.body.model;
    const field = req.body.field;
    const model = modelToReset === 'Patient' ? Patient : User;
    if (field === 'paymentState') {
      const result = await model.bulkWrite([{
        updateMany: {
          filter: { paymentState: { "$ne": 'ready' } },
          update: { paymentState: 'ready' }
        }
      }]);
      if (result) res.status(httpStatus.OK).json(result);
    } else if (field === 'calling') {
      const result = await model.bulkWrite([{
        updateMany: {
          filter: { paymentState: { "$ne": false } },
          update: { paymentState: false }
        }
      }]);
      if (result) res.status(httpStatus.OK).json(result);
    }
  } catch (e) {
    return next(new APIError(e));
  }
};

/**
 * @api v1/provider/checkout
 * @params patientId(_id), amountToPay, email
 * */
exports.checkout = async (req, res, next) => {
  try {
    /*const id = req.body.checkoutData.id;
    const email = req.body.checkoutData.email;
    const totalAmount = req.body.checkoutData.amountToPay;*/

    /* const clientId = paymentConfig.clientId;
     const clientSecret = paymentConfig.clientSecret;
     const secondKey = paymentConfig.secondKey;
     const notifyUrl = paymentConfig.notifyUrl;
     const continueUrl = paymentConfig.clientUrl + req.body.checkoutData.room;
     const merchantPosId = paymentConfig.merchantPosId;
     const description = paymentConfig.description;*/
    //const currencyCode = Currency.PLN;

    const culqi = new Culqi({
      privateKey: culqiConfing.private_key,
      pciCompliant: true,
      publicKey: culqiConfing.private_key,
    });
    console.log(culqi);


    const token = await culqi.tokens.createToken({
      card_number: '4111111111111111',
      cvv: '123',
      expiration_month: '09',
      expiration_year: '2025',
      email: 'richard@piedpiper.com',
    });
    console.log(token);

    console.log(token.id);


    const charge = await culqi.charges.createCharge({
      amount: '10000',
      currency_code: 'PEN',
      email: 'richard@piedpiper.com',
      source_id: token.id,
    });

    console.log(charge);
    console.log(charge.id);
    /*const payU = new PayU(clientId, clientSecret, merchantPosId, secondKey, {
      sandbox: true,
    });
    const result = await payU.createOrder({
      notifyUrl: notifyUrl,
      customerIp: "127.0.0.1",
      continueUrl: continueUrl,
      description: description,
      currencyCode: currencyCode,
      totalAmount: totalAmount,
      buyer: {
        email: email,
      },
      products: [{
        name: "Video consultancy fee",
        quantity: 1,
        unitPrice: totalAmount
      }]
    });
    if(result) {
        const patient = await Patient.findOneAndUpdate({_id: id}, {transactionMail: email}, {new: true});
        if(patient){ res.status(httpStatus.OK).json(result)}
    }*/



    res.status(httpStatus.OK).send()
  } catch (e) {
    console.log("error ", e)
    return next(new APIError(e))
  }
};



/**
 * @api v1/provider/charges
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.charge = async (req, res, next) => {
  let charge = null;
  const providerId = req.body.chargeData.providerId;
  const card_number = req.body.chargeData.card_number;
  const cvv = req.body.chargeData.cvv;
  const expiration_month = req.body.chargeData.expiration_month;
  const expiration_year = req.body.chargeData.expiration_year;
  const email = req.body.chargeData.email;
  const amount = req.body.chargeData.amount;
  const currency_code = req.body.chargeData.currency_code;
  try {
    const culqi = new Culqi({
      privateKey: culqiConfing.private_key,
      pciCompliant: true,
      publicKey: culqiConfing.private_key,
    });
    const token = await culqi.tokens.createToken({
      card_number: card_number,
      cvv: cvv,
      expiration_month: expiration_month,
      expiration_year: expiration_year,
      email: email,
    });
    charge = await culqi.charges.createCharge({
      amount: (amount * 100),
      currency_code: currency_code,
      email: email,
      source_id: token.id,
    });
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
  try {
    const paysubcription = new Paysubcription({
      plan: "basic",
      providerId: providerId,
      chargeId: charge.id,
      createDate: new Date(),
      currencyCode: currency_code,
      card: card_number,
      amount: (amount * 100),
      email: email,
      status: "active"
    });
    await paysubcription.save();
    res.status(httpStatus.OK).send()
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
};


/**
 * @api v1/provider/subcription
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.subcriptionPlanWithCard = async (req, res, next) => {

  try {
    console.log(req.body)
    const providerId = req.body.providerId;
    const cardData = req.body.card;
    let cardExists = await Card.findOne({ card_number: cardData.card_number });
    console.log(providerId);
    let provider = await User.findOne({ _id: providerId });

    console.log(provider);
    console.log(cardExists);

    const culqi = new Culqi({
      privateKey: culqiConfing.private_key,
      pciCompliant: true,
      publicKey: culqiConfing.private_key,
    });

    if (cardExists == undefined || cardExists == null) {
      // const token = await culqi.tokens.createToken({
      //   card_number: cardData.card_number,
      //   cvv: cardData.cvv,
      //   expiration_month: cardData.expiration_month,
      //   expiration_year: cardData.expiration_year,
      //   email: cardData.email,
      // });
      // console.log('eeee')

      // if(provider.customerId == undefined){
      // const cus = {
      //   first_name: provider.firstName,
      //   last_name: provider.lastName,
      //   email: provider.email,
      //   address: provider.address == undefined ? cardData.address : provider.address,
      //   address_city: provider.address_city == undefined ? cardData.address_city : provider.address_city ,
      //   country_code: provider.country_code == undefined ? cardData.country_code : provider.country_code,
      //   phone_number: provider.phoneNumber == undefined ? cardData.phoneNumber : provider.phoneNumber,
      // };
      // console.log(cus);
      // let customerCulqi = await culqi.customers.createCustomer(cus);
      // console.log(customerCulqi);
      // provider.customerId = customerCulqi.id;
      // provider = await User.findOneAndUpdate({_id: providerId}, provider, {new: false});

      // }


      // let cardCulqi = await culqi.cards.createCard({
      //   customer_id: provider.customerId,
      //   token_id: token.id
      // });
      cardExists = await new Card({
        description: cardData.description,
        // cardId: cardCulqi.id,
        card_number: cardData.card_number,
        providerId: providerId,
        createDate: new Date(),
        status: "active",
      }).save();
    }

    const subcriptionData = req.body.subcription;

    if (provider != undefined) {
      const planSubcription = await Plan.findById(subcriptionData.id);
      // let subscriptionCulqi = await culqi.subscriptions.createSubscription({
      //   card_id: cardExists.cardId,
      //   plan_id: planSubcription.planId
      // });  
      // provider.subcriptionId = subscriptionCulqi.id;
      provider.subcriptionStatus = true
      provider.planId = planSubcription._id;
      provider = await User.findOneAndUpdate({ _id: providerId }, provider, { new: true });
      res.status(httpStatus.OK).json(provider.transform())
    } else {
      res.status(httpStatus.NOT_FOUND).send()
    }
  } catch (e) {
    console.log("error ", e)
    e["message"] = e.user_message;
    error = new APIError(e);
    return next(error)
  }
};

/**
 * @api v1/provider/subcription
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.unsubscribePlanWithCard = async (req, res, next) => {
  try {
    const providerId = req.params.providerid;
    console.log('providerId')
    console.log(providerId)
    let userProvider = await User.findById(providerId);
    const subcriptionId = userProvider.subcriptionId;
    const culqi = new Culqi({
      privateKey: culqiConfing.private_key,
      pciCompliant: true,
      publicKey: culqiConfing.private_key,
    });
    // await culqi.subscriptions.deleteSubscription({
    //   id: subcriptionId
    // });
    userProvider.subcriptionId = null;
    userProvider.planId = null;
    userProvider.subcriptionStatus = false;
    console.log(userProvider);
    userProvider = await User.findOneAndUpdate({ _id: providerId }, userProvider, { new: false });
    res.status(httpStatus.OK).send();
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
};

exports.getCard = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const card = await Card.findOne({ providerId: providerId });
    res.status(httpStatus.OK).json(card);
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
}

exports.updateCard = async (req, res, next) => {
  try {

    const providerId = req.body.providerId;
    const card = await Card.findOneAndUpdate({ providerId: providerId }, { card_number: req.body.card_number }, { new: true });
    res.status(httpStatus.OK).json(card);
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
}


/**
 * @api v1/provider/subcription
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.changeSubscribePlan = async (req, res, next) => {
  try {
    const providerId = req.params.providerid;
    const cardData = req.body.card;
    const subcriptionData = req.body.subcription;

    let userProvider = await User.findById(providerId);
    const subcriptionId = userProvider.subcriptionId;

    const culqi = new Culqi({
      privateKey: culqiConfing.private_key,
      pciCompliant: true,
      publicKey: culqiConfing.private_key,
    });

    await culqi.subscriptions.deleteSubscription({
      id: subcriptionId
    });

    const cardExists = await Card.findOne({ card_number: cardData.card_number });

    const planSubcription = await Plan.findById(subcriptionData.id);
    let subscriptionCulqi = await culqi.subscriptions.createSubscription({
      card_id: cardExists.cardId,
      plan_id: planSubcription.planId
    });
    userProvider.subcriptionId = subscriptionCulqi.id;
    userProvider.subcriptionStatus = true
    userProvider = await User.findOneAndUpdate({ _id: providerId }, userProvider, { new: false });

    res.status(httpStatus.OK).send()

    /*userProvider.subcriptionId = null;
    userProvider.subcriptionStatus = false;
    userProvider = await User.findOneAndUpdate({_id: providerId}, userProvider, {new: false});*/
    res.status(httpStatus.OK).send();
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
};


/**
 * @api v1/provider/cards
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.listCards = async (req, res, next) => {
  try {
    const cardData = req.body;
    const cards = await Card.find({ providerId: cardData.providerId });
    if (cards == undefined) {
      res.status(httpStatus.CREATED).json(cards);
    } else {
      res.status(httpStatus.NOT_FOUND).send();
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * @api v1/provider/cards
 * @params providerId(_id), card_number, cvv, expiration_month, expiration_year, email, amount, currency_code
 * */
exports.removeCard = async (req, res, next) => {
  try {
    const cardId = req.params.cardId;
    const cardExists = await Card.findOne({ _id: cardId });
    if (cardExists == undefined) {
      res.status(httpStatus.NOT_FOUND).send();
    } else {
      // const culqi = new Culqi({
      //   privateKey: culqiConfing.private_key,
      //   pciCompliant: true,
      //   publicKey: culqiConfing.private_key,
      // });
      // await culqi.cards.deleteCard({
      //   id: cardExists.cardId
      // });
      await cardExists.remove();
      res.status(httpStatus.OK).json('ok')
    }
  } catch (error) {
    return next(error);
  }
};


/**
 * @api v1/provider/notify
 * @param req => notifyUrl
 * @param res
 * @param next
 * */
exports.notify = async (req, res, next) => {
  try {
    const payResult = req.body;
    if (payResult && payResult.order.buyer) {
      const email = payResult.order.buyer.email;
      const paymentType = payResult.order.payMethod.type;
      const paymentState = payResult.order.status;
      if (paymentState === 'COMPLETED') {
        const paidPatient = await Patient.findOneAndUpdate({ transactionMail: email }, {
          paymentType: paymentType,
          paymentState: paymentState
        }, { new: true });

        if (paidPatient) {
          const order = payResult.order;
          const transactionData = {
            orderId: order.orderId, orderCreateDate: order.orderCreateDate, currencyCode: order.currencyCode,
            totalAmount: order.totalAmount, email: order.buyer.email, firstName: order.buyer.firstName, lastName: order.buyer.lastName
          };
          const newTransaction = await new Transaction(transactionData).save();
          console.log("New transaction created successfully", newTransaction)
        }
      }
    }
    res.status(httpStatus.OK).send()
  } catch (e) {
    return next(APIError(e))
  }
};

/**
 * @api v1/provider/chart
 * @method put
 * @param req chartData
 * @param res
 * @param next
 * */
exports.editChart = async (req, res, next) => {
  let newChart;
  try {
    const chartData = req.body;
    const chart = await Chart.findOne({ dni: chartData.dni });
    if (chart) newChart = await Chart.findOneAndUpdate({ dni: chartData.dni }, chartData, { new: true });
    else newChart = await new Chart(chartData).save();
    res.status(httpStatus.OK).json(newChart);
  } catch (e) {
    return next(APIError(e))
  }
};

/**
 * @api v1/provider/chart/:dni
 * param dni
 * */
exports.getChart = async (req, res, next) => {
  try {
    const patientDni = req.params.patientDni;
    const chart = await Chart.findOne({ dni: patientDni });
    res.status(httpStatus.OK).json(chart)
  } catch (e) {
    console.log(e)
  }
}

/**
 * @api v1/provider/consult
 * @method post
 * @param req consult data(name, aga, phone number...)
 * @param res
 * @param next
 * */
exports.createConsult = async (req, res, next) => {
  try {
    let consultData = req.body;
    consultData['providerAttetionId'] = consultData['providerId']
    consultData['createdAt'] = new Date()
    const consult = await new Consult(consultData).save();
    res.status(httpStatus.CREATED).json(consult);
  } catch (e) {
    return next(APIError(e))
  }
};

/**
 * @api v1/provider/consult
 * @method patch
 * @param req consult data(name, aga, phone number...)
 * @param res
 * @param next
 * */
exports.closeConsult = async (req, res, next) => {
  try {
    const consultId = req.params.consultId;
    const consult = await Consult.findOneAndUpdate({ _id: consultId }, {
      status: 'close',
      updatedAt: new Date()
    }, { new: false });
    res.status(httpStatus.CREATED).json(consult);
  } catch (e) {
    return next(APIError(e))
  }
};


exports.getOneConsult = async (req, res, next) => {
  try {
    const patientId = req.query.patientId;
    const consultId = req.query.consultId
    patient = await Patient.findById(patientId).exec();
    consult = await Consult.findById(consultId).exec();
    consult.patient = patient;
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", error);
    return next(APIError(e));
  }
};

exports.updateConsult = async (req, res, next) => {
  try {

    const consultId = req.body.consultId;
    const patientId = req.body.patientId;
    const providerId = req.body.providerId;
    const updateData = req.body.updateData;

    const consult = await Consult.findById(consultId).exec();

    let updatedConsult = null;

    if (consultId && consult) {
      updatedConsult = await Consult.findByIdAndUpdate(
        consultId,
        {
          "$set": {
            timeOfDisease: updateData.timeOfDisease,
            wayOfStart: updateData.wayOfStart,
            providerAttetionId: providerId,
            symptom: updateData.symptom,
            history: updateData.history,
            subjective: updateData.subjective,
            objective: updateData.objective,
            assessment: updateData.assessment,
            plan: updateData.plan,
            providerFiles: updateData.providerFiles,
            updatedAt: new Date()
          }
        },
        { new: true });
    } else {
      const patient = await Patient.findById(patientId).exec();
      updateData['dni'] = patient.dni;
      updateData['patientId'] = patientId;
      updateData['providerId'] = providerId;
      updateData['providerAttetionId'] = providerId;
      updateData['createdAt'] = new Date();
      updateData['status'] = 'close';
      updatedConsult = await new Consult(updateData).save();
    }

    return res.status(httpStatus.OK).json(updatedConsult);
  } catch (e) {
    console.log(e);
    return next(new APIError(e))
  }
};


exports.getConsultInChat = async (req, res, next) => {
  try {
    const patientId = req.query.patientId;
    const providerId = req.query.providerId;
    consult = await Consult.find({ patientId: patientId, providerId: providerId }).exec();
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", error);
    return next(APIError(e));
  }
};

exports.getLastAttetions = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    //console.log("getLastAttetions providerId userId: ", userId)
    const lastConsultAttetions = await Consult.find({ providerId: userId }).sort({ date: -1 }).limit(10).map(async (list) => {
      await Promise.all(list.map(async (c) => {
        const patient = await Patient.find({ _id: c.patientId });
        c["patient"] = patient[0]
      }));
      return list;
    });
    if (lastConsultAttetions) {
      //console.log("lastConsultAttetions: ", lastConsultAttetions)
      res.status(httpStatus.OK).json(lastConsultAttetions);
    }


  } catch (e) {
    return next(new APIError(e))
  }
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
      raking: req.body.feeback.rakingApp,
      comment: req.body.feeback.feedBackApp
    }).save();

    res.status(httpStatus.OK).send();
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }
};

/**
 * @api v1/provider/feedback/:providerId
 * param providerId
 * */
exports.getFeedBacks = async (req, res, next) => {
  try {
    let feedbackProvider = await FeedbackProvider.find({ providerId: req.params.providerId }).exec();
    await Promise.all(feedbackProvider.map(async (p) => {
      const patient = await Patient.findById(p.patientId);
      p.patient = patient;
    }));
    res.status(httpStatus.OK).json(feedbackProvider);
  } catch (e) {
    console.log(e)
  }
}

