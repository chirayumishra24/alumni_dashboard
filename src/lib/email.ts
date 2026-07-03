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

We have received your registration details. We will reach out to you for email verification shortly.

${verificationLink ? `You can also verify your email address directly by clicking the link below:\n\n${verificationLink}\n\n` : ''}Once your email and credentials are verified, we will activate your profile and publish it live on the school website directory.

If you have any questions, please reply to this email or reach out to us at support@skillizee.io.

Warm regards,
CCGS Alumni Coordinator Team
support@skillizee.io`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <h2 style="color: #6b1d2f; margin-bottom: 20px; font-family: serif;">Verify Your Email Address</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for registering on the <strong>CCGS Alumni Hub</strong> portal for <strong>${school}</strong>!</p>
    <p>We have received your registration details. We will reach out to you for email verification shortly.</p>
    
    ${verificationLink ? `
    <p>You can also verify your email address directly by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #6b1d2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 0.9em; box-shadow: 0 4px 6px rgba(107, 29, 47, 0.15);">Verify Email Address</a>
    </div>
    <p style="font-size: 0.85em; color: #64748b; margin-bottom: 25px;">
      If the button does not work, copy and paste this link into your browser: <br/>
      <a href="${verificationLink}" style="color: #6b1d2f; word-break: break-all;">${verificationLink}</a>
    </p>
    ` : ''}
    
    <p>Once approved, your details will go live on the school platform directory.</p>
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

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMentorshipDate(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function mentorshipEmailLayout({
  title,
  intro,
  detailsHtml,
  meetingUrl,
  footer,
}: {
  title: string;
  intro: string;
  detailsHtml: string;
  meetingUrl: string;
  footer: string;
}) {
  const safeUrl = escapeHtml(meetingUrl);
  return `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <h2 style="color: #6b1d2f; margin-bottom: 20px; font-family: serif; border-bottom: 2px solid #6b1d2f; padding-bottom: 10px;">${escapeHtml(title)}</h2>
    <p>${escapeHtml(intro)}</p>
    <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #6b1d2f; border-radius: 6px; margin: 20px 0;">
      ${detailsHtml}
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeUrl}" style="background-color: #6b1d2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 0.9em; box-shadow: 0 4px 6px rgba(107, 29, 47, 0.15);">Join Meeting</a>
    </div>
    <p style="font-size: 0.85em; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
      If the button does not work, copy and paste this link into your browser:<br/>
      <a href="${safeUrl}" style="color: #6b1d2f; word-break: break-all;">${safeUrl}</a>
    </p>
    <p style="font-size: 0.9em; color: #475569; line-height: 1.6;">${escapeHtml(footer)}</p>
    <p style="margin-top: 20px; font-size: 0.9em; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">
      Warm regards,<br/>
      <strong>CCGS Alumni Coordinator Team</strong><br/>
      <a href="mailto:support@skillizee.io" style="color: #64748b; text-decoration: none;">support@skillizee.io</a>
    </p>
  </div>`;
}

export async function sendMentorScheduledEmail({
  toEmail,
  mentorName,
  studentName,
  studentBatch,
  studentProgram,
  scheduledAt,
  meetingUrl,
  meetingPlatform,
  notes,
}: {
  toEmail: string;
  mentorName: string;
  studentName: string;
  studentBatch: number | string;
  studentProgram: string;
  scheduledAt: string;
  meetingUrl: string;
  meetingPlatform: string;
  notes?: string | null;
}) {
  const formattedDate = formatMentorshipDate(scheduledAt);
  const subject = `CCGS Mentorship: Call scheduled with ${studentName}`;
  const text = `Dear ${mentorName},

Your CCGS mentorship call has been scheduled.

Student: ${studentName}
Program: ${studentProgram}
Expected Batch: ${studentBatch}
Date & Time: ${formattedDate}
Platform: ${meetingPlatform}
Meeting Link: ${meetingUrl}
${notes ? `Student note: ${notes}\n` : ''}
Thank you for supporting the CCGS student community.

