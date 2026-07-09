# secure-landing

A Cloudflare Worker that serves a static "landing page that goes nowhere":
no links, no forms, no scripts, no images, no external requests, and a
security header set that closes off the usual ways a page like this could
be abused (framing, referrer leakage, MIME sniffing, mixed content, etc).

Every request — any path, any method — gets the exact same response, so
the Worker doesn't leak information about what routes exist behind it.

## Structure

```
secure-landing/
├── src/index.js              # the Worker: page HTML + security headers
├── wrangler.toml              # Cloudflare deployment config
└── .github/workflows/deploy.yml   # optional CI/CD via GitHub Actions
```

## Deploy manually

Requires Node.js and a Cloudflare account.

```bash
npm install -g wrangler
wrangler login
cd secure-landing
wrangler deploy
```

That publishes to `secure-landing.<your-subdomain>.workers.dev` by default.
To use your own domain instead, edit `wrangler.toml` and uncomment the
`routes` block with your zone name and hostname.

## Deploy via CI/CD (GitHub Actions)

The included workflow deploys automatically on every push to `main`.

1. In GitHub, go to your repo's **Settings → Secrets and variables → Actions**.
2. Add two repository secrets:
   - `CLOUDFLARE_API_TOKEN` — create one at
     https://dash.cloudflare.com/profile/api-tokens with the
     "Edit Cloudflare Workers" template.
   - `CLOUDFLARE_ACCOUNT_ID` — found on the right-hand sidebar of any
     zone's Overview page in the Cloudflare dashboard.
3. Push to `main`; the workflow runs `wrangler deploy` for you.

## What "secure" means here

| Header | Purpose |
|---|---|
| `Content-Security-Policy: default-src 'none'; ...` | Nothing on the page can load or execute — no scripts, images, frames, or forms. |
| `X-Frame-Options: DENY` | Page can't be embedded in an iframe (clickjacking). |
| `X-Content-Type-Options: nosniff` | Browser won't reinterpret the response as another content type. |
| `Referrer-Policy: no-referrer` | No referrer data sent if someone somehow navigates away. |
| `Permissions-Policy` | Camera, mic, geolocation, etc. all explicitly denied. |
| `Strict-Transport-Security` | Forces HTTPS for this host for a year, including subdomains. |
| `Cross-Origin-*-Policy` | Isolates the page from cross-origin scripting/embedding. |
| `Cache-Control: no-store` | Nothing about the page gets cached anywhere. |

## Customizing

- Change the visible text in `PAGE_HTML` inside `src/index.js`.
- If you want the page to respond differently per path (e.g. always 200
  regardless, which it already does) or add logging/analytics, note that
  any analytics script will require loosening the CSP — which trades away
  some of the "goes nowhere, does nothing" guarantee.
