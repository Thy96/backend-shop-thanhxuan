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
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Support" <${process.env.MAIL_APP_ADMIN}>`,
    to,
    subject: 'Xác thực email',
    html: `
      <h2>Xác thực tài khoản</h2>
      <p>Nhấn vào link bên dưới để xác thực email:</p>
      <a href="${verifyLink}">${verifyLink}</a>
    `,
  });
}