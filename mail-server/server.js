require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

let sendGrid = null;
let useSendGrid = false;
try {
  sendGrid = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    console.log('SendGrid configured');
  }
} catch (e) {
  // optional dependency might not be installed
}

let transporter = null;
if (!useSendGrid) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP not fully configured. Emails will fail unless SENDGRID_API_KEY or SMTP_* env vars are provided.');
  } else {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    transporter.verify().then(() => console.log('SMTP transporter verified')).catch(err => console.warn('SMTP verify failed:', err && err.message));
  }
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

async function sendEmail({ to, subject, text, html }) {
  if (useSendGrid) {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html
    };
    return sendGrid.send(msg);
  }

  if (!transporter) {
    throw new Error('No mail transporter configured (SENDGRID_API_KEY or SMTP_*)');
  }

  return transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html
  });
}

// Health
app.get('/', (req, res) => {
  res.json({ ok: true, mode: useSendGrid ? 'sendgrid' : (transporter ? 'smtp' : 'none') });
});

// Send password reset email
// body: { to, name, token, appUrl }
app.post('/send-reset', async (req, res) => {
  try {
    const { to, name, token, appUrl } = req.body;
    if (!to || !token || !appUrl) return res.status(400).json({ ok: false, error: 'Missing to, token or appUrl' });

    const resetLink = `${appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Restablece tu contraseña';
    const text = `Hola ${name || ''},\n\nPara restablecer tu contraseña, visita este enlace:\n${resetLink}\n\nSi no solicitaste esto, ignora este mensaje.`;
    const html = `<p>Hola ${name || ''},</p><p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Si no solicitaste esto, ignora este mensaje.</p>`;

    await sendEmail({ to, subject, text, html });
    res.json({ ok: true });
  } catch (err) {
    console.error('send-reset error', err && err.message);
    res.status(500).json({ ok: false, error: err && err.message });
  }
});

// Generic send endpoint for tests
// body: { to, subject, text, html }
app.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || !subject) return res.status(400).json({ ok: false, error: 'Missing to or subject' });
    await sendEmail({ to, subject, text: text || '', html: html || '' });
    res.json({ ok: true });
  } catch (err) {
    console.error('send error', err && err.message);
    res.status(500).json({ ok: false, error: err && err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mail server listening on port ${PORT} (mode: ${useSendGrid ? 'sendgrid' : (transporter ? 'smtp' : 'none')})`);
});
