const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = {
    execute: async (sock, mek, from, command, args, botLogoUrl, footer) => {
        if (command === 'dl') return module.exports.download(sock, mek, from, args, botLogoUrl, footer);
        if (command === 's' || command === 'sticker') return module.exports.sticker(sock, mek, from, botLogoUrl, footer);
        if (command === 'ovp') return module.exports.oneViewPhoto(sock, mek, from, botLogoUrl, footer);
    },

    download: async (sock, mek, from, args, botLogoUrl, earnFooterText) => {
        const url = args[0];
        if (!url) return await sock.sendMessage(from, { text: "❌ ලින්ක් එකක් දෙන්න." });
        await sock.sendMessage(from, { text: "🔍 පරීක්ෂා කරයි..." });
        const res = await axios.get(`https://api.dreaded.site/api/download?url=${encodeURIComponent(url)}`);
        const data = res.data.result;
        if (!data) return await sock.sendMessage(from, { text: "❌ සොයාගත නොහැකි විය." });
        await sock.sendMessage(from, { image: { url: data.thumbnail }, caption: `*${data.title}*\n\n👇 *Quality එක තෝරන්න:*` + earnFooterText }, { quoted: mek });
        await sock.sendMessage(from, { text: "Quality තෝරන්න:", sections: [{ title: "Select Quality", rows: [
            { title: '🎥 720p HD', rowId: `.dl-final ${data.url_720 || data.url}` },
            { title: '🎥 480p SD', rowId: `.dl-final ${data.url_480 || data.url}` },
            { title: '🎥 360p Low', rowId: `.dl-final ${data.url_360 || data.url}` }
        ]}], buttonText: 'SELECT QUALITY', listType: 1 });
    },

    downloadFinal: async (sock, mek, from, url) => {
        await sock.sendMessage(from, { text: "⏳ බාගත වෙමින්..." });
        await sock.sendMessage(from, { video: { url: url }, caption: "📥 *Downloaded by THUHI MD*" });
    },

    sticker: async (sock, mek, from, botLogoUrl, earnFooterText) => {
        const isQuotedImage = mek.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (!isQuotedImage) return await sock.sendMessage(from, { text: "❌ පින්තූරයකට Reply කරන්න." });
        const buffer = await downloadMediaMessage({ message: mek.message.extendedTextMessage.contextInfo.quotedMessage }, 'buffer', {}, { logger: pino() });
        const sticker = new Sticker(buffer, { pack: 'THUHI MD', author: 'Vimukthi', type: StickerTypes.FULL, quality: 70 });
        await sock.sendMessage(from, { sticker: await sticker.toBuffer() });
    },

    oneViewPhoto: async (sock, mek, from, botLogoUrl, earnFooterText) => {
        const quotedMsgId = mek.message.extendedTextMessage?.contextInfo?.stanzaId;
        const targetMek = global.viewOnceStore[quotedMsgId];
        if (targetMek) {
            const buffer = await downloadMediaMessage(targetMek, 'buffer', {}, { logger: pino() });
            await sock.sendMessage(from, { image: buffer, caption: "🔓 *One-View Photo Saved!*" }, { quoted: mek });
        } else {
            await sock.sendMessage(from, { text: "❌ වලංගු One-View පින්තූරයකට Reply කරන්න." });
        }
    }
};
