const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// 🖼️ Logo එක
const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png";

// වෙනම ෆයිල්ස්
const menuCmd = require('./menu.js');
const mediaCmd = require('./media.js');

// --- WEB SERVER (index.html එක Load වීමට) ---
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let sock = null;

async function startThuhiMD() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') startThuhiMD(); });

    sock.ev.on('messages.upsert', async chatUpdate => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        
        const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
        const prefix = '.'; // මෙතන prefix එක අමතක වෙලා තිබුනා
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : undefined;

        if (command === 'menu' || command === 'amenu') {
            await menuCmd.execute(sock, mek, botLogoUrl);
        } else if (command === 'sticker' || command === 's') {
            await mediaCmd.sticker(sock, mek, botLogoUrl);
        } else if (command === 'dl') {
            await mediaCmd.download(sock, mek, botLogoUrl);
        }
    });
}

// Web server සහ Bot දෙකම Start කිරීම
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startThuhiMD();
});

