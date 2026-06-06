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

// 🖼️ THUHI MD Logo Link (ඔයා හොයාගත්තු නියම PNG ලින්ක් එක)
const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png";

let sock = null;

// Anti-Delete සහ One-View තාවකාලිකව තබා ගන්නා තැන්
const messageStore = {};
const viewOnceStore = {}; 

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
            console.log('=================================================');
            console.log('🎉 THUHI MD සාර්ථකව සම්බන්ධ විය! (CONNECTED)');
            console.log('=================================================');
        }
    });

    // මැසේජ් ලැබෙන විට ක්‍රියාත්මක වන පද්ධතිය
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const from = mek.key.remoteJid;
            const msgId = mek.key.id;
            
            // Anti-Delete සඳහා මැසේජ් සේව් කරගැනීම
            messageStore[msgId] = mek;

            // One-View Photo එකක් ආවොත් මතකයට ගැනීම
            const isViewOnce = mek.message.viewOnceMessageV2 || mek.message.viewOnceMessage;
            if (isViewOnce) {
                const viewOnceMsg = mek.message.viewOnceMessageV2?.message?.imageMessage || mek.message.viewOnceMessage?.message?.imageMessage;
                if (viewOnceMsg) {
                    viewOnceStore[msgId] = viewOnceMsg;
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
                // 1. ALIVE COMMAND (.alive)
                if (command === 'alive') {
                    const aliveMsg = `👋 *THUHI MD IS ALIVE NOW*

*OWNER* - THUHI MD
*VERSION* - 1.0.0
*PREFIX* - [ . ]

💬 මාත් එක්ක තියෙන Commands ඔක්කොම බලන්න \`.menu\` ලෙස Type කරන්න!`;
                    await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: aliveMsg }, { quoted: mek });
                }

                // 2. MENU COMMAND (.menu)
                if (command === 'menu' || command === 'help') {
                    const menuText = `✨ *THUHI MD WHATSAPP BOT MENU* ✨

👋 හෙලෝ යාළුවා, මම THUHI MD බහුකාර්ය WhatsApp බෝට්.

*📥 DOWNLOAD COMMANDS:*
• \`.dl [link]\` - TikTok, FB, Insta, YouTube වීඩියෝ ඩවුන්ලෝඩ් කරන්න.

*🖼️ STICKER COMMANDS:*
• \`.sticker\` / \`.s\` - ඡායාරූපයකට Reply කර ස්ටිකර් එකක් සාදාගන්න.

*🔓 WHATSAPP TOOLS:*
• \`.ovp\` - One-View ඡායාරූපයකට Reply කර එය සාමාන්‍ය ඡායාරූපයක් ලෙස ලබාගන්න.

*🤖 SYSTEM COMMANDS:*
• \`.alive\` - බෝට් ක්‍රියාකාරීදැයි පරීක්ෂා කිරීමට.
• \`.menu\` - මේ මෙනුව ලබා ගැනීමට.

---
*🚨 AUTOMATIC FEATURES:*
• *Anti-Delete:* කවුරුහරි මකන මැසේජ් ඔටෝමැටිකව චැට් එකට ලබාදේ.

_Powered by Vimukthi Thuhina_`;
                    await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: menuText }, { quoted: mek });
                }

                // 3. ONE-VIEW RECOVERY COMMAND (.ovp)
                if (command === 'ovp') {
                    const quotedMsgId = mek.message.extendedTextMessage?.contextInfo?.stanzaId;
                    if (quotedMsgId && viewOnceStore[quotedMsgId]) {
                        const savedViewOnce = viewOnceStore[quotedMsgId];
                        await sock.sendMessage(from, { text: "⏳ *One-View ඡායාරූපය ලබා ගනිමින් පවතී...*" }, { quoted: mek });
                        
                        const stream = await downloadContentFromMessage(savedViewOnce, 'image');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                        
                        await sock.sendMessage(from, { image: buffer, caption: '🔓 *THUHI MD: One-View Photo Recovered!*' }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { text: "❌ කරුණාකර වලංගු One-View ඡායාරූපයකට පමණක් \`.ovp\` ලෙස Reply කරන්න." }, { quoted: mek });
                    }
                }

                // 4. STICKER COMMAND (.sticker)
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

                // 5. SOCIAL MEDIA VIDEO DOWNLOADER (.dl)
                if (command === 'dl' || command === 'download') {
                    const url = args[0];
                    if (!url) return await sock.sendMessage(from, { text: "❌ කරුණාකර වීඩියෝ ලින්ක් එකක් ඇතුළත් කරන්න." }, { quoted: mek });

                    await sock.sendMessage(from, { text: "⏳ *වීඩියෝව සකසමින් පවතී...*" });

                    try {
                        const res = await axios.get(`https://api.dreaded.site/api/download?url=${encodeURIComponent(url)}`);
                        if (res.data && res.data.result) {
                            const videoUrl = res.data.result.download_url || res.data.result.url;
                            await sock.sendMessage(from, { video: { url: videoUrl }, caption: "📥 *Downloaded by THUHI MD*" }, { quoted: mek });
                        } else {
                            await sock.sendMessage(from, { text: "❌ වීඩියෝව ලබා ගැනීමට JavaScript දෝෂයක් පවතී." }, { quoted: mek });
                        }
                    } catch (e) {
                        await sock.sendMessage(from, { text: "❌ සර්වර් දෝෂයකි. පසුව උත්සාහ කරන්න." });
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    });

    // Anti-Delete Detector System
    sock.ev.on('messages.update', async chatUpdate => {
        for (const { key, update } of chatUpdate) {
            if (update.messageStubType === 68 || update.revoke) {
                const deletedMsgId = key.id;
                const oldMessage = messageStore[deletedMsgId];

                if (oldMessage) {
                    const from = key.remoteJid;
                    const participant = key.participant || key.remoteJid;
                    await sock.sendMessage(from, { text: `🚨 *ANTI-DELETE DETECTED!* \n\n*Sender:* @${participant.split('@')[0]} මැසේජ් එකක් مකා දැමුවා:`, mentions: [participant] });
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
