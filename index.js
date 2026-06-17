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

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Config
const botLogoUrl = "https://i.ibb.co/Z6gnPvV2/file-000009be47207afef1535933c3f19.png";
const shrinkmeApi = "81bd69560df8d7ed1f3042d7bed34037908d4998";
const targetUrl = "https://youtube.com/@VimukthiThuhina";

let sock = null;
let isReady = false; // Bot ready flag එක

const messageStore = {};
const viewOnceStore = {};

async function getEarnFooter() {
    let shortUrl = targetUrl;
    try {
        const shortRes = await axios.get(`https://shrinkme.io/api?api=${shrinkmeApi}&url=${encodeURIComponent(targetUrl)}`);
        if (shortRes.data && shortRes.data.status === "success") {
            shortUrl = shortRes.data.shortenedUrl;
        }
    } catch (e) {
        console.log("Shrinkme API error");
    }
    return `\n\n💵 *ඔබත් කැමතිද මුදල් උපයන්න මෙම link එකෙන් යන්න:*\n👉 ${shortUrl}\n\n*📌 පියවර 3:*\n1️⃣ 'CLOSE' / 'X' ඔබන්න\n2️⃣ 'Click here to continue' ඔබන්න\n3️⃣ තත්පර 5 ඉඳලා 'Get Link' ඔබන්න`;
}

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

        if (connection === 'open') {
            isReady = true;
            console.log('=================================================');
            console.log('🎉 THUHI MD IS RUNNING AND READY NOW!');
            console.log('=================================================');

            try {
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const welcomeMsg = `✨ *THUHI MD සම්බන්ධ වෙමින් පවතී...*\n\nදැන් \`.alive\` ටයිප් කරලා check කරපන්!\n\n_Powered by Vimukthi Thuhina_`;
                await sock.sendMessage(myNumber, { image: { url: botLogoUrl }, caption: welcomeMsg });
            } catch (e) {
                console.log("Welcome msg error:", e);
            }
        }
        else if (connection === 'close') {
            isReady = false;
            const shouldReconnect = lastDisconnect.error?.output?.statusCode!== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', lastDisconnect.error);
            if (shouldReconnect) {
                await delay(5000);
                startThuhiMD();
            }
        }
    });

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            if (chatUpdate.type!== 'notify') return;
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            const from = mek.key.remoteJid;
            const msgId = mek.key.id;
            messageStore[msgId] = mek;

            const isViewOnce = mek.message.viewOnceMessageV2 || mek.message.viewOnceMessage;
            if (isViewOnce) viewOnceStore[msgId] = mek;

            let msgType = Object.keys(mek.message)[0];
            if (msgType === 'ephemeralMessage') {
                mek.message = mek.message.ephemeralMessage.message;
                msgType = Object.keys(mek.message)[0];
            }

            let body = '';
            if (msgType === 'conversation') body = mek.message.conversation;
            else if (msgType === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
            else if (msgType === 'imageMessage') body = mek.message.imageMessage.caption;
            else if (msgType === 'videoMessage') body = mek.message.videoMessage.caption;

            const prefix = '.';
            const isCmd = body.startsWith(prefix);
            const command = isCmd? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : undefined;
            const args = body.trim().split(/ +/).slice(1);

            if (isCmd) {
                const earnFooterText = await getEarnFooter();

                if (command === 'alive') {
                    const aliveMsg = `👋 *THUHI MD IS ALIVE NOW*\n\n*OWNER* - THUHI MD\n*VERSION* - 1.0.0\n*PREFIX* - [. ]\n\n💬 \`.menu\` ටයිප් කරපන්!${earnFooterText}`;
                    await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: aliveMsg }, { quoted: mek });
                }

                if (command === 'menu' || command === 'help') {
                    const menuCmd = require('./menu.js');
                    await menuCmd.execute(sock, mek, from, botLogoUrl, earnFooterText);
                }

                if (command === 'ovp') {
                    const quotedMsgId = mek.message.extendedTextMessage?.contextInfo?.stanzaId;
                    if (quotedMsgId && viewOnceStore[quotedMsgId]) {
                        await sock.sendMessage(from, { text: "⏳ One-View ඡායාරූපය සකසමින්..." }, { quoted: mek });
                        const targetMek = viewOnceStore[quotedMsgId];
                        const buffer = await downloadMediaMessage(targetMek, 'buffer', {}, { logger: pino() });
                        await sock.sendMessage(from, { image: buffer, caption: `🔓 One-View Photo Saved!${earnFooterText}` }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { text: `❌ One-View ඡායාරූපයකට reply කරපන්.${earnFooterText}` }, { quoted: mek });
                    }
                }

                if (command === 'sticker' || command === 's') {
                    const isQuotedImage = msgType === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage;
                    const isImage = msgType === 'imageMessage';

                    if (isImage || isQuotedImage) {
                        await sock.sendMessage(from, { text: "⏳ ස්ටිකරය සාදමින්..." }, { quoted: mek });
                        let targetMekForSticker = mek;
                        if (isQuotedImage) {
                            targetMekForSticker = { message: mek.message.extendedTextMessage.contextInfo.quotedMessage };
                        }
                        const buffer = await downloadMediaMessage(targetMekForSticker, 'buffer', {}, { logger: pino() });
                        const sticker = new Sticker(buffer, {
                            pack: 'THUHI MD Pack',
                            author: 'Vimukthi Thuhina',
                            type: StickerTypes.FULL,
                            quality: 70
                        });
                        const stickerBuffer = await sticker.toBuffer();
                        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
                        await sock.sendMessage(from, { text: `🎉 ස්ටිකරය සාර්ථකයි!${earnFooterText}` }, { quoted: mek });
                    } else {
                        await sock.sendMessage(from, { text: `❌ Photo එකකට.s ගහපන්.${earnFooterText}` }, { quoted: mek });
                    }
                }

                if (command === 'dl' || command === 'download') {
                    const url = args[0];
                    if (!url) return await sock.sendMessage(from, { text: "❌ ලින්ක් එක දාපන්." }, { quoted: mek });
                    await sock.sendMessage(from, { text: "⏳ වීඩියෝව සකසමින්..." });
                    try {
                        const res = await axios.get(`https://api.dreaded.site/api/download?url=${encodeURIComponent(url)}`);
                        if (res.data && res.data.result) {
                            const videoUrl = res.data.result.download_url || res.data.result.url;
                            const captionText = `📥 Downloaded by THUHI MD${earnFooterText}`;
                            await sock.sendMessage(from, { video: { url: videoUrl }, caption: captionText }, { quoted: mek });
                        } else {
                            await sock.sendMessage(from, { text: `❌ වීඩියෝව ගන්න බැරි උනා.${earnFooterText}` });
                        }
                    } catch (e) {
                        await sock.sendMessage(from, { text: `❌ Server error.${earnFooterText}` });
                    }
                }
            }
        } catch (err) {
            console.log("Upsert error:", err);
        }
    });

    sock.ev.on('messages.update', async chatUpdate => {
        for (const { key, update } of chatUpdate) {
            if (update.messageStubType === 68 || update.revoke) {
                const deletedMsgId = key.id;
                const oldMessage = messageStore[deletedMsgId];
                if (oldMessage) {
                    const from = key.remoteJid;
                    const participant = key.participant || key.remoteJid;
                    const senderNum = participant.split('@')[0];
                    let innerMsg = oldMessage.message;
                    let innerType = Object.keys(innerMsg)[0];
                    if (innerType === 'ephemeralMessage') {
                        innerMsg = innerMsg.ephemeralMessage.message;
                        innerType = Object.keys(innerMsg)[0];
                    }
                    let deletedText = '📦 Media';
                    if (innerType === 'conversation') deletedText = innerMsg.conversation;
                    else if (innerType === 'extendedTextMessage') deletedText = innerMsg.extendedTextMessage.text;
                    else if (innerType === 'imageMessage') deletedText = innerMsg.imageMessage.caption || '🖼️ Photo';
                    const earnFooterText = await getEarnFooter();
                    const antiDeleteAlert = `*🛑 ANTI DELETE DETECTED*\n\n• *Deleted By:* @${senderNum}\n• *Message:* ${deletedText}\n\n| © THUHI MD${earnFooterText}`;
                    await sock.sendMessage(from, { text: antiDeleteAlert, mentions: [participant] });
                }
            }
        }
    });
}

// FIXED PAIRING CODE API
app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number එක දාපන්" });

    num = num.replace(/[^0-9]/g, "");
    if (!num.startsWith('94')) return res.status(400).json({ error: "94 වලින් පටන් ගන්න. උදා: 94771234567" });

    try {
        if (!sock ||!isReady) {
            return res.status(503).json({ error: "Bot start වෙමින් පවතී. තත්පර 10 ඉඳලා ආපහු try කරපන්" });
        }

        await delay(3000); // WhatsApp ready වෙන්න ඉඩ
        let code = await sock.requestPairingCode(num);
        if (!code) return res.status(500).json({ error: "Code generate උනේ නෑ. පැය 2 ඉඳලා try කරපන්" });

        code = code.match(/.{1,4}/g)?.join('-') || code; // 1234-5678 format
        console.log('Pairing Code:', code, 'for', num);
        return res.json({ code: code, status: "success" });
    } catch (error) {
        console.log("Pairing error:", error);
        return res.status(500).json({ error: error.message || "Code error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startThuhiMD();
});
