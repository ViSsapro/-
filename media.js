// media.js
module.exports = {
    download: async (sock, mek, from, args, botLogoUrl, earnFooterText) => {
        const url = args[0];
        if (!url) return await sock.sendMessage(from, { text: "❌ කරුණාකර වීඩියෝ ලින්ක් එකක් දෙන්න." });

        await sock.sendMessage(from, { text: "🔍 *වීඩියෝව පරීක්ෂා කරමින් පවතී...*" });

        // API එකෙන් විස්තර ලබා ගැනීම
        const res = await require("axios").get(`https://api.dreaded.site/api/download?url=${encodeURIComponent(url)}`);
        const data = res.data.result;

        if (!data) return await sock.sendMessage(from, { text: "❌ වීඩියෝව සොයාගත නොහැකි විය." });

        // Thumbnail සහ තොරතුරු සහිත මැසේජ් එක
        const caption = `*🎬 THUHI MD VIDEO DOWNLOADER*

*Title:* ${data.title}
*Duration:* ${data.duration}

👇 *පහත Quality එකක් තෝරන්න:*`;

        await sock.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: caption + earnFooterText
        }, { quoted: mek });

        // Quality තේරීමේ List එක
        const sections = [{
            title: "Select Video Quality",
            rows: [
                { title: '🎥 720p HD', rowId: `.dl-final ${data.url_720 || data.url}` },
                { title: '🎥 480p SD', rowId: `.dl-final ${data.url_480 || data.url}` },
                { title: '🎥 360p Low', rowId: `.dl-final ${data.url_360 || data.url}` }
            ]
        }];

        await sock.sendMessage(from, {
            text: "කරුණාකර ඉහත පින්තූරය යටින් ඇති menu බොත්තම ඔබා Quality එක තෝරන්න.",
            sections: sections,
            buttonText: 'SELECT QUALITY',
            listType: 1
        });
    },

    // අවසාන වශයෙන් වීඩියෝව යවන කොටස
    downloadFinal: async (sock, mek, from, url) => {
        await sock.sendMessage(from, { text: "⏳ *වීඩියෝව බාගත වෙමින් පවතී...*" });
        await sock.sendMessage(from, { video: { url: url }, caption: "📥 *Downloaded by THUHI MD*" });
    }
};
