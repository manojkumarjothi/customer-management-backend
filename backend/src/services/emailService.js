/**
 * Email service - send transactional emails using Nodemailer config.
 */

const { getTransporter } = require('../config/mail');
const logger = require('../utils/logger');

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@company.com';

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();
  try {
    await transport.sendMail({
      from: FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      html,
    });
    return true;
  } catch (err) {
    logger.error('Email send error:', err);
    throw err;
  }
}

async function sendPasswordResetEmail(to, resetLink) {
  return sendEmail({
    to,
    subject: 'Password Reset - Employee Management',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>Link expires in ${process.env.PASSWORD_RESET_EXPIRY || 30} minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
}

async function sendWelcomeEmail(to, name, tempPassword) {
  return sendEmail({
    to,
    subject: 'Welcome - Employee Management',
    html: `
      <p>Hi ${name},</p>
      <p>Your account has been created. Please login and change your password.</p>
      <p>Email: ${to}</p>
      <p>Temporary password: ${tempPassword}</p>
    `,
  });
}

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };
