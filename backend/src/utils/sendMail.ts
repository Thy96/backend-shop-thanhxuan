async function brevoSend(to: string, subject: string, htmlContent: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY chưa được cấu hình');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Support', email: 'caodinhthy1996@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${JSON.stringify(err)}`);
  }
}

// ⭐ gửi mail reset password
export async function sendResetPasswordMail(to: string, resetLink: string) {
  await brevoSend(
    to,
    'Thay Đổi Mật Khẩu',
    `<p>Click vào link để đổi mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`,
  );
}

// ⭐ gửi mail verify email
export async function sendVerifyEmailMail(to: string, verifyLink: string) {
  await brevoSend(
    to,
    'Xác thực email',
    `<h2>Xác thực tài khoản</h2><p>Nhấn vào link bên dưới để xác thực email:</p><a href="${verifyLink}">${verifyLink}</a>`,
  );
}