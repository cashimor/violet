class SimulationController {
    constructor() {
      this.day = 1;
      this.energy = 100;
      this.energyResetValue = 100; // Energy reset to this value each new day
  
      // DOM elements for updating the UI
      this.dayCounterElement = document.getElementById("day-counter");
      this.energyCounterElement = document.getElementById("energy-counter");
      this.restButton = document.getElementById("rest-button");
  
      // Update initial display
      this.updateDisplay();
  
      // Attach rest button event
      this.restButton.addEventListener("click", () => this.advanceDay());
    }
  
    updateDisplay() {
      this.dayCounterElement.textContent = this.day;
      this.energyCounterElement.textContent = this.energy;
    }
  
    advanceDay() {
      this.day++;
      this.energy = this.energyResetValue;
      this.updateDisplay();
    }
  
    deductEnergy(amount) {
      if (this.energy >= amount) {
        this.energy -= amount;
        this.updateDisplay();
        return true; // Deduction successful
      } else {
        alert("Not enough energy to perform this action. Please rest to regain energy.");
        return false; // Deduction unsuccessful
      }
    }
  }
  