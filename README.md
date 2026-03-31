# Inject_synthesizer

A synthesizer app accessible from any device via a public URL.

## 🌐 Public URL Options

### Option 1 — GitHub Pages (static, always-on)

The `public/index.html` is automatically deployed to GitHub Pages on every push to `main`:

```
https://rigvida04.github.io/Inject_synthesizer/
```

### Option 2 — Live tunnel (dynamic, for development)

Run the app locally and expose it instantly as a **public URL** reachable from any device on any network — no port forwarding required.

#### Prerequisites

```bash
npm install
```

#### Start the server only (localhost:3000)

```bash
npm start
# → http://localhost:3000
```

#### Start the server AND open a public tunnel

```bash
npm run tunnel
```

This will output something like:

```
=================================================
  Public URL: https://<random>.loca.lt
  Share this URL to open the app on any device.
=================================================
```

Share that URL with anyone — it works on phones, tablets, and other computers without any firewall configuration.

> **Note:** The subdomain can be customized via the `TUNNEL_SUBDOMAIN` environment variable:
>
> ```bash
> TUNNEL_SUBDOMAIN=my-synth npm run tunnel
> ```
>
> If a fixed subdomain is unavailable, the script automatically falls back to a random URL.
