# Metta Practice GitHub Pages preview

This directory is an isolated, static preview copied from the authoritative
marketing source in `../site`. It does not modify that source.

## Important security limitation

GitHub Pages publishes every file in this directory to the public internet.
The password screen is therefore only a casual review gate: it conceals the
pages in ordinary browsing and checks the agreed password's SHA-256 hash in
the browser, but a determined visitor can bypass it or download public files
directly.

Do not place the ebook, audiobook masters, customer files, API keys, checkout
secrets, or any other private material in this directory. Use server-side
authentication if genuine confidentiality is required.

## Preview safeguards

- Every HTML page carries `noindex`, `nofollow`, `noarchive`, `nosnippet`, and
  `noimageindex` directives.
- `robots.txt` disallows all crawling.
- Checkout controls are disabled until the real Lemon Squeezy URL and product
  files have final approval.
- The rejected audiobook sample is omitted.
- The low-glare production cover uses the original pink-violet-cyan brand
  colors as restrained accents rather than a full-bleed neon field.
- Access lasts for the current browser tab/session. The small “Lock” control
  clears it.

## Local validation

Serve this directory over HTTP; Web Crypto is not available from every
`file://` context.

```sh
python3 -m http.server 8766 --directory site-pages
```

Open `http://127.0.0.1:8766/`. An incorrect password must remain locked; the
agreed preview password must reveal the site; reloading must preserve access
in the same tab; and “Lock” must return to the password screen.

## Deployment record

- Repository: `ogreadmore/metta-practice-site`
- Pages source: `main` at `/`
- Canonical domain: `https://mettapractice.com/`
- HTTPS enforcement: enabled
- Apex DNS: GitHub Pages' four official `185.199.108-111.153` A records
- `www`: CNAME to `ogreadmore.github.io.`
- Account-level domain verification: keep the GoDaddy TXT record requested by
  GitHub for the `ogreadmore` account

GoDaddy remains the DNS provider only. Do not restore the retired GoDaddy
website A records while GitHub Pages is the active host.
