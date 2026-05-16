export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  const key = process.env.RESEND_KEY;
  if (!key) return res.status(500).send('RESEND_KEY not set');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Feja Leads <onboarding@resend.dev>',
      to: 'jaoli1982@gmail.com',
      subject: 'New lead: ' + email,
      html: '<p>New landing page lead: <strong>' + email + '</strong></p>',
    }),
  });

  if (!r.ok) {
    const body = await r.text();
    return res.status(502).send('Resend error: ' + body);
  }

  return res.status(200).send('ok');
}
