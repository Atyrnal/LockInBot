const { Events, Client } = require("discord.js");
const path = require("path");

module.exports = {
	name : Events.ClientReady,
	once : true,
	execute(client) {
		client.user.setPresence({
			status: 'online'
		});
		client.user.setActivity({
			name: "Killshot Development",
			type: 3
		})
	}
}