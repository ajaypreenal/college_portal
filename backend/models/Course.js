const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: String,
  credits: Number,
  facultyId: String
});

module.exports = mongoose.model('Course', courseSchema);
