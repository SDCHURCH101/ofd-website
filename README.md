# OFD, LLC — Website

Marketing site for **OFD, LLC**, a locally owned commercial real estate company in Fairbanks, Alaska. The site features the two properties OFD owns:

- **399 Helmericks Avenue** — 66,000 sq ft industrial / warehouse site on 6.25 acres
- **300 Barnette Street** — 17,000 sq ft downtown office building

## Stack

Static, no framework. Plain HTML + CSS + a small vanilla JS file.

- `index.html`, `properties.html`, `leasing.html`, `about.html`, `contact.html`, `404.html`
- `assets/styles.css` — shared styles (brand navy + brass + ivory; Fraunces + Inter)
- `assets/app.js` — nav, scroll state, reveal-on-scroll, count-up stats, demo contact form
- `assets/img/` — real OFD property photos, processed logo (navy + white knockout), favicons, OG image
- `robots.txt`, `sitemap.xml`

## Contact form

The contact form on `contact.html` runs in **demo mode** (`data-demo="true"`): it validates and shows a success panel but does not send anything. To receive real submissions, wire it to a backend (Formspree, Netlify Forms, etc.) via the `action`/`method` attributes and remove `data-demo`. Instructions are in an HTML comment in `contact.html`.

## Local preview

Served as static files. A global launch config named `ofd` runs:

```
python3 -m http.server 4323 --directory /tmp/ofd-site
```

Edit files in this repo, then sync to the preview copy:

```
cp index.html properties.html leasing.html about.html contact.html 404.html robots.txt sitemap.xml /tmp/ofd-site/
cp -R assets /tmp/ofd-site/
```

Bump the `?v=` query on `styles.css` / `app.js` links after CSS/JS edits to bust the browser cache.

## Content notes

- Main contact is the property manager: phone **(907) 987-2095** and email **properties.fairbanks@gmail.com** (used site-wide in the utility bar, footer, contact page, CTAs, and JSON-LD).
- Only the two owned properties are shown. Other listings from the old site (Prudhoe Bay, Deadhorse FBO, Northward Building, A Street Apartments, etc.) are intentionally excluded.
- The downtown photos in the `OFDLLC.com` source folder are signed "330 Barnette"; this site uses the user's own "300 Barnette" photo set per the brief. Confirm whether 300 and 330 Barnette are the same building.
- Canonical/OG/sitemap URLs use `https://www.ofdllc.com`.

## Photo credits

All photography is OFD's own (Fairbanks properties). Logo is the OFD, LLC mark, processed into transparent navy and white-knockout versions plus favicons.
