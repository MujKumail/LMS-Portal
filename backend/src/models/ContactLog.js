const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const contactLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { 
    type: String, 
    enum: ['Course Issue', 'Technical Problem', 'General Query'], 
    required: true 
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('ContactLog', contactLogSchema);
