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

function getRoleEntitlements(role: string): string {
  switch (role) {
    case 'ASSOCIATE':
      return 'Active Litigation Matters, Judicial Affidavits, Drafting & Court Pleadings, Firm Deadlines';
    case 'STAFF':
      return 'Case Docketing, Service of Summons, Court Filing Disbursements, Document Repository';
    case 'LEAD_ATTORNEY':
      return 'Full Practice Management, Retainers, Financial Accounting, Team & Audit Logs';
    default:
      return 'Firm Matters, Tasks, Case Binders, Calendar Deadlines';
  }
}

function formatExpiration(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(date);
}

function generateInvitationText(params: SendInvitationParams): string {
  const { to, role, inviteLink, expiresAt, invitedByName } = params;
  const roleLabel = getRoleLabel(role);
  const entitlements = getRoleEntitlements(role);
  const formattedExpiry = formatExpiration(expiresAt);
  const inviter = invitedByName || 'Atty. Benedict Garcia (Managing Partner)';
  const currentYear = new Date().getFullYear();

  return `GARCIA LAW OFFICES
Makati & Pasig Chambers • Republic of the Philippines

OFFICIAL WORKSPACE INVITATION

Dear Colleague,

You have been formally invited by ${inviter} to join the firm's central practice platform. Your profile has been pre-configured with the following official assignment:

- Invited Email: ${to}
- Designation: ${roleLabel}
- Authorized By: ${inviter}
- Access Scope: ${entitlements}

To activate your account and establish your credentials, navigate to the secure link below:
${inviteLink}

STRICT 48-HOUR SECURITY EXPIRATION NOTICE:
In accordance with Philippine Bar regulations and firm data protection policies, this activation link will permanently expire on ${formattedExpiry}. Expired links are automatically revoked and cannot be renewed without re-authorization from the Managing Partner.

QUICK SETUP STEPS:
1. Open the activation link above in your browser.
2. Confirm your legal name and establish an enterprise-grade password (minimum 12 characters, uppercase, lowercase, number, special character).
3. Access the firm dashboard to immediately review your assigned matters and docket schedule.

---
ATTORNEY-CLIENT PRIVILEGE & CONFIDENTIALITY NOTICE:
This electronic transmission contains confidential and legally privileged information intended solely for the designated recipient. If you received this transmission in error, please immediately notify the sender by reply and delete this email without copying, distributing, or disclosing its contents.

© ${currentYear} Garcia Law Offices. Makati Chambers: Ayala Avenue, Makati City • Pasig Chambers: Ortigas Center, Pasig City.
Practice Management System • Fully compliant with Republic Act No. 10173 (Philippine Data Privacy Act of 2012).
`;
}

