// Shared helper for talking to Supabase's REST API with the service role key.
// The key only ever lives on the server (Vercel environment variables).

function config() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel.');
  }
  return { url, key };
}

async function supabase(path, options = {}) {
  const { url, key } = config();
  // Works with both key styles: the older service_role key (a JWT starting
  // "eyJ") goes in both headers; the newer "sb_secret_..." key only in apikey.
  const auth = key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {};
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      ...auth,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    const msg = (data && data.message) || `Supabase error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return { data, headers: res.headers };
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

module.exports = { supabase, readBody };
