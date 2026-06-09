const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay, downloadMediaMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const fs = require('fs');
const path = require('path');
const axios = require("axios");

// ප්ලගින් ලෝඩ් කිරීම
const plugins = {};
const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'));
for (const file of pluginFiles) {
    const plugin = require(`./plugins/${file}`);
    plugins[plugin.name] = plugin;
}

// ... (පැරණි getEarnFooter සහ අනෙකුත් setup කොටස් මෙතනට දාන්න - මම කෙටි කළා)

sock.ev.on('messages.upsert', async chatUpdate => {
    // ... (මෙසේජ් හැසිරවීමේ මුල් කොටස්)
    
    if (isCmd) {
        let executed = false;
        for (const p in plugins) {
            if (plugins[p].commands && plugins[p].commands.includes(command)) {
                await plugins[p].execute(sock, mek, args, from, command, { downloadMediaMessage, pino, getEarnFooter });
                executed = true;
                break;
            }
        }
    }
});

// ... (ඉතිරි කොටස් ඒ විදියටම තබා ගන්න)
