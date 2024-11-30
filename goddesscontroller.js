// This file is more a list of ideas than actual usable code at this time.
class GoddessController {
  constructor(characters) {
    this.characters = characters;
    this.followers = []; // List to hold all followers' characters
  }

  // Add a follower to the list based on the "malvani" or "nirvani" tidbit
  addFollower(character) {
    // Check for tidbits that indicate followers of the Goddess
    if (character.hasTidbit("malvani") || character.hasTidbit("nirvani")) {
      if (!this.followers.includes(character)) {
        this.followers.push(character); // Add to the list of followers
      }
    }
  }

  // Function to get the number of followers (either malvani or nirvani)
  getFollowerCount() {
    let followerCount = 0;

    // Loop through all characters in the game and count those with malvani or nirvani tidbits
    for (let character of this.characters) {
      if (character.hasTidbit("malvani") || character.hasTidbit("nirvani")) {
        followerCount++;
      }
    }
    return followerCount;
  }

  // Check if a character is a follower of the Goddess (malvani or nirvani)
  isFollower(character) {
    return character.hasTidbit("malvani") || character.hasTidbit("nirvani");
  }

  // Evict the Xivato from a location using the power of the Goddess
  evictXivato(location) {
    // Logic to evict Xivato from the location
    location.removeFaction("Xivato"); // Example method to remove Xivato
    console.log(
      `The Xivato have been evicted from ${location.name} by the Goddess's power.`
    );
    return ">xivatoevicted"; // Return a label for dialogue flow
  }

  // Convert an Xivato to the Goddess's religion
  convertXivato(xivatoCharacter) {
    if (xivatoCharacter.hasTidbit("xivato")) {
      // Change the character's tidbit and state to indicate conversion
      xivatoCharacter.setTidbit("malvani");
      console.log(
        `${xivatoCharacter.name} has been converted to the Goddess's religion.`
      );
      return ">xivatoConverted"; // Return a label for dialogue flow
    } else {
      console.log(`${xivatoCharacter.name} is not an Xivato.`);
      return ">conversionFailed"; // Label if the conversion fails
    }
  }

  // Handle the priest asking for the number of followers
  getFollowersDialogue() {
    const followerCount = this.getFollowerCount();
    return `There are ${followerCount} devoted followers of the Goddess.`;
  }
}
