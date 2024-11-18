class SimulationController {
  constructor(jobController, xivatoController, characters) {
    this.jobController = jobController;
    this.xivatoController = xivatoController;
    this.characters = characters;
    this.day = 1;
    this.energy = 100;
    this.energyResetValue = 50; // Energy reset to this value each new day
    this.money = 100000; // Adjust this initial value as needed
    this.dailyCost = 0;
    this.locationCost = 0;
    this.jobCost = 0;
    this.friendBoundary = 0;

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
    this.dailyCost = this.locationCost + this.jobCost;
    this.dayCounterElement.textContent = this.day;
    this.energyCounterElement.textContent = this.energy;
    this.moneyCounterElement.textContent = `¥${this.money.toLocaleString()}`;
    this.dailyCostElement.textContent = `¥${this.dailyCost.toLocaleString()}`;
  }

  advanceDay() {
    this.day++;
    this.energy = this.energyResetValue;

    let totalProfit = 0;
    let evilLairBonus = 0;

    this.randomizeNPCLocations();

    // Prepare summary of daily activities
    let summary = `<b>Day ${this.day}:</b><br>`;

    // Calculate profits from all jobs
    Object.entries(this.jobController.jobs).forEach(([roomId, job]) => {
      const roomType = this.jobController.getRoomTypeByName(job.purpose); // Get room type from purpose
      const assignedNpc = job.npcAssigned;
      if (job.purpose === "Evil Lair") {
        evilLairBonus = 25;
        if (assignedNpc) {
          evilLairBonus = 50;
        }
      }
      if (roomType && assignedNpc) {
        const result = roomType.calculateProfit(assignedNpc);

        if (typeof result === "number") {
          // Success: Add profit and report
          totalProfit += result;
          summary += `Income from ${
            job.purpose
          }: ¥${result.toLocaleString()}<br>`;
        } else {
          // Issue: Add issue to report
          summary += `Event: ${result}<br>`;
        }
      }

    });
    this.energy = this.energy + evilLairBonus;
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
      alert("Game Over! Violet ran out of money.");
      // Implement any additional game-over logic here
    }
    if (this.xivatoController.onNewDay()) {
      alert("Game Over! Violet is homeless.");      
    }
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
    const possibleLocations = ["Bamboo Forest", "Riverside", "Mountain Area", "City Block 1", "City Block 2", "At Home"];
  
    // Shuffle the locations array (Fisher-Yates Shuffle)
    for (let i = possibleLocations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleLocations[i], possibleLocations[j]] = [possibleLocations[j], possibleLocations[i]];
    }
  
    // Assign NPCs to random locations
    this.characters.forEach(character => {
      // Skip characters with a job (i.e., those who have an icon)
      if (character.icon) return;
  
      if (possibleLocations.length > 0) {
        character.location = possibleLocations.pop(); // Assign and remove location
      } else {
        character.location = "At Home"; // Fallback if no locations are left
      }
    });
  }
}
