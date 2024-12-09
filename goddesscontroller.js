class GoddessController {
  constructor(characters, gameController) {
    this.characters = characters;
    this.gameController = gameController;
    this.mana = 0; // Current amount of mana available
    this.manaThreshold = 1000; // Default mana threshold for answering prayers
  }

  calculateFollowers(followerCount) {
    const dedicatedIndividuals = followerCount;
    let followers = dedicatedIndividuals * dedicatedIndividuals * 17;
    return Math.round(followers); // Scale to max followers
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

  // Triggered at the start of a new day to gather mana based on followers
  gatherMana() {
    const followerCount = this.getFollowerCount();
    if (followerCount > 4) {
      // Possible win scenario.
      if (this.canHearPrayer()) {
        this.gameController.simulationController.scenarioManager.triggerGameOver(
          "Malvani rises to rule the world.",
          "malvani"
        );
      }
    }
    const newFollowers = this.calculateFollowers(followerCount);
    const manaGained = newFollowers * 10; // Mana generated per follower
    this.mana += manaGained;
    return manaGained;
  }

  // Check if there is enough mana for a prayer to be heard
  canHearPrayer() {
    return this.mana >= this.manaThreshold;
  }

  // Consume mana to answer a prayer
  answerPrayer(cost) {
    if (this.mana >= cost) {
      this.mana -= cost;
      return true; // Prayer answered
    }
    return false; // Not enough mana
  }

  // Method to handle prayers
  prayForEviction() {
    // Check if there's enough mana
    if (this.mana < this.manaThreshold) {
      return "Malvani cannot act—her power is insufficient.";
    }

    // Find Xivato-controlled locations
    const xivatoLocations =
      this.gameController.locationController.locations.filter(
        (location) => location.owner === "Xivato"
      );

    if (xivatoLocations.length === 0) {
      return "The Xivato have no strongholds left to be evicted from.";
    }

    // Select a random Xivato location and vacate it
    const targetLocation =
      xivatoLocations[Math.floor(Math.random() * xivatoLocations.length)];
    targetLocation.vacate();

    // Deduct the mana cost
    this.mana -= this.manaThreshold;
    return true; // Indicate success
  }
}
