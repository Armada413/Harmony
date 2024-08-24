import { Client } from "discord.js";

/**
 * @param {Client} client
 */
const yesOrNoButtons = async (client) => {
  // Filter members who has the "Collaborator" role into an array of id's
  const guildCollection = await guild.members.fetch();
  const collaborators = guildCollection
    .filter((member) =>
      member.roles.cache.some((role) => role.name === "Collaborator")
    )
    .map((member) => member.id);

  // Send initial jury request
  const yesButton = new ButtonBuilder()
    .setCustomId("yes")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Success);

  const noButton = new ButtonBuilder()
    .setCustomId("no")
    .setLabel("No")
    .setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder().addComponents(yesButton, noButton);

  for (const singleCollaborator of collaborators) {
    const user = await client.users.fetch(singleCollaborator);
    await user.send({
      content: "You have been summoned for jury, can you attend?",
      components: [row],
    });
  }
};
const checkJuryRequest = (client) => {};

function fisherYatesShuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export default {
  fisherYatesShuffle,
};
