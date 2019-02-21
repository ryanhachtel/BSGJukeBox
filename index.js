const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const jukeboxClient = new Discord.Client();
const bot_token = 'NTQ4MDA5NTg4OTQzODgwMjE0.D0_FrQ.okm77_W6fVYgz4qDO_vGm2tFeYg';

jukeboxClient.on('ready', () => {
	console.log(`Connected as ${jukeboxClient.user.tag}`);
});

discordClient.on('message', (recMeg) => {
	if (recMeg.author == jukeboxClient.user) { return; }

	if (recMeg.content.includes(jukeboxClient.user.toString())) {
		try {
			processCommand(recMeg);
		} catch (error) {
			console.log(error);
		}
		return;
	}
});

const processCommand = (cmd) => {
	const fullCmd = cmd.content.substr(1); // Remove !
	const cmdArgs = fullCmd.split(' ');
	switch (cmdArgs[0]) {
		case 'play': 
			console.log('Playing Music');
			playMusic(cmd, cmdArgs[1]);
			break;
		default:
			break;
	}
}

const playMusic = (cmd, link) => {
	if (cmd.member.voiceChannel) {
		cmd.member.voiceChannel.join()
		.then(conn => {
			const broadcast = jukeboxClient.createVoiceBroadcast();
			const stream = ytdl(link, { filter : 'audioonly' });
			broadcast.playStream(stream);
			const dispatcher = conn.playBroadcast(broadcast);
			dispatcher.on('end', () => {
				cmd.member.voiceChannel.leave();
			});
		})
		.catch(err => console.log(err));
	}
}

jukeboxClient.login(bot_token);