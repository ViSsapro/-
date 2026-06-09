module.exports = {
    name: 'test',
    commands: ['test', 'menu'],
    execute: async (sock, mek, args, from) => {
        await sock.sendMessage(from, { text: "✅ THUHI MD වැඩ කරයි! ප්ලගින් පද්ධතිය සාර්ථකයි." }, { quoted: mek });
    }
};
