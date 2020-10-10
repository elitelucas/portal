const path = require('path');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const Transfer = require('../models/transfer.model');
var mime = require('mime');
var fs = require('fs');

/**
 * @api v1/file-transfer/upload
 * @param req.files.file
 * */
exports.upload = async (req, res, next) => {
  try {
    var rand_no = Math.floor(123123123123*Math.random());
    const file = req.files.file;
    const fileName=rand_no+file.name;
    const imagePath = path.join(__dirname + './../../public/transfer/');
    await file.mv(imagePath + fileName, async error => {
      if (error) {
        throw new APIError(error)
      }
      const transfer = await new Transfer({name: fileName, type: file.mimetype, size: file.size, modified: file.lastModifiedDate}).save();
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

/**
 * @api v1/file-transfer/get-transfer
 * */
exports.download = async (req, res, next) => {

    const imagePath = path.join(__dirname + './../../public/');
    const filePath = imagePath+req.params.receiver+'\\';
    const filename=req.params.fileName;
    const file = filePath+filename;
    if(fs.existsSync(file)){
      const mimetype = mime.lookup(file);
  
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', mimetype);
    
      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
    }else{
      console.log('There is no such files');
    }
  
    
};
