// backend/src/services/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

let transporter = null;
if (MAIL_USER && MAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: MAIL_USER, pass: MAIL_PASS }
  });
}

async function sendEligibilityEmail(to, scholarship) {
  if (!transporter) {
    console.warn('Mailer not configured; skipping email to', to);
    return;
  }
  const mailOptions = {
    from: MAIL_USER,
    to,
    subject: `You may be eligible: ${scholarship.title}`,
    text: `We found a scholarship that matches your profile: ${scholarship.title}\n\nApply here: ${scholarship.application_url}\n\nProvider: ${scholarship.provider}\n\nDescription: ${scholarship.description}`
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendEligibilityEmail };
