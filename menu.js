module.exports = {
    execute: async (sock, mek, from, botLogoUrl, earnFooterText) => {

        const date = new Date().toLocaleDateString('en-GB');
        const time = new Date().toLocaleTimeString('en-GB');

        const menu = `
╭┈┈┈┈┈୨💕୧┈┈┈┈┈╮
      𝐓𝐇𝐔𝐇𝐈 𝐌𝐃 𝐌𝐈𝐍𝐈
╰┈┈┈┈┈୨💕୧┈┈┈┈┈╯

🌸 Hey Bestie~!

Welcome to your favorite bot menu 🎀

♡ 16/06/2026
♡ 19:10:15

─────────────

🩷 Pick Your Menu

♡ 🛠️ System

♡ 👥 Group

♡ 🖼️ Media

♡ 📥 Download

♡ 🫧 Anime

♡ 🌐 Info

♡ 🎯 Fun

♡ 🔞 NSFW

♡ 🎥 Movie

─────────────

🎀 Web:
https://v2-ew6n.onrender.com

─────────────

💌 Made With Love

> 🌸 THUHI-OFC MD MINI BOT
`;

        await sock.sendMessage(
            from,
            {
                image: { url: botLogoUrl },
                caption: menu
            },
            { quoted: mek }
        );

        const downloadMenu = `
╭───❀ 𝓓𝓞𝓦𝓝𝓛𝓞𝓐𝓓 ❀───╮

❶ 📘 *.facebook*
❷ 🎵 *.tiktok*
❸ 📸 *.instagram*
❹ 🎧 *.song*
❺ 🎬 *.video*
❻ 🔗 *.csend*
❼ 📦 *.apk*
❽ 📎 *.comicdl*
❾ 🏷️ *.mangadl*

─────────────── 🌸

> 🌸 THUHI-OFC MD MINI BOT
`;

        const groupMenu = `
╭───❀ 𝓖𝓡𝓞𝓤𝓟 ❀───╮

❶ ➕ *.add*
❷ ❌ *.kick*
❸ ⬆️ *.promote*
❹ ⬇️ *.demote*
❺ 🔓 *.group open*
❻ 🔒 *.group close*
❼ 📄 *.groupinfo*
❽ 📢 *.tagall*
❾ 👻 *.hidetag*
❿ 📋 *.grouplist*
⓫ ⚙️ *.groupsetting*
⓬ 🖼️ *.setgpp*
⓭ 📝 *.setgdesc*
⓮ ✏️ *.setgname*
⓯ 🚪 *.leave*

─────────────── 🌸

> 🌸 THUHI-OFC MD MINI BOT
`;

        const replyText =
            mek.message?.conversation ||
            mek.message?.extendedTextMessage?.text ||
            '';

        if (replyText === '1') {
            return await sock.sendMessage(
                from,
                {
                    image: { url: botLogoUrl },
                    caption: downloadMenu
                },
                { quoted: mek }
            );
        }

        if (replyText === '2') {
            return await sock.sendMessage(
                from,
                {
                    image: { url: botLogoUrl },
                    caption: groupMenu
                },
                { quoted: mek }
            );
        }
    }
};
