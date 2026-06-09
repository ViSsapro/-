module.exports = {
    name: 'welcome',
    execute: async (sock, anu) => {
        if (anu.action === 'add') {
            const from = anu.id;
            // පින්තූරය සමඟ පිළිගැනීමේ පණිවිඩය
            await sock.sendMessage(from, { 
                image: { url: "https://i.ibb.co/Z6gnPvV2/file-000000009be47207afef1535933c3f19.png" }, 
                caption: "👋 සාදරයෙන් පිළිගනිමු! \nමම THUHI MD බෝට් එක. ඔබට අවශ්‍ය දේවල් දැනගන්න .menu යැවීම ප්‍රමාණවත්." 
            });
        }
    }
};
