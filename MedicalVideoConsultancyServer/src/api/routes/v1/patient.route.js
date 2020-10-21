const express = require('express');
const router = express.Router();
const controller = require('../../controllers/patient.controller');
const { authorize } = require('../../middlewares/authPatient');

/**
 * @api v1/patient
 * */

router.route('')
  .put(authorize(), controller.updatePatient)

router.route('/roomName/:room')
  .get(authorize(), controller.checkRoomExist);

router.route('/payment/:userId')
  .get(authorize(), controller.getPayData);

router.route('/uploadFile')
  .post(authorize(), controller.fileUpload);

router.route('/feedback')
  .post(authorize(), controller.createFeedback);

router.route('/disconnect/:patientId')
  .put(authorize(), controller.disconnectPatient)

router.route('/getBlog/:userId')
  .get(authorize(), controller.getBlog);

router.route('/provider-state/:room')
  .get(/*authorize(),*/ controller.getProviderState);

module.exports = router;
