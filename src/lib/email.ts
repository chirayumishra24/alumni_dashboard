import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || 'CCGS Alumni Hub <support@skillizee.io>';

let transporter: nodemailer.Transporter | null = null;

// Only initialize nodemailer if SMTP credentials are provided
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
  console.log('Nodemailer SMTP transporter initialized successfully.');
} else {
  console.warn('Nodemailer SMTP environment variables are missing. Emails will be logged to console.');
}

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: MailOptions) {
  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email successfully sent to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('--- MOCK EMAIL SENDER ---');
      console.log(`To: ${to}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text}`);
      console.log('-------------------------');
      return { success: true, mock: true };
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, error };
  }
}

export async function sendRegistrationEmail(toEmail: string, name: string, school: string, verificationLink?: string) {
  const subject = `Welcome to the CCGS Alumni Hub - Verify Your Email`;
  const text = `Dear ${name},

Thank you for registering on the CCGS Alumni Hub portal for ${school}!

${verificationLink ? `To complete your registration, please verify your email address by clicking the link below:\n\n${verificationLink}\n\n` : ''}We have received your registration details. A mentor or coordinator will review your profile shortly after your email is verified. Once your email and credentials are verified, we will activate your profile and publish it live on the school website directory.

If you have any questions, please reply to this email or reach out to us at support@skillizee.io.

Warm regards,
CCGS Alumni Coordinator Team
support@skillizee.io`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <h2 style="color: #6b1d2f; margin-bottom: 20px; font-family: serif;">Verify Your Email Address</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for registering on the <strong>CCGS Alumni Hub</strong> portal for <strong>${school}</strong>!</p>
    
    ${verificationLink ? `
    <p>Please click the button below to verify your email address and submit your profile for admin review:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #6b1d2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 0.9em; box-shadow: 0 4px 6px rgba(107, 29, 47, 0.15);">Verify Email Address</a>
    </div>
    <p style="font-size: 0.85em; color: #64748b; margin-bottom: 25px;">
      If the button does not work, copy and paste this link into your browser: <br/>
      <a href="${verificationLink}" style="color: #6b1d2f; word-break: break-all;">${verificationLink}</a>
    </p>
    ` : ''}
    
    <p>After verification, a school coordinator will review your profile. Once approved, your details will go live on the school platform directory.</p>
    <p>If you have any questions, please reply directly to this email or contact us at <a href="mailto:support@skillizee.io" style="color: #6b1d2f;">support@skillizee.io</a>.</p>
    <br/>
    <p style="margin-top: 20px; font-size: 0.9em; color: #64748b; border-t: 1px solid #f1f5f9; padding-top: 15px;">
      Warm regards,<br/>
      <strong>CCGS Alumni Coordinator Team</strong><br/>
      <a href="mailto:support@skillizee.io" style="color: #64748b; text-decoration: none;">support@skillizee.io</a>
    </p>
  </div>`;

  return sendEmail({ to: toEmail, subject, text, html });
}

export async function sendVerificationEmail(toEmail: string, name: string, school: string) {
  const subject = `Your CCGS Alumni Profile is Verified!`;
  const text = `Dear ${name},

Congratulations! Your CCGS Alumni Profile for ${school} has been verified by the coordinator.

Your profile has now been published live to the school website directory, and other students can connect with you for mentorship.

Thank you for support and contribution to the CCGS Alumni network!

Warm regards,
CCGS Alumni Coordinator Team
support@skillizee.io`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
    <h2 style="color: #10b981; margin-bottom: 20px;">Profile Verified!</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Congratulations! Your <strong>CCGS Alumni Profile</strong> for <strong>${school}</strong> has been verified by the coordinator.</p>
    <p>Your profile is now live on the school website directory, and other students can connect with you for career mentorship.</p>
    <p>Thank you for your support and active contribution to the CCGS Alumni network!</p>
    <br/>
    <p style="margin-top: 20px; font-size: 0.9em; color: #64748b;">
      Warm regards,<br/>
      <strong>CCGS Alumni Coordinator Team</strong><br/>
      <a href="mailto:support@skillizee.io" style="color: #64748b;">support@skillizee.io</a>
    </p>
  </div>`;

  return sendEmail({ to: toEmail, subject, text, html });
}
