const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Hilfsfunktion für Perplexity-Anfragen
async function askPerplexity(prompt) {
    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar-reasoning-pro',
            messages: [
                { role: 'system', content: 'Du bist ein präziser Recherche-Assistent. Antworte auf Deutsch.' },
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Perplexity Error:', error.response ? error.response.data : error.message);
        return 'Fehler bei der Recherche mit Perplexity.';
    }
}

// Start-Befehl
bot.start((ctx) => {
    ctx.reply('Willkommen beim Super-Agenten! 🚀\n\nIch kann für dich:\n' +
        '🔍 /leads [Thema] - Leads recherchieren\n' +
        '📧 /email [Kontext] - E-Mails schreiben\n' +
        '🎬 /tiktok [Thema] - Virale Skripte erstellen\n' +
        '⚖️ /recht [Thema] - Familienrechtliche Beschlüsse finden\n' +
        '🤖 /ask [Frage] - Allgemeine KI-Analyse');
});

// Leads recherchieren
bot.command('leads', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Bitte gib ein Thema an, z.B. /leads Immobilienmakler in Berlin');
    
    ctx.reply('Ich recherchiere Leads für dich... 🔍');
    const result = await askPerplexity(`Finde potenzielle Leads für: ${query}. Liste Firmennamen, Websites und Kontaktmöglichkeiten auf, falls verfügbar.`);
    ctx.reply(result);
});

// E-Mails schreiben
bot.command('email', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Bitte gib den Kontext an, z.B. /email Kaltakquise für Webdesign');
    
    ctx.reply('Ich erstelle den E-Mail-Entwurf... 📧');
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Du bist ein Experte für Copywriting und E-Mail-Marketing." },
                { role: "user", content: `Schreibe eine professionelle E-Mail für folgenden Zweck: ${query}` }
            ]
        });
        ctx.reply(completion.choices[0].message.content);
    } catch (error) {
        ctx.reply('Fehler bei der E-Mail-Erstellung.');
    }
});

// TikTok Skripte
bot.command('tiktok', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Bitte gib ein Thema an, z.B. /tiktok 3 Tipps für besseren Schlaf');
    
    ctx.reply('Ich erstelle ein virales TikTok-Skript... 🎬');
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Du bist ein Experte für virales Marketing auf TikTok. Erstelle Skripte mit Hook, Mehrwert und Call-to-Action." },
                { role: "user", content: `Erstelle ein virales TikTok-Skript für: ${query}` }
            ]
        });
        ctx.reply(completion.choices[0].message.content);
    } catch (error) {
        ctx.reply('Fehler bei der Skript-Erstellung.');
    }
});

// Familienrecht Recherche
bot.command('recht', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Bitte gib ein Thema an, z.B. /recht aktuelles Urteil zum Unterhalt 2024');
    
    ctx.reply('Ich suche nach aktuellen familienrechtlichen Beschlüssen... ⚖️');
    const result = await askPerplexity(`Suche nach aktuellen familienrechtlichen Beschlüssen oder Urteilen zu: ${query}. Nenne Aktenzeichen und eine kurze Zusammenfassung.`);
    ctx.reply(result);
});

// Allgemeine Analyse
bot.command('ask', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('Bitte stelle eine Frage.');
    
    ctx.reply('Ich analysiere das für dich... 🤖');
    const result = await askPerplexity(query);
    ctx.reply(result);
});

bot.launch();
console.log('Super-Agent Bot ist gestartet!');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
