# Super-Agent Bot Deployment auf AWS EC2

Hier ist die Anleitung, wie du deinen neuen Super-Agenten auf deiner AWS EC2-Instanz zum Laufen bringst.

## 1. Vorbereitung auf EC2
Verbinde dich per SSH mit deiner EC2-Instanz und installiere Node.js (falls noch nicht geschehen):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Repository aktualisieren
Gehe in das Verzeichnis deines Bots und ziehe die neuesten Änderungen von GitHub:
```bash
cd /pfad/zu/deinem/bot
git pull origin main
```

## 3. Abhängigkeiten installieren
Installiere die neuen Pakete:
```bash
npm install
```

## 4. Umgebungsvariablen (.env)
Stelle sicher, dass die `.env`-Datei auf deinem Server existiert und deine Keys enthält. Du kannst sie mit `nano .env` erstellen oder bearbeiten:
```env
TELEGRAM_BOT_TOKEN=DEIN_TELEGRAM_TOKEN
OPENAI_API_KEY=DEIN_OPENAI_KEY
PERPLEXITY_API_KEY=DEIN_PERPLEXITY_KEY
```

## 5. Bot dauerhaft laufen lassen (PM2)
Damit der Bot nicht stoppt, wenn du die Konsole schließt, empfehle ich **PM2**:
```bash
sudo npm install -g pm2
pm2 start bot.js --name "super-agent"
pm2 save
pm2 startup
```

## 6. Befehle im Telegram-Bot
Sobald der Bot läuft, kannst du folgende Befehle nutzen:
- `/start` - Zeigt die Hilfe an
- `/leads [Thema]` - Recherchiert Leads (z.B. `/leads Immobilienmakler in Berlin`)
- `/email [Kontext]` - Schreibt eine E-Mail (z.B. `/email Kaltakquise für Webdesign`)
- `/tiktok [Thema]` - Erstellt ein virales Skript (z.B. `/tiktok 3 Tipps für besseren Schlaf`)
- `/recht [Thema]` - Sucht familienrechtliche Beschlüsse (z.B. `/recht aktuelles Urteil zum Unterhalt 2024`)
- `/ask [Frage]` - Allgemeine KI-Analyse mit Perplexity
