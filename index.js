const fetch = require('node-fetch');
const Discord = require("discord.js");
var fs = require('fs');
const config = require('./config.json')
var ip = config.ip
var token = config.token
var prefix = config.prefix
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(token)
client.on("ready", () => {
    console.log('Server watcher online, watching ' + ip + '!');
    client.user.setActivity(ip, {
        type: 'WATCHING'
    })
});
client.on('message', msg => {
    if (msg.author.bot) return;
    //nothing is done here yet.
});

function requireUncached(module) {
    delete require.cache[require.resolve(module)]
    return require(module)
}
const getStatus = async function () {
    const response = await fetch(`http://mcapi.us/server/status?ip=${ip}`);
    const body = await response.json();
    return (body.online)
}
const getCurrent = async function () {
    const json = requireUncached(`./current.json`)
    return (json.current)
}
setInterval(async function () {
    let status = await getStatus()
    let current = await getCurrent()
    if (status === false) {
        if (current === true) {
            fs.writeFileSync(`./current.json`, `{"current": false}`)
            console.log(ip + " is offline.")
            let embed = new Discord.MessageEmbed()
                .setDescription(`${ip} is offline.`)
                .setColor('FF0000')
                .setTimestamp()
                .setAuthor(`RoyalKits Status Checker`, `https://api.mcsrvstat.us/icon/${ip}`)
            client.channels.cache.get(config.channel).send(embed)
        }
    }
    if (status === true) {
        if (current === false) {
            fs.writeFileSync(`./current.json`, `{"current": true}`)
            console.log(ip + " is online.")
            let embed = new Discord.MessageEmbed()
                .setDescription(`${ip} is back online!`)
                .setColor('00FF00')
                .setTimestamp()
                .setAuthor(`RoyalKits Status Checker`, `https://api.mcsrvstat.us/icon/${ip}`)
            client.channels.cache.get(config.channel).send(embed)
        }
    }
}, 15000)