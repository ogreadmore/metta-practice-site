# Metta Practice public site

Static GitHub Pages site for [mettapractice.com](https://mettapractice.com/).

The complete first edition is public and ungated in HTML, PDF, EPUB, and
digitally narrated audiobook formats. The guided meditation library is also
free. Reading, listening, and downloads require no signup or payment.

## Publishing

- Repository: `ogreadmore/metta-practice-site`
- Pages source: `main` at `/`
- Canonical domain: `https://mettapractice.com/`
- DNS provider: GoDaddy

Do not add API keys, checkout secrets, or private review artifacts. Donation
support may be connected to Stripe later, but free access must remain
independent of any donation flow.

## Local validation

```sh
python3 -m http.server 8766
```

Open `http://127.0.0.1:8766/` and verify the complete reader, every direct
download, and every audio player at desktop and mobile widths.
