const express = require('express');
const http = require(`http`);
const app = express();
const ioserver = require(`socket.io`);
const server = http.Server(app);
const io = ioserver(server);
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');

let sessions = {};

// Express setup
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

// Discord setup
bot.login(config.bot_token);
bot.on('ready', () => { console.log("Hi, I'm a bot."); });
const guild = bot.guilds.get(config.guild_id);
// routes
app.get('/', (req, res) => { res.render("index"); });

// socket.io 
io.sockets.on('connection', socket => {
    socket.on('init', (bots) => init(socket, bots));
    socket.on('manageUser', (data) => { manageUser(socket, data) });
    socket.on('action', ({ action, params }) => { actionFunc(socket, action, params) });
});

// functions
const getUser = (guild, param) => guild.members.find('displayName', param);

const init = (socket, bots) => {
    let guild = bot.guilds.get(config.guild_id);
    let ob = { names: [], pics: [] };
    let members = guild.members.array().filter(({ user }) => {
        if (!bots) { return !user.bot; }
        else { return user.bot; }
    });
    members.forEach(({ displayName, user }) => {
        ob.names.push(displayName);
        if (user.avatarURL != undefined) ob.pics.push(user.avatarURL);
        else ob.pics.push(config.undefinedPic); // Image for users that don't have avatars
    });
    socket.emit('init', { guild_name: guild.name, members: ob, type: (bots) ? "members" : "bots" });
}

const manageUser = (socket, { username, img }) => {
    socket.emit('manage', { user: { name: username, pic: img } });
}

const actionFunc = (socket, action, params) => {
    let guild = bot.guilds.get(config.guild_id);
    let user = getUser(guild, params[0]);
    if (action === "changeusername") {
        user.setNickname(params[1]);
    }
    else if (action === "sendmessage") {
        guild.channels.get(config.default_channel_id).send(`${user.toString()} ${params[1]}`);
    }
}

server.listen(8080);
