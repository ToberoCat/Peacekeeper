const { client, config } = require("../index");
const { getForbiddenWords, leetToEnglish, getEmbed} = require("../localization/Language");
const similarity = require("string-similarity");
const BreakException = {};

const forbiddenWords = getForbiddenWords();

function remove(message) {
    message.delete();
    message.channel.send({ embeds: [getEmbed("forbidden-word-user", [ {from: "user", to: message.author.toString() } ])] });
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function report(message, word, match) {
    const channel = client.channels.cache.get(config.channels.reportedMessages);
    channel.send({ embeds: [getEmbed("forbidden-word-report", [ {from: "user", to: message.author.toString() },
            {from: "og_word", to: word},
            {from: "similar", to: match.target },
            {from: "percentage", to: Math.round(match.rating * 100) },
            {from: "message", to: message.url}])] });
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const leetContent = config.forbidden.checkLeet ? leetToEnglish(message.content) : message.content;
    const content = config.autoreply.toLowerCase ?  leetContent : leetContent.toLowerCase();

    if (isValidHttpUrl(message.content) && !message.member.roles.cache.find(r => r.id === config.bypass)) {
        message.delete();
        return;
    }

    if (content.endsWith(config.autoreply.endswith)) {
        try {
            config.autoreply.contains.forEach((item) => {
                if (content.includes(item)) {
                    message.reply(config.autoreply.reply);
                    throw BreakException;
                }
            });
        } catch (e) {

        }
    }

    try {
        content.split(" ").forEach((arg) => {
            forbiddenWords.forEach((word) => {
               if (!word.includes(arg) && ! arg.includes(word)) return;

               remove(message);
               throw BreakException;
            });
            if (!config.forbidden.checkProbability) return;
            const match = similarity.findBestMatch(arg, forbiddenWords);
            if (match.bestMatch.rating >= config.forbidden.deletePercenatge) return remove(message);
            if (match.bestMatch.rating >= config.forbidden.reportPercenatge) return report(message, arg, match.bestMatch);
        });
    } catch (e) {
        if (e !== BreakException) throw e;
    }
});