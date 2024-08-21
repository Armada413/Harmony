import { ChannelType, Events } from "discord.js";
import { GUILD_ID } from "../../config.js";
import { updateJuryRequest } from "../api/juryApi.js";

export default {
  name: Events.InteractionCreate,
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    try {
      // ====================== Handle Slash Commands ======================
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(
          interaction.commandName
        );

        if (!command) {
          console.error(
            `No command matching ${interaction.commandName} was found.`
          );
          return;
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          }
        }
      }

      // ====================== Handle Buttons ======================
      else if (interaction.isButton()) {
        if (interaction.customId == "crate_private_thread") {
          try {
            const channel = interaction.channel;

            // // Check if the user already has a private thread in the current channel
            const existingThread = channel.threads.cache.find(
              (thread) => thread.name == interaction.user.id
            );

            if (existingThread) {
              // Check if member is in thread
              const isMember = existingThread.members.cache.has(
                interaction.user.id
              );

              if (isMember) {
                // User already has a thread, reply with a message
                await interaction.reply({
                  content: `You already have an existing private report thread: https://discord.com/channels/${GUILD_ID}/${existingThread.id}
                `,
                  ephemeral: true,
                });
              } else {
                // Add user back into thread in case they aren't there
                await existingThread.members.add(interaction.user);
                // User already has a thread, reply with a message
                await interaction.reply({
                  content: `You already have an existing private report thread: https://discord.com/channels/${GUILD_ID}/${existingThread.id}
                              `,
                  ephemeral: true,
                });
              }
            } else {
              // Create thread
              const thread = await channel.threads.create({
                name: interaction.user.id,
                autoArchiveDuration: 60, // Auto-archive after 60 minutes of inactivity
                type: ChannelType.PrivateThread,
                reason: "Private report thread created by the bot",
              });

              // Set permissions so only the interacting user can view and message in the thread
              await thread.members.add(interaction.user.id);

              // Send a confirmation message in the thread
              await thread.send(
                `Hello ${interaction.user.displayName}, this is your private report thread.`
              );
              await interaction.reply({
                content: "Your private report channel has been created!",
                ephemeral: true,
              });
            }
          } catch (error) {
            console.error("Error handling thread interaction:", error);
            await interaction.reply({
              content: "There was an error while processing your request!",
              ephemeral: true,
            });
          }
        } else if (
          interaction.customId === "juryYes" ||
          interaction.customId === "juryNo"
        ) {
          const requestId = Number(interaction.channel.name);
          if (interaction.customId === "juryYes") {
            const requestObject = {
              request_id: requestId,
              attendance: true,
            };

            updateJuryRequest(requestObject);

            await interaction.reply({
              content: "Your attendance has been confirmed.",
              ephemeral: true,
            });

            await interaction.channel.delete();
          } else {
            const requestObject = {
              request_id: requestId,
              attendance: false,
            };

            updateJuryRequest(requestObject);

            await interaction.reply({
              content: "Your attendance has been declined.",
              ephemeral: true,
            });

            await interaction.channel.delete();
          }
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  },
};
