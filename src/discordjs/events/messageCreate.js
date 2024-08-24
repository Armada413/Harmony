import { Events, Message } from "discord.js";

export default {
  name: Events.MessageCreate,
  /**
   * @param {Message} message
   */
  async execute(message) {
    // Check if the message came from the jury chat
    if (message.channel.name.startsWith("@")) {
      // Ensure the message is not from a bot
      if (message.author.bot) return;

      // Check if the message mentions any users
      if (message.mentions.users.size > 0) {
        // Attempt to delete the message to prevent the mention from notifying the user
        try {
          await message.delete();

          async function removeUserFromThread(thread, userId) {
            try {
              // Remove the user from the thread
              await thread.members.remove(userId);
            } catch (error) {
              console.error(`Failed to remove user from thread: ${error}`);
            }
          }

          // Remove the mentioned users from the thread
          for (const [userId] of message.mentions.users) {
            await removeUserFromThread(message.channel, userId);
          }

          // Optionally, send a warning message to the user who tried to mention someone
          message.channel.send(
            `This is your final warning, DO NOT invite users to this thread`
          );
        } catch (err) {
          console.error(`Failed to delete the message: ${err}`);
        }
      } else {
        //   Extract the channel & user id from the title
        const extracted = message.channel.name.slice(1).split(".");
        const channelId = extracted[0];
        const userId = extracted[1];
        const userNumber = extracted[2];

        //   Fetch the channel with the channelId
        const juryChannel = message.client.channels.cache.get(channelId);

        if (juryChannel) {
          // Forward the message sent by the user anonymously to the juryChannel
          juryChannel.send(`‎ 
  
  ${userNumber} : ${userId} - 
  
  ${message.content}`);
        } else {
          console.error("messageCreate.js: Failed at fetching channelId");
        }
      }
    }
  },
};
