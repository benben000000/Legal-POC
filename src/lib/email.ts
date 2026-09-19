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

function generateInvitationHtml(params: SendInvitationParams): string {
  const { to, role, inviteLink, expiresAt, invitedByName } = params;
  const roleLabel = getRoleLabel(role);
  const entitlements = getRoleEntitlements(role);
  const formattedExpiry = formatExpiration(expiresAt);
  const inviter = invitedByName || 'Atty. Benedict Garcia (Managing Partner)';
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Official Firm Invitation • Garcia Law Offices</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  
  <!-- Inbox Snippet Preview Text -->
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Official invitation from ${inviter} to join Garcia Law Offices as ${roleLabel}. Access active case matters, deadlines, and docket pipeline.
  </div>

  <!-- Main Outer Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 36px 12px 48px 12px;">
    <tr>
      <td align="center">
        
        <!-- Email Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Top Accent Trim -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);"></td>
          </tr>

          <!-- Executive Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Monogram Emblem -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" width="44" height="44" style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #60a5fa; font-size: 18px; font-weight: 700; letter-spacing: 1px;">
                          GLO
                        </td>
                        <td style="padding-left: 16px;">
                          <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 1.2px; color: #ffffff; text-transform: uppercase;">
                            GARCIA LAW OFFICES
                          </h1>
                          <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 500; letter-spacing: 0.8px; color: #94a3b8; text-transform: uppercase;">
                            Makati & Pasig Chambers • Republic of the Philippines
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(37, 99, 235, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #93c5fd; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Practice Cloud
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              
              <!-- Greeting & Invitation Memo -->
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                Official Workspace Invitation
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Dear Colleague,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                You have been formally invited by <strong>${inviter}</strong> to join the firm's central practice platform. Your profile has been pre-configured with the following official assignment:
              </p>

              <!-- Assignment Credentials Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="35%" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">
                          Invited Email
                        </td>
                        <td width="65%" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">
                          ${to}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">
                          Designation
                        </td>
                        <td style="padding-bottom: 8px;">
                          <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                            ${roleLabel}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px;">
                          Authorized By
                        </td>
                        <td style="font-size: 13px; font-weight: 500; color: #334155; padding-bottom: 8px;">
                          ${inviter}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                          Access Scope
                        </td>
                        <td style="font-size: 12px; font-weight: 400; color: #475569; line-height: 1.4;">
                          ${entitlements}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #2563eb; border-radius: 6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                          <a href="${inviteLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 600; color: #ffffff !important; text-decoration: none; letter-spacing: 0.3px;">
                            Accept Invitation & Set Up Account &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 48-Hour Expiration Warning Banner -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 700; color: #92400e; padding-bottom: 3px;">
                          Strict 48-Hour Security Expiration Notice
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #b45309; line-height: 1.5;">
                          In accordance with Philippine Bar and firm data protection policies, this activation link will permanently expire on <strong>${formattedExpiry}</strong>. Expired links are automatically revoked and cannot be renewed without re-authorization from the Managing Partner.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Onboarding Roadmap -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #0f172a; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Quick Setup Steps
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #475569; line-height: 1.6;">
                    <strong>1.</strong> Click the activation button above to open the secure registration portal.<br/>
                    <strong>2.</strong> Confirm your legal name and establish a password meeting enterprise criteria.<br/>
                    <strong>3.</strong> Enter the firm dashboard to immediately access your assigned matters and cogwheel task board.
                  </td>
                </tr>
              </table>

              <!-- Plain Text Fallback Link -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px dashed #e2e8f0; padding-top: 18px;">
                <tr>
                  <td style="font-size: 11px; color: #64748b; padding-bottom: 6px;">
                    Button not working? Copy and paste this exact link directly into your browser:
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #334155; word-break: break-all;">
                    <a href="${inviteLink}" style="color: #2563eb; text-decoration: none;">${inviteLink}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Legal & Privacy Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: left;">
              <p style="margin: 0 0 10px 0; font-size: 10px; line-height: 1.5; color: #64748b; font-weight: 500;">
                <strong>ATTORNEY-CLIENT PRIVILEGE & CONFIDENTIALITY NOTICE:</strong> This electronic transmission contains confidential and legally privileged information intended solely for the designated recipient. If you received this transmission in error, please immediately notify the sender by reply and delete this email without copying, distributing, or disclosing its contents.
              </p>
              <p style="margin: 0; font-size: 10px; line-height: 1.5; color: #94a3b8;">
                © ${currentYear} Garcia Law Offices. Makati Chambers: Ayala Avenue, Makati City • Pasig Chambers: Ortigas Center, Pasig City.<br/>
                Practice Cloud v2.0 • Fully compliant with Republic Act No. 10173 (Philippine Data Privacy Act of 2012).
              </p>
            </td>
          </tr>

        </table>
        <!-- End Email Container Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export async function sendInvitationEmail(params: SendInvitationParams): Promise<EmailResult> {
  const { to, role, inviteLink, expiresAt } = params;
  const roleLabel = getRoleLabel(role);
  const subject = `Official Invitation: Join Garcia Law Offices as ${roleLabel}`;
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