Warm regards,
CCGS Alumni Coordinator Team`;

  const detailsHtml = `
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Student:</strong> ${escapeHtml(studentName)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Program:</strong> ${escapeHtml(studentProgram)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Expected Batch:</strong> ${escapeHtml(studentBatch)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Date & Time:</strong> ${escapeHtml(formattedDate)}</p>
      <p style="margin: 0; color: #334155;"><strong>Platform:</strong> ${escapeHtml(meetingPlatform)}</p>
      ${notes ? `<p style="margin: 14px 0 0 0; color: #475569; line-height: 1.5;"><strong>Student note:</strong> ${escapeHtml(notes)}</p>` : ''}`;

  const html = mentorshipEmailLayout({
    title: 'Mentorship Call Scheduled',
    intro: `Dear ${mentorName}, your mentorship call with ${studentName} has been scheduled.`,
    detailsHtml,
    meetingUrl,
    footer: 'Thank you for helping a current student learn from your experience.',
  });

  return sendEmail({ to: toEmail, subject, text, html });
}

export async function sendStudentScheduledEmail({
  toEmail,
  studentName,
  mentorName,
  mentorCompany,
  mentorRole,
  mentorBatch,
  scheduledAt,
  meetingUrl,
  meetingPlatform,
}: {
  toEmail: string;
  studentName: string;
  mentorName: string;
  mentorCompany?: string | null;
  mentorRole?: string | null;
  mentorBatch: number | string;
  scheduledAt: string;
  meetingUrl: string;
  meetingPlatform: string;
}) {
  const formattedDate = formatMentorshipDate(scheduledAt);
  const company = mentorCompany || 'their organization';
  const role = mentorRole || 'Alumnus';
  const subject = `CCGS Mentorship: Call scheduled with ${mentorName} (${company})`;
  const text = `Dear ${studentName},

Your CCGS mentorship call has been scheduled.

Mentor: ${mentorName}
Role: ${role}
Company: ${company}
Batch: ${mentorBatch}
Date & Time: ${formattedDate}
Platform: ${meetingPlatform}
Meeting Link: ${meetingUrl}

Please prepare a few focused questions before the call.

Warm regards,
CCGS Alumni Coordinator Team`;

  const detailsHtml = `
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Mentor:</strong> ${escapeHtml(mentorName)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Batch:</strong> ${escapeHtml(mentorBatch)}</p>
      <p style="margin: 0 0 8px 0; color: #334155;"><strong>Date & Time:</strong> ${escapeHtml(formattedDate)}</p>
      <p style="margin: 0; color: #334155;"><strong>Platform:</strong> ${escapeHtml(meetingPlatform)}</p>`;

  const html = mentorshipEmailLayout({
    title: 'Mentorship Call Scheduled',
    intro: `Dear ${studentName}, your call with ${mentorName} has been scheduled.`,
    detailsHtml,
    meetingUrl,
    footer: 'Please prepare a few focused questions so the conversation is useful and respectful of the mentor time.',
  });

  return sendEmail({ to: toEmail, subject, text, html });
}

export async function sendEventInvitationEmail({
  toEmail,
  name,
  eventTitle,
  eventDescription,
  eventDate,
  eventLocation,
  acceptUrl,
  declineUrl,
}: {
  toEmail: string;
  name: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  acceptUrl: string;
  declineUrl: string;
}) {
  const formattedDate = new Date(eventDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Invitation: ${eventTitle} - CCGS Alumni Event`;
  const text = `Dear ${name},

You are cordially invited to the upcoming CCGS Alumni Event:

Title: ${eventTitle}
Date & Time: ${formattedDate}
Location: ${eventLocation}

Description:
${eventDescription}

To respond, please use the links below:
Accept: ${acceptUrl}
Decline: ${declineUrl}

Warm regards,
CCGS Alumni Coordinator Team`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <h2 style="color: #6b1d2f; margin-bottom: 20px; font-family: serif; border-bottom: 2px solid #6b1d2f; padding-bottom: 10px;">Event Invitation</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>You are cordially invited to the upcoming <strong>CCGS Alumni Network</strong> event:</p>

    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #6b1d2f; border-radius: 4px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e293b;">${eventTitle}</h3>
      <p style="margin: 5px 0; font-size: 0.9em; color: #475569;"><strong>Date & Time:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0; font-size: 0.9em; color: #475569;"><strong>Location:</strong> ${eventLocation}</p>
      <p style="margin: 15px 0 0 0; font-size: 0.9em; color: #334155; line-height: 1.5; white-space: pre-wrap;">${eventDescription}</p>
    </div>

    <p>Please RSVP by clicking one of the buttons below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 0.9em; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15); margin-right: 15px;">✓ Accept Invitation</a>
      <a href="${declineUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 0.9em; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.15);">✗ Decline Invitation</a>
    </div>

    <p style="font-size: 0.85em; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
      If the buttons do not work, you can copy and paste these links into your browser:<br/>
      <strong>Accept:</strong> <a href="${acceptUrl}" style="color: #10b981; word-break: break-all;">${acceptUrl}</a><br/>
      <strong>Decline:</strong> <a href="${declineUrl}" style="color: #ef4444; word-break: break-all;">${declineUrl}</a>
    </p>

    <br/>
    <p style="margin-top: 20px; font-size: 0.9em; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">
      Warm regards,<br/>
      <strong>CCGS Alumni Coordinator Team</strong><br/>
      <a href="mailto:support@skillizee.io" style="color: #64748b; text-decoration: none;">support@skillizee.io</a>
    </p>
  </div>`;

  return sendEmail({ to: toEmail, subject, text, html });
}
