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

const { date } = require('joi');
var nodemailer = require('nodemailer');
const Culqi = require('culqi-node');


/**
 * @api v1/provider/invite-by-sms.
 * @param req
 * @param res
 * @param next
 * */

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
 * @api v1/provider/patientByField
 * @update patient's last seen
 * */

//I added

exports.getAllPatients = async (req, res, next) => {
  try {
    const key = req.query.key;
    const value = req.query.value;
    let sendArr = [];
    patient = await Patient.find({ providerId: value }).exec();

    consult = await Consult.find().exec();
    consultCntArr = [];
    for (let i = 0; i < patient.length; i++) {
      let cnt = 0;
      for (let j = 0; j < consult.length; j++) {
        if (patient[i].dni === consult[j].dni) {
          cnt++;
        }
      }
      consultCntArr.push(cnt);
    }
    for (let i = 0; i < patient.length; i++) {
      sendArr.push(
        {
          id: patient[i]._id,
          dni: patient[i].dni,
          fullName: patient[i].fullName,
          consultCnt: consultCntArr[i],
          lastConsult: patient[i].lastSeen
        }
      )
    }
    console.log('sendArr')
    console.log(sendArr)

    res.status(httpStatus.OK).json(sendArr);
  } catch (e) {
    console.log("getAllPatients:", error);
    return next(APIError(e));
  }
};

exports.getConsult = async (req, res, next) => {
  try {
    const key = req.query.key;
    const value = req.query.value;
    consult = await Consult.find({ patientId: value }).exec();
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", error);
    return next(APIError(e));
  }
};

exports.getOneConsult = async (req, res, next) => {
  try {
    const providerId = req.query.providerId;
    const patientId = req.query.patientId;
    const date = req.query.date
    patient = await Patient.findById(patientId).exec();
    consult = await Consult.findOne({ patientId: patientId, providerId: providerId, date: new Date(date) }).exec();
    consult.patient = patient;
    res.status(httpStatus.OK).json(consult);
  } catch (e) {
    console.log("getConsult:", error);
    return next(APIError(e));
  }
};

exports.updateConsult = async (req, res, next) => {
  try {
    const providerId = req.body.providerId;
    const patientId = req.body.patientId;
    const date = req.body.date;
    const updateData = req.body.updateData;
    const symptom = [updateData.symptom0, updateData.symptom1, updateData.symptom2, updateData.symptom3];

    const updatedConsult = await Consult.findOneAndUpdate(
      { patientId: patientId, providerId: providerId, date: new Date(date) },
      {
        "$set": {
          allergy: updateData.allergy,
          timeOfDisease: updateData.timeOfDisease,
          wayOfStart: updateData.wayOfStart,
          symptom: symptom,
          history: updateData.history,
          subjective: updateData.subjective,
          objective: updateData.objective,
          assessment: updateData.assessment,
          plan: updateData.plan,
          providerFiles: updateData.providerFiles,
          new: true
        }
      });


    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: req.body.patientId },
      {
        "$set": {
          fullName: updateData.name,
          age: updateData.age,
          phoneNumber: updateData.phoneNumber,
          new: true
        }
      });
    return res.status(httpStatus.OK).json('success');
  } catch (e) {
    return next(APIError(e))
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

exports.fileUpload = async (req, res) => {
  const file = req.files.file;
  var folderName = 'provider';
  if (req.body._id === undefined) {
    folderName = 'patient';
  }
  const imagePath = path.join(__dirname + './../../public/' + folderName + '/');
  file.mv(imagePath + file.name, function (error) {
    if (error) {
      console.log("file upload error", error)
    } else {
      res.status(httpStatus.CREATED).json(file.name);
    }
  });
};

exports.uploadCkImage = async (req, res) => {
  const file = req.files.attachment;
  const imagePath = path.join(__dirname + './../../public/images/');
  file.mv(imagePath + file.name, function (error) {
    if (error) {
      console.log("file upload error", error)
    } else {
      res.status(httpStatus.CREATED).json(file.name);
    }
  });
};

exports.mail = async (req, res) => {
  console.log('**********dddddddddddddd********')
  console.log('req.body')
  console.log(req.body)

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dremova.yulya1@mail.ru',
      pass: 'sufdhk7k7bJABDFKer'
    }
  });

  var mailOptions = {
    from: 'dremova.yulya1@mail.ru',
    to: 'vovochkaperepelkin@yandex.ru',
    subject: 'Sending Email using Node.js',
    html: '<p>That was easy!</p>'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.status(httpStatus.CREATED).json('sent successfully');
    }
  });
}
//I added end

