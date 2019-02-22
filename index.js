const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const jukeboxClient = new Discord.Client();
const bot_token = 'NTQ4MDA5NTg4OTQzODgwMjE0.D0_FrQ.okm77_W6fVYgz4qDO_vGm2tFeYg';
const streamOptions = { seek: 0, volumne: 1 };

let currentChannel = null;
let currentStream = null;
let songQueue = [];

/*
Todo's:
	Remove
	List Queue
		- links
		- v2 song names
	Hype Music
	Playlists
	Check Link is for Youtube
*/

jukeboxClient.on('ready', () => {
	console.log(`Connected as ${jukeboxClient.user.tag}`);
});

jukeboxClient.on('message', (recMeg) => {
	if (recMeg.author == jukeboxClient.user) { return; }

	if (
		recMeg.content.includes(jukeboxClient.user.toString())
		&& recMeg.content.startsWith('!')
	) {
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
			console.log('Resuming song');
			resume(cmd);
			break;
		case 'queue':
			console.log('Queueing up song');
			queueSong(cmdArgs[1])
			break;
		case 'skip':
			console.log('Skipping current song.')
			skipSong(cmd);
			break;
		default:
			break;
	}
}

const playMusic = (cmd, link) => {
	if (!cmd.member.voiceChannel) {
		cmd.reply("You must be in a voice channel to play a song.");
		return;
	}
	if (!currentStream) {
		currentChannel = cmd.member.voiceChannel;
		// Join and begin playing
		cmd.member.voiceChannel.join()
		.then(conn => {
			createStreamDispatcherAndPlay(conn, cmd, link);
		})
		.catch(err => console.log(err));
	} else {
		cmd.reply('Already Playing a song, try !queue to queue up your request.');
	}
}

const createStreamDispatcherAndPlay = (conn, cmd, link) => {
	let stream = ytdl(link, { filter : 'audioonly' });
	const streamDispatcher = conn.playStream(stream, streamOptions);
	currentStream = streamDispatcher;

	// Listen for song to finish
	streamDispatcher.on('end', () => {
		console.log("Current Song stopped playing");
		if (songQueue.length !== 0) {
			const newSong = songQueue[0];
			songQueue = songQueue.slice(1);
			createStreamDispatcherAndPlay(conn, cmd, newSong)
		} else {
			currentChannel = null;
			currentStream = null;
			streamDispatcher.stream.destroy();
			cmd.member.voiceChannel.leave();
		}
	})
}

const queueSong = (link) => {
	songQueue.push(link);
}

const skipSong = (cmd) => {
	if (currentStream == null) {
		cmd.reply("No song is currently playing, can't skip it.");
		return;
	}

	if (cmd.member.voiceChannel) {
		if (cmd.member.voiceChannel === currentChannel) {
			currentStream.end();
			return;
		} else {
			cmd.reply("You are not a part of the channel listening to the song and can't skip it.");
			return;
		}
	}
}

const pause = (cmd) => {
	if (currentStream == null) {
		cmd.reply("No song is currently playing, can't pause it.");
		return;
	}

	if (cmd.member.voiceChannel) {
		if (cmd.member.voiceChannel === currentChannel) {
			currentStream.pause();
			return;
		} else {
			cmd.reply("You are not a part of the channel listening to the song and can't pause it.");
			return;
		}
	}
}

const resume = (cmd) => {
	if (currentStream == null) {
		cmd.reply("No song is currently paused, can't resume it.");
		return;
	}

	if (cmd.member.voiceChannel) {
		if (cmd.member.voiceChannel === currentChannel) {
			currentStream.resume();
			return;
		} else {
			cmd.reply("You are not a part of the channel listening to the song and can't resume it.");
			return;
		}
	}
}

jukeboxClient.login(bot_token);