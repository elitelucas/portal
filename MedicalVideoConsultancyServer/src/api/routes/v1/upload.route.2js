const express = require('express');
const router = express.Router();
const controller = require('../../controllers/upload.controller');

/**
 * public/image/:image name
 */
router.route('/image/:imageName')
  .get(controller.getImage);

/**
 * public/video/:video name
 * */
router.route('/video/:videoName')
  .get(controller.getVideo);


/**
 * @api v1/file-transfer/download/:fileName
 * */
router.route('/download/:fileName')
  .get(controller.downloadFile);

module.exports = router;
