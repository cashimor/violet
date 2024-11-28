class SimulationController {
  constructor(jobController, xivatoController, characters, gameController) {
    this.jobController = jobController;
    this.xivatoController = xivatoController;
    this.gameController = gameController;
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
    this.gameOver = false;
    this.gameIntro = false;
    this.evilLairBonus = 0;
    this.evilness = 100; // Starting evil score
    this.updateEvilness(0);

    // DOM elements for updating the UI
    this.dayCounterElement = document.getElementById("day-counter");
    this.energyCounterElement = document.getElementById("energy-counter");
    this.restButton = document.getElementById("rest-button");
    this.moneyCounterElement = document.getElementById("money-counter");
    this.dailyCostElement = document.getElementById("daily-cost");

    // Update initial display
    this.updateDisplay();

    // Attach rest button event
    this.restButton.addEventListener("click", () => this.advanceDay());
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

  updateDisplay() {
    // Calculate daily costs
    this.dailyCost = this.locationCost + this.jobCost;

    // Choose the currency symbol based on the game state
    const currencySymbol = this.gameIntro ? "⚜" : "¥";

    // Update UI elements with the appropriate symbol
    this.dayCounterElement.textContent = this.day;
    this.energyCounterElement.textContent = this.energy;
    this.moneyCounterElement.textContent = `${currencySymbol}${this.money.toLocaleString()}`;
    this.dailyCostElement.textContent = `${currencySymbol}${this.dailyCost.toLocaleString()}`;
  }

  checkEvilWin() {
    const requiredMoney = 1000000; // Adjust if needed
    const xivatoLocations = this.xivatoController.owned("Xivato"); // Assuming a method for total locations
    const availableLocations = this.xivatoController.getAvailableLocations();
    const bribeCount = this.bribes;

    // Check all conditions
    if (
      this.money >= requiredMoney &&
      xivatoLocations === 0 &&
      availableLocations.length === 0 &&
      bribeCount > 0
    ) {
      this.triggerGameOver("You conquered the city!", gameOverLocations["evil"]); // Call a method to handle the win state
    }
  }

  advanceDay() {
    if (this.gameOver) {
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
    let summary = `<b>Day ${this.day}:</b><br>`;
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
    summary += `<br>Daily Costs: ¥${this.dailyCost.toLocaleString()}<br>`;
    summary += `Net Income: ¥${(
      totalProfit - this.dailyCost
    ).toLocaleString()}<br>`;
    summary += `<b>Total Money:</b> ¥${this.money.toLocaleString()}<br>`;

    // Show the summary in the Simulation Details section
    document.getElementById("summary-text").innerHTML = summary;

    // Check for Game Over
    if (this.money < 0) {
      this.triggerGameOver("Out of money", gameOverLocations["poverty"]);
      // Implement any additional game-over logic here
    }
    if (this.xivatoController.onNewDay()) {
      this.triggerGameOver(
        "Xivato took over the town",
        gameOverLocations["xivato"]
      );
    }
    this.checkEvilWin();
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
      this.xivatoController.owned("Violet") +
      this.xivatoController.owned("Xivato");

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

  triggerGameOver(message, location) {
    this.gameOver = true;
    updateSummaryText(message);
    this.gameController.mapController.closeMap();
    this.gameController.locationController.loadLocation(location);
  }

  triggerGameIntro3 = () => {
    this.money = 0;
    this.dailyCost = 0;
    this.locationCost = 0;
    this.gameController.closeDialogCallback = this.triggerGameStart;
    this.gameController.locationController.loadLocation(
      gameOverLocations["purgatory"]
    );
  };

  triggerGameIntro2 = () => {
    const alaric = this.characters.find((char) => char.name === "Alaric");
    const vaeren = this.characters.find((char) => char.name === "Vaeren");
    vaeren.location = alaric.location;
    alaric.location = "Job";
    this.gameController.closeDialogCallback = this.triggerGameIntro3;
    this.gameController.locationController.loadLocation(
      gameOverLocations["bedroom"]
    );
  };

  triggerGameIntro() {
    this.gameIntro = true;
    this.gameController.mapButton.disabled = true;
    this.gameController.mapButton.classList.add("hidden");
    this.restButton.classList.add("hidden");
    this.restButton.disabled = true;
    this.gameController.closeDialogCallback = this.triggerGameIntro2;
    this.gameController.locationController.loadLocation(
      gameOverLocations["bedroom"]
    );
  }

  triggerGameStart = () => {
    this.money = 0;
    this.dailyCost = 0;
    this.locationCost = 0;
    this.gameIntro = false;
    this.gameController.mapButton.disabled = false;
    this.restButton.disabled = false;
    this.gameController.mapButton.classList.remove("hidden");
    this.restButton.classList.remove("hidden");
    this.gameController.locationController.loadLocation(
      this.gameController.locationController.locations[0] // Itsuki.
    );
  };
}
