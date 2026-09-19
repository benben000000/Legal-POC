import nodemailer from 'nodemailer';

export interface SendInvitationParams {
  to: string;
  role: string;
  inviteLink: string;
  expiresAt: Date;
  invitedByName?: string;
}

export interface EmailResult {
  success: boolean;
  delivered: boolean;
  provider: 'resend' | 'smtp' | 'preview';
  message?: string;
  error?: string;
  id?: string;
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'LEAD_ATTORNEY':
      return 'Lead Attorney / Managing Partner';
    case 'ASSOCIATE':
      return 'Associate Attorney';
    case 'STAFF':
      return 'Legal Staff / Paralegal';
    default:
      return role.replace(/_/g, ' ');
  }
}

function formatExpiration(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(date);
}

function generateInvitationHtml(params: SendInvitationParams): string {
  const { to, role, inviteLink, expiresAt, invitedByName } = params;
  const roleLabel = getRoleLabel(role);
  const formattedExpiry = formatExpiration(expiresAt);
  const inviter = invitedByName || 'Atty. Benedict Garcia (Managing Partner)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firm Workspace Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 32px 40px;
      text-align: left;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #ffffff;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .body-text {
      font-size: 14px;
      color: #334155;
      margin-bottom: 24px;
    }
    .role-badge {
      display: inline-block;
      background-color: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      margin: 0 4px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      letter-spacing: 0.3px;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .expiry-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 24px;
    }
    .expiry-title {
      font-size: 13px;
      font-weight: 700;
      color: #92400e;
      margin: 0 0 4px 0;
    }
    .expiry-desc {
      font-size: 12px;
      color: #b45309;
      margin: 0;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      background-color: #f1f5f9;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 40px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer p {
      margin: 0 0 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GARCIA LAW OFFICES</h1>
      <p>Legal Practice Management Cloud • Republic of the Philippines</p>
    </div>
    <div class="content">
      <div class="greeting">Official Invitation to Join Practice Workspace</div>
      <p class="body-text">
        Dear Colleague (${to}),
      </p>
      <p class="body-text">
        You have been formally invited by <strong>${inviter}</strong> to join the firm's central practice workspace on <strong>Legal Demo</strong> with the assigned role designation of:
      </p>
      <p style="text-align: center; margin: 20px 0;">
        <span class="role-badge">${roleLabel}</span>
      </p>
      <p class="body-text">
        Once registered, you will have synchronized access to firm matters, court pleadings, case binders, and docket deadlines assigned to your office.
      </p>

      <div class="cta-container">
        <a href="${inviteLink}" class="btn" target="_blank" rel="noopener noreferrer">
          Accept Invitation & Set Up Account
        </a>
      </div>

      <div class="expiry-box">
        <p class="expiry-title">Strict 48-Hour Expiration Notice</p>
        <p class="expiry-desc">
          In compliance with firm data protection guidelines, this secure invitation link will strictly expire on <strong>${formattedExpiry}</strong>. Expired links are automatically revoked and cannot be reused.
        </p>
      </div>

      <p class="body-text" style="font-size: 12px; color: #64748b;">
        If the button above does not open, copy and paste the following direct link into your web browser:
      </p>
      <div class="link-fallback">
        <a href="${inviteLink}" style="color: #2563eb; text-decoration: none;">${inviteLink}</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>CONFIDENTIALITY NOTICE:</strong> This electronic transmission contains confidential and legally privileged information intended solely for the designated recipient. If you are not the intended recipient, any disclosure, copying, distribution, or action taken in reliance on this communication is strictly prohibited.</p>
      <p>© ${new Date().getFullYear()} Garcia Law Offices. Makati & Pasig Chambers. All rights reserved. Compliant with RA 10173 (Philippine Data Privacy Act of 2012).</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendInvitationEmail(params: SendInvitationParams): Promise<EmailResult> {
  const { to, role, inviteLink, expiresAt } = params;
  const roleLabel = getRoleLabel(role);
  const subject = `Firm Workspace Invitation: Join Garcia Law Offices as ${roleLabel}`;
  const html = generateInvitationHtml(params);

  // 1. Check for Resend API Key (Priority 1: Recommended for Next.js / Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'Garcia Law Offices <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to dispatch email via Resend');
      }

      return {
        success: true,
        delivered: true,
        provider: 'resend',
        id: data.id,
        message: `Official invitation email delivered to ${to} via Resend.`,
      };
    } catch (error: any) {
      console.error('[Email Service] Resend dispatch error:', error.message || error);
      // Fall through to SMTP or preview if Resend fails
    }
  }

  // 2. Check for SMTP Configuration (Priority 2: Standard SMTP / Gmail / SendGrid / SES)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromEmail = process.env.SMTP_FROM || `Garcia Law Offices <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      return {
        success: true,
        delivered: true,
        provider: 'smtp',
        id: info.messageId,
        message: `Official invitation email delivered to ${to} via SMTP.`,
      };
    } catch (error: any) {
      console.error('[Email Service] SMTP dispatch error:', error.message || error);
    }
  }

  // 3. Fallback: Development Preview Mode
  // If neither Resend nor SMTP is configured, log details cleanly for development
  console.log('----------------------------------------------------');
  console.log('[Email Service] INVITATION DISPATCHED (DEVELOPMENT PREVIEW)');
  console.log(`To: ${to}`);
  console.log(`Role: ${roleLabel}`);
  console.log(`Subject: ${subject}`);
  console.log(`Link: ${inviteLink}`);
  console.log(`Expires: ${formatExpiration(expiresAt)}`);
  console.log('To send real emails in production, configure RESEND_API_KEY or SMTP credentials.');
  console.log('----------------------------------------------------');

  return {
    success: true,
    delivered: false,
    provider: 'preview',
    message: `Invitation generated! To deliver automated emails, configure RESEND_API_KEY or SMTP in your environment variables.`,
  };
}
