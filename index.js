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

// Config
const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png";
const shrinkmeApi = "81bd69560df8d7ed1f3042d7bed34037908d4998"; 
const targetUrl = "https://youtube.com/@VimukthiThuhina"; 

app.use(express.static(path.join(__dirname)));
let sock = null;
const messageStore = {};
const viewOnceStore = {}; 

async function getEarnFooter() {
    let shortUrl = targetUrl; 
    try {
        const shortRes = await axios.get(`https://shrinkme.io/api?api=${shrinkmeApi}&url=${encodeURIComponent(targetUrl)}`);
        if (shortRes.data?.status === "success") shortUrl = shortRes.data.shortenedUrl; 
    } catch (e) { console.log("Shrinkme Error"); }
    return `\n\n💵 *මුදල් උපයන්න:* ${shortUrl}`;
}

async function startThuhiMD() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'close') startThuhiMD();
        else if (connection === 'open') console.log('THUHI MD READY!');
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            if (chatUpdate.type !== 'notify') return;
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            const isCmd = body.startsWith('.');
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : "";
            
            const earnFooter = await getEarnFooter();

            // මෙනු විධානය
            if (command === 'menu' || command === 'help') {
                const menuMsg = `🤖 *THUHI MD MENU* \n\n.alive - Check Status\n.s - Sticker\n.ovp - OneView\n.dl - Download${earnFooter}`;
                await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: menuMsg });
            }

            // ස්ටිකර් විධානය
            if (command === 's' || command === 'sticker') {
                const isQuotedImage = mek.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
                const isImage = mek.message.imageMessage;
                if (isImage || isQuotedImage) {
                    const buffer = await downloadMediaMessage(mek, 'buffer', {}, { logger: pino() });
                    const sticker = new Sticker(buffer, { pack: 'THUHI MD', author: 'Vimukthi', type: StickerTypes.FULL });
                    await sock.sendMessage(from, { sticker: await sticker.toBuffer() });
                }
            }

        } catch (err) { console.log(err); }
    });
}

// Web API
app.get('/code', async (req, res) => {
    const num = req.query.number;
    if (!num) return res.status(400).send("Number Required");
    const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ""));
    res.json({ code });
});

app.listen(PORT, () => startThuhiMD());
