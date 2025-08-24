const { Events } = require("discord.js");
const { entersState, joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection} = require("@discordjs/voice")
const path = require("path");

module.exports = {
	name : Events.PresenceUpdate,
	once : false,
	async execute(oldPresence, newPresence) {
		if (newPresence.userId != process.env.TARGET_ID) return;

		async function playInVC(member, filename) {
			const voiceChannel = member.voice.channel;
			if (!voiceChannel) return;

			const existingConnection = getVoiceConnection(member.guild.id);
			if (existingConnection) {
				existingConnection.destroy();
			}
			
			const connection = joinVoiceChannel({
				channelId : voiceChannel.id,
				guildId : voiceChannel.guild.id,
				adapterCreator : voiceChannel.guild.voiceAdapterCreator
			});

			const player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
			})

			const resource = createAudioResource(
				"sounds/" + filename,
				{ inlineVolume : true }
			);
			resource.volume.setVolume(1.3);

			await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
			player.play(resource);
			connection.subscribe(player);
			player.on(AudioPlayerStatus.Idle, () => {
				connection.destroy()
			});

		}

		var activity = newPresence.activities.find(act => (act.name.toLowerCase() == "roblox" || act.name.toLowerCase() == "league of legends"))
		if (activity != undefined && activity != null) {
			newPresence.member.send(`Hell nah hop off ${activity.name} twin 💔\nYou got a game to make so LOCK IN`);
			(await newPresence.guild.members.fetch(process.env.OWNER_ID)).send(`!!! ${newPresence.user.username} is on ${activity.name} !!!`);
			playInVC(newPresence.member, activity.name.toLowerCase() + ".ogg")
			setTimeout( async () => {
				const futurePresence = (await newPresence.member.fetch()).presence;
				if (futurePresence.activities.some(act => act.name == activity.name)) {
					futurePresence.member.send("DAWG I TOLD YOU GET OFF\nTS Aint gonna get made by a miracle bro\nYou waiting for a solar flare to magically corrupt your hard drive and create a game?? Nahhhh\nI believe in u dawg but u HAVE to lock in, remember the deal?");
					playInVC(futurePresence.member, "stillon.ogg");
				}
			}, 90e3);
		} else if (oldPresence.activities.some(act => (act.name.toLowerCase() == "roblox" || act.name.toLowerCase() == "league of legends"))) {
			newPresence.member.send(`Good job now GET TO WORK`)
			playInVC(newPresence.member, "goodjob.ogg")
		}
	}
}