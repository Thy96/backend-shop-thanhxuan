import * as nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_APP_ADMIN,
      pass: process.env.MAIL_APP_PASS,
    },
  });
}

// ⭐ gửi mail reset password
export async function sendResetPasswordMail(to: string, resetLink: string) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Support" <${process.env.MAIL_APP_ADMIN}>`,
    to,
    subject: 'Thay Đổi Mật Khẩu',
    html: `
      <p>Click vào link để đổi mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
}

// ⭐ gửi mail verify email
export async function sendVerifyEmailMail(to: string, verifyLink: string) {
  const mailUser = process.env.MAIL_APP_ADMIN;
  const mailPass = process.env.MAIL_APP_PASS;

  console.log('[sendVerifyEmailMail] MAIL_APP_ADMIN:', mailUser ? mailUser : 'UNDEFINED');
  console.log('[sendVerifyEmailMail] MAIL_APP_PASS:', mailPass ? '***set***' : 'UNDEFINED');
  console.log('[sendVerifyEmailMail] sending to:', to);

  if (!mailUser || !mailPass) {
    throw new Error('MAIL_APP_ADMIN hoặc MAIL_APP_PASS chưa được cấu hình');
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Support" <${mailUser}>`,
    to,
    subject: 'Xác thực email',
    html: `
      <h2>Xác thực tài khoản</h2>
      <p>Nhấn vào link bên dưới để xác thực email:</p>
      <a href="${verifyLink}">${verifyLink}</a>
    `,
  });
  console.log('[sendVerifyEmailMail] sent successfully to:', to);
}