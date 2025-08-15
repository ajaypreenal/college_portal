const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: [true, "Email is required"], lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6 },
    rollNumber: { type: Number },
    class: { type: String }, // Remove required - make it optional
    course: { type: String }, // For students
    role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
    // Faculty-specific fields
    department: { type: String },
    facultyId: { type: String },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

// Ensure class is set for students only
userSchema.pre('save', function(next) {
  if (this.role === 'student' && !this.class) {
    this.class = 'N/A';
  }
  next();
});

// Hash password once (ONLY here)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err); }
});

userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Create default admin WITHOUT manual hashing
userSchema.statics.createDefaultAdmin = async function () {
  try {
    const adminEmail = 'admin@college.com';
    const existingAdmin = await this.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await this.create({
        name: 'Default Admin',
        email: adminEmail,
        password: 'admin123',     // plain; pre-save will hash
        role: 'admin',
        class: 'N/A'
      });
      console.log('✅ Default admin created:', adminEmail, '/ admin123');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = mongoose.model('User', userSchema);
