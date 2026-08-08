# Kashmiri Gold — kashmirigold.com

Static site with two serverless API routes. No build step, no framework, no npm install.

## Files

```
index.html          Home
origin.html         The Kashmir story
range.html          Four products, with detail sections
purity.html         ISO 3632 testing, adulteration
contact.html        Contact form
privacy.html        Privacy notice          (draft — needs review)
cookies.html        Cookie notice           (draft — needs review)
terms.html          Terms of use            (draft — needs review)
assets/style.css    All styling
assets/site.js      Nav, reveals, cookie bar, forms
api/waitlist.js     POST → Supabase waitlist
api/contact.js      POST → Supabase contact_messages
supabase-setup.sql  Run once in Supabase
robots.txt, sitemap.xml
```

## Deploying

1. Push the folder to GitHub.
2. Vercel → Add New → Project → import the repo.
3. **Framework Preset: Other.** Leave build command and output directory blank.
4. Deploy. Vercel picks up `/api` automatically.
5. Settings → Domains → add `kashmirigold.com` and follow the DNS records shown.

The site works immediately. The forms return an error until step two below is done.

## Making the forms work

1. Supabase → new project → SQL Editor → paste `supabase-setup.sql` → Run.
2. Supabase → Settings → API. Copy the Project URL and the **service_role** key.
3. Vercel → Settings → Environment Variables, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |
   | `RESEND_API_KEY` | optional — enables email alerts on contact form |
   | `NOTIFY_EMAIL` | optional — defaults to andrew@vitacomhealth.com |

4. **Redeploy.** Environment variables only apply to builds made after they're added.

The service_role key bypasses row-level security and must never appear in client-side
code. It only exists in Vercel's environment and in the `/api` functions.

Sign-ups appear in Supabase → Table Editor → waitlist.

## Before this goes live properly

Not optional, and not things a developer can decide alone:

- [ ] Vitacom Ltd company number and registered address (used in privacy, terms, footer)
- [ ] ICO registration for Vitacom Ltd
- [ ] Legal review of privacy, cookies and terms — all three are drafts with marked gaps
- [ ] Named third-party processors listed in the privacy notice
- [ ] ISO 3632 test certificates confirmed before the purity claims stay up
- [ ] Confirmation the UK GMP manufacturer is contracted
- [ ] Real product photography
- [ ] Analytics provider chosen, then wired to the cookie banner's consent state

## Health claims — read before editing any copy

Every health claim on this site is the authorised wording from the GB Nutrition and
Health Claims Register, attributed to the vitamin or mineral it belongs to.

Saffron has **no** authorised health claims in Great Britain. Turmeric has none either.
Claims from the original investor deck — anxiety, mood, memory, wound healing, weight
loss — are not usable. Several are medicinal claims, which puts them under the MHRA
rather than just the ASA.

If new copy is added, check it against the register first. Do not paraphrase an
authorised claim; the wording is fixed.

## Not built yet

E-commerce. That needs the Vitacom company number for Stripe onboarding, real prices,
VAT treatment, stock, fulfilment, and consumer terms covering the 14-day cancellation
right. Separate phase.