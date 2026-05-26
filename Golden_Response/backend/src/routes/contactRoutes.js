const express = require('express');
const router = express.Router();
const { submitContactTicket } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validate');

// Public support submissions
router.post('/submit', validateContact, submitContactTicket);

module.exports = router;
