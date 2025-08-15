const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance'); // Added Attendance model import

// Create student (admin) - using User model
router.post('/', protect, authorize('admin'), async (req,res) => {
  try {
    const studentData = {
      ...req.body,
      role: 'student' // Ensure role is set to student
    };
    
    const student = new User(studentData);
    await student.save();
    
    // Return student data without password
    const studentResponse = {
      _id: student._id,
      name: student.name,
      email: student.email,
      class: student.class,
      rollNumber: student.rollNumber,
      course: student.course,
      role: student.role
    };
    
    res.status(201).json({ 
      message: 'Student created successfully',
      student: studentResponse 
    });
  } catch (err) { 
    console.error('Error creating student:', err);
    res.status(400).json({ error: err.message }); 
  }
});

// Read all students
router.get('/', protect, authorize('admin','faculty'), async (req,res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one student
router.get('/:id', protect, async (req,res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current student profile (for logged-in student)
router.get('/me', protect, async (req,res) => {
  try {
    const student = await User.findById(req.user._id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }
    
    // Get attendance summary for the student
    const attendanceRecords = await Attendance.find({ student: student._id });
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;
    
    res.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        rollNumber: student.rollNumber,
        course: student.course,
        role: student.role
      },
      attendance: {
        total: totalClasses,
        present: presentCount,
        absent: totalClasses - presentCount,
        percentage: attendancePercentage
      }
    });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', protect, authorize('admin'), async (req,res) => {
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' }, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', protect, authorize('admin'), async (req,res) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;