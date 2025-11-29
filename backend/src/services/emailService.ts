import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'nhuthoas04@gmail.com'
} = process.env;

let transporter: any;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
} else {
  console.warn('[emailService] SMTP environment variables are not fully configured. Emails will be logged to console.');
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  if (!to) throw new Error('Missing "to" field for email');
  if (!subject) throw new Error('Missing "subject" field for email');
  
  const payload = {
    from: SMTP_FROM,
    to,
    subject,
    html,
    text
  };

  if (!transporter) {
    console.log('[emailService] Preview email payload:', payload);
    return;
  }

  await transporter.sendMail(payload);
}

export async function sendResetPasswordEmail(toEmail: string, displayName: string, code: string) {
  const safeName = displayName || 'bạn';
  const subject = 'Đặt lại mật khẩu - Bếp Nhà';
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
      <h2>Xin chào ${safeName},</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Bếp Nhà.</p>
      <p>Mã xác thực của bạn là:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#e53e3e">${code}</p>
      <p>Mã này sẽ hết hạn sau <strong>1 phút</strong>.</p>
      <p><strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
      <p>Trân trọng,<br/>Đội ngũ Bếp Nhà</p>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject,
    html,
    text: `Mã xác thực đặt lại mật khẩu của bạn là ${code}. Mã hết hạn sau 1 phút.`
  });
}
