// Manual "publish now" — triggers a Vercel rebuild immediately rather than
// waiting for the daily cron. Use after an urgent CRM change.
//
//   DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..." npm run publish:site
//
// Or put DEPLOY_HOOK_URL in a local .env that is gitignored and source it.
// The URL is a secret: anyone holding it can trigger builds. Never commit it.
//
// The same thing can be done with a bare curl, or from the Vercel dashboard
// under Settings → Git → Deploy Hooks:
//   curl -X POST "$DEPLOY_HOOK_URL"

const hook = process.env.DEPLOY_HOOK_URL;

if (!hook) {
  console.error('DEPLOY_HOOK_URL is not set.\n');
  console.error('  Vercel → Settings → Git → Deploy Hooks → copy the URL, then:');
  console.error('    DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..." npm run publish:site');
  process.exit(1);
}

const res = await fetch(hook, { method: 'POST' });
const body = await res.text();

if (!res.ok) {
  console.error(`Deploy hook failed: HTTP ${res.status}`);
  console.error(body.slice(0, 400));
  process.exit(1);
}

console.log('Deploy triggered. The build will re-bake listings.html from the CRM.');
console.log('Watch it at https://vercel.com/dashboard');
