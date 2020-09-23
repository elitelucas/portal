const httpStatus = require('http-status');
const path = require('path');
const Plan = require('../models/plan.model');
const Admin = require('../models/admin.model');
const nodemailer = require("nodemailer");
const {emailConfig, smsConfig, culqiConfing} = require("../../config/vars");
const client = require('twilio')(smsConfig.Sid, smsConfig.authToken);
const bcrypt = require('bcryptjs');
const {env, baseUrl} = require('../../config/vars');
const Culqi = require('culqi-node');

/**
 * Load user and append to req.
 * @public
 */
exports.list = async (req, res, next) => {
  try {

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Load user and append to req.
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const planExists = await Plan.findOne({name: req.body.name});
    if(planExists == undefined){
      
      const planData = req.body;

      const culqi = new Culqi({
        privateKey: culqiConfing.private_key,
        pciCompliant: true,
        publicKey: culqiConfing.private_key,
      });
      
      let planCulqi = await culqi.plans.createPlan({
        name: planData.name,
        amount: (planData.amount*100),
        currency_code: planData.currency_code,
        interval: "meses",
        interval_count: 1
      });

      planData['interval'] = "meses";
      planData['interval_count'] = 1;
      planData['trial_days'] = 30;
      planData['createDate'] = new Date();
      planData['status'] = "active";
      
      planData['planId'] = planCulqi.id;

      const plan = await new Plan(planData).save();

      res.status(httpStatus.CREATED).json(plan);
    }else{
      res.status(httpStatus.CONFLICT).json({});
    }
  } catch (error) {
    return next(error);
  }
};


/**
 * Load user and append to req.
 * @public
 */
exports.get = async (req, res, next) => {
  try {
   /*
   id: req.params.userId
   const userData = await User.findById(id);
    const user = userData ? await User.findById(id) : await Admin.findById(id);
    req.locals = { user };*/
    return next();
  } catch (error) {
    return next(error);
  }
};


/**
 * Load user and append to req.
 * @public
 */
exports.remove = async (req, res, next) => {
  try {
   /* const userData = await User.findById(id);
    const user = userData ? await User.findById(id) : await Admin.findById(id);
    req.locals = { user };*/
    return next();
  } catch (error) {
    return next(error);
  }
};
