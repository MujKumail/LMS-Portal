const ContactLog = require('../models/ContactLog');
const { sendContactSupportEmail } = require('../utils/mailer');

const submitContactTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const ticket = await ContactLog.create({
      name,
      email,
      subject,
      message
    });

    // Send Admin Notification email asynchronously
    sendContactSupportEmail(ticket).catch(err => 
      console.error('Contact support email notification trigger failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully! Our academic staff will contact you shortly.',
      ticket: {
        _id: ticket._id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactTicket };
