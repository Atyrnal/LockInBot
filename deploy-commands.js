const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require("dotenv");
const Logger = require("./logger").Logger

dotenv.config();

const commands = [];

const log = new Logger("LockInBot-CommandDeployment");


const foldersPath = path.join(__dirname, 'src/commands')
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            log.warn(`The command at ${filePath} is missing module properties.`);
        }
    }
  }

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		log.log(`Started refreshing ${commands.length} application commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application commands.`);
	} catch (error) {
		log.error(error);
	}
})();