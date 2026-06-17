module.exports = {
    execute: async (sock, mek, from, botLogoUrl, earnFooterText) => {

        const date = new Date().toLocaleDateString('en-GB');
        const time = new Date().toLocaleTimeString('en-GB');
        const prefix = '.';

        const mainMenu = `
╭┈୨💕୧┈╮
      𝐀𝐌𝐈𝐔𝐃𝐌𝐎𝐃𝐙 𝐁𝐎𝐓
╰┈୨💕୧┈╯

🌸 Hey Bestie~!

Welcome to amiudmodz 🎀

♡ ${date}
♡ ${time}

─────────────

🩷 Reply with number:

1️⃣ ♡ 🛠️ System
2️⃣ ♡ 👥 Group  
3️⃣ ♡ 🖼️ Media
4️⃣ ♡ 📥 Download
5️⃣ ♡ 🫧 Anime
6️⃣ ♡ 🌐 Info
7️⃣ ♡ 🎯 Fun
8️⃣ ♡ 🔞 NSFW
9️⃣ ♡ 🎥 Movie

─────────────

🎀 Web: https://amiudmodz.onrender.com
💌 Made With Love by amiudmodz
        `;

        const downloadMenu = `
╭───❀ 𝓓𝓞𝓦𝓝𝓛𝓞𝓐𝓓 ❀───╮

❶ 📘 \`${prefix}facebook link\` - FB Video
❷ 🎵 \`${prefix}tiktok link\` - TikTok Video
❸ 📸 \`${prefix}instagram link\` - IG Video
❹ 🎧 \`${prefix}song name\` - YouTube MP3
❺ 🎬 \`${prefix}video name\` - YouTube MP4
❻ 🔗 \`${prefix}csend\` - Coming Soon
❼ 📦 \`${prefix}apk name\` - APK Download
❽ 📎 \`${prefix}comicdl\` - Comic Download
❾ 🏷️ \`${prefix}mangadl\` - Manga Download

─────────────── 🌸
> amiudmodz Bot
        `;

        const groupMenu = `
╭───❀ 𝓖𝓡𝓞𝓤𝓟 ❀───╮

❶ ➕ \`${prefix}add 94xxx\` - Add Member
❷ ❌ \`${prefix}kick @tag\` - Remove Member
❸ ⬆️ \`${prefix}promote @tag\` - Make Admin
❹ ⬇️ \`${prefix}demote @tag\` - Remove Admin
❺ 🔓 \`${prefix}group open\` - Open Group
❻ 🔒 \`${prefix}group close\` - Close Group
❼ 📄 \`${prefix}groupinfo\` - Group Info
❽ 📢 \`${prefix}tagall\` - Tag All Members
❾ 👻 \`${prefix}hidetag msg\` - Hidden Tag
❿ 📋 \`${prefix}grouplist\` - Group List
⓫ ⚙️ \`${prefix}groupsetting\` - Settings
⓬ 🖼️ \`${prefix}setgpp\` - Set Group DP
⓭ 📝 \`${prefix}setgdesc text\` - Set Desc
⓮ ✏️ \`${prefix}setgname name\` - Set Name
⓯ 🚪 \`${prefix}leave\` - Leave Group

─────────────── 🌸
> amiudmodz Bot
        `;

        const systemMenu = `
╭───❀ 𝓢𝓨𝓢𝓣𝓔𝓜 ❀───╮

❶ ⚡ \`${prefix}ping\` - Check Speed
❷ 🔥 \`${prefix}alive\` - Bot Status
❸ 👑 \`${prefix}owner\` - Owner Contact
❹ 🆔 \`${prefix}jid\` - Your WhatsApp ID
❺ 🗑️ \`${prefix}deleteme\` - Delete Session
❻ ⚙️ \`${prefix}settings\` - Bot Settings
❼ 📊 \`${prefix}stats\` - Bot Stats

─────────────── 🌸
> amiudmodz Bot
        `;

        const mediaMenu = `
╭───❀ 𝓜𝓔𝓓𝓘𝓐 ❀───╮

❶ 🎨 \`${prefix}sticker\` - Image→Sticker
❷ 📷 \`${prefix}take\` - Steal Sticker
❸ 🖼️ \`${prefix}toimg\` - Sticker→Image
❹ 🎭 \`${prefix}emojimix 😀+❤️\` - Mix Emoji
❺ ✨ \`${prefix}blur\` - Blur Image
❻ 🎨 \`${prefix}aiimg prompt\` - AI Image

─────────────── 🌸
> amiudmodz Bot
        `;

        // Reply text එක ගන්නවා
        const replyText = mek.message?.conversation || mek.message?.extendedTextMessage?.text || '';

        // Main menu එක send කරනවා
        if (!replyText || replyText === prefix + 'menu') {
            return await sock.sendMessage(from, {
                image: { url: botLogoUrl },
                caption: mainMenu
            }, { quoted: mek });
        }

        // Number reply කරලා submenu
        if (replyText === '1') {
            return await sock.sendMessage(from, {
                image: { url: botLogoUrl },
                caption: systemMenu
            }, { quoted: mek });
        }

        if (replyText === '2') {
            return await sock.sendMessage(from, {
                image: { url: botLogoUrl },
                caption: groupMenu
            }, { quoted: mek });
        }

        if (replyText === '3') {
            return await sock.sendMessage(from, {
                image: { url: botLogoUrl },
                caption: mediaMenu
            }, { quoted: mek });
        }

        if (replyText === '4') {
            return await sock.sendMessage(from, {
                image: { url: botLogoUrl },
                caption: downloadMenu
            }, { quoted: mek });
        }
    }
};
