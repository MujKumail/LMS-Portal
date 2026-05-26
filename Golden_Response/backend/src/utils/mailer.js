const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'emails.log');

let transporter = null;
let useFallback = false;

// Determine if we should use active SMTP or log fallback
if (process.env.EMAIL_USER === 'mock_user' || !process.env.EMAIL_USER) {
  useFallback = true;
} else {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (err) {
    console.error('⚠️  Failed to initialize SMTP Transporter, utilizing offline file logger.');
    useFallback = true;
  }
}

const sendEmail = async (to, subject, htmlBody) => {
  if (useFallback) {
    const timestamp = new Date().toISOString();
    const logEntry = `
========================================
[EMAIL LOGGER - ${timestamp}]
To: ${to}
Subject: ${subject}
----------------------------------------
${htmlBody}
========================================
\n`;
    fs.appendFileSync(logFile, logEntry);
    console.log(`✉️   [Email System] Mock Email dispatched to ${to}. Logged in backend/logs/emails.log`);
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LMS Academy <noreply@lmsacademy.com>',
      to,
      subject,
      html: htmlBody
    };
    await transporter.sendMail(mailOptions);
    console.log(`✉️   [Email System] Live Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌  [Email System] Failed to send email to ${to}: ${error.message}`);
    // If SMTP fails, write to log fallback to prevent API crash
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `\n[SMTP FAILURE LOG - ${timestamp}] To: ${to} | Error: ${error.message}\n${htmlBody}\n`);
    return false;
  }
};

