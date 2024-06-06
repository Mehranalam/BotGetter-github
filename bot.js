const axios = require('axios');
const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const SocksProxyAgent = require('socks-proxy-agent');


// Token
// channel 


const botToken = '7212552198:AAE10QYLm_qC0e2MV7pV0WYYVvJ66kfKPvI';
const channelID = 'github_get';
const proxy = ''

const agent = proxy ? new SocksProxyAgent(proxy) : null;

const bot = new Telegraf(botToken, {
    telegram: { agent }
});

const fetchRandomGitHubRepo = async () => {
    try {
        const response = await axios.get('https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc', {
            proxy: false
        });
        const repos = response.data.items;
        const randomRepo = repos[Math.floor(Math.random() * repos.length)];
        return randomRepo;
    } catch (error) {
        console.error('Error fetching data from GitHub:', error);
        return null;
    }
};

const sendMessageToChannel = async () => {
    const repo = await fetchRandomGitHubRepo();
    if (repo) {
        const message = `
    📌 **${repo.name}**
    👤 *Author*: ${repo.owner.login}
    🌟 *Stars*: ${repo.stargazers_count}
    📄 *Description*: ${repo.description || 'No description available'}
    🔗 [Link to repository](${repo.html_url})

    **This message has been sent automatically** - *BotGetter-github* bot will automatically receive random projects from GitHub.\nRepository address:
    `;
        await bot.telegram.sendMessage(channelID, message, { parse_mode: 'Markdown' });
    }
};

cron.schedule('0 9 * * *', () => {
    sendMessageToChannel();
    console.log('Message sent to the channel.');
});

bot.launch();

console.log('Bot is running.');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
