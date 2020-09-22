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
  var rand_no = Math.floor(123123123123*Math.random());
  if(req.body.key){
    const file = req.files.file;
    const fileName=rand_no+file.name;
    const imagePath = path.join(__dirname + './../../public/images/');
  file.mv(imagePath + fileName, function (error) {
    if (error) {
      console.log("QRimage upload error", error)
    } else {
        res.status(httpStatus.CREATED).json({fileName:fileName});
    }
  });
  }else{
    const user = await User.findOne({_id: req.body._id});
    const userModel = user ? User : Admin;
    const file = req.files.file;
    const fileName=rand_no+file.name;
    const imagePath = path.join(__dirname + './../../public/images/');
    file.mv(imagePath + fileName, function (error) {
      if (error) {
        console.log("profile image upload error", error)
      } else {
        userModel.findOneAndUpdate({_id: req.body._id}, {image: fileName}, {new: true}).then(result => {
          res.status(httpStatus.CREATED).json(result)
        }).catch(e => {
          console.log("image upload failed", e);
        })
      }
    });
  }
};

/**
 * Upload signature image.
 * */

exports.sigImgUpload = async (req, res) => {
  var rand_no = Math.floor(123123123123*Math.random());
  const file = req.files.file;
  const fileName=rand_no+file.name;
  const imagePath = path.join(__dirname + './../../public/images/');
  file.mv(imagePath + fileName, function (error) {
    if (error) {
      console.log("signature image upload error", error)
    } else {
        res.status(httpStatus.CREATED).json({fileName:fileName});
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

/**
 * Update signature and payment method in user profile page
 * */

exports.updateSigPay = async (req, res) => {
  const imagePath = path.join(__dirname + './../../public/images/');
  var rand_no = Math.floor(123123123123*Math.random());
  var signatureImgName=rand_no+"signature.png";
  console.log('signatureImgName')
  console.log(signatureImgName)
  var sigImgSrc=req.body.sigImgSrc;
  if (sigImgSrc){
    var fs=require('fs');
    if(sigImgSrc.indexOf(';base64,')!==-1){
      let base64Image = sigImgSrc.split(';base64,').pop();
      fs.writeFile(imagePath+signatureImgName, base64Image, {encoding: 'base64'}, function(err) {
          console.log('File created');
      });
    }else{
      signatureImgName=sigImgSrc;
    }   
  }
  const payMethod=req.body.payMethod;
 
  User.findOneAndUpdate(
    {_id: req.params.userId}, 
    {"$set":{sigImgSrc:signatureImgName,payMethod:payMethod}},
    {new: true}
    )
    .then(result => {
      console.log('result')
      console.log(result)
    res.status(httpStatus.OK).json(result.sigImgSrc);
  }).catch(e => {
    return res.send(e)
  })
};

/**
 * Get payment method field from users collection
 * */

exports.getPayData = async (req, res) => {
  const id=req.params.userId;
  User.findById(id).then(result=>{
    res.status(httpStatus.OK).json(result.payMethod);
  }).catch(e => {
    return res.send(e)
  })
};

/**
 * Get signature image namefrom users collection
 * */

exports.getSignature = async (req, res) => {
  const id=req.params.userId;
  User.findById(id).then(result=>{
    res.status(httpStatus.OK).json(result.sigImgSrc);
  }).catch(e => {
    return res.send(e)
  })
};


/**
 * Get blog field from users collection
 * */

exports.getBlog = async (req, res) => {
  const id=req.params.userId;
  User.findById(id).then(result=>{
    res.status(httpStatus.OK).json(result.blog);
  }).catch(e => {
    return res.send(e)
  })
};

/**
 * Insert data to blog field of users collection
 * */

exports.postBlog = async (req, res) => {

  const id=req.body.userId;
  const postTitle=req.body.postTitle;
  const postBody=req.body.postBody;

  User.findOneAndUpdate(
    { _id: id }, 
    { $push: { blog: {postTitle,postBody}}},
    {new:true})
    .then(result=>{
      res.status(httpStatus.OK).json(result.blog);
    }).catch(e => {
      return res.send(e)
    })
};

/**
 * Update blog field of users collection
 * */

exports.updateBlog = async (req, res, next) => {
  const idx=req.body.idx;
  const id=req.body.userId;
  const postTitle=req.body.postTitle;
  const postBody=req.body.postBody;
  User.findOne({_id: id})
    .then(result =>{
      result.blog.splice(idx,1,{postTitle,postBody});
      result.save(function(error) {
        if (error) {
            console.log(error);
            return res.status(500).send(null);
        } else {
          return res.status(httpStatus.OK).json(result.blog);
        }
    });
  })  
    .catch(e =>{
      return res.send(e)
    });
};

/**
 * Delete blog field of users collection
 * */

exports.deleteBlog = async (req, res, next) => {
  const idx=req.params.idx;
  const id=req.params.userId;
  User.findById(id)
    .then(result =>{
      result.blog.splice(idx,1);
      result.save(function(error) {
        if (error) {
            console.log(error);
            return res.status(500).send(null);
        } else {
          return res.status(httpStatus.OK).json(result.blog);
        }
    });
  })  
    .catch(e =>{
      return res.send(e)
    });
};


