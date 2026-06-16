module.exports = {
    execute: async (sock, mek, from, botLogoUrl, earnFooterText) => {
        const pushname = mek.pushName || 'User';
        const date = new Date().toLocaleDateString('en-GB');
        const time = new Date().toLocaleTimeString('en-GB');

        const menu = `
╭─────♡◉♡─────⌬
💖 *Hello ${pushname}...!* 🌸
🌷 *Welcome to 𝐓𝐇𝐔𝐇𝐈 𝐎𝐅𝐂 𝐌𝐈𝐍𝐈 Menu* ✨
╰─────♡◉♡─────⌬

┆ ➤ 🌸
┆ ➤ 💫
┆ ➤ 🌷

📅 *Date:* ${date} 📆
⌚ *Time:* ${time} ⏳

─────────────── 💗

✨ *Commands List:* ✨

🛠️ *System*
.alive - Bot status
.menu - Show menu

👥 *Group*
.tagall - Tag all
.promote - Make admin

📥 *Download*
.dl - Download video
.s - Make sticker

🔓 *Tools*
.ovp - Recover view once

─────────────── 🌸

${earnFooterText}

┆ ✦ 🌷
┆ ➤ 💖
┆ ➤ 🌸

> © 𝚃𝙷𝚄𝙷𝙸 𝙾𝙵𝙲 𝙱𝙾𝚃
`;

        await sock.sendMessage(from, { image: { url: botLogoUrl }, caption: menu }, { quoted: mek });
    }
};
