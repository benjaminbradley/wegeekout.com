# Deploying the wegeekout.com archive

What's left after this repo is pushed to `github.com/benjaminbradley/wegeekout.com`.
The site is in `docs/`, and `docs/CNAME` already says `wegeekout.com`.

## 1. Push

```sh
git push -u origin main
```

## 2. Turn on GitHub Pages

Repo → **Settings → Pages**:

1. **Source:** *Deploy from a branch*
2. **Branch:** `main`, folder `/docs` → **Save**
3. **Custom domain:** should show `wegeekout.com` (read from `docs/CNAME`). If it's empty, type it in and save.
4. Leave **Enforce HTTPS** for now. It becomes available after DNS works (step 4).

Check the deploy: open the **Actions** tab and look for a green "pages build and deployment" run. Until DNS points at GitHub, you can preview the site at
`https://benjaminbradley.github.io/wegeekout.com/`. That preview works only because every link in the archive is relative.

## 3. (Recommended) Verify the domain with GitHub

Account → **Settings → Pages → Add a domain** → `wegeekout.com`. GitHub gives you a TXT record (`_github-pages-challenge-benjaminbradley.wegeekout.com`). Add it at your DNS provider, then click **Verify**. This stops anyone else's repo from claiming your domain.

## 4. Point DNS at GitHub

At your DNS provider for `wegeekout.com`:

**Before changing anything:**
- A day ahead, lower the TTL on the existing records (for example to 300 s) so the switch takes effect quickly.
- Keep a copy of the current records in case you need to roll back.
- Don't touch MX/email records.
- The old site sits behind Cloudflare. If these records are in Cloudflare, set them to **DNS only** (grey cloud) while GitHub issues the certificate.

**Remove** the existing `A`/`AAAA` records for `wegeekout.com` (and `www`) that point at the old WordPress host.

**Add:**

| Type  | Name  | Value                          |
|-------|-------|--------------------------------|
| A     | @     | 185.199.108.153                |
| A     | @     | 185.199.109.153                |
| A     | @     | 185.199.110.153                |
| A     | @     | 185.199.111.153                |
| AAAA  | @     | 2606:50c0:8000::153            |
| AAAA  | @     | 2606:50c0:8001::153            |
| AAAA  | @     | 2606:50c0:8002::153            |
| AAAA  | @     | 2606:50c0:8003::153            |
| CNAME | www   | benjaminbradley.github.io.           |

With the `www` CNAME in place, GitHub redirects `www.wegeekout.com` to `wegeekout.com` automatically.

If the domain has **CAA** records, one of them must allow `letsencrypt.org`. Otherwise GitHub can't issue the HTTPS certificate.

Check propagation:

```sh
dig +short wegeekout.com
```

## 5. Turn on HTTPS

Once DNS resolves to GitHub, go back to **Settings → Pages**. The DNS check should go green, and GitHub requests a Let's Encrypt certificate, which can take from a few minutes up to about an hour. Then tick **Enforce HTTPS**.

If the certificate seems stuck, clear the Custom domain field, save, re-enter `wegeekout.com`, and save again.

## 6. Afterwards

- Click through the live site and compare it with the old one. Old URLs keep the same paths.
- **Before you shut down the WordPress host**, take a final backup: a database dump plus all of `wp-content/`. The uploads folder may contain files that aren't in this archive.
- Cancel the old hosting only once the new site has run fine for a while.

## 7. Contact form (web3forms)

The form on `/contact-me/` posts to web3forms using the access key embedded in the page. After the site is live, check the web3forms dashboard: if the key is restricted by domain, allow `wegeekout.com`, then send a test message.
