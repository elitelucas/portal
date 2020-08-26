const express = require('express');
const router = express.Router();
const controller = require('../../controllers/transfer.controller');

/**
 * @api v1/file-transfer/upload
 * */
router.route('/upload')
  .post(controller.upload);

/**
 * @api v1/file-transfer/get-transfer
 * */
router.route('/get-transfer')
  .get(controller.getTransfer);

module.exports = router;

