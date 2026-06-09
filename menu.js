// menu.js
module.exports = {
    execute: async (sock, mek, from, botLogoUrl, earnFooterText) => {
        const sections = [
            {
                title: "🏵 HELP-LIST",
                rows: [
                    { title: '🏵 HELP-LIST', rowId: '.help', description: 'බෝට් එකේ මූලික විස්තර සහ උපකාර.' },
                    { title: '🏵 SUPPER TTP-LIST', rowId: '.ttp', description: 'සින්හල Font Support TTP විධාන.' },
                    { title: '🏵 LOGO-LIST', rowId: '.logo', description: 'විවිධ Logo සැකසීමේ විධාන.' },
                    { title: '🏵 MEDIA-LIST', rowId: '.media', description: 'වීඩියෝ සහ හඬ පට සංස්කරණ මෙවලම්.' },
                    { title: '🏵 DOWNLOAD-LIST', rowId: '.dl', description: 'Youtube, FB, Insta බාගත කිරීම්.' },
                    { title: '🏵 ADMIN-LIST', rowId: '.admin', description: 'Group Admin විධාන ලැයිස්තුව.' },
                    { title: '🏵 ANIME-LIST', rowId: '.anime', description: 'Anime පින්තූර විධාන.' },
                    { title: '🏵 BOOK-LIST', rowId: '.book', description: 'සිංහල නවකතා පොත් ලැයිස්තුව.' }
                ]
            }
        ];

        const menuMessage = {
            image: { url: botLogoUrl },
            caption: `*╭────────═✪═────────╮*\n  *◄◯ 𝐐𝐔𝐄𝐄𝐍 𝐀𝐋𝐄𝐗𝐀 𝐌𝐄𝐍𝐔 ◯►*\n*╰────────═✪═────────╯*\n\n👋 හෙලෝ, පහත බොත්තම ඔබා ඔබට අවශ්‍ය විධාන ලැයිස්තුව තෝරාගන්න.${earnFooterText}`,
            footer: '© 2026 THUHI MD',
            headerType: 4,
            sections: sections,
            buttonText: '𝗠𝗘𝗡𝗨 𝗟𝗜𝗦𝗧'
        };

        await sock.sendMessage(from, menuMessage, { quoted: mek });
    }
};
