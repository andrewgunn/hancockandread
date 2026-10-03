# Hancock & Read

Redesigned website for [Hancock & Read](https://hancockandread.co.uk), bespoke furniture designers and makers in Sheffield since 1985.

A static site with no framework, hosted on GitHub Pages. GSAP, ScrollTrigger, SplitText and Lenis are vendored in `assets/vendor`. Fonts are self-hosted (Cormorant Garamond and Jost).

## Build

```sh
node src/build.mjs                 # preview build (404 page assumes /hancockandread/ base)
BASE_PATH= node src/build.mjs      # build for the live domain at /
```

All page content lives in `src/build.mjs`. It writes `index.html` files into the repo root, matching the old WordPress URLs. Images are optimised WebP files in `assets/img` (640, 1280 and 2000px), and their metadata is in `src/images.json`.

## SEO preserved

- Every existing URL is kept: `/about/`, `/what-we-do/`, `/testimonials/`, `/kitchens/`, `/bathrooms/`, `/bedrooms/`, `/studys/`, `/contact-us/`, `/gallery/`, `/kitchen-gallery/`, `/bedroom-gallery/`, `/bathroom-gallery/`, `/study-gallery/` and `/privacy-policy/`.
- Page titles are unchanged. The only change is the stray trailing `|` removed from the home page title.
- Canonical URLs point to `https://hancockandread.co.uk/...`, the same as the old site, so this preview copy doesn't compete with the live site.
- Added: meta descriptions (the old site had none), Open Graph tags, `FurnitureStore` LocalBusiness and breadcrumb structured data, one proper H1 per page, descriptive image alt text, `sitemap.xml`, and `wp-sitemap.xml` / `wp-sitemap-posts-page-1.xml` so the sitemap already submitted to search engines keeps working.

## Going live

1. `BASE_PATH= node src/build.mjs`, then commit.
2. Add a `CNAME` file containing `hancockandread.co.uk` and point DNS at GitHub Pages.
3. Choose a form backend (e.g. Formspree) and put its URL in `data-endpoint` on the contact form. Until then the form opens the visitor's email app, addressed to info@hancockandread.co.uk.
4. Re-submit `sitemap.xml` in Google Search Console.
