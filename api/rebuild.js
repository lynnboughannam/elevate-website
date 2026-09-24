// Triggers a Vercel rebuild by POSTing to the project's Deploy Hook.
//
// Invoked by the cron entry in vercel.json. The point of the rebuild is to
// re-run scripts/bake-listings.mjs so the static HTML picks up CRM changes —
// a cron job cannot redeploy a project by itself, it has to call the hook.
//
// DEPLOY_HOOK_URL is a Vercel environment variable. It is a secret: anyone
// holding it can trigger builds, which on Hobby consumes limited build minutes.
// It must never be committed.
//
// CRON_SECRET is optional but strongly recommended. Vercel sends it as
// `Authorization: Bearer <CRON_SECRET>` on cron invocations. Without it this
// endpoint is publicly callable and anyone can burn your build minutes.

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }

  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) {
    // Misconfiguration, not a client error — say so plainly so it does not
    // fail the way click_events did, silently, for months.
    console.error('[rebuild] DEPLOY_HOOK_URL is not set; cannot trigger a deploy.');
    return res.status(500).json({ error: 'DEPLOY_HOOK_URL not configured' });
  }

  try {
    const r = await fetch(hook, { method: 'POST' });
    const body = await r.text();
    if (!r.ok) {
      console.error(`[rebuild] deploy hook returned ${r.status}: ${body.slice(0, 200)}`);
      return res.status(502).json({ error: 'deploy hook failed', status: r.status });
    }
    console.log('[rebuild] deploy triggered');
    return res.status(200).json({ ok: true, triggered: new Date().toISOString() });
  } catch (err) {
    console.error('[rebuild] deploy hook threw:', String(err));
    return res.status(502).json({ error: 'deploy hook unreachable' });
  }
}
