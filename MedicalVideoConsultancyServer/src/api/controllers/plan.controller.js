const httpStatus = require('http-status');
const path = require('path');
const Plan = require('../models/plan.model');
const Admin = require('../models/admin.model');
const nodemailer = require("nodemailer");
const { emailConfig, smsConfig, culqiConfing } = require("../../config/vars");
const client = require('twilio')(smsConfig.Sid, smsConfig.authToken);
const bcrypt = require('bcryptjs');
const { env, baseUrl } = require('../../config/vars');
const Culqi = require('culqi-node');

/**
 * Load user and append to req.
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    Plan.find({}, (err, plans) => {
      res.send(plans);
    });
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

    const planExists = await Plan.findOne({ name: req.body.name });

    if (planExists) {
      res.status(httpStatus.CONFLICT).json({});
    } else {
      
      const planData = req.body;

      // const culqi = new Culqi({
      //   privateKey: culqiConfing.private_key,
      //   pciCompliant: true,
      //   publicKey: culqiConfing.private_key,
      // });


      // let planCulqi = await culqi.plans.createPlan({
      //   name: planData.name,
      //   amount: (planData.amount * 100),
      //   currency_code: planData.currency_code,
      //   interval: "meses",
      //   interval_count: 1,
      //   description: planData.description
      // });
      // console.log('planCulqi')
      // console.log(planCulqi)

      // planData['interval'] = "meses";
      // planData['interval_count'] = 1;
      // planData['trial_days'] = 30;
      // planData['createDate'] = new Date();
      // planData['status'] = "active";

      // planData['planId'] = planCulqi.id;

      const plan = await new Plan(planData).save();
      console.log('plan')
      console.log(plan)

      res.status(httpStatus.CREATED).json(plan);
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
    const id = req.params.planId;
    Plan.findById(id, (err, plan) => {
      res.send(plan);
    });
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
    const planId = req.params.planId;
    Plan.findById(planId, async (err, plan) => {
      if (!err) {

        const culqi = new Culqi({
          privateKey: culqiConfing.private_key,
          pciCompliant: true,
          publicKey: culqiConfing.private_key,
        });
  
        culqi.plans.deletePlan({
          id: plan.planId
        });
  
        plan.remove();
  
        res.status(httpStatus.OK).send()
      }else{
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send()
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.update= async (req, res, next)=>{
  try{
    const planId=req.body.id;
    const plan=await Plan.findOneAndUpdate(
      {_id:planId},
      {"$set":{name:req.body.name, description:req.body.description, amount:req.body.amount}},
      {new:true}
    );
    res.status(httpStatus.OK).json(plan);
  }catch (error) {
    return next(error);
  }
}
