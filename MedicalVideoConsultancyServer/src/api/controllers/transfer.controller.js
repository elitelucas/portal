const path = require('path');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const Transfer = require('../models/transfer.model');

/**
 * @api v1/file-transfer/upload
 * @param req.files.file
 * */
exports.upload = async (req, res, next) => {
  try {
    const file = req.files.file;
    const imagePath = path.join(__dirname + './../../public/transfer/');
    await file.mv(imagePath + file.name, async error => {
      if (error) {
        throw new APIError(error)
      }
      const transfer = await new Transfer({name: file.name, type: file.mimetype, size: file.size, modified: file.lastModifiedDate}).save();
      res.status(httpStatus.CREATED).json(transfer);
    });
  } catch (e) {
    console.log("upload:",error);
    return next(APIError(e))
  }
};

/**
 * @api v1/file-transfer/get-transfer
 * */
exports.getTransfer = async (req, res, next) => {
  try {
    const transferData = await Transfer.find({});
    res.status(httpStatus.OK).json(transferData);
  } catch (e) {
    return next(APIError(e))
  }
};
