const httpStatus = require('http-status');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Patient = require('../models/patient.model');
const RefreshToken = require('../models/refreshToken.model');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../config/vars');
const { baseWebUrl } = require('../../config/vars');
const Culqi = require('culqi-node');
const { culqiConfing } = require('../../config/vars');
const Plan = require('../models/plan.model');
const SubcriptionPay = require('../models/subcriptionPay.model');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res) => {
  let userModel;
  try {
    const userData = req.body;
    userModel = userData.role === 'Admin' ? Admin : User;
    userData.cmp = userModel === Admin ? '-' : userData.cmp;
    const user = await new userModel(userData).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    return res.json({ token, user: userTransformed, status: httpStatus.CREATED });
  } catch (error) {
    console.log("register:", error);
    return res.json(userModel.checkDuplicateField(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const userData = await User.findOne({ 'email': req.body.email });
    const userModel = userData ? User : Admin;
    let { user, accessToken } = await userModel.findAndGenerateToken(req.body);
    if (user.role != "Admin" && user.role != "SuperAdmin") {
      let now = new Date();
      now.setHours(23);
      now.setMinutes(59);
      now.setSeconds(59);
      //console.log("now:", now);
      //console.log("now.getTime():", now.getTime());

      let userRegister = user.createdAt;
      userRegister.setMonth(userRegister.getMonth() + 1);
      userRegister.setHours(0);
      userRegister.setMinutes(0);
      userRegister.setSeconds(0);
      //console.log("userRegister:", userRegister);

      /*console.log("userRegister.getTime():", userRegister.getTime());

      console.log("eval:", (userRegister.getTime() <= now.getTime()));
      console.log("eval:", (userRegister.getTime() - now.getTime()));
      console.log("eval:", (now.getTime() - userRegister.getTime()));*/

      const diff = userRegister.getTime() - now.getTime();

      if (diff > 0) {
        //console.log("ok");
        user.payToDay = true;
        user.freeUse = true;
        user.freeUseTime = diff;
      } else {
        const subcrioptionPay = await SubcriptionPay.findOne({ providerId: user._id, status: "active" });
        //console.log("subcrioptionPay");
        //console.log(subcrioptionPay);
        //console.log("userData");
        //console.log(userData);
        //console.log("user");
        //console.log(user);
        if (subcrioptionPay) {
          //console.log("subcrioptionPay.subcriptionId");
          if (subcrioptionPay.planId) {
            const planSubcription = await Plan.findById(subcrioptionPay.planId);
            //console.log("planSubcription");
            //console.log(planSubcription);
            if (planSubcription.type == "subcription") {
              const culqi = new Culqi({
                privateKey: culqiConfing.private_key,
                pciCompliant: true,
                publicKey: culqiConfing.private_key,
              });
              const subscriptionCulqi = await culqi.subscriptions.getSubscription({
                id: subcrioptionPay.subcriptionId
              });
              //console.log(subscriptionCulqi.status);
              if (subscriptionCulqi.status != "Activa") {
                await SubcriptionPay.update({ _id: subcrioptionPay._id }, { status: "inactive" }, { new: false });
                await User.findOneAndUpdate({ _id: user._id }, { payToDay: false }, { new: true });
              }

            } else
              if (planSubcription.type == "charge") {

                let planSubcriptionEndDate = subcrioptionPay.endDate;
                planSubcriptionEndDate.setHours(0);
                planSubcriptionEndDate.setMinutes(0);
                planSubcriptionEndDate.setSeconds(0);
                //console.log("charge");
                //console.log(now);
                //console.log(planSubcriptionEndDate);
                user.endDate = planSubcriptionEndDate;
                if (now.getTime() >= planSubcriptionEndDate.getTime()) {
                  await SubcriptionPay.update({ _id: subcrioptionPay._id }, { status: "inactive" }, { new: false });
                  await User.findOneAndUpdate({ _id: user._id }, { payToDay: false }, { new: true });
                }
              }
          }
        }else{
          user.payToDay = false;
          user.freeUse = false;
        }
      }
    }
    console.log("user");
    console.log(user);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    /*console.log("userTransformed");
    console.log(userTransformed);*/
    return res.json({ token, user: userTransformed });
  } catch (error) {
    console.log("error", error);
    error = new APIError(e);
    return next(error)
  }
};



/**
 * @api post v1/auth/verify-email
 *When user click the link in his email
 */

exports.verifyEmail = async (req, res, next) => {
  try {
    const fakeToken = req.params.token;
    const buff = Buffer.from(fakeToken, 'base64')
    const email = buff.toString('utf-8');
    const user = await User.findOne({ email: email });
    const userModel = user ? User : Admin;
    await userModel.findOneAndUpdate({ email: email }, { status: "active" }, { new: true }).then(result => {
      res.status(200).json(result);
      //res.redirect(baseWebUrl+'auth/sign-in');
    })
  } catch (e) {
    return next(e)
  }
};

/**
 * @api post v1/auth/verify-sms
 * When user verify with code using his phone number
 *
 * */
exports.verifySMS = async (req, res, next) => {
  try {
    const smsCode = req.body.code.smsCode;
    const fakeToken = req.body.token;
    const token = Buffer.from(fakeToken, 'base64');
    const phoneNumber = token.toString('utf-8');
    const user = await User.findOne({ phoneNumber: phoneNumber });
    const userModel = user ? User : Admin;
    await userModel.findOneAndUpdate({ phoneNumber: phoneNumber, smsCode: smsCode }, { status: "active" }, { new: true }).then(result => {
      res.status(200).json(result)
    });
  } catch (e) {
    return next(e);
  }
};

/***
 * @api post v1/auth/join
 * @param req patientData
 * @param res
 * @param next
 */

exports.join = async (req, res, next) => {
  try {
    const patientData = req.body;

    /*console.log("join patientData");
    console.log(patientData);*/

    patientData['role'] = "Patient";
    let patient = await new Patient(patientData).save();
    if (patient) {

      patient = await Patient.findOneAndUpdate({ _id: patient._id }, {
        reason: patientData.reason,
        typeAttetion: patientData.typeAttetion,
        providerId: patientData.providerId,
      }, { new: false });

      res.status(httpStatus.CREATED).json(patient);
    } else {
      res.status(httpStatus.NOT_FOUND).send();
    }
  } catch (e) {
    return next(Patient.checkDuplicateField(e))
  }
};


/***
 * @api post v1/auth/join
 * @param req patientData
 * @param res
 * @param next
 */

exports.joinValidatePatient = async (req, res, next) => {
  try {
    const patientData = req.body;
    /*console.log("joinValidatePatient patientData");
    console.log(patientData);*/
    let patient = await Patient.findOne({ dni: patientData.dni });

    if (patient) {
      patient.reason = patientData.reason;
      patient.typeAttetion = patientData.typeAttetion;
      patient.providerId = patientData.providerId;
      /*console.log("joinValidatePatient patient");
      console.log(patient);*/

      const result = await Patient.updateOne({ _id: patient._id }, patient, { upsert: true });

      /*console.log("joinValidatePatient patient");
      console.log(result);
      console.log(patient);*/

      const { accessToken } = await Patient.findAndGenerateToken(patient);
      return res.json({ token: accessToken, patient: patient });
    } else {
      res.status(httpStatus.NOT_FOUND).send();
    }
  } catch (e) {
    console.log(e)
    return next(e);
  }
};


/***
 * @api post v1/auth/join/validate
 * @param req patientData
 * @param res
 * @param next
 */

exports.joinValidate = async (req, res, next) => {
  try {
    const patientData = req.body;
    patientData['role'] = "Patient";
    const patient = await new Patient(patientData).save();
    if (patient) res.status(httpStatus.CREATED).json(patient);

  } catch (e) {
    return next(Patient.checkDuplicateField(e))
  }
};
