// POST /api/subscribe  { email, company }
// Adds an email to the list. Duplicates are ignored (they still see success).

const { supabase, readBody } = require('./_supabase');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = readBody(req);

  // Honeypot: real people never see or fill the hidden "company" field.
  // Bots usually do. Pretend it worked and save nothing.
  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Enter a valid email.' });
  }

  try {
    await supabase('subscribers?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email, source: 'coming-soon' }),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Try again.' });
  }
};
