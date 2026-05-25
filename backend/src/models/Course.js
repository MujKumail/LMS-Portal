const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // URL or rich text
  type: { type: String, enum: ['video', 'document'], default: 'video' },
  duration: { type: String, default: '10 mins' },
  order: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessons: [lessonSchema],
  thumbnail: { type: String, default: '' },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('Course', courseSchema);
