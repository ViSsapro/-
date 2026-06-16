module.exports = {
    execute: async (sock, mek, from, botLogoUrl, earnFooterText) => {
        
        async function menuCommand(sock, msg) {
    const from = msg.key.remoteJid;
    const pushname = msg.pushName || 'User';
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
!menu - Show menu
!ping - Check speed

👥 *Group*
!tagall - Tag all
!promote - Make admin

📥 *Download*
!yt - YouTube DL
!tiktok - TikTok DL

─────────────── 🌸

🌐 *THUHI-OFC Pairing Web* 💕
> https://att.onrender.com

> © 𝚃𝙷𝚄𝙷𝙸 𝙾𝙵𝙲 𝙱𝙾𝚃
`;

    await sock.sendMessage(from, { text: menu }, { quoted: msg });
}

module.exports = { menuCommand };
};
