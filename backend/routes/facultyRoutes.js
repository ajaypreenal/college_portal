const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all faculty members
router.get('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('-password');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new faculty member (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const facultyData = {
      ...req.body,
      role: 'faculty',
      class: 'N/A' // Faculty don't have classes
    };
    const faculty = new User(facultyData);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update faculty member (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faculty = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete faculty member (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faculty = await User.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get faculty profile (for logged-in faculty)
router.get('/me', protect, authorize('faculty'), async (req, res) => {
  try {
    const faculty = await User.findById(req.user._id).select('-password');
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty role required.' });
    }
    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;