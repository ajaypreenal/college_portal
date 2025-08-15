
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
mongoose.connect(process.env.MONGO_URI).then(async ()=>{
  await User.deleteMany({});
  await User.create({ name:'Admin', email:'admin@alpha.edu', password:'admin123', role:'admin' });
  console.log('Seeded admin user (email: admin@alpha.edu, password: admin123)');
  process.exit();
});