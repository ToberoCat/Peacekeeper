const { MessageEmbed} = require('discord.js');
const fs = require("fs");

let messages;

function load_msg() {
    messages = JSON.parse(fs.readFileSync("../localization/messages.json").toString());
}

function getForbiddenWords() {
    const raw = fs.readFileSync('../localization/forbidden_words.json');
    return JSON.parse(raw);
}

function leetToEnglish(msg) {
    return msg.replaceAll("4", "a")
        .replaceAll("3", "e")
        .replaceAll("6", "g")
        .replaceAll("1", "i")
        .replaceAll("0", "o")
        .replaceAll("5", "s")
        .replaceAll("7", "t");
}

function getEmbed(id, parsables) {
    load_msg();
    const embed = messages[id];
    embed.timestamp = new MessageEmbed().setTimestamp().toJSON().timestamp;
    if (parsables != null) {
        parsables.forEach((parser) => {
            if (embed.title) embed.title = embed.title.replaceAll(`{${parser.from}}`, parser.to);
            if (embed.thumbnail) embed.thumbnail.url = embed.thumbnail.url.replaceAll(`{${parser.from}}`, parser.to);
            if (embed.description) embed.description = embed.description.replaceAll(`{${parser.from}}`, parser.to);
            if (embed.image) embed.image.url = embed.image.url.replaceAll(`{${parser.from}}`, parser.to);
            if (embed.footer) embed.footer = embed.footer.replaceAll(`{${parser.from}}`, parser.to);
            if (embed.url) embed.url = embed.url.replaceAll(`{${parser.from}}`, parser.to);
        });
    }

    return embed;

}

module.exports.getEmbed = getEmbed;
module.exports.getForbiddenWords = getForbiddenWords;
module.exports.leetToEnglish = leetToEnglish;