import "dotenv/config";

export async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    throw new Error('BREVO_API_KEY ya SENDER_EMAIL env variable set nahi hai');
  }


  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Twitter Clone', email: process.env.SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
    return await res.json(); // { messageId: '...' }
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Ready-made email templates ----------

const wrap = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px">
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <p style="color:#888;font-size:12px">Twitter Clone (demo project)</p>
  </div>`;

export const otpEmail = (otp) => ({
  subject: 'Your OTP code',
  html: wrap(`<h2>Verification code</h2>
    <p style="font-size:28px;letter-spacing:6px"><b>${otp}</b></p>
    <p>Ye code 10 minute tak valid hai. Kisi ko share mat karo.</p>`),
});

export const subscriptionEmail = (plan) => ({
  subject: `Your ${plan} plan is active`,
  html: wrap(`<h2>Thanks for subscribing!</h2>
    <p>Aapka <b>${plan}</b> plan ab active hai.</p>`),
});

export const loginEmail = (name) => ({
  subject: 'New login to your account',
  html: wrap(`<h2>Hi ${name || 'there'}!</h2>
    <p>Aapke account mein abhi login hua hai. Agar ye aap nahi the, to password change kar lo.</p>`),
});


const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

export const sendPasswordEmail = async ({
  email,
  name,
  newPassword,
}) => {
  const safeName = escapeHtml(name || "there");
  const safePassword = escapeHtml(newPassword);

  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your password has been reset</title>
    </head>

    <body style="margin:0;padding:0;background:#f3f5f9;
      font-family:Arial,Helvetica,sans-serif;color:#182230;">

      <div style="display:none;max-height:0;overflow:hidden;">
        Your temporary password is ready. Sign in securely to your account.
      </div>

      <table role="presentation" width="100%" cellspacing="0"
        cellpadding="0" style="background:#f3f5f9;padding:32px 12px;">
        <tr>
          <td align="center">

            <table role="presentation" width="100%" cellspacing="0"
              cellpadding="0" style="max-width:560px;background:#ffffff;
              border-radius:16px;overflow:hidden;">

              <tr>
                <td style="background:#101827;padding:30px 32px;">
                  <p style="margin:0;color:#a7f3d0;font-size:13px;
                    font-weight:bold;letter-spacing:2px;">
                    TWITTER CLONE
                  </p>

                  <h1 style="margin:16px 0 8px;color:#ffffff;
                    font-size:27px;line-height:1.3;">
                    Your account, secured.
                  </h1>

                  <p style="margin:0;color:#cbd5e1;font-size:14px;
                    line-height:1.7;">
                    Your temporary password is ready.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px;">

                  <p style="font-size:16px;line-height:1.7;margin:0 0 12px;">
                    Hi ${safeName},
                  </p>

                  <p style="font-size:14px;line-height:1.8;color:#526071;
                    margin:0 0 24px;">
                    We received a request to reset your password.
                    Use the temporary password below to sign in to your account.
                  </p>

                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;
                    border-radius:12px;padding:22px 16px;text-align:center;">

                    <p style="margin:0 0 12px;color:#166534;
                      font-size:12px;font-weight:bold;letter-spacing:1px;">
                      YOUR TEMPORARY PASSWORD
                    </p>

                    <p style="margin:0;color:#14532d;font-size:20px;
                      line-height:1.6;font-weight:bold;overflow-wrap:anywhere;">
                      ${safePassword}
                    </p>
                  </div>

                  <div style="margin-top:24px;padding:16px;
                    background:#fff7ed;border-radius:10px;">
                    <p style="margin:0 0 8px;color:#9a3412;
                      font-size:14px;font-weight:bold;">
                      Important security reminder
                    </p>

                    <p style="margin:0;color:#7c5140;font-size:13px;
                      line-height:1.8;">
                      Sign in and change this password as soon as possible.
                      Never share it with anyone. If you did not request
                      this reset, contact support and secure your account.
                    </p>
                  </div>

                  <p style="margin:28px 0 0;color:#526071;font-size:14px;
                    line-height:1.8;">
                    Stay safe,<br>
                    <strong style="color:#182230;">The Twiller Team</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background:#f8fafc;padding:20px 32px;
                  border-top:1px solid #e8edf3;">
                  <p style="margin:0;color:#8792a2;font-size:11px;
                    line-height:1.8;text-align:center;">
                    This is an automated security email. Please do not
                    reply to this message.<br>
                    © ${new Date().getFullYear()} Twitter Clone · Demo project
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return sendEmail(
    email,
    "Your temporary password | Twitter Clone",
    html
  );
};
