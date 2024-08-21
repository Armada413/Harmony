import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, Client, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // =================== Delete Archive ===================
    // // Assuming 'channel' is your text channel
    // async function deleteArchivedThreads(channel) {
    //   try {
    //     // Fetch all archived threads in the channel
    //     const archivedThreads = await channel.threads.fetchArchived();
    //     // Iterate over each archived thread and delete it
    //     archivedThreads.threads.forEach(async (thread) => {
    //       try {
    //         await thread.delete();
    //         console.log(`Deleted archived thread: ${thread.name}`);
    //       } catch (error) {
    //         console.error(`Failed to delete thread ${thread.name}:`, error);
    //       }
    //     });
    //     console.log('All archived threads have been processed.');
    //   } catch (error) {
    //     console.error('Failed to fetch archived threads:', error);
    //   }
    // }
    // // Usage example:
    // // Replace 'channelId' with the ID of your channel
    // const channel = await client.channels.fetch('1272968183829237793');
    // deleteArchivedThreads(channel);
    // =================== LOGIC TO ADD REPORT BUTTON ===================
    // try {
    //   const channel = await client.channels.cache.get('1272968183829237793');
    //   if (!channel) return;
    //   const button = new ButtonBuilder()
    //     .setCustomId('crate_private_thread')
    //     .setLabel('Private Channel')
    //     .setStyle(ButtonStyle.Primary);
    //   const row = new ActionRowBuilder().addComponents(button);
    //   channel.send({
    //     content: 'Create a private report channel',
    //     components: [row],
    //   });
    // } catch (error) {
    //   console.error(error.message);
    // }
  },
};
