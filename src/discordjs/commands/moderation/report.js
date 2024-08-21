import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from "@discordjs/builders";
import { ButtonStyle, ChannelType, CommandInteraction } from "discord.js";
import { createJuryRequest, makeReport } from "../../api/juryApi.js";

export default {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription(
      "Report user (WARNING: False reports will be treated as an offense)"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("text")
        .setDescription("Report text offense")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Server users")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("offense")
            .setDescription("Select the offense type")
            .setRequired(true)
            .addChoices(
              { name: "Condescension or Bullying: 4.1.c", value: "4.1.c" },
              { name: "Doxing: 4.1.d", value: "4.1.d" },
              { name: "Discrimination: 4.1.b", value: "4.1.b" },
              { name: "NSFW: 4.1.g", value: "4.1.g" },
              { name: "Advertisement: 4.1.f", value: "4.1.f" },
              { name: "Spam: 4.1.h", value: "4.1.h" },
              { name: "No minors (must be 18+): 4.2.a", value: "4.2.a" },
              { name: "Bot or duplicate account: 4.2.b", value: "4.2.b" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("message_link")
            .setDescription(
              'Right click message and select "Copy Message Link"'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("Report voice offense")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Server users")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("offense")
            .setDescription("Select the offense type")
            .setRequired(true)
            .addChoices(
              { name: "Condescension or Bullying: 4.1.c", value: "4.1.c" },
              { name: "Doxing: 4.1.d", value: "4.1.d" },
              { name: "Discrimination: 4.1.b", value: "4.1.b" },
              { name: "NSFW: 4.1.g", value: "4.1.g" },
              { name: "Advertisement: 4.1.f", value: "4.1.f" },
              { name: "Spam: 4.1.h", value: "4.1.h" },
              { name: "No minors (must be 18+): 4.2.a", value: "4.2.a" },
              { name: "Bot or duplicate account: 4.2.b", value: "4.2.b" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("other")
        .setDescription(
          "Report something that isn't either text or voice based"
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Server users")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("offense")
            .setDescription("Select the offense type")
            .setRequired(true)
            .addChoices(
              { name: "No minors (must be 18+): 4.2.a", value: "4.2.a" },
              { name: "Bot or duplicate account: 4.2.b", value: "4.2.b" }
            )
        )
    ),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const client = interaction.client;
    const guild = interaction.guild;

    try {
      // Defer reply because this interaction takes too long for default replies
      await interaction.deferReply();

      let message_link = null;
      // User who made report id
      const user_discord = interaction.user.id;
      // Get suspect id
      const { id: suspect_discord } = interaction.options.getUser("user");
      // What kind of report is it
      const type = interaction.options.getSubcommand();
      const offense = interaction.options.getString("offense");

      const report = {
        user_discord: user_discord,
        suspect_discord: suspect_discord,
        type: type,
        offense: offense,
        // If the report is "text" get the "message_link" else return null
        message_link: (message_link =
          type === "text"
            ? interaction.options.getString("message_link")
            : null),
      };

      const reportStatus = await makeReport(report);

      if (reportStatus.data.success === false) {
        throw new Error(reportStatus.data.message);
      }

      // If there is a case then make a jury request
      if (reportStatus.data.case) {
        const juryRequest = await createJuryRequest({
          case_id: reportStatus.data.caseId,
        });
        if (juryRequest.data.juror) {
          const channelId = "1171766946392457216";
          const channel = await client.channels.fetch(channelId);
          // Create private thread of juror
          const thread = await channel.threads.create({
            // Make the name of the channel the db table request ID (for future retrieval)
            name: juryRequest.data.requestId,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: "Private thread for jury request",
          });

          // Set permissions so only the juror can view and message in the thread
          await thread.members.add(juryRequest.data.juror);

          // Set up buttons
          const yesButton = new ButtonBuilder()
            .setCustomId("juryYes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success);

          const noButton = new ButtonBuilder()
            .setCustomId("juryNo")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yesButton, noButton);

          // Send a confirmation message in the thread
          await thread.send({
            content: "You have been summoned for jury, may you attend?",
            components: [row],
          });
        }
      }

      // Send a follow-up message after processing is done
      await interaction.editReply(reportStatus.data.message);
    } catch (error) {
      // Check if the controller passed an error message, else use default error message
      let errorMessage = "There was an error when making the report";
      // Added this in case of error happens before an error.response is given
      if (error.response) {
        errorMessage =
          error.response.data.success === false
            ? error.response.data.message
            : "There was an error when making the report";
      }

      console.error(error.message);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        // If interaction was neither deferred nor replied, send a reply
        await interaction.reply(errorMessage);
      }
    }
  },
};
