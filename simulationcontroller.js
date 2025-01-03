class SimulationController {
  constructor(jobController, enemyController, characters, gameController) {
    this.jobController = jobController;
    this.enemyController = enemyController;
    this.gameController = gameController;
    this.scenarioManager = new ScenarioManager(gameController, this); // Initialize the helper
    this.characters = characters;
    this.day = 1;
    this.energy = 100;
    this.energyResetValue = 50; // Energy reset to this value each new day
    this.money = 10000000; // Adjust this initial value as needed
    this.dailyCost = 500000;
    this.locationCost = 500000;
    this.jobCost = 0;
    this.friendBoundary = 0;
    this.bribes = 0;
    this.evilLairBonus = 0;
    this.evilness = 70; // Starting evil score
    this.updateEvilness(0);
    this.tidbits = {};

    // DOM elements for updating the UI
    this.dayCounterElement = document.getElementById("day-counter");
    this.energyCounterElement = document.getElementById("energy-counter");
    this.restButton = document.getElementById("rest-button");
    this.moneyCounterElement = document.getElementById("money-counter");
    this.dailyCostElement = document.getElementById("daily-cost");

    // Update initial display
    this.updateDisplay();

    // Attach rest button event with debounce
    this.restButton.addEventListener(
      "click",
      debounceClick(() => this.advanceDay())
    );
  }

  toData() {
    const state = {
      day: this.day,
      energy: this.energy,
      money: this.money,
      dailyCost: this.dailyCost,
      locationCost: this.locationCost,
      jobCost: this.jobCost,
      friendBoundary: this.friendBoundary,
      tidbits: this.tidbits || {},
      bribes: this.bribes,
      evilness: this.evilness,
    };
    return state;
  }

  fromData(state) {
    if (state) {
      this.day = state.day;
      this.energy = state.energy;
      this.money = state.money;
      this.dailyCost = state.dailyCost;
      this.locationCost = state.locationCost;
      this.jobCost = state.jobCost;
      this.friendBoundary = state.friendBoundary;
      this.tidbits = state.tidbits || {};
      this.bribes = state.bribes;
      this.evilness = state.evilness;
      this.updateEvilness(0);
    }
  }

  reduceFriendBoundary(amount) {
    this.friendBoundary = Math.max(0, this.friendBoundary - amount); // Prevent negative boundary
    console.log(
      `Friend boundary reduced by ${amount}. New value: ${this.friendBoundary}`
    );
  }

  // Set a tidbit
  setTidbit(key) {
    this.tidbits[key] = true;
    return key;
  }

  // Get a tidbit (returns false if not set)
  hasTidbit(key) {
    return !!this.tidbits[key];
  }

  getEvilFilter(evilness) {
    const hue = 135 + (100 - evilness) * 1.65; // Violet base hue
    const brightness = 50 + (100 - evilness) * 0.5;
    const contrast = 100;

    return `hue-rotate(${hue}deg) brightness(${brightness}%) contrast(${contrast}%)`;
  }

  updateEvilness(change) {
    const newEvilness = this.evilness + change;
    this.evilness = Math.max(0, Math.min(100, newEvilness)); // Clamp between 0 and 100

    // Get the new outline color
    const newColor = this.getEvilFilter(this.evilness);
    document.getElementById("violet-outline-image").style.filter = newColor;
  }

  recalculateDailyCostLocations(locations) {
    // Calculate costs from rented locations
    this.locationCost = locations
      .filter((location) => location.owner === "Violet")
      .reduce((total, location) => total + location.dailyCost, 0);
    this.updateDisplay();
  }

  // Recalculate the total daily cost from rented locations and jobs
  recalculateDailyCostJobs(jobController) {
    // Calculate upkeep costs from jobs
    this.jobCost = Object.values(jobController.jobs)
      .filter((job) => job.purpose && job.purpose !== "default") // Ignore undecorated rooms
      .reduce((total, job) => {
        const roomType = jobController.getRoomTypeByName(job.purpose); // Lookup the room type
        if (!roomType) {
          console.warn(`Room type "${job.purpose}" not found in roomTypes.`);
          return total;
        }
        const decorationCost = roomType.cost || 0;
        const upkeepRate = roomType.upkeep || 0;
        let wages = 0;
        if (job.npcAssigned) {
          wages = roomType.dailyWage;
        }
        return total + decorationCost * upkeepRate + wages;
      }, 0);
    // Update the display to reflect the new daily cost
    this.updateDisplay();
  }

  // Function to update the day display with the formatted game date
  updateDayCounter(currentDay) {
    if (this.scenarioManager.gameIntro) {
      document.getElementById(
        "date-counter"
      ).innerText = `Dune Day, 8th of the Moons of Dust`;
      return;
    }

    // Use the formatGameDate function to get the formatted date
    const formattedDate = this.enemyController.formatGameDate(currentDay);

    // Update the date display
    document.getElementById("date-counter").innerText = formattedDate;
  }

  // Function to update the energy bar
  updateEnergyBar(currentEnergy, maxEnergy) {
    let resetValue = this.energyResetValue + this.evilLairBonus;
    const energyFill = document.getElementById("energy-fill");
    const resetMarker = document.getElementById("energy-reset-marker");

    // Update the energy bar fill
    const energyPercentage = (currentEnergy / maxEnergy) * 100;
    energyFill.style.width = `${energyPercentage}%`;

    // Calculate reset marker position as a percentage of the energy bar
    const resetPercentage = (resetValue / maxEnergy) * 100;
    const markerPosition = 135 + (resetPercentage / 100) * 300;

    // Position the reset marker within the bounds of the energy bar
    resetMarker.style.left = `${markerPosition}px`;
    resetMarker.style.display = resetPercentage <= 100 ? "block" : "none";
  }

  updateDisplay() {
    // Calculate daily costs
    this.dailyCost = this.locationCost + this.jobCost;

    // Choose the currency symbol based on the game state and tidbit
    const currencySymbol = this.hasTidbit("KNOWmoney")
      ? "¥" // Use Yen if Violet knows about money
      : this.scenarioManager.gameIntro
      ? "⚜"
      : "?"; // Use medieval or unknown symbol otherwise

    // Update UI elements with the appropriate symbol
    this.updateDayCounter(this.day);
    this.updateEnergyBar(this.energy, 100);
    this.moneyCounterElement.textContent = `${currencySymbol}${this.money.toLocaleString()}`;
    this.dailyCostElement.textContent = `${currencySymbol}${this.dailyCost.toLocaleString()}`;
  }

  checkCommunityWin() {
    const communityLocations = this.enemyController.owned("Community"); // Community-controlled locations
    const violetLocations = this.enemyController.owned("Violet"); // Violet-controlled locations
    const xivatoLocations = this.enemyController.owned("Xivato"); // Xivato-controlled locations
    const availableLocations = this.enemyController.getAvailableLocations(); // Unoccupied locations

    // Check if all locations are either Community or Violet-controlled
    if (
      xivatoLocations === 0 && // No Xivato-controlled locations
      availableLocations.length === 0 && // No unoccupied locations
      violetLocations < 3 // All locations are controlled
    ) {
      // Determine if Itsuki is present in the Community scenario
      const itsuki = this.gameController.getCharacterByName("Itsuki");
      const isItsukiPartner = itsuki && itsuki.icon === "partner";
      const nys = this.gameController.getCharacterByName("Nys");
      const isNysPartner = nys && nys.icon === "partner";

      if (isItsukiPartner) {
        // Itsuki helps lead the Community transformation
        this.scenarioManager.triggerGameOver(
          "With Itsuki by your side, the city blossoms into a true community.",
          "communityitsuki"
        );
      } else if (isNysPartner) {
        // Nys is by Violet's side.
        this.scenarioManager.triggerGameOver(
          "Together, you and Nys have created a better world.",
          "communitynys"
        );
      } else {
        // Violet achieves the Community transformation alone
        this.scenarioManager.triggerGameOver(
          "The city thrives under your leadership, but you are left to lead alone.",
          "community"
        );
      }
    }
  }

  checkAloneWin() {
    const requiredMoney = 2000000; // Higher threshold for alone ending

    // Check conditions for "Violet Alone"
    if (this.money >= requiredMoney && this.evilness > 100) {
      this.scenarioManager.triggerGameOver(
        "You achieved immense wealth, but no one remains by your side.",
        "alone"
      );
    }
  }

  checkEvilWin() {
    const requiredMoney = 1000000; // Adjust if needed
    const xivatoLocations = this.enemyController.owned("Xivato"); // Assuming a method for total locations
    const communityLocations = this.enemyController.owned("Community"); // Assuming a method for total locations
    const availableLocations = this.enemyController.getAvailableLocations();
    const bribeCount = this.bribes;

    // Check all conditions for the Evil Win
    if (
      this.money >= requiredMoney &&
      xivatoLocations === 0 &&
      availableLocations.length === 0 &&
      communityLocations < 1 &&
      bribeCount > 0
    ) {
      // Check if Itsuki is in the Evil Lair
      const itsuki = this.gameController.getCharacterByName("Itsuki");
      if (itsuki.icon == "partner") {
        this.scenarioManager.triggerGameOver(
          "Even Itsuki could not resist your rise to power.",
          "evilItsuki"
        );
      } else {
        this.scenarioManager.triggerGameOver("You conquered the city!", "evil");
      }
    }
  }

  advanceDay() {
    if (this.scenarioManager.gameOver) {
      updateSummaryText(
        "The game is over. Please restart or reload to continue."
      );
      return;
    }
    this.day++;
    this.energy = this.energyResetValue;

    let totalProfit = 0;
    this.evilLairBonus = 0;

    this.randomizeNPCLocations();
    // Prepare summary of daily activities
    let summary = "";
    let raidHappened = false;

    // Calculate profits from all jobs
    Object.entries(this.jobController.jobs).forEach(([roomId, job]) => {
      let raidChance = this.calculateRaidLikelihood(roomId);
      if (raidHappened) raidChance = 0;
      const roomType = this.jobController.getRoomTypeByName(job.purpose); // Get room type from purpose
      const assignedNpc = job.npcAssigned;
      if (job.purpose === "Evil Lair") {
        this.evilLairBonus = 25;
        if (assignedNpc) {
          this.evilLairBonus = 50;
        }
      }
      if (roomType && assignedNpc) {
        const result = roomType.calculateProfit(assignedNpc, raidChance);

        if (typeof result === "number") {
          // Success: Add profit and report
          totalProfit += result;
          summary += `Income from ${
            job.purpose
          }: ¥${result.toLocaleString()}<br>`;
        } else {
          raidHappened = true;
          // Issue: Add issue to report
          summary += `Event: ${result}<br>`;
        }
      }
    });
    this.energy = this.energy + this.evilLairBonus;
    // Update money and handle end-of-day report
    this.money += totalProfit; // Add total profit to money
    this.money -= this.dailyCost; // Subtract daily costs

    // Add daily cost and final balance to the summary
    summary += `Net Income: ¥${(
      totalProfit - this.dailyCost
    ).toLocaleString()}<br>`;

    // Show the summary in the Simulation Details section
    document.getElementById("summary-text").innerHTML = summary;

    // Check for Game Over
    if (this.money < 0) {
      this.scenarioManager.triggerGameOver("Out of money", "poverty");
      // Implement any additional game-over logic here
    }
    if (this.enemyController.onNewDay()) {
      this.scenarioManager.triggerGameOver(
        "Xivato took over the town",
        "xivato"
      );
    }
    this.gameController.goddessController.gatherMana();
    this.checkEvilWin();
    this.checkCommunityWin();
    this.checkAloneWin();
    this.updateDisplay();
  }

  deductEnergy(amount) {
    if (this.energy >= amount) {
      this.energy -= amount;
      this.updateDisplay();
      return true; // Deduction successful
    } else {
      alert(
        "Not enough energy to perform this action. Please rest to regain energy."
      );
      return false; // Deduction unsuccessful
    }
  }

  deductMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      this.updateDisplay();
      return true;
    } else {
      alert("Not enough money to perform this action. Please acquire funds.");
      return false; // Deduction unsuccessful
    }
  }

  randomizeNPCLocations() {
    const possibleLocations = [
      "Bamboo Forest",
      "Riverside",
      "Mountain Area",
      "City Block 1",
      "City Block 2",
      "At Home",
      "At Home",
    ];

    // Shuffle the locations array (Fisher-Yates Shuffle)
    for (let i = possibleLocations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleLocations[i], possibleLocations[j]] = [
        possibleLocations[j],
        possibleLocations[i],
      ];
    }

    // Assign NPCs to random locations
    this.characters.forEach((character) => {
      // Skip characters with a job (i.e., those who have an icon)
      if (character.icon) return;

      if (possibleLocations.length > 0) {
        character.location = possibleLocations.pop(); // Assign and remove location
      } else {
        character.location = "At Home"; // Fallback if no locations are left
      }
    });
  }

  /**
   * Calculate the likelihood of a raid on a specific location.
   * @param {Object} location - The location to calculate raid likelihood for.
   * @returns {number} - The raid likelihood as a percentage (0-100).
   */
  calculateRaidLikelihood(roomId) {
    const baseLikelihood = 10; // Base raid likelihood (e.g., 10%)
    const maxLikelihood = 90; // Maximum likelihood cap
    const bribeEffectiveness = 5000; // Amount of money to reduce likelihood by 1%

    // Global faction influence
    const totalInfluence =
      this.enemyController.owned("Violet") +
      this.enemyController.owned("Xivato");

    // Adjust likelihood based on global and local influence
    let likelihood = baseLikelihood + totalInfluence * 0.05;

    // Increase likelihood if the location is in the city
    if (roomId?.includes("City")) {
      likelihood += 20; // Add a 20% bonus for city locations
    }

    // Reduce likelihood by bribes
    const bribeReduction = this.bribes / bribeEffectiveness;
    likelihood -= bribeReduction;

    // Ensure the likelihood stays within bounds
    likelihood = Math.min(maxLikelihood, Math.max(0, likelihood));

    return likelihood;
  }

  /**
   * Add bribe money to reduce raid likelihood.
   * @param {number} amount - Amount of money given as a bribe.
   */
  addBribe(amount) {
    this.bribes += amount;
  }

  showButtons() {
    this.gameController.mapButton.disabled = false;
    this.restButton.disabled = false;
    this.gameController.mapButton.classList.remove("hidden");
    this.restButton.classList.remove("hidden");
    if (this.hasTidbit("SHOP_smartPhone")) {
      this.gameController.phoneController.showButton();
    }
  }
}
