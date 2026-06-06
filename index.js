const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// 🖼️ ඔයා ලබාදුන් THUHI MD Logo එකෙහි Link එක
const botLogoUrl = "https://ibb.co/1fn2R654";

async function startThuhiMD() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logLevel: 'silent',
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    });

    // 📱 Phone Number එකෙන් Link කිරීමේ කොටස
    if (!sock.authState.creds.registered) {
        console.clear();
        console.log("=================================================");
        console.log("       🟩 THUHI MD WHATSAPP BOT CONNECTING 🟩     ");
        console.log("=================================================");
        const phoneNumber = await question('කරුණාකර ඔබගේ WhatsApp අංකය ඇතුලත් කරන්න (e.g., 9477xxxxxxx): ');
        
        await delay(3000);
        let code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nYour Pairing Code Is: ⚠️  ${code}  ⚠️\n`);
        console.log("ඔබගේ දුරකථනයේ Linked Devices වෙත ගොස් මෙම Code එක ඇතුලත් කරන්න.");
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('සම්බන්ධතාවය බිඳ වැටුණි. නැවත සම්බන්ධ වෙමින්...', shouldReconnect);
            if (shouldReconnect) startThuhiMD();
        } else if (connection === 'open') {
            console.log('=================================================');
            console.log('🎉 THUHI MD සාර්ථකව සම්බන්ධ විය! (CONNECTED)');
            console.log('=================================================');
            
            // Bot active වුණාම inbox එකට THUHI MD ලෝගෝ එකත් එක්ක එන Message එක
            const welcomeText = `✨ *THUHI MD සම්බන්ධ වෙමින් පවතී...* \n\nදැන් ඔබගේ inbox එකෙහි \`.alive\` ලෙස Type කර බෝට් ක්‍රියාකාරීදැයි පරීක්ෂා කරන්න!`;
            await sock.sendMessage(sock.user.id, { 
                image: { url: botLogoUrl }, 
                caption: welcomeText 
            });
        }
    });

    // 💬 Commands පද්ධතිය (Messages Monitor)
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            const from = mek.key.remoteJid;
            const type = Object.keys(mek.message)[0];
            const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            
            const prefix = '.';
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : undefined;

            if (isCmd) {
                // 1. ALIVE COMMAND (ලෝගෝ එකත් සමග)
                if (command === 'alive') {
                    const aliveMsg = `👋 *I AM ALIVE NOW*

*OWNER* - THUHI MD
*VERSION* - 1.0.0
*PREFIX* - [ . ]

💬 *Reply Number:*
*1* 🟩 MAIN MENU
*2* 🟩 CREATE BOT
*3* 🟩 CHECK PING`;
                    await sock.sendMessage(from, { 
                        image: { url: botLogoUrl }, 
                        caption: aliveMsg 
                    }, { quoted: mek });
                }

                // 2. MENU COMMAND (ලෝගෝ එකත් සමග)
                if (command === 'menu' || body === '1') {
                    const menuMsg = `🏡 *MAIN MENU*

*OWNER* - THUHI MD
*VERSION* - 1.0.0

*Reply Number* ⤵️
1️⃣ OWNER MENU
2️⃣ SOCIAL MENU
3️⃣ AI MENU
4️⃣ GROUP MENU
5️⃣ TOOLS MENU
6️⃣ EDUCATION MENU
7️⃣ CHANNEL MENU`;
                    await sock.sendMessage(from, { 
                        image: { url: botLogoUrl }, 
                        caption: menuMsg 
                    }, { quoted: mek });
                }

                // 3. SOCIAL MENU
                if (command === 'social' || body === '2') {
                    const socialMsg = `☠️ *SOCIAL MENU*
─────────────────
┌  「 *.song* 🎧 」
└  *Download Youtube Audio*
─────────────────
┌  「 *.video* 🎥 」
└  *Download Youtube Video*
─────────────────
┌  「 *.fb* 📘 」
└  *Download Facebook Media*
─────────────────
┌  「 *.tiktok* 🎵 」
└  *Download Tiktok Media*
─────────────────
┌  「 *.insta* 📸 」
└  *Download Instagram Media*
─────────────────
┌  「 *.twitter* ❌ 」
└  *Download X (Twitter) Media*
─────────────────
┌  「 *.movie* 🎬 」
└  *Search & Download Movie All*
─────────────────
┌  「 *.sublk* 🇱🇰 」
└  *Search & Download Movie sublk*`;
                    await sock.sendMessage(from, { text: socialMsg }, { quoted: mek });
                }
                
                // 4. TOOLS MENU
                if (command === 'tools' || body === '5') {
                    const toolsMsg = `🛠️ *TOOLS MENU*
─────────────────
┌  「 *.ping* 📊 」
└  *Check bot response speed*
─────────────────
┌  「 *.system* 💻 」
└  *Check server info*
─────────────────
┌  %5B%20*.alive*%20👋%20%5D
└  *Check if bot is active*
─────────────────
┌  「 *.menu* 🌍 」
└  *Get Bot All Commands*
─────────────────
┌  「 *.bot* 🤖 」
└  *Bot pairing code*`;
                    await sock.sendMessage(from, { text: toolsMsg }, { quoted: mek });
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}

startThuhiMD();
