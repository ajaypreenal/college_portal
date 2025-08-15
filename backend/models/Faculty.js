const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: String,
  email: { type:String, unique:true },
  facultyId: { type: String, unique: true },
  department: String
});

module.exports = mongoose.model('Faculty', facultySchema);
