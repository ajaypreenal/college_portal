const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type:String, required:true, unique:true },
  studentId: { type: String, unique: true },
  course: String,
  year: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
