// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter only if email config is present
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Email transporter initialized');
} else {
  console.warn('Email credentials not set – reminders will be disabled');
}

const sendReminderEmail = async (to, applications) => {
  if (!transporter) {
    console.warn('Email transporter not available, skipping send');
    return;
  }
  if (!to || applications.length === 0) return;

  try {
    const subject = 'Upcoming Interview/Event Reminder';
    const html = `
      <h1>Upcoming Events</h1>
      <p>You have the following events scheduled for tomorrow:</p>
      <ul>
        ${applications.map(app => `<li><strong>${app.company}</strong> – ${app.position} – Next Event: ${new Date(app.nextEventDate).toLocaleDateString()}</li>`).join('')}
      </ul>
      <p>Good luck!</p>
    `;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Reminder email sent to ${to}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

module.exports = { sendReminderEmail };