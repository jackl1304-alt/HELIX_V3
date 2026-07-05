# Cloudflare Setup für HELIX (Production)

This document walks you through standing up Cloudflare in front of your Netcup
Docker stack. After completing it, all traffic flows:

```
Cloudflare Global Edge (DDoS, WAF, CDN)
   ↓ (CF-Connecting-IP header carries real client IP)
Netcup Reverse Proxy (nginx, port 443)
   ↓
Helix Docker Stack (Express, Postgres, Redis, Prometheus, Grafana)
```

Default hosting block: **Cloudflare Free tier** — $0/month.
No Vercel, no Heroku, no AWS.

---

## Prerequisites

Before you start:

- [ ] Domain registrar access (where you bought `deltaways.de`)
- [ ] Netcup VPS with HELIX Docker stack already running on port 443 (you should have a working `https://deltaways.de` setup; Cloudflare is purely additive)
- [ ] Netcup VPS public IPv4 address (call it `1.2.3.4` below)
- [ ] 15 minutes

---

## Step 1 — Create Cloudflare account & add site

1. Go to <https://dash.cloudflare.com/sign-up>
2. Pick the **Free** plan when prompted. **Do NOT** upgrade to Pro during this setup.
3. Click **+ Add a Site**, enter your apex domain: `deltaways.de`
4. Cloudflare scans existing DNS records. Verify the scan reports your current Netcup IP.

## Step 2 — Update nameservers at registrar

Cloudflare gives you two nameservers like `anna.ns.cloudflare.com` / `bob.ns.cloudflare.com`.

