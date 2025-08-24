const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Logger = require("./logger.js").Logger

dotenv.config();

const log = new Logger("LockInBot");

const client = new Client({
	intents: [
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message
	]
});

(async () => {
	client.commands = new Collection();
	const foldersPath = path.join(__dirname, 'src/commands');
	const commandFolders = fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				log.warn(`The command at ${filePath} is missing required module properties.`)
			}
		}
	}

	const eventsPath = path.join(__dirname, "src/events");
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	log.log("Client logging in.")
	await client.login(process.env.BOT_TOKEN);
	
})();