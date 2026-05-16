# Feja

Kitchen compliance made simple. Built for commercial kitchens to log temperatures, track corrective actions, and stay audit-ready.

**Live:** [feja.com.au](https://feja.com.au)

---

## Stack

- **Frontend:** React (Create React App)
- **Auth + Database:** Supabase (`logs`, `venues`, `profiles`, `leads` tables)
- **Hosting:** Cloudflare Pages (manual deploy via Wrangler)
- **Email API:** Resend via Vercel serverless functions (`api/`)
- **Logos:** Cloudinary

---

## Local Development

```bash
npm install
npm start
```

Runs on [http://localhost:3000](http://localhost:3000).

---

## Deploying to Production

Cloudflare Pages is deployed manually via Wrangler. There is no automatic Git-triggered deploy currently.

```bash
npm run build && npx wrangler pages deploy build --project-name feja-app
```

Each deploy produces a unique preview URL (e.g. `https://abc123.feja-app.pages.dev`) and simultaneously updates [feja.com.au](https://feja.com.au).

---

## Routing

Routing is handled by `public/_redirects`:

```
/ /landing.html 200        → landing page
/privacy /privacy.html 200 → privacy policy
/* /index.html 200         → React app (everything else)
```

---

## Environment Variables

Set in a `.env` file locally (not committed). Required:

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

Vercel environment variables are set in the Vercel dashboard for the `api/` functions.
