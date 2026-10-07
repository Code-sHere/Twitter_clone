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

export const sendPasswordEmail = async ({
  email,
  name,
  newPassword,
}) => {
  const html = `
        <h2>New Password Generated 🔐</h2>

        <p>Hello ${name || "there"},</p>

        <p>Your new password is:</p>

        <div style="
            background:#f1f1f1;
            padding:15px;
            border-radius:6px;
            font-size:18px;
            font-weight:bold;
        ">
            ${newPassword}
        </div>

        <p>
            Please login using this password and change it
            immediately from your profile/settings.
        </p>

        <p>
            Regards,<br>
            <strong>Twiller Team</strong>
        </p>
    `;

  return await sendEmail(
    email,
    `New Password - ${name || "User"}`,
    html
  );
};