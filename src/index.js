const { Client, Intents} = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');
const Language = require("./localization/Language");
const {getEmbed} = require("./localization/Language");

const config = yaml.load(fs.readFileSync('../config.yml', 'utf8'));


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['CHANNEL', 'MESSAGE']
});

client.once("ready", async () => {
    const guilds = client.guilds.cache.size;
    await require("./handler/Handler")(client);

    console.log(`Ready! Logged in as ${client.user.tag}! I'm on ${guilds} ${guilds === 1 ? "guild" : "guilds"}`);

    setInterval(() => {
        const channel = client.channels.cache.get(config.channels.statusChannel);
        channel.send({ embeds: [ getEmbed("update") ] });
    }, config.updateTimeout);
});

client.login(process.env.BOT_TOKEN || config.BotToken);

module.exports.client = client;
module.exports.config = config;