exports.getPatient = async (req, res, next) => {
  try {
    const key = req.query.key;
    const value = req.query.value;
    //console.log("getPatient key:",key," - value:",value)
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
            if (updated) res.status(httpStatus.OK).json(updated);
          } else {
            res.status(httpStatus.NO_CONTENT).send()
          }
      }
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
    //console.log("updatePatient:",req.body)
    //req.body.avatar = new Buffer(req.body.avatar.split(",")[1], "base64");
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
      amount: (amount*100),
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
      amount: (amount*100),
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
exports.subcription = async (req, res, next) => {
  let charge = null;
  const providerId = req.body.chargeData.providerId;
  try {
    const card_number = req.body.chargeData.card_number;
    const cvv = req.body.chargeData.cvv;
    const expiration_month = req.body.chargeData.expiration_month;
    const expiration_year = req.body.chargeData.expiration_year;
    const email = req.body.chargeData.email;
    const amount = req.body.chargeData.amount;
    const currency_code = req.body.chargeData.currency_code;
    const first_name = req.body.chargeData.first_name;
    const last_name = req.body.chargeData.last_name;
    const address = req.body.chargeData.address;
    const address_city = req.body.chargeData.address_city;
    const country_code = req.body.chargeData.country_code;
    const phone_number = req.body.chargeData.phone_number;

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
    
    let plan = await culqi.plans.createPlan({
      name: "Eberos Subscription Plan Basic",
      amount: (amount*100),
      currency_code: currency_code,
      interval: "meses",
      interval_count: 1,
      limit: 12
    });

    console.log(plan);

    console.log(plan.id);

    let customer = await culqi.customers.createCustomer({
      first_name: first_name,
      last_name: last_name,
      email: email,
      address: address,
      address_city: address_city,
      country_code: country_code,
      phone_number: phone_number
    }
    );

    console.log(customer);

    console.log(customer.id);
  
    let card = await culqi.cards.createCard({
      customer_id: customer.id,
      token_id: token.id
    });

    console.log(card);

    console.log(card.id);

    let subscription = await culqi.subscriptions.createSubscription({
      card_id: card.id,
      plan_id: plan.id
    });

    console.log(subscription);

    console.log(subscription.id);


    res.status(httpStatus.OK).send()
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }    
  /*try {
    const paysubcription = new Paysubcription({
      plan: "basic",
      providerId: providerId,
      chargeId: charge.id,
      createDate: new Date(),
      currencyCode: currency_code,
      amount: amount,
      email: email,
      status: "active"
    });
    await paysubcription.save();
    res.status(httpStatus.OK).send()
  } catch (e) {
    console.log("error ", e)
    error = new APIError(e);
    return next(error)
  }*/
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
    const consultData = req.body;
    const consult = await new Consult(consultData).save();
    res.status(httpStatus.CREATED).json(consult);
  } catch (e) {
    return next(APIError(e))
  }
};

exports.getLastAttetions = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    console.log("getLastAttetions providerId userId: ", userId)
    const lastConsultAttetions = await Consult.find({ providerId: userId }).sort({ date: -1 }).limit(10).map(async (list) => {
      await Promise.all(list.map(async (c) => {
        const patient = await Patient.find({ _id: c.patientId });
        c["patient"] = patient[0]
      }));
      return list;
    });
    if (lastConsultAttetions) {
      console.log("lastConsultAttetions: ", lastConsultAttetions)
      res.status(httpStatus.OK).json(lastConsultAttetions);
    }


  } catch (e) {
    return next(new APIError(e))
  }
};


/**
 * 
 * @param Consult result 
 */
exports.createConsultEvent = async (result) => {
  try {
    const patientsData = await Patient.find({ room: result.room, connection: true });
    const providerData = await User.findOne({ room: result.room });

    //console.log("patientsData:",patientsData," \n providerData:",providerData);

    const consult = await new Consult({
      patientId: patientsData[0]._id,
      providerId: providerData._id,
      dni: patientsData[0].dni,
      createDate: new Date()
    }).save();

    return consult;
  } catch (e) {
    return new APIError(e)
  }
};
