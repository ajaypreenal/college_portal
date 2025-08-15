# College Website - Attendance Management System

A comprehensive college management system with attendance tracking capabilities.

## Features

### Attendance Management
- **Mark Attendance**: Faculty can mark attendance for students by class and course
- **Bulk Attendance**: Support for marking multiple students' attendance at once
- **Attendance Reports**: View attendance by date, student, course, or class
- **Student Dashboard**: Students can view their own attendance records
- **Admin Reports**: Administrators can view attendance across all classes and courses

### User Management
- **Role-based Access**: Admin, Faculty, and Student roles
- **Authentication**: JWT-based secure authentication
- **User Profiles**: Manage student, faculty, and admin accounts

### Course Management
- **Course Creation**: Add and manage courses
- **Class Assignment**: Assign students to classes
- **Course Tracking**: Monitor course-specific attendance

## API Endpoints

### Attendance Routes
- `GET /api/attendance/students/class/:className` - Get students by class
- `POST /api/attendance/mark-bulk` - Mark bulk attendance
- `POST /api/attendance` - Mark attendance (faculty form)
- `GET /api/attendance/date/:date` - View attendance by date
- `GET /api/attendance/student/:studentId` - Get attendance report by student
- `GET /api/attendance/course/:courseName/class/:className` - Get course attendance

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```
   MONGO_URI=mongodb://localhost:27017/college_db
   JWT_SECRET=your_jwt_secret_here
   PORT=5500
   ```

3. **Database Setup**
   - Ensure MongoDB is running
   - The system will automatically create default admin and student accounts

4. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Access the Application**
   - Frontend: `http://localhost:5500`
   - Backend API: `http://localhost:5500/api`

## Default Accounts

- **Admin**: `admin@college.com` / `admin123`
- **Student 1**: `student1@college.com` / `pass123`
- **Student 2**: `student2@college.com` / `pass123`

## Usage

### For Faculty
1. Navigate to the Attendance page
2. Select class, course, and date
3. Check students who are present
4. Submit attendance

### For Students
1. Login to student dashboard
2. View attendance section
3. Filter by course and date range
4. View attendance summary and records

### For Administrators
1. Access admin dashboard
2. Use attendance management section
3. Generate reports by class, course, or date
4. Monitor overall attendance patterns

## File Structure

```
├── backend/
│   ├── models/
│   │   ├── Attendance.js      # Attendance data model
│   │   ├── User.js            # User management model
│   │   └── ...
│   ├── routes/
│   │   ├── attendance.js      # Attendance API routes
│   │   └── ...
│   └── server.js              # Main server file
├── frontend/
│   ├── attendance.html        # Attendance marking page
│   ├── student_dashboard.html # Student attendance view
│   ├── admin.html             # Admin attendance management
│   └── assets/js/
│       ├── attendance.js      # Attendance functionality
│       ├── student.js         # Student dashboard logic
│       └── admin.js           # Admin functionality
└── package.json
```

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

