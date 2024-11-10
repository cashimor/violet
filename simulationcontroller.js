class SimulationController {
    constructor() {
      this.day = 1;
      this.energy = 100;
      this.energyResetValue = 100; // Energy reset to this value each new day
      this.money = 100000; // Adjust this initial value as needed
      this.dailyCost = 0;
      
  
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
  
    // Recalculate the total daily cost from rented locations
    recalculateDailyCost(locations) {
        this.dailyCost = locations
            .filter(location => location.owner === "Violet")
            .reduce((total, location) => total + location.dailyCost, 0);
        this.updateDisplay();
    }

    updateDisplay() {
      this.dayCounterElement.textContent = this.day;
      this.energyCounterElement.textContent = this.energy;
      this.moneyCounterElement.textContent = `¥${this.money.toLocaleString()}`;
      this.dailyCostElement.textContent = `¥${this.dailyCost.toLocaleString()}`;
    }
  
    advanceDay() {
      this.day++;
      this.energy = this.energyResetValue;
      this.money -= this.dailyCost;
      if (this.money < 0) {
        alert("Game Over! Violet ran out of money.");
        // Implement any additional game-over logic here
      }
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
  }
  