/**
 * Secure "goes nowhere" landing page.
 *
 * Design goals:
 *  - Single static page, no links, no forms, no JS, no external resources.
 *  - Aggressive security headers so there is nothing a browser can be
 *    tricked into doing with the response (no framing, no referrer leak,
 *    no MIME sniffing, no mixed content, no permissions grants).
 *  - Every route (including 404s) returns the exact same response, so
 *    the Worker leaks no information about what does or doesn't exist
 *    behind it.
 */

const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>&nbsp;</title>
<style>
  html, body {
    margin: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0b0d10;
    color: #c8ccd1;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  main {
    text-align: center;
    padding: 2rem;
  }
  p {
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    opacity: 0.7;
    margin: 0;
  }
</style>
</head>
<body>
<main>
  <p>Nothing to see here.</p>
</main>
</body>
</html>`;

const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  // No scripts, no styles from elsewhere, no images, no frames, no forms,
  // no connections out. This page has nowhere to go and nothing to load.
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; " +
    "form-action 'none'; frame-ancestors 'none'; block-all-mixed-content",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), " +
    "magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  // Force HTTPS on every future visit for a year, including subdomains.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Don't let intermediaries or the browser cache this anywhere.
  "Cache-Control": "no-store",
};

export default {
  async fetch(request) {
    // Only GET/HEAD are meaningful for a static page; anything else
    // still gets the same body/headers rather than an informative error.
    return new Response(PAGE_HTML, {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  },
};