1. Log into your domain registrar (where you bought `deltaways.de`)
2. Replace the existing nameservers with Cloudflare's two
3. Wait 5–60 min for propagation (Cloudflare emails you when it's done)

## Step 3 — Configure DNS records (most important)

Cloudflare DNS dashboard → **Records**.

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `@` | `1.2.3.4` (your Netcup IPv4) | **Proxied (orange cloud ⛅)** |
| AAAA | `@` | `2001:db8::1` (your Netcup IPv6, optional) | **Proxied** |
| CNAME | `*.deltaways.de` (use "Add record → wildcard") | `deltaways.de` | **Proxied** |
| A | `monitoring` (or other internal-only hostnames) | `1.2.3.4` | **DNS only (grey cloud)** |

Save each record. The orange cloud is what gives you DDoS/WAF/CDN.

### Why "DNS only" for monitoring?

Cloudflare proxies all traffic to your Netcup IP. If you proxy the Grafana host too, then **your WAF will see monitoring traffic and could rate-limit it**. By setting monitoring to grey cloud, you tell Cloudflare: "send this host's traffic raw, don't cache or filter it." Combined with the `nginx.conf` rule `allow 10.0.0.0/8 etc.; deny all`, the Grafana host is only reachable when it actually comes from your LAN/VPN.

## Step 4 — Enable Cloudflare for SaaS (Custom Hostnames for tenants)

This is the magic for multi-tenant support: every tenant can use their own domain (e.g. `reg.med-corp.com`) and Cloudflare routes the TLS to your Netcup server automatically.

Dashboard → **SSL/TLS → Custom Hostnames** → **Add Custom Hostname**.

Fill in:
- **Hostname**: `*.helix.example.com` (or your real wildcard if you have one)
- **Origin Server**: select `deltaways.de` (your apex, which you've already configured)
- Save

When a tenant later wants `reg.med-corp.com` connected:
- Dashboard → Custom Hostnames → Add →
  - hostname: `reg.med-corp.com`
  - origin: `deltaways.de`
- Cloudflare shows a TXT-record you ask the tenant to add at their DNS to verify ownership
- Done — TLS validated automatically, routed to Netcup nginx

> Note: Custom Hostnames for SaaS is a paid feature on most plans. **On the Free plan, you can use Custom Hostnames for the apex and primary subdomains, but wildcards require Advanced Certificate Manager or Pro tier.** If you want tenant-custom domains on Hobby, the workaround is: each tenant adds their domain as a separate CNAME pointing to `deltaways.de`, and you manage TLS manually per tenant at your end. Upgrade to **Pro ($20/mo)** only when you sign your first paid enterprise tenant.

## Step 5 — SSL/TLS settings

Dashboard → **SSL/TLS**.

| Setting | Value | Why |
|---|---|---|
| Encryption mode | **Full (strict)** | We have a real cert at Netcup (Let's Encrypt or Cloudflare Origin Cert). |
| Edge Certificates → Minimum TLS Version | **TLS 1.2** | Don't allow legacy clients |
| Always Use HTTPS | **On** | Belt-and-braces with nginx redirect |
| HTTP/2 | **On** | Performance |
| HTTP/3 (QUIC) | **On** | Performance |
| TLS 1.3 | **On** | Performance |
| 0-RTT | **Off** | Mitigates replay attacks |

## Step 6 — Enable Cloudflare WAF + DDoS protection

Dashboard → **Security**.

| Setting | Value | Why |
|---|---|---|
| Security Level | **Medium** | Reasonable default; challenge obviously malicious clients |
| Challenge Passage | **30 minutes** | Time a successful challenge stays valid |
| Browser Integrity Check | **On** | Detects headless browsers / bots |
| Bot Fight Mode | **On** | Free automatic bot mitigation |
| Super Bot Fight Mode | Free tier doesn't have; upgrade if needed | For enterprise chatbot defense |

Dashboard → **Security → WAF** (free tier has limited rules, but useful):

- **Add a rate-limit rule** for `/api/auth/*`: 5 requests / 60 seconds across all CF users
- **Add a rate-limit rule** for `/api/*` global: 100 requests / 10 seconds

Rule expression for `/api/auth/*`:
```
(http.request.uri.path matches "^/api/auth/.*")
```

For `/api/*` global:
```
(http.request.uri.path matches "^/api/.*")
```

Pick rate-limit action "Challenge" or "Block" as you see fit.

> Important: real per-IP rate limiting happens in nginx too (more granular) — Cloudflare's WAF rate-limits are aggregate.

## Step 7 — Enable CF Caching for static assets

Dashboard → **Caching → Configuration**.

| Setting | Value |
|---|---|
| Browser Cache TTL | **Respect Existing Headers** |
| Crawler Hints | **On** |

Dashboard → **Rules → Page Rules** (or new **Cache Rules**):

Add a Cache Rule:
- **Match**: `(http.request.uri.path matches "/assets/.*")` OR `(http.request.uri.extension in {"js" "css" "png" "jpg" "jpeg" "gif" "ico" "svg" "woff" "woff2"})`
- **Action**: **Cache eligible** → Edge TTL: **30 days** → Browser TTL: **30 days**

This caches the React-built assets at the CF edge → instant page loads globally.

## Step 8 — Health check the setup

After 5 minutes for the Cloudflare edge to populate, verify:

1. Browse to `https://deltaways.de/health` → should return `{ "status": "healthy", ... }`
2. Browse to `https://regulatory.deltaways.de/health` → same
3. Check the netcup nginx logs: `docker compose logs nginx | grep X-Forwarded-For`
   - You should see real client IPs in `X-Forwarded-For` and `CF-Connecting-IP` headers
4. Visit <https://www.cloudflare.com/cdn-cgi/trace/> from your normal browser connected through CF → should show `colo=...` (closest CF datacenter)

If `health` doesn't load → check Cloudflare DNS records (Step 3) and that the orange cloud is on.

## Step 9 — Enable analytics (optional, free)

Dashboard → **Analytics**.

You should immediately see traffic analytics: requests per country, threat analytics for blocked WAF hits, performance metrics.

Cloudflare also offers optional **Web Analytics** (privacy-friendly, no JS, GDPR-friendly). Add a small JS snippet to your index.html for real-user metrics:

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "<your-token>"}'></script>
```

Enable this end-to-end in Cloudflare → **Analytics → Web Analytics → Add site**.

## Step 10 — Maintenance

| Action | Frequency | Notes |
|---|---|---|
| Review WAF blocked events | weekly | Dashboard → Security → Events log |
| Rotate Cloudflare API tokens | every 90 days | If you create an API token for automation |
| Review Analytics traffic | weekly | Capacity planning |
| Review WAF rule false-positives | weekly | Add custom allow rules as needed |
| Add new tenant custom-domain | per onboarding | See Step 4 |

---

## Security hardening checklist (production-ready)

- [x] Cloudflare proxy (orange cloud) on apex + production subdomains
- [x] TLS 1.2+ only
- [x] HSTS preloaded
- [x] WAF rate-limit on `/api/auth/*`
- [x] nginx real_ip from CF whitelisted (config committed in `nginx.conf`)
- [x] nginx.cf-real-IP forwarded to Express (config committed)
- [x] Express `helmet()` + `trust proxy` CIDR list (config committed)
- [x] CORS allowlist via `ALLOWED_ORIGINS` env (config committed)
- [x] nginx serves the static React build with CSP-Strict
- [x] monitoring hostname DNS-only (grey cloud) + IP-restricted in nginx
- [ ] Sentry error tracking — recommend adding soon
- [ ] Daily backup of Postgres to S3 — confirm cron + restore drill
- [ ] Fail2ban on Netcup for SSH brute-force

---

## What Cloudflare gives you for free — recap

| Feature | Free? | What it does for HELIX |
|---|---|---|
| Global CDN | ✅ | Sub-100ms to any user worldwide |
| Unlimited DDoS mitigation | ✅ | L3/L4/L7 DDoS auto-blocked |
| WAF managed rulesets (limited) | ✅ | OWASP top-10 protection |
| Free SSL certificate | ✅ | No need for Let's Encrypt per host |
| 5 Page Rules / 10 Cache Rules | ✅ | Cache your static assets |
| Email forwarding | ✅ | Catch-all for `contact@yourdomain` |
| DNS hosting (authoritative, fast) | ✅ | Best DNS latency in industry |
| Analytics (basic) | ✅ | GDPR-friendly traffic reports |
| Web Analytics (privacy-friendly RUM) | ✅ | Real-user metrics |
| Custom Hostnames (per-tenant) | ⚠️ Add-on | Pro: $0.10/hostname/mo; Free: manual |
| Advanced Rate Limiting | ⚠️ add-on | Pro: $0.05 / 10k requests |

For "what we get for $0": massive.

---

## Next steps

1. Run the setup, follow Steps 1–10.
2. Once verified working:
   - Add `CLOUDFLARE_PROXY=true` to your deployment `.env`
   - Trigger a manual cloudflare cache purge after new React deploys: `wrangler pages deployment trigger --project-name=helix` (only if you also enable Cloudflare Pages — optional)
3. For the marketing-grade "wow" effect on paying customers, consider adding the optional `Web Analytics` JS snippet (Step 9).

Questions? Read the source of truth: <https://developers.cloudflare.com/>.
