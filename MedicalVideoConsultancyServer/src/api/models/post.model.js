const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    providerId: {
        type: String,
        match: [/^[a-fA-F0-9]{24}$/, 'Wrong provider id']
      },
    postTitle:String,
    postBody:String,
},
{
    timestamps:true
  })

  module.exports = mongoose.model('Post', postSchema);
