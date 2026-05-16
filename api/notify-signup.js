export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, venue, email } = req.body;
  const key = process.env.RESEND_KEY;
  if (!key) return res.status(500).send('RESEND_KEY not set');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Feja Signups <onboarding@resend.dev>',
      to: 'jaoli1982@gmail.com',
      subject: `New signup: ${name} — ${venue || 'invited staff'}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Venue:</strong> ${venue || '(invited staff)'}</p><p><strong>Email:</strong> ${email}</p>`,
    }),
  });

  if (!r.ok) return res.status(502).end();
  return res.status(200).send('ok');
}
