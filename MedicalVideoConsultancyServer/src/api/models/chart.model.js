const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chartSchema = new Schema({
  dni: String,
  disease: {
    type:Array,
    default:[]
  },
  medication:  {
    type:Array,
    default:[]
  },
  surgery: {
    type:Array,
    default:[]
  },
  family: {
    type:Array,
    default:[]
  },
  toxic: {
    type:Array,
    default:[]
  }
});

module.exports = mongoose.model('Chart', chartSchema);
