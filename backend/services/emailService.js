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

  // Verify connection and credentials on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('[Email Service] Transporter verification failed:', error);
      // Provide a helpful hint for Gmail users
      if (error.response && error.response.includes('Username and Password not accepted') &&
          process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail.com')) {
        console.error(
          '[Email Service] ⚠️ Gmail rejected the login. Please use an "App Password" instead of your regular password.\n' +
          '   Generate one at: https://myaccount.google.com/apppasswords\n' +
          '   Then set EMAIL_PASS to that 16-character password.'
        );
      }
    } else {
      console.log('[Email Service] Transporter is ready to send emails');
    }
  });

  console.log('[Email Service] Email transporter initialized');
} else {
  console.warn('[Email Service] Email credentials not set – reminders will be disabled');
}

const sendReminderEmail = async (to, applications) => {
  if (!transporter) {
    console.warn('[Email Service] Transporter not available, skipping send');
    return;
  }
  if (!to || applications.length === 0) {
    console.warn('[Email Service] No recipient or applications, skipping');
    return;
  }

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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Reminder email sent to ${to} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error('[Email Service] Error sending reminder email:', error);
    if (error.response) {
      console.error('[Email Service] SMTP response:', error.response);
    }
    if (error.code) {
      console.error('[Email Service] Error code:', error.code);
    }
    // Provide a helpful hint for Gmail users
    if (error.code === 'EAUTH' && 
        error.response && error.response.includes('Username and Password not accepted') &&
        process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail.com')) {
      console.error(
        '[Email Service] ⚠️ Gmail rejected the login. Please use an "App Password" instead of your regular password.\n' +
        '   Generate one at: https://myaccount.google.com/apppasswords\n' +
        '   Then set EMAIL_PASS to that 16-character password.'
      );
    }
  }
};

module.exports = { sendReminderEmail };