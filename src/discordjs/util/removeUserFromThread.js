export async function removeUserFromThread(thread, userId) {
  try {
    // Remove the user from the thread
    await thread.members.remove(userId);
  } catch (error) {
    console.error(`Failed to remove user from thread: ${error}`);
  }
}
