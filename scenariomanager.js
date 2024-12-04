// scenarioManager.js
class ScenarioManager {
  constructor(gameController, simulationController) {
    this.gameController = gameController; // Reference to the main game controller
    this.simulationController = simulationController;
    this.gameIntro = false;
    this.oldLife = false;
    this.gameOver = false;
  }

  triggerGameOver(message, key) {
    const location = gameOverLocations[key];
    this.gameController.optionsController.unlockEnding(key);
    this.gameOver = true;
    updateSummaryText(message);
    this.gameController.mapController.closeMap();
    this.gameController.locationController.loadLocation(location);
  }

  triggerGameIntro3 = () => {
    if (this.oldLife) {
      this.simulationController.energy = 0;
      this.simulationController.updateEnergyBar(0, 100);
      this.triggerGameOver("This time, Vaeren strangles you.", "dead");
      return;
    }
    this.simulationController.money = 0;
    this.simulationController.dailyCost = 0;
    this.simulationController.locationCost = 0;
    this.gameController.closeDialogCallback = this.triggerGameStart;
    this.gameController.locationController.loadLocation(
      gameOverLocations["purgatory"]
    );
  };

  triggerGameIntro2 = () => {
    const alaric = this.simulationController.characters.find(
      (char) => char.name === "Alaric"
    );
    const vaeren = this.simulationController.characters.find(
      (char) => char.name === "Vaeren"
    );
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
    this.simulationController.restButton.classList.add("hidden");
    this.simulationController.restButton.disabled = true;
    this.gameController.locationController.loadLocation(
      gameOverLocations["bedroom"]
    );
    this.gameController.closeDialogCallback = this.triggerGameIntro2;
  }

  triggerOldLife() {
    const alaric = this.simulationController.characters.find(
      (char) => char.name === "Alaric"
    );
    const vaeren = this.simulationController.characters.find(
      (char) => char.name === "Vaeren"
    );
    alaric.location = "Game Start: Violet's Bedroom";
    vaeren.location = "Job";
    this.simulationController.money = 10000000; // Adjust this initial value as needed
    this.simulationController.dailyCost = 500000;
    this.simulationController.locationCost = 500000;
    this.simulationController.jobCost = 0;
    this.gameIntro = true;
    this.oldLife = true;
    this.simulationController.gameController.mapButton.disabled = true;
    this.simulationController.gameController.mapButton.classList.add("hidden");
    this.simulationController.restButton.classList.add("hidden");
    this.simulationController.restButton.disabled = true;
    this.gameController.locationController.loadLocation(
      gameOverLocations["bedroom"]
    );
    this.gameController.closeDialogCallback = this.triggerGameIntro2;
  }

  triggerGameStart = () => {
    this.simulationController.money = 0;
    this.simulationController.dailyCost = 0;
    this.simulationController.locationCost = 0;
    this.gameIntro = false;
    this.simulationController.showButtons();
    this.gameController.locationController.loadLocation(
      this.gameController.locationController.locations[0] // Itsuki.
    );
  };
}
