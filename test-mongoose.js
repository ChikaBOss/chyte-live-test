// test-mongoose.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔌 Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ Mongoose connected successfully');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Mongoose connection error:', err);
  process.exit(1);
});