import { Events, Message } from "discord.js";

export default {
  name: Events.MessageCreate,
  /**
   * @param {Message} message
   */
  async execute(message) {
    if (message.channel.name.startsWith("@")) {
      //   Extract the channel & user id from the title
      const extracted = message.channel.name.slice(1).split(".");
      const channelId = extracted[0];
      const userId = extracted[1];

      //   Fetch the channel with the channelId
      const juryChannel = message.client.channels.cache.get(channelId);

      if (juryChannel) {
        // Forward the message sent by the user anonymously to the juryChannel
        juryChannel.send(message.content);
      }
    }
  },
};
