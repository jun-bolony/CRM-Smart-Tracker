// backend/cron/reminderJob.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const { sendReminderEmail } = require('../services/emailService');

const startReminderJob = () => {
  // Schedule job – for testing, you may change the cron expression
  cron.schedule('0 9 * * *', async () => {
    console.log('[Reminder Job] Running...');
    try {
      const users = await User.find();
      console.log(`[Reminder Job] Found ${users.length} users`);

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
          console.log(`[Reminder Job] User ${user.email} has ${applications.length} events tomorrow`);
          await sendReminderEmail(user.email, applications);
        } else {
          console.log(`[Reminder Job] User ${user.email} has no events tomorrow`);
        }
      }
    } catch (error) {
      console.error('[Reminder Job] Error:', error);
    }
  });
  console.log('[Reminder Job] Scheduled to run daily at 09:00');
};

module.exports = { startReminderJob };