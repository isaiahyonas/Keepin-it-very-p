// GET    /api/admin            → all subscribers, newest first
// DELETE /api/admin?id=123     → remove one subscriber
// Every request must send the header  x-admin-password: <ADMIN_PASSWORD>

const crypto = require('crypto');
const { supabase } = require('./_supabase');

function passwordOk(given) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || !given) return false;
  // Compare hashes so the check takes the same time no matter what was typed.
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

async function listAll() {
  // Supabase returns at most 1000 rows per request, so page through.
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    const { data } = await supabase(
      'subscribers?select=id,email,source,created_at&order=created_at.desc,id.desc',
      { headers: { Range: `${from}-${from + pageSize - 1}` } }
    );
    const batch = Array.isArray(data) ? data : [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ ok: false, error: 'ADMIN_PASSWORD is not set in Vercel.' });
  }
  if (!passwordOk(req.headers['x-admin-password'])) {
    return res.status(401).json({ ok: false, error: 'Wrong password.' });
  }

  try {
    if (req.method === 'GET') {
      const subscribers = await listAll();
      return res.status(200).json({ ok: true, subscribers });
    }

    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '');
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ ok: false, error: 'Missing or bad id.' });
      }
      await supabase(`subscribers?id=eq.${id}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, DELETE');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('admin failed:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
