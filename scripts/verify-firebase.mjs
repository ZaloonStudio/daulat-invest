import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/lib/firebase.ts', import.meta.url), 'utf8');
const fallback = source.match(/apiKey:.*?\|\|\s*['"]([^'"]+)['"]/); 
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallback?.[1];
if (!apiKey) throw new Error('Firebase API key is missing.');
const origin = 'https://www.daulatinvest.com';
const headers = { Origin: origin, Referer: origin + '/', 'Content-Type': 'application/json' };
async function request(path, options = {}) {
  const response = await fetch('https://identitytoolkit.googleapis.com/v1/' + path + '?key=' + encodeURIComponent(apiKey), {headers, signal: AbortSignal.timeout(15000), ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Firebase verification failed.');
  return data;
}
try {
  const config = await request('projects');
  if (config.projectId !== '400676871624') throw new Error('The API key belongs to a different Firebase project.');
  for (const domain of ['daulatinvest.com', 'www.daulatinvest.com']) {
    if (!config.authorizedDomains?.includes(domain)) throw new Error('Missing authorized domain: ' + domain);
  }
  const google = await request('accounts:createAuthUri', {method: 'POST', body: JSON.stringify({providerId: 'google.com', continueUri: origin + '/'})});
  if (!google.authUri || new URL(google.authUri).hostname !== 'accounts.google.com') throw new Error('Google sign-in is not configured correctly.');
  console.log('PASS: production Firebase project, both website domains, and Google sign-in provider.');
  console.log('A real account is still required to verify private portfolio reads and cross-device sync.');
} catch (error) {
  console.error('FAIL:', error.message);
  process.exitCode = 1;
}
