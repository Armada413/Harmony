import { Events, Role } from 'discord.js';
import { User, MessageReaction } from 'discord.js';
import { addUser } from '../api/authApi.js';

export default {
  name: Events.MessageReactionAdd,
  /**
   * @param {User} user
   * @param {MessageReaction} reaction
   */
  async execute(reaction, user) {
    const messageId = '1272746998918811680';
    const emojiId = '✅';
    const roleId = '1271656640692752464';

    // If the user reacted from the 'messageId' with the ✅ emoji then add @member role
    if (reaction.message.id == messageId && reaction.emoji.name == emojiId) {
      try {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const userData = { discord_id: user.id };

        // If the user doesn't have the role then add role
        if (!member.roles.cache.has(roleId)) {
          await member.roles.add(roleId);
          await addUser(userData);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  },
};
