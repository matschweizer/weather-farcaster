# ⛅ Weather-Farcaster Mini App

Eine vollständige Farcaster Mini App, die das aktuelle Wetter und eine 3-Tages-Vorschau anzeigt.

## Features

- 📍 Automatische Standorterkennung (GPS → IP-Fallback)
- ☀️ Aktuelle Temperatur + 3-Tages-Vorschau
- 🌅 Sonnenaufgang & Sonnenuntergang
- 🔄 Wetterdaten von Open-Meteo (kostenlos, kein API-Key)
- ⬡ Farcaster SDK mit `sdk.actions.ready()`
- 🗂️ Korrektes `fc:miniapp` Meta-Tag + Manifest

---

## 🚀 Deployment in 5 Schritten

### 1. Repository auf GitHub pushen

```bash
git init
git add .
git commit -m "init: weather farcaster mini app"
gh repo create weather-farcaster --public --push
```

### 2. Auf Vercel deployen

```bash
npm i -g vercel
vercel deploy --prod
```

Oder: [vercel.com/new](https://vercel.com/new) → GitHub repo importieren.

> **Notiere dir deine Vercel-Domain**, z.B. `weather-farcaster-xyz.vercel.app`

### 3. Domain in Dateien eintragen

Ersetze `YOUR_DOMAIN.vercel.app` in:
- `.env.local` → `NEXT_PUBLIC_DOMAIN=weather-farcaster-xyz.vercel.app`
- In Vercel Dashboard → Settings → Environment Variables → `NEXT_PUBLIC_DOMAIN` setzen

### 4. Farcaster Account Association generieren

1. Gehe zu [farcaster.xyz/~/settings/developer-tools](https://farcaster.xyz/~/settings/developer-tools)
2. Aktiviere **Developer Mode**
3. Klicke **Create Manifest**
4. Gib deine Domain ein (ohne `https://`)
5. Kopiere `header`, `payload`, `signature`
6. In Vercel: Environment Variables setzen:
   - `FC_HEADER` = dein header
   - `FC_PAYLOAD` = dein payload  
   - `FC_SIGNATURE` = deine signature
7. Erneut deployen: `vercel deploy --prod`

### 5. App testen

1. Gehe zu [farcaster.xyz/~/developers/mini-apps/debug](https://farcaster.xyz/~/developers/mini-apps/debug)
2. Gib deine URL ein
3. Klicke **Preview** — deine App erscheint im Warpcast-Viewer!

---

## 📁 Projektstruktur

```
weather-farcaster/
├── app/
│   ├── layout.tsx              # fc:miniapp Meta-Tag
│   ├── page.tsx                # Haupt-UI mit Farcaster SDK
│   ├── page.module.css         # Styles
│   ├── globals.css             # Globale Styles
│   ├── og-image.png/           # OG-Bild (3:2) für Embed
│   │   └── route.tsx
│   └── .well-known/
│       └── farcaster.json/
│           └── route.ts        # Manifest API Route
├── public/
│   ├── icons/
│   │   ├── icon.png            # 200×200px App-Icon (manuell hinzufügen)
│   │   └── splash.png          # 200×200px Splash-Icon (manuell hinzufügen)
│   └── .well-known/
│       └── farcaster.json      # Statisches Manifest (Fallback)
├── vercel.json
├── next.config.js
└── .env.local.example
```

## 📸 Icons hinzufügen

Lege folgende Bilder in `public/icons/` ab:
- `icon.png` — 200×200px, App-Icon
- `splash.png` — 200×200px, Splash-Screen-Icon

---

## 🛠 Lokale Entwicklung

```bash
npm install
cp .env.local.example .env.local
# .env.local bearbeiten
npm run dev
```

Dann öffne [localhost:3000](http://localhost:3000).

**Im Farcaster-Client testen:**
```bash
npx @farcaster/miniapp-devtools
```

---

## Datenquellen

| Service | Zweck | Kosten |
|---------|-------|--------|
| [Open-Meteo](https://open-meteo.com) | Wetterdaten | Kostenlos |
| [OpenStreetMap Nominatim](https://nominatim.org) | Reverse Geocoding | Kostenlos |
| [ipapi.co](https://ipapi.co) | IP-Standort Fallback | Kostenlos (1000/Tag) |
