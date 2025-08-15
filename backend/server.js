require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const bcrypt = require('bcryptjs'); // ❌ not needed here

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendance');
const { protect } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);

// Student dashboard (if you need it)
app.get('/student-dashboard', protect, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'student_dashboard.html'));
});

// Create default admin (plain password; model will hash)
async function createDefaultAdmin() {
  try {
    await User.createDefaultAdmin();
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
}

// Create multiple default students (plain password; model will hash)
async function createDefaultStudents() {
  try {
    const students = [
      { name: 'Student One', email: 'student1@college.com', password: 'pass123', role: 'student', class: 'CSE-A', rollNumber: 101, course: 'Computer Science' },
      { name: 'Student Two', email: 'student2@college.com', password: 'pass123', role: 'student', class: 'CSE-B', rollNumber: 102, course: 'Computer Science' },
      { name: 'Student Three', email: 'student3@college.com', password: 'pass123', role: 'student', class: 'CSE-A', rollNumber: 103, course: 'Mathematics' },
      { name: 'Student Four', email: 'student4@college.com', password: 'pass123', role: 'student', class: 'ECE-A', rollNumber: 104, course: 'Physics' },
      { name: 'Student Five', email: 'student5@college.com', password: 'pass123', role: 'student', class: 'ECE-B', rollNumber: 105, course: 'English' }
    ];

    for (const s of students) {
      const exists = await User.findOne({ email: s.email });
      if (!exists) {
        await User.create(s); // ✅ no manual hashing
        console.log(`✅ Student created: ${s.email} / ${s.password}`);
      } else {
        console.log(`ℹ️ Student already exists: ${s.email}`);
      }
    }
  } catch (err) {
    console.error('Error creating students:', err);
  }
}

// Create default faculty users (so they can login)
async function createDefaultFaculty() {
  try {
    const faculty = [
      { name: 'Dr. Sarah Johnson', email: 'faculty1@college.com', password: 'faculty123', role: 'faculty', department: 'Computer Science', facultyId: 'CS001' },
      { name: 'Prof. Michael Chen', email: 'faculty2@college.com', password: 'faculty123', role: 'faculty', department: 'Mathematics', facultyId: 'MATH001' },
      { name: 'Dr. Emily Davis', email: 'faculty3@college.com', password: 'faculty123', role: 'faculty', department: 'Physics', facultyId: 'PHY001' },
      { name: 'Prof. Robert Wilson', email: 'faculty4@college.com', password: 'faculty123', role: 'faculty', department: 'English', facultyId: 'ENG001' }
    ];

    for (const f of faculty) {
      const exists = await User.findOne({ email: f.email });
      if (!exists) {
        // Don't include class field for faculty
        const facultyData = { ...f };
        delete facultyData.class; // Remove class field for faculty
        await User.create(facultyData);
        console.log(`✅ Faculty created: ${f.email} / ${f.password}`);
      } else {
        console.log(`ℹ️ Faculty already exists: ${f.email}`);
      }
    }
  } catch (err) {
    console.error('Error creating faculty:', err);
  }
}

// Create sample attendance records for testing
async function createSampleAttendance() {
  try {
    const Attendance = require('./models/Attendance');
    
    // Check if attendance records already exist
    const existingRecords = await Attendance.countDocuments();
    if (existingRecords > 0) {
      console.log('ℹ️ Attendance records already exist, skipping sample creation');
      return;
    }

    // Get all students
    const students = await User.find({ role: 'student' });
    if (students.length === 0) {
      console.log('ℹ️ No students found for attendance records');
      return;
    }

    const courses = ['Computer Science', 'Mathematics', 'Physics', 'English'];
    const attendanceRecords = [];

    // Create attendance for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      students.forEach(student => {
        // Randomly mark students as present (80% chance)
        const isPresent = Math.random() > 0.2;
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        
        attendanceRecords.push({
          student: student._id,
          course: randomCourse,
          date: date,
          status: isPresent ? 'Present' : 'Absent'
        });
      });
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`✅ Created ${attendanceRecords.length} sample attendance records`);
    }
  } catch (err) {
    console.error('Error creating sample attendance:', err);
  }
}

const PORT = process.env.PORT || 5500;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await createDefaultAdmin();
    await createDefaultStudents();
    await createDefaultFaculty(); // Call the new function here
    await createSampleAttendance(); // Call the new function here
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
  });

// Serve frontend (optional if you use Live Server)
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});