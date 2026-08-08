// POST /api/contact  →  stores the enquiry in Supabase `contact_messages`
// and, if RESEND_API_KEY is set, emails a notification.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;           // optional
  const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'andrew@vitacomhealth.com';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Server not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const name = String(body?.name || '').trim().slice(0, 120);
  const email = String(body?.email || '').trim().toLowerCase();
  const subject = String(body?.subject || 'General enquiry').slice(0, 120);
  const message = String(body?.message || '').trim().slice(0, 5000);

  if (!name) return res.status(400).json({ error: 'Name required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  if (message.length < 10) return res.status(400).json({ error: 'Message too short' });

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Supabase insert failed:', r.status, detail);
      return res.status(502).json({ error: 'Could not save message' });
    }
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }

  // Optional email notification. Failure here must not fail the request —
  // the message is already stored.
  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Kashmiri Gold <website@kashmirigold.com>',
          to: [NOTIFY_TO],
          reply_to: email,
          subject: `Website enquiry: ${subject}`,
          text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        }),
      });
    } catch (err) {
      console.error('Notification email failed (message was still saved):', err);
    }
  }

  return res.status(200).json({ ok: true });
}