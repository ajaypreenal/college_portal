const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// POST: Mark attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, status } = req.body;
    if (!studentId || !status) {
      return res.status(400).json({ message: 'Student ID and status are required' });
    }

    const attendance = new Attendance({
      student: studentId,
      status
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET: Fetch all attendance
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find().populate('student', 'name email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
