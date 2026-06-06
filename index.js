const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png";
let sock = null;

// Anti-Delete සහ One-View තාවකාලිකව තබා ගන්නා තැන්
const messageStore = {};
const viewOnceStore = {}; // One View Photo රහසින් මතක තබා ගැනීමට

app.use(express.static(path.join(__dirname)));

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
            console.log('🎉 THUHI MD CONNECTED SUCCESSFULLY!');
        }
    });

    // මැසේජ් ලැබෙන විට ක්‍රියාත්මක වන පද්ධතිය
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const from = mek.key.remoteJid;
            const msgId = mek.key.id;
            
            // 🛑 ANTI-DELETE සඳහා සාමාන්‍ය මැසේජ් සේව් කරගැනීම
            messageStore[msgId] = mek;

            // 🔓 ONE-VIEW PHOTO එකක් ආවොත් ඒක කාටත් හොරෙන් බෝට්ගේ මතකයට ගැනීම
            const isViewOnce = mek.message.viewOnceMessageV2 || mek.message.viewOnceMessage;
            if (isViewOnce) {
                const viewOnceMsg = mek.message.viewOnceMessageV2?.message?.imageMessage || mek.message.viewOnceMessage?.message?.imageMessage;
                if (viewOnceMsg) {
                    viewOnceStore[msgId] = viewOnceMsg; // මැසේජ් ID එකෙන් සේව් කරගන්නවා
                }
            }

            // Ephemeral පිරිසිදු කිරීම
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            const type = Object.keys(mek.message)[0];
            
            // Text එක ලබා ගැනීම
            let body = '';
            if (type === 'conversation') body = mek.message.conversation;
            else if (type === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
            else if (type === 'imageMessage') body = mek.message.imageMessage.caption;
            else if (type === 'videoMessage') body = mek.message.videoMessage.caption;

            const prefix = '.';
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : undefined;
            const args = body.trim().split(/ +/).slice(1);

            if (isCmd) {
                // ALIVE COMMAND
                if (command === 'alive') {
                    await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: `👋 *THUHI MD IS ALIVE*` }, { quoted: mek });
                }

                // 🔓 1. ONE-VIEW RECOVERY COMMAND (.ovp)
                if (command === 'ovp') {
                    // ඔයා Reply කරපු මැසේජ් එකේ ID එක ගන්නවා
                    const quotedMsgId = mek.message.extendedTextMessage?.contextInfo?.stanzaId;
                    
                    if (quotedMsgId && viewOnceStore[quotedMsgId]) {
                        const savedViewOnce = viewOnceStore[quotedMsgId];
                        
                        await sock.sendMessage(from, { text: "⏳ *One-View ඡායාරූපය ලබා ගනිමින් පවතී...*" }, { quoted: mek });
                        
                        // ඩවුන්ලෝඩ් කර චැට් එකට යැවීම
                        const stream = await downloadContentFromMessage(savedViewOnce, 'image');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }
                        
                        await sock.sendMessage(from, { image: buffer, caption: '🔓 *THUHI MD: One-View Photo Recovered!*' }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { text: "❌ කරුණාකර වලංගු One-View (View Once) ඡායාරූපයකට පමණක් `.ovp` ලෙස Reply කරන්න. (නැතහොත් බෝට් පණ ගැන්වීමට පෙර ලැබුණු එකක් විය හැක)" }, { quoted: mek });
                    }
                }

                // 🖼️ 2. STICKER COMMAND
                if (command === 'sticker' || command === 's') {
                    const isQuotedImage = type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage;
                    const isImage = type === 'imageMessage';

                    if (isImage || isQuotedImage) {
                        const imgMessage = isImage ? mek.message.imageMessage : mek.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
                        const stream = await downloadContentFromMessage(imgMessage, 'image');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                        await sock.sendMessage(from, { sticker: buffer }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { text: "❌ කරුණාකර ඡායාරූපයකට (Photo) .sticker ලෙස Reply කරන්න." }, { quoted: mek });
                    }
                }

                // 📥 3. SOCIAL MEDIA VIDEO DOWNLOADER
                if (command === 'dl' || command === 'download') {
                    const url = args[0];
                    if (!url) return await sock.sendMessage(from, { text: "❌ කරුණාකර වීඩියോ ලින්ක් එකක් ඇතුළත් කරන්න." }, { quoted: mek });

                    await sock.sendMessage(from, { text: "⏳ *වීඩියෝව සකසමින් පවතී...*" });

                    try {
                        const res = await axios.get(`https://api.dreaded.site/api/download?url=${encodeURIComponent(url)}`);
                        if (res.data && res.data.result) {
                            const videoUrl = res.data.result.download_url || res.data.result.url;
                            await sock.sendMessage(from, { video: { url: videoUrl }, caption: "📥 *Downloaded by THUHI MD*" }, { quoted: mek });
                        } else {
                            await sock.sendMessage(from, { text: "❌ වීඩියෝව ලබා ගැනීමට නොහැකි විය." }, { quoted: mek });
                        }
                    } catch (e) {
                        await sock.sendMessage(from, { text: "❌ සර්වර් දෝෂයකි." }, { quoted: mek });
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    });

    // 🚨 4. ANTI-DELETE DETECTOR
    sock.ev.on('messages.update', async chatUpdate => {
        for (const { key, update } of chatUpdate) {
            if (update.messageStubType === 68 || update.revoke) {
                const deletedMsgId = key.id;
                const oldMessage = messageStore[deletedMsgId];

                if (oldMessage) {
                    const from = key.remoteJid;
                    const participant = key.participant || key.remoteJid;
                    await sock.sendMessage(from, { text: `🚨 *ANTI-DELETE DETECTED!* \n\n*Sender:* @${participant.split('@')[0]} මැසේජ් එකක් මකා දැමුවා:`, mentions: [participant] });
                    await sock.copyNForward(from, oldMessage, true);
                }
            }
        }
    });
}

// Web API Endpoint
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number is required" });
    num = num.replace(/[^0-9]/g, ""); 
    try {
        if (!sock) return res.status(500).json({ error: "Server not ready" });
        await delay(2000);
        let code = await sock.requestPairingCode(num.trim());
        return res.json({ code: code });
    } catch (error) {
        return res.status(500).json({ error: "Error getting code" });
    }
});

app.listen(PORT, () => {
    startThuhiMD();
});
