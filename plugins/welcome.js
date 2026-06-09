module.exports = {
    name: 'welcome',
    // මේ ප්ලගින් එක මැසේජ් එකක් නොවී, Event එකක් නිසා මෙය commands ලැයිස්තුවේ අවශ්‍ය නැත.
    execute: async (sock, anu) => {
        if (anu.action === 'add') {
            const from = anu.id;
            const welcomeText = `👋 *සාදරයෙන් පිළිගනිමු!* \n\nමම THUHI MD බෝට් එක. ඔබට අවශ්‍ය දේවල් දැනගන්න .menu කියලා ටයිප් කරන්න.`;
            await sock.sendMessage(from, { text: welcomeText });
        }
    }
};
