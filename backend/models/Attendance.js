const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);