const getBrandedTemplate = (title, content, recipientName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 30px 15px;
      color: #334155;
    }
    .wrapper {
      max-width: 600px;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      margin: 0 auto;
    }
    .banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 35px 25px;
      text-align: center;
      color: #ffffff;
    }
    .banner h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .banner p {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }
    .body-box {
      padding: 35px 30px;
      line-height: 1.7;
      font-size: 16px;
    }
    .body-box h2 {
      font-size: 20px;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .body-box p {
      margin: 0 0 20px 0;
    }
    .highlight-card {
      background-color: #f1f5f9;
      border-left: 4px solid #4f46e5;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin: 25px 0;
    }
    .highlight-card p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .highlight-card p:last-child {
      margin: 0;
    }
    .btn-link {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      margin-top: 15px;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #f1f5f9;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="banner">
      <h1>LMS Academy</h1>
      <p>Igniting Minds, Shaping Futures</p>
    </div>
    <div class="body-box">
      <h2>Hello ${recipientName || 'Student'},</h2>
      ${content}
    </div>
    <div class="footer">
      <p>This email was dispatched automatically by LMS Academy. Please do not reply directly.</p>
      <p>&copy; 2026 LMS Academy. All rights reserved. | <a href="#">Support Center</a></p>
    </div>
  </div>
</body>
</html>
  `;
};

// 1. Send Welcome Email
const sendWelcomeEmail = async (user) => {
  const content = `
    <p>Welcome to LMS Academy! We are absolutely thrilled to have you join our vibrant community of learners and educators.</p>
    <p>Whether you want to acquire new skills, build portfolio-ready apps, or teach students globally, LMS Academy is here to support your goals every step of the way.</p>
    <div class="highlight-card">
      <p><strong>Your Account Details:</strong></p>
      <p>👤 <strong>Role:</strong> ${user.role.toUpperCase()}</p>
      <p>📧 <strong>Email:</strong> ${user.email}</p>
      <p>📅 <strong>Joined On:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <p>Ready to jump in? Let's explore some courses and start your learning journey!</p>
    <a href="#" class="btn-link">Explore Course Catalog</a>
  `;
  const html = getBrandedTemplate('Welcome to LMS Academy!', content, user.name);
  return sendEmail(user.email, '🚀 Welcome to LMS Academy!', html);
};

// 2. Send Enrollment Confirmation
const sendEnrollmentEmail = async (user, course) => {
  const content = `
    <p>Congratulations! You have successfully enrolled in the following course:</p>
    <div class="highlight-card">
      <p>📚 <strong>Course:</strong> ${course.title}</p>
      <p>🎓 <strong>Instructor:</strong> ${course.instructor?.name || 'Academic Faculty'}</p>
      <p>⏳ <strong>Duration:</strong> ${course.lessons?.length || 0} Lessons</p>
    </div>
    <p>The syllabus is unlocked and ready for you. We suggest setting aside a few hours every week to maintain steady learning momentum!</p>
    <a href="#" class="btn-link">Start Learning Now</a>
  `;
  const html = getBrandedTemplate('Enrollment Confirmation', content, user.name);
  return sendEmail(user.email, `📚 Enrollment Confirmed: ${course.title}`, html);
};

// 3. Send Progress Milestone Email
const sendMilestoneEmail = async (user, course, milestonePercent) => {
  let title = 'Learning Milestone Unlocked!';
  let message = '';

  if (milestonePercent === 50) {
    message = `
      <p>You have successfully completed <strong>50%</strong> of the course <strong>"${course.title}"</strong>!</p>
      <p>This is a magnificent achievement. You're officially halfway there! Keep pushing, the rest is within arm's reach.</p>
    `;
  } else if (milestonePercent === 100) {
    message = `
      <p>Incredible job! You have fully completed <strong>100%</strong> of the course <strong>"${course.title}"</strong>!</p>
      <p>You've successfully mastered the lectures, completed all material, and added a key skill to your profile. Your certificate of completion is waiting!</p>
    `;
  }

  const content = `
    ${message}
    <div class="highlight-card">
      <p>📈 <strong>Progress achieved:</strong> ${milestonePercent}% Complete</p>
      <p>📚 <strong>Course name:</strong> ${course.title}</p>
      <p>🏆 <strong>Milestone Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <a href="#" class="btn-link">${milestonePercent === 100 ? 'Download Certificate' : 'Resume Learning'}</a>
  `;
  const html = getBrandedTemplate(title, content, user.name);
  return sendEmail(user.email, `🏆 Milestone Reached: ${milestonePercent}% of ${course.title}`, html);
};

// 4. Send Instructor Announcement
const sendAnnouncementEmail = async (student, course, title, announceMsg) => {
  const content = `
    <p>Your instructor has posted an important update in <strong>"${course.title}"</strong>:</p>
    <div class="highlight-card" style="border-left-color: #7c3aed;">
      <p>📣 <strong>Announcement: ${title}</strong></p>
      <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0;">
      <p>${announceMsg}</p>
    </div>
    <p>Head over to the course dashboard to participate in the discussions.</p>
    <a href="#" class="btn-link">View Course Board</a>
  `;
  const html = getBrandedTemplate(`Announcement: ${course.title}`, content, student.name);
  return sendEmail(student.email, `📣 [${course.title}] Announcement: ${title}`, html);
};

// 5. Send Contact Support Notification
const sendContactSupportEmail = async (ticket) => {
  const content = `
    <p>A new support/help ticket has been submitted to the platform. Here are the details:</p>
    <div class="highlight-card" style="border-left-color: #f43f5e; background-color: #fff1f2;">
      <p>📝 <strong>Subject:</strong> ${ticket.subject}</p>
      <p>👤 <strong>Sender Name:</strong> ${ticket.name}</p>
      <p>📧 <strong>Sender Email:</strong> ${ticket.email}</p>
      <p>💬 <strong>Message:</strong></p>
      <p style="font-style: italic; white-space: pre-wrap; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #fda4af;">${ticket.message}</p>
    </div>
    <p>Please address this ticket within 24 hours to ensure high satisfaction rates.</p>
  `;
  const html = getBrandedTemplate('New Help Ticket', content, 'Support Administrator');
  return sendEmail(
    process.env.EMAIL_FROM || 'admin@lmsacademy.com',
    `🚨 [LMS Ticket] ${ticket.subject} - From ${ticket.name}`,
    html
  );
};

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendMilestoneEmail,
  sendAnnouncementEmail,
  sendContactSupportEmail
};
