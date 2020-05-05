const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const adminSchema = new Schema({
  email: String,
  name: String,
  phone: String,
  password: String,
  tags: String,
  picture:{
    title: String,
    description: String,
    image_url: String
  }
  isBusy: Boolean,
  occupation: {
    type: String, enum: ["nurse", "doctor", "secretary"]
  },
  praxis: [{type: Schema.Types.ObjectId, ref: 'Praxis'}]
});

// CREATE MODEL
//                           admins
const Admin = mongoose.model('Admin', adminSchema);

// EXPORT
module.exports = Admin;