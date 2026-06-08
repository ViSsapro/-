const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay,
    downloadMediaMessage
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const axios = require("axios");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const app = express();
const PORT = process.env.PORT || 3000;

const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png";
const shrinkmeApi = "81bd69560df8d7ed1f3042d7bed34037908d4998"; 
const targetUrl = "https://youtube.com/@VimukthiThuhina"; 

async function getEarnFooter() {
    let shortUrl = targetUrl; 
    try {
        const shortRes = await axios.get(`https://shrinkme.io/api?api=${shrinkmeApi}&url=${encodeURIComponent(targetUrl)}`);
        if (shortRes.data && shortRes.data.status === "success") {
            shortUrl = shortRes.data.shortenedUrl; 
        }
    } catch (shortErr) { console.log("Shrinkme API error"); }
    
    return `\n\n💵 *ඔබත් කැමතිද මුදල් උපයන්න මෙම link එකෙන් යන්න:*
👉 ${shortUrl}`;
}

let sock = null;
const messageStore = {};
const viewOnceStore = {}; 

async function startThuhiMD() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logLevel: 'silent',
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startThuhiMD();
        } else if (connection === 'open') {
            console.log('🎉 THUHI MD IS RUNNING!');
        }
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        if (chatUpdate.type !== 'notify') return;
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        const from = mek.key.remoteJid;
        
        let body = (mek.message.conversation) || (mek.message.extendedTextMessage?.text) || "";
        const prefix = '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : undefined;
        const args = body.trim().split(/ +/).slice(1);

        if (isCmd) {
            const earnFooterText = await getEarnFooter();

            if (command === 'dl') {
                const url = args[0];
                const type = args[1] || 'mp4';
                if (!url) return await sock.sendMessage(from, { text: "❌ ලින්ක් එකක් දෙන්න." });
                
                await sock.sendMessage(from, { text: "⏳ *සකසමින් පවතී...*" });
                
                try {
                    // API URLs
                    const mp3Api = `https://podda-api.zone.id/ytmp3_2?url=${encodeURIComponent(url)}`;
                    const mp4Api = `https://podda-api.zone.id/ytmp4_2?url=${encodeURIComponent(url)}`;
                    
                    const res = await axios.get(type === 'mp3' ? mp3Api : mp4Api);
                    const data = res.data.result;

                    if (type === 'mp3') {
                        await sock.sendMessage(from, { audio: { url: data.download_url || data.url }, mimetype: 'audio/mpeg' }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { video: { url: data.download_url || data.url }, caption: `📥 *Downloaded by THUHI MD*${earnFooterText}` }, { quoted: mek });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { text: "❌ දෝෂයක් සිදුවිය." });
                }
            }
        }
    });
}

app.listen(PORT, () => {
    startThuhiMD();
});
