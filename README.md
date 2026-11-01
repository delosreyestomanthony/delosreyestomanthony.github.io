# Tom Anthony Delos Reyes — portfolio

Live site: https://delosreyestomanthony.github.io/

A static website: plain HTML, one CSS file, one small JavaScript file. No build step, no frameworks, no paid services. Hosted free on GitHub Pages.

```
index.html                     Home: hero, services, featured projects, all-examples collection, experience, about, contact
work/referral-network.html     Project: websites, directory, blog, newsletters
work/roundtable-events.html    Project: Eventbrite, email scheduling, LinkedIn, event graphics
work/top-tier-print.html       Project: Etsy listings, invoices, order tracking, brand graphics
work/photo-mentorship.html     Project: thumbnails, carousel cards, emails, social posts
work/lesson-visuals.html etc.  Old links, redirect to photo-mentorship.html
assets/css/site.css            All styles. Colours, fonts, radii and spacing are tokens at the top.
assets/js/site.js              Menu, filters, "Show all", larger image view, copy email. Site works without it.
assets/img/                    Web-ready images
assets/files/                  Résumé PDF
tools/                         resize.ps1 (make web images), redact.ps1 (blur private details), make-graphics.ps1 (favicon, social image), serve.ps1 (local preview)
```

## Preview on your computer

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

Open http://localhost:8080/ and press Ctrl+C in that window to stop.

## Common updates

All text is in the HTML files. Edit the words between the tags, save, then publish.

**Résumé.** Replace `assets/files/Tom-Anthony-Delos-Reyes-Resume.pdf` with a new file of the same name. If the size changes a lot, update the "PDF, ... KB" size label in `index.html`. The editable source is `anthony-portfolio-sources\resume\resume.html` (in Documents); print it to PDF with Edge (see the comment at the top of that file).

**Email.** Search all files for `delosreyestomanthony@gmail.com` and replace every match (links use `mailto:` plus the address; the copy button uses `data-copy="..."`).

**LinkedIn.** In `index.html`, inside `<div class="contact-actions">`, add `<a class="btn" href="https://www.linkedin.com/in/YOUR-PROFILE/">LinkedIn</a>`.

**Experience.** In `index.html`, find `<ol class="exp-grid">`. Copy one `<li class="card job">…</li>`, paste it in date order, and edit it. Keep an even number of cards so the two columns stay balanced.

**Add an example to the collection.** In `index.html`, copy one `<li class="card item">…</li>` inside `<ul class="collection-grid">`. Change the images, title, client, description, and link. `data-cat` decides which filters show it; use any of `web email ecommerce ops events creative`, separated by spaces. Filter counts update automatically.

**Add an image.**

```
powershell -ExecutionPolicy Bypass -File tools\resize.ps1 -Src "C:\path\to\original.png" -Name "new-image" -Widths 800,1600
```

Use the small file in `src` and the large one in the link's `href` (the larger view). Always fill in `alt`, `width` and `height`.

**Blur private details first** (customer names, emails, phone numbers):

```
powershell -ExecutionPolicy Bypass -File tools\redact.ps1 -Src original.png -Out redacted.png -Rects "x,y,width,height;x,y,width,height"
```

**Add a project page.** Copy one file in `work/`, change the title, description, canonical and `og:` lines at the top, then the hero facts and blocks. Add a card for it under "Selected work" in `index.html`, update the previous/next links at the bottom of the project pages, and add it to `sitemap.xml`.

**After changing the CSS or JS**, raise the version number in every HTML file (`site.css?v=1` → `?v=2`, same for `site.js`). Browsers cache these files for about 10 minutes, and the new number makes visitors get the update right away.

## Publish (GitHub Pages)

The site is built from the `main` branch of `delosreyestomanthony/delosreyestomanthony.github.io`. Pushed changes go live in about a minute.

```
git add -A
git commit -m "Describe the change"
git push
```

Or edit and upload files directly on github.com and click **Commit changes**.

## Design tokens

| Role | Value |
| --- | --- |
| Page background | `#0B1220` |
| Card surface | `#121B2D` |
| Raised surface / image wells | `#18233A` |
| Borders and dividers | `#243049` (hover `#34425F`) |
| Primary text | `#EEF2F8` |
| Secondary text | `#A9B4C8` |
| Labels | `#8693AB` |
| Steel-blue accent | `#5B8DEF` (hover `#82A9F6`) |
| Text on accent | `#071023` |

Type: Bricolage Grotesque (headings, 500–600) and Instrument Sans (body, 400–600), both from Google Fonts under the SIL Open Font License. Fallbacks: Arial / Helvetica.

Shape: cards 20 px radius, image frames 12 px, buttons and filter chips fully rounded. Card padding and grid gaps are the `--pad` and `--gap` tokens.

Motion: hover and focus feedback (180 ms), filter results fade in (280 ms), the larger image view opens with a short fade, and pages cross-fade where supported. All of it is off when the visitor's system asks for reduced motion. There is no loading screen, and nothing waits on an animation.
