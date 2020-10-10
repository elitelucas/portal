const path = require('path');


/**
 * public/image/:image name
 */
exports.getImage = (req, res) => {
  let imageName = req.params.imageName;
  res.sendFile(path.join(__dirname + './../../public/images/' + imageName));
};


/**
 * public/video/:video name
 * */
exports.getVideo = (req, res) => {
  let videoName = req.params.videoName;
  res.sendFile(path.join(__dirname + './../../public/videos/' + videoName));
};

/**
 * @api public/download
 * */
exports.downloadFile = (req, res, next) => {
  try {
    let fileNameToDownload = req.params.fileName;
    res.sendFile(path.join(__dirname + './../../public/transfer/' + fileNameToDownload));
  }catch (e) {
    console.log("downloadFile:",error);
  }
}
