Mail server for proyecto-ionic

This is a minimal Express mail server that sends emails using SendGrid (if `SENDGRID_API_KEY` is provided) or falls back to SMTP (configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

Setup

1. Install dependencies:

   npm install

2. Configure environment. Copy `.env.example` to `.env` and set the values. Example using SendGrid:

   SENDGRID_API_KEY=SG.xxxxxx
   FROM_EMAIL=no-reply@yourdomain.com
   PORT=3001

Example using SMTP (Gmail):

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL="Your Name <your@gmail.com>"

Run

   npm run start

or for development with auto-restart (if you have nodemon):

   npm run dev

Endpoints

- GET / -> health check. Returns { ok: true, mode: "sendgrid"|"smtp"|"none" }

- POST /send-reset
  - body: { to, name, token, appUrl }
  - Sends a password reset email using a link constructed as `${appUrl}/reset-password?token=${token}`

- POST /send
  - body: { to, subject, text, html }
  - Generic send endpoint for testing

Frontend integration

Update your `EmailService` to POST to `http://localhost:3001/send-reset` when requesting password resets. Provide the `appUrl` value (e.g., `http://localhost:8100`) so the server can build the proper reset link.

Security notes

- Do not commit `.env` with secrets.
- Prefer SendGrid for production; SMTP with app passwords works for testing.
