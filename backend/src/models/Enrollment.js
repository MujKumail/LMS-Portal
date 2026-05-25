const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 }, // 0 to 100
  completedLessons: [{ type: String }], // Array of completed lesson IDs
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = getModel('Enrollment', enrollmentSchema);
