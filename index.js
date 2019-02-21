const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const jukeboxClient = new Discord.Client();
const bot_token = 'NTQ4MDA5NTg4OTQzODgwMjE0.D0_FrQ.okm77_W6fVYgz4qDO_vGm2tFeYg';

let currentChannel = null;
let currentSong = null;

jukeboxClient.on('ready', () => {
	console.log(`Connected as ${jukeboxClient.user.tag}`);
});

jukeboxClient.on('message', (recMeg) => {
	if (recMeg.author == jukeboxClient.user) { return; }

	if (recMeg.content.includes(jukeboxClient.user.toString()) && recMeg.content.startsWith('!')) {
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
		case 'pause':
			console.log('Pausing current song');
			pause(cmd);
			break;
		case 'resume':
			console.log("Resuming song");
			resume(cmd);
			break;
		default:
			break;
	}
}

const playMusic = (cmd, link) => {
	if (cmd.member.voiceChannel) {
		currentChannel = cmd.member.voiceChannel;
		cmd.member.voiceChannel.join()
		.then(conn => {
			const broadcast = jukeboxClient.createVoiceBroadcast();
			const stream = ytdl(link, { filter : 'audioonly' });
			broadcast.playStream(stream);
			const voiceBroadcast = conn.playBroadcast(broadcast);
			currentSong = voiceBroadcast;
			voiceBroadcast.on('end', () => {
				currentChannel = null;
				currentSong = null;
				cmd.member.voiceChannel.leave();
			});
		})
		.catch(err => console.log(err));
	} else {
		cmd.reply('You must be in a voice channel to play a song')
	}
}

const pause = (cmd) => {
	if (currentSong == null) {
		cmd.reply("No song is currently playing");
		return;
	}

	if (cmd.member.voiceChannel) {
		if (cmd.member.voiceChannel === currentChannel) {
			currentSong.pause();
		} else {
			cmd.reply("You are not a part of the channel listening to the song and can't pause it.");
			return;
		}
	}
}

const resume = (cmd) => {
	if (currentSong == null) {
		cmd.reply("No song is currently playing");
		return;
	}

	if (cmd.member.voiceChannel) {
		if (cmd.member.voiceChannel === currentChannel) {
			currentSong.resume();
		} else {
			cmd.reply("You are not a part of the channel listening to the song and can't resume it.");
			return;
		}
	}
}

jukeboxClient.login(bot_token);