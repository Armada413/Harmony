import { Events } from "discord.js";

export default {
  name: Events.ThreadUpdate,

  async execute(oldThread, newThread) {
    // Check if the thread has been archived
    if (!oldThread.archived && newThread.archived) {
      try {
        // Delete the thread
        await newThread.delete();
      } catch (error) {
        console.error(
          `Failed to delete archived thread ${newThread.name}:`,
          error
        );
      }
    }
  },
};
