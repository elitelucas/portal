const mongoose = require('mongoose');
const logger = require('./../config/logger');
const { mongo, env } = require('./vars');
const User = require("../api/models/user.model")
// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
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
      const user = new User({
        email: "qwe@qwe.com",
        password: "qwe",
        role: "SuperAdmin",
      });
      const userData = await User.findOne({email: "qwe@qwe.com"});
      if(!userData) user.save();
    });
  return mongoose.connection;
};
