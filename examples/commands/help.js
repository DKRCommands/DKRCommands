const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    category: "welcome", // Required for slash commands
    description: "Print customized welcome message", // Required for slash commands

    slash: true,
    testOnly: true, // Ensure you have test servers setup

    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "name",
            description: "your name",
            required: true
        }
    ],
    callback: async ({ interaction }) => {
        const userName = interaction.getString("name");

        await interaction.reply(`Welcome ${userName}`);
    },
};
