// backend/cron/reminderJob.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const { sendReminderEmail } = require('../services/emailService');

const startReminderJob = () => {
  // Only schedule if email transporter is available (checked inside sendReminderEmail)
  cron.schedule('* * * * *', async () => {
    console.log('[Reminder Job] Running...');
    try {
      const users = await User.find();
      for (const user of users) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfDay = new Date(tomorrow);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(tomorrow);
        endOfDay.setHours(23, 59, 59, 999);

        const applications = await Application.find({
          userId: user._id,
          nextEventDate: { $gte: startOfDay, $lte: endOfDay },
        });

        if (applications.length > 0) {
          await sendReminderEmail(user.email, applications);
        }
      }
    } catch (error) {
      console.error('[Reminder Job] Error:', error);
    }
  });
  console.log('[Reminder Job] Scheduled to run daily at 09:00');
};

module.exports = { startReminderJob };