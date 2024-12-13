class EnemyController {
  constructor(locations, gameController) {
    this.occupationInterval = 10; // Days between occupying new locations
    this.failedExpansionInterval = 5; // Times occupation should fail before evict.
    this.daysSinceLastOccupation = 0; // Tracks the days since last occupation
    this.locations = locations;
    this.gameController = gameController;
    this.failedExpansionCounter = 0;
    this.lastDaySpokenWithItsuki = 0;
  }

  toData() {
    const state = {
      daysSinceLastOccupation: this.daysSinceLastOccupation,
      failedExpansionCounter: this.failedExpansionCounter,
      lastDaySpokenWithItsuki: this.lastDaySpokenWithItsuki,
    };
    return state;
  }

  fromData(state) {
    if (state) {
      this.daysSinceLastOccupation = state.daysSinceLastOccupation;
      this.failedExpansionCounter = state.failedExpansionCounter;
      this.lastDaySpokenWithItsuki = state.lastDaySpokenWithItsuki;
    }
  }

  // Function to format the game's date
  formatGameDate(currentDay) {
    const startDate = new Date(2024, 2, 21); // March 21, 2024
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Calculate the current date based on the day count
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + currentDay - 1);

    // Get the formatted date components
    const dayOfWeek = weekdays[currentDate.getDay()];
    const options = { month: "long", day: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-US", options);

    return `${dayOfWeek}, ${formattedDate}`;
  }

  updateItsukiApartment(itsuki) {
    // Find the location for Itsuki's apartment
    const itsukiApartment = locations.find(
      (location) => location.name === "Itsuki's Apartment"
    );
    if (!itsukiApartment) {
      console.error("Itsuki's Apartment location not found!");
      return;
    }

    // Loop through all characters to check for "itsuki" tidbits
    for (let character of characters) {
      if (character.hasTidbit("itsuki")) {
        // Add a specific tidbit to Itsuki (e.g., "loanOfficeritsuki", "priestitsuki")
        itsuki.setTidbit(character.icon + "itsuki");

        // Update Itsuki's apartment to become active on the map
        if (itsukiApartment.ref != "Map") {
          itsuki.dialogue = "itsukiFoundDialogue.txt";
          console.log("Updated Itsuki's dialogue to post-discovery content.");
          itsukiApartment.ref = "Map";
          itsukiApartment.x = 240; // Move west (lower x value)
          itsukiApartment.y = 160; // Move north (lower y value)
          console.log(
            `Itsuki's apartment updated at (${itsukiApartment.x}, ${itsukiApartment.y}).`
          );
          this.gameController.mapController.setLocations(locations);
        }
      }
    }
  }

  // Assuming roomTypes is globally accessible or passed as context
  applyItsukiTheft(itsuki) {
    // Partners don't steal.
    if (itsuki.icon == "partner") return;
    const chance = 0.1;
    const maxTheftPercentage = 0.2;

    const loanOffice = roomTypes["loansharking"];
    if (!loanOffice || !loanOffice.funds || loanOffice.funds <= 0) return; // No funds to steal

    // Check if Itsuki successfully steals today
    if (Math.random() < chance) {
      const theftAmount = Math.round(
        loanOffice.funds * maxTheftPercentage * Math.random()
      );
      loanOffice.funds -= theftAmount;

      // Record the theft for dialogue purposes
      if (!loanOffice.theftHistory) {
        loanOffice.theftHistory = [];
      }
      loanOffice.theftHistory.push({
        date: this.formatGameDate(this.gameController.simulationController.day),
        amount: theftAmount,
      });
      console.log(`Itsuki stole ${theftAmount} from the loan office!`);
    }
  }

  owned(who) {
    return this.locations.filter((location) => location.owner === who).length;
  }

  getAvailableLocations() {
    return this.locations.filter((location) => location.available);
  }

  handleNys(itsuki) {
    console.log("Nys is being handled!");
  }

  checkNys(itsuki) {
    if (this.lastDaySpokenWithItsuki < 0) {
      this.handleNys();
      return;
    }
    if (!this.gameController.simulationController.hasTidbit("lairOccupied")) return;
    const currentDay = this.gameController.simulationController.day;
    if (itsuki.icon == "partner") return;
    if (itsuki.hasTidbit("offeredHelp")) return;
    if (itsuki.hasTidbit("spoken")) {
      this.lastDaySpokenWithItsuki = currentDay;
      itsuki.removeTidbit("spoken");
      return;
    }
    if (!this.gameController.goddessController.canHearPrayer()) return;
    if (currentDay > this.lastDaySpokenWithItsuki + 4) {
      // Activate Nys
      const nys = this.gameController.getCharacterByName("Nys");
      nys.icon = "";
      this.lastDaySpokenWithItsuki = -1;
      this.handleNys();
    }
  }

  checkLoseCondition() {
    const violetOwned = this.owned("Violet");
    const xivatoOwned = this.owned("Xivato");
    const availableRooms = this.getAvailableLocations().length;

    // Lose condition: Violet owns no locations, and all others are occupied by Xivato
    if (violetOwned === 0 && xivatoOwned > 0 && availableRooms === 0)
      return true;
    return false;
  }

  // Method invoked each new day
  onNewDay() {
    // Itsuki
    // Find Itsuki in the list of characters
    const itsuki = this.gameController.getCharacterByName("Itsuki");

    this.applyItsukiTheft(itsuki);
    this.updateItsukiApartment(itsuki);

    this.checkNys(itsuki);

    // Xivato
    this.daysSinceLastOccupation++;

    if (this.daysSinceLastOccupation >= this.occupationInterval) {
      this.occupyNewLocation();
      this.daysSinceLastOccupation = 0; // Reset counter
    }

    return this.checkLoseCondition();
  }

  findLocationToEvict() {
    let templeLocation = null;
    let evilLairLocation = null;
    const evictableLocations = [];

    // Loop through all locations
    for (const location of this.locations) {
      // Check if location is owned by Violet
      if (location.owner === "Violet") {
        console.log(location.rooms);
        // Check for temple in the first room
        if (location.rooms[0]?.use === "Temple") {
          templeLocation = location; // Store the temple location
        }
        // Check for the evil lair in any room
        else if (location.rooms.some((room) => room.use === "Evil Lair")) {
          evilLairLocation = location; // Store the evil lair location
        }
        // Otherwise, this is a valid evictable location
        else {
          evictableLocations.push(location);
        }
      }
    }

    let locationToEvict = null;
    // If there are no evictable locations, return null
    if (evictableLocations.length > 0) {
      const randomIndex = Math.floor(Math.random() * evictableLocations.length);
      locationToEvict = evictableLocations[randomIndex];
    }
    // Return all three locations
    return {
      locationToEvict, // Randomly selected location to evict
      templeLocation, // Temple location
      evilLairLocation, // Evil Lair location
    };
  }

  occupyNewLocation() {
    const availableLocations = this.getAvailableLocations();

    if (availableLocations.length === 0) {
      // All locations are occupied
      this.failedExpansionCounter += this.owned("Xivato");
    }

    if (availableLocations.length > 0) {
      const locationToOccupy =
        availableLocations[
          Math.floor(Math.random() * availableLocations.length)
        ];
      locationToOccupy.rentTo("Xivato"); // Assuming `rentTo` sets the location's owner
      this.gameController.simulationController.recalculateDailyCostLocations(
        locations
      );
      console.log(`Xivato have occupied ${locationToOccupy.name}`);
      return;
    }
    if (this.failedExpansionInterval > this.failedExpansionCounter) {
      return;
    }
    this.failedExpansionCounter -= this.failedExpansionInterval;
    // Check if there is something to evict.
    const { locationToEvict, templeLocation, evilLairLocation } =
      this.findLocationToEvict();
    if (locationToEvict) {
      locationToEvict.vacate();
      this.gameController.simulationController.recalculateDailyCostLocations(
        locations
      );
      console.log(`Xivato have evicted Violet from ${locationToEvict.name}`);
      return;
    }
    if (templeLocation) {
      templeLocation.owner = "Xivato";
      this.gameController.simulationController.recalculateDailyCostLocations(
        locations
      );
      console.log("Xivato have converted the temple to their own use.");
      return;
    }
    this.gameController.simulationController.scenarioManager.triggerGameOver(
      "Xivato infiltrated your Evil Lair.",
      "xivato"
    );
  }
}
