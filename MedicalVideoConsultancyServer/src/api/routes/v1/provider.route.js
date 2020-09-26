const express = require('express');
const router = express.Router();
const controller = require('../../controllers/provider.controller');
const {authorize} = require('../../middlewares/auth');
/**
 * @api v1/provider/invite-by-sms.
 * @param userData
 * */

router.route('/invite-by-sms')
  .post(authorize(), controller.inviteBySMS);

/**
 * @api v1/provider/mediaUpload
 * @param file
 * */
router.route('/mediaUpload')
  .post(authorize(), controller.uploadMedia);

/**
 * @api v1/provider/room/:userId
 * @param id
 * */

router.route('/room/:userId')
  .get(controller.getRoomData);

/**
 * @api v1/provider/room/:userId
 * @param userId, field, value
 * */

router.route('/room/:userID')
  .patch(authorize(), controller.changeRoomField)

  router.route('/text/:userID')
  .patch(authorize(), controller.changeRoomField)
/**
 * @api v1/provider/roomName/: roomName
 * @param roomName
 * */

router.route('/roomName/:room')
  .get(controller.checkRoomExist);

/**
 * @api v1/provider/patientByField
 * @params field: value
 * */


//I added 
router.route('/allPatients')
  .get(controller.getAllPatients);

router.route('/consult/:patientId/:startDate/:endDate')
  .get(controller.getConsult);

router.route('/oneConsult')
  .get(controller.getOneConsult);

router.route('/consultInChat')
  .get(controller.getConsultInChat);

router.route('/uploadFile')
  .post(controller.fileUpload);

router.route('/mail')
  .post(controller.mail);  


router.route('/updateConsult')
  .put(controller.updateConsult)

router.route('/ckImage')
  .post(controller.uploadCkImage)

router.route('/getSignature/:providerId')
  .get(controller.getSignature)

//I added end
router.route('/patientByField')
  .get(controller.getPatient);

/**
 * @api v1/provider/patient
 * @param patientData
 * */

router.route('/patient')
  .put(controller.updatePatient)

/**
 * @api v1/provider/patients-waiting/:room
 * @param no
 * */

router.route('/patients-waiting/:room')
  .get(controller.getWaitingPatientsData);

/**
 * @api v1/provider/patients-recent
 * */

router.route('/patients-recent')
  .get(controller.getRecentPatientsData);

/**
 * @api v1/provider/patients-all/:room
 * @param id
 * */
router.route('/patients-all/:room')
  .get(controller.getAllPatientsData);
/**
 * @api v1/provider/resetState
 * @params model, field 'to reset'
 * */

router.route('/resetState')
  .patch(controller.resetState);


/**
 * @api v1/provider/checkout
 * */
router.route('/checkout')
  .post(controller.checkout);

  
/**
 * @api v1/provider/checkout
 * */
router.route('/charge')
  .post(controller.charge);

/**
 * @api v1/provider/checkout
 * */
router.route('/subcription')
  .post(controller.subcription);
  
/**
 * @api v1/provider/notify
 * */
router.route('/notify')
  .post(controller.notify)

/**
 * @api v1/provider/chart
 * @method put
 * */
router.route('/chart')
  .put(controller.editChart);

/**
 * @api v1/provider/chart/:dni
 * @method get
 * */
router.route('/getChart/:patientDni')
  .get(controller.getChart);

/**
 * @api v1/provider/consult
 * @method post
 * */
router.route('/consult')
  .post(controller.createConsult);
  /**
   * @api v1/provider/consult
   * @method post
   * */
  router.route('/consult/:userId')
    .get(controller.getLastAttetions);

/**
 * @api v1/provider/consult
 * @method post
 * */
// router.route('/consult')
//   .get(controller.getConsult);

module.exports = router;
