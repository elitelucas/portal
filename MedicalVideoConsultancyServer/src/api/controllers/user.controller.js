const httpStatus = require('http-status');
const path = require('path');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const nodemailer = require("nodemailer");
const {emailConfig, smsConfig} = require("../../config/vars");
const client = require('twilio')(smsConfig.Sid, smsConfig.authToken);
const bcrypt = require('bcryptjs');
const {env, baseUrl} = require('../../config/vars');
/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const userData = await User.findById(id);
    const user = userData ? await User.findById(id) : await Admin.findById(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};


/**
 * Update existing user
 * @api {patch} v1/users/:userId
 * @public
 */
exports.update = async (req, res, next) => {
  const user = await User.findOne({_id: req.body.userId});
  const userModel = user ? User : Admin;
  userModel.findOneAndUpdate({_id: req.body.userId}, req.body, {new: true})
    .then(savedUser => res.json(savedUser))
    .catch(e => next(userModel.checkDuplicateField(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {

    const userData = await User.list(req.query);
    const adminData = await Admin.list(req.query);
    const users = adminData.concat(userData);
    const transformedUsers = users.map(user => {
      if(user.role ==="SuperAdmin") {
        console.log("super admin", user)
      } else{
       return user.transform()
      }
    });
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;
  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};


/**
 Send email when change user's status to approved or deny to user's email
 */

exports.sendEmail = (req, res) => {
  console.log("request came");
  let user = req.body;
  const buffer = new Buffer(user.email);
  const fakeToken = buffer.toString('base64');
  const verifyUrl = baseUrl + `api/v1/auth/verify-email/${fakeToken}`;

  console.log("verifyUrl:"+verifyUrl)

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: true,
    auth: {
      user: emailConfig.username,
      pass: emailConfig.password
    }
  });
  let mailOptions = {};
  if (user.permission.includes("approved")) {
    mailOptions = {
      from: emailConfig.username,
      to: user.email,
      subject: "Your MEVICO accounts is"+" " + user.permission,
      html:  "<br/>" + "<br/>" + "<div>Please click <a href='"+verifyUrl+"'>here</a> to make your account active</div>"
    };
  } else if(user.permission.includes("deny")) {
    mailOptions = {
      from: emailConfig.username,
      to: user.email,
      subject: "Your MEVICO accounts is"+" " + user.permission,
      html:  "<br/>" + "<br/>" + "<div>Your request was denied. Please contact support.</div>"
    };
  } else {
    return;
  }


  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log("sendMail:",error);
    } else {
      res.status(200).send(user);
      console.log('Email sent: ' + info.response);
    }
  });
};


/**
 * Send SMS when user's permission change from pending, deny, approved to user's phone number
 * */

exports.sendSMS = (req, res) => {
  const userData = req.body;
  const buffer = new Buffer(userData.email);
  const fakeToken = buffer.toString('base64');
  const code = Math.floor(100000 + Math.random() * 900000)
  const textApproved = "Please visit following url like and enter verification code -";
  const textDeny = "Your request was denied. Please contact support.";
  const verifyUrl = baseUrl + 'auth/verify-sms/' + fakeToken;
  let smsContent = '';
  if(userData.permission.includes("approved")) {
     smsContent = textApproved +" "+ code +" "+ "See:  " + verifyUrl;
  } else if(userData.permission.includes("deny")) {
     smsContent = textDeny +" "+ code +" "+ "See:  " + verifyUrl;
  } else {
    return;
  }

  client.messages.create({from: smsConfig.sender, body: smsContent, to: userData.phoneNumber})
    .then(result=> {
      if(!result.errorCode) {
        User.findOneAndUpdate({email: userData.email}, {smsCode: code})
          .then(result1=> {
            res.status(200).send(result1)
          })
      }
    }).catch(e=> {
      console.log("SMS failed to sent", e)
  })
};


/**
 * Upload files when user update his profile.
 * */

exports.fileUpload = async (req, res) => {
  const user = await User.findOne({_id: req.body._id});
  const userModel = user ? User : Admin;
  const file = req.files.file;
  const imagePath = path.join(__dirname + './../../public/images/');
  file.mv(imagePath + file.name, function (error) {
    if (error) {
      console.log("profile image upload error", error)
    } else {
      userModel.findOneAndUpdate({_id: req.body._id}, {image: file.name}, {new: true}).then(result => {
        res.status(httpStatus.CREATED).json(result)
      }).catch(e => {
        console.log("image upload failed", e);
      })
    }
  });
};

/**
 * Update profile in user profile page
 * */

exports.updateProfile = async (req, res) => {
  const user = await User.findOne({_id: req.params.userId});
  const userModel = user ? User : Admin;
  const userOldData = req.locals.user;
  let userNewData = req.body.profile;
  let password = userNewData.password === '' ? userOldData.password : userNewData.password;
  if(userNewData.password !== '') {
    const rounds = env === 'test' ? 1 : 10;
    const hash = await bcrypt.hash(password, rounds);
    userNewData.password = hash;
  } else{
    userNewData.password = password;
  }
  userModel.findOneAndUpdate({_id: req.params.userId}, userNewData, {new: true}).then(result => {
    res.status(httpStatus.OK).json(result);
  }).catch(e => {
    return res.send(e)
  })
};
