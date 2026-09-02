# 🚀 Stremio Addon Portal & Configurator (Google Material 3)

Un portale web completo, moderno e reattivo in stile **Google Material Design 3** per ospitare, configurare e distribuire il tuo Addon Stremio.

Dotato di supporto sia per **Tema Chiaro** che **Tema Scuro**, gestione provider Debrid, filtri risoluzioni fino a 4K UHD, priorità audio in lingua italiana, generatore istantaneo di manifest e codici QR per l'installazione immediata su Smart TV (Android TV, Google TV, Fire Stick) e Web.

---

## 📸 Caratteristiche Principali

- 🎨 **Google Material 3 Design**: Grafica pulita, arrotondata, intuitiva con la palette ufficiale Google (Blu `#4285F4`, Rosso `#EA4335`, Giallo `#FBBC04`, Verde `#34A853`).
- 🌓 **Tema Chiaro & Tema Scuro**: Switch istantaneo in testata con memorizzazione preferenza (`localStorage`) e rispetto del tema di sistema OS.
- ⚡ **Supporto Debrid Multi-Provider**: Real-Debrid, AllDebrid, Premiumize, TorBox, Debrid-Link con gestione sicura delle API Key.
- 🇮🇹 **Filtri Lingua Italiana**: Priorità a tracce audio italiane, multi-audio e requisiti per sottotitoli.
- 📺 **Risoluzioni & Formati**: 4K UHD, 1080p, 720p, 480p, HDR10+, Dolby Vision, filtro esclusione CAM / TS.
- 📱 **Installazione 1-Click & QR Code**: 
  - Protocollo diretto `stremio://` per app Desktop & Mobile.
  - Link Stremio Web (`https://web.stremio.com/#/addons?addon=...`).
  - **Codice QR dinamico integrato** (funziona offline senza dipendenze CDN esterne).
- 🩺 **Live Health Check**: Monitoraggio in tempo reale della latenza e dello stato online del server.
- 📄 **Simulatore & Ispezione Live Manifest**: JSON v3 e anteprima grafica dei flussi stream in tempo reale.

---

## 🛠️ Avvio Rapido Locale

### 1. Installazione delle dipendenze
```bash
npm install
```

### 2. Avvio del Server
```bash
# Su Linux / macOS / Git Bash / PowerShell:
PUBLIC_BASE_URL=http://localhost:7000 npm start

# Su Windows PowerShell (alternativa con variabile d'ambiente):
$env:PUBLIC_BASE_URL="http://localhost:7000"; npm start

# Su Windows CMD:
set PUBLIC_BASE_URL=http://localhost:7000 && npm start
```

Il server sarà attivo su:
- 🌐 **Interfaccia Web di Configurazione**: `http://localhost:7000/` oppure `http://localhost:7000/configure`
- 📄 **Manifest Stremio**: `http://localhost:7000/manifest.json`
- 🩺 **Health Check**: `http://localhost:7000/health`

---

## 🌐 Deploy su Cloud & Server Pubblici

Per rendere accessibile l'addon a chiunque su Stremio Web o Smart TV fuori dalla rete locale:

### Variabili d'Ambiente Supportate
| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `PORT` | Porta su cui ascolta il server | `7000` |
| `PUBLIC_BASE_URL` | URL pubblico con cui raggiungere l'addon | `http://localhost:7000` |

### Deploy su Render / Railway
1. Collega il repository GitHub.
2. Imposta Build Command: `npm install`
3. Imposta Start Command: `npm start`
4. Aggiungi la variabile d'ambiente:
   - `PUBLIC_BASE_URL`: `https://tuo-addon.onrender.com`

### Deploy con Docker
```bash
# Build dell'immagine
docker build -t stremio-addon .

# Esecuzione container
docker run -d -p 7000:7000 -e PUBLIC_BASE_URL=https://tuo-dominio.com stremio-addon
```

---

## 📁 Struttura del Progetto

```
stremio-addon-configurator/
├── package.json          # Dipendenze e script npm
├── server.js             # Server Express con protocollo Stremio Addon v3
├── README.md             # Documentazione e guida
└── public/
    ├── index.html        # Portale di configurazione Google Style
    ├── style.css         # Stili CSS Material Design 3, Dark & Light Mode
    └── app.js            # Logica frontend, generatore link, QR Code e live ping
```

---

## 📄 Licenza
Rilasciato sotto licenza MIT.