function generateInvitationHtml(params: SendInvitationParams): string {
  const { to, role, inviteLink, expiresAt, invitedByName } = params;
  const roleLabel = getRoleLabel(role);
  const entitlements = getRoleEntitlements(role);
  const formattedExpiry = formatExpiration(expiresAt);
  const inviter = invitedByName || 'Atty. Benedict Garcia (Managing Partner)';
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Official Firm Invitation • Garcia Law Offices</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111827;">
  
  <!-- Outer Table Container -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; padding: 32px 12px 48px 12px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Card: Strictly <= 4px radius, no box shadow, solid border -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
          
          <!-- Solid Primary Accent Bar (No Gradients) -->
          <tr>
            <td height="3" style="background-color: #2563eb; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>

          <!-- Header: Deep Slate Surface with Minimal Monogram -->
          <tr>
            <td style="background-color: #111827; padding: 24px 28px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" width="36" height="36" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 2px; color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">
                          GLO
                        </td>
                        <td style="padding-left: 14px;">
                          <h1 style="margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; color: #ffffff; text-transform: uppercase;">
                            GARCIA LAW OFFICES
                          </h1>
                          <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 400; color: #9ca3af;">
                            Makati & Pasig Chambers • Republic of the Philippines
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; border: 1px solid #374151; border-radius: 2px; color: #9ca3af; font-size: 10px; font-weight: 500; padding: 2px 6px; letter-spacing: 0.5px; text-transform: uppercase;">
                      PRACTICE MANAGEMENT
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.2px;">
                Official Workspace Invitation
              </h2>
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                Dear Colleague,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                You have been formally invited by <strong style="color: #111827;">${inviter}</strong> to join the firm's central practice platform. Your profile has been pre-configured with the following official assignment:
              </p>

              <!-- Assignment Table: Minimal Borders, No Glowing Pills -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 2px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32%" style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                          Invited Email
                        </td>
                        <td width="68%" style="font-size: 13px; font-weight: 500; color: #111827; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                          ${to}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                          Designation
                        </td>
                        <td style="padding-top: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #111827;">
                          ${roleLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                          Authorized By
                        </td>
                        <td style="font-size: 13px; font-weight: 500; color: #111827; padding-top: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                          ${inviter}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 10px;">
                          Access Scope
                        </td>
                        <td style="font-size: 12px; font-weight: 400; color: #4b5563; line-height: 1.4; padding-top: 10px;">
                          ${entitlements}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button: Professional, Flat, Border Radius 2px, No Drop Shadow -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #2563eb; border: 1px solid #1d4ed8; border-radius: 2px;">
                          <a href="${inviteLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 30px; font-size: 14px; font-weight: 600; color: #ffffff !important; text-decoration: none; letter-spacing: 0.2px;">
                            Accept Invitation & Set Up Account
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 48-Hour Security Expiration Callout: Flat, Left Accent Border, No Shadows -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 3px solid #d97706; border-radius: 2px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; color: #92400e; padding-bottom: 3px;">
                          Strict 48-Hour Security Expiration Notice
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #78350f; line-height: 1.5;">
                          In accordance with Philippine Bar regulations and firm data protection policies, this activation link will permanently expire on <strong>${formattedExpiry}</strong>. Expired links are automatically revoked and cannot be renewed without re-authorization from the Managing Partner.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Setup Steps -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 11px; font-weight: 600; color: #111827; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Quick Setup Steps
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #4b5563; line-height: 1.6;">
                    1. Click the activation button above to open the secure registration portal.<br/>
                    2. Confirm your legal name and establish a password meeting enterprise security requirements.<br/>
                    3. Enter the firm dashboard to immediately access your assigned matters and docket schedule.
                  </td>
                </tr>
              </table>

              <!-- Fallback Link: Verifiable Direct Link -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <tr>
                  <td style="font-size: 11px; color: #6b7280; padding-bottom: 6px;">
                    Button not working? Copy and paste this exact link directly into your browser:
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 2px; padding: 8px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; word-break: break-all;">
                    <a href="${inviteLink}" style="color: #2563eb; text-decoration: underline;">${inviteLink}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Legal & Privacy Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 28px; text-align: left;">
              <p style="margin: 0 0 8px 0; font-size: 10px; line-height: 1.5; color: #6b7280;">
                <strong>ATTORNEY-CLIENT PRIVILEGE & CONFIDENTIALITY NOTICE:</strong> This electronic transmission contains confidential and legally privileged information intended solely for the designated recipient. If you received this transmission in error, please immediately notify the sender by reply and delete this email without copying, distributing, or disclosing its contents.
              </p>
              <p style="margin: 0; font-size: 10px; line-height: 1.5; color: #94a3b8;">
                © ${currentYear} Garcia Law Offices. Makati Chambers: Ayala Avenue, Makati City • Pasig Chambers: Ortigas Center, Pasig City.<br/>
                Practice Management System • Fully compliant with Republic Act No. 10173 (Philippine Data Privacy Act of 2012).
              </p>
            </td>
          </tr>

        </table>
        <!-- End Email Container Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendInvitationEmail(params: SendInvitationParams): Promise<EmailResult> {
  const { to, role, inviteLink, expiresAt } = params;
  const roleLabel = getRoleLabel(role);
  const subject = `Official Invitation: Join Garcia Law Offices as ${roleLabel}`;
  const html = generateInvitationHtml(params);
  const text = generateInvitationText(params);

  // RFC Headers to ensure delivery to primary inbox and high priority / importance marking
  const emailHeaders = {
    'X-Priority': '1',
    'X-MSMail-Priority': 'High',
    'Importance': 'high',
    'Priority': 'urgent',
  };

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
          text,
          headers: emailHeaders,
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
        text,
        html,
        priority: 'high',
        headers: emailHeaders,
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
  console.log('----------------------------------------------------');
  console.log('[Email Service] INVITATION DISPATCHED (DEVELOPMENT PREVIEW)');
  console.log(`To: ${to}`);
  console.log(`Role: ${roleLabel}`);
  console.log(`Subject: ${subject}`);
  console.log(`Link: ${inviteLink}`);
  console.log(`Expires: ${formatExpiration(expiresAt)}`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    delivered: false,
    provider: 'preview',
    message: `Invitation generated! To deliver automated emails, configure RESEND_API_KEY or SMTP in your environment variables.`,
  };
}

