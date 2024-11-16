class OptionsController {
  constructor(simulationController, jobController, locationController) {
    this.simulationController = simulationController;
    this.jobController = jobController;
    this.locationController = locationController;
    this.showing = false;
    document.getElementById("save-button").addEventListener("click", () => {
      this.saveGameState();
    });

    document.getElementById("load-button").addEventListener("click", () => {
      this.loadGameState();
    });

    document
      .getElementById("music-toggle")
      .addEventListener("change", (event) => {
        this.toggleMusic();
      });

    document.getElementById("close-config").addEventListener("click", () => {
      this.close();
    });

    document.getElementById("config-button").addEventListener("click", () => {
      const configScreen = document.getElementById("config-screen");
      if (this.showing) {
        this.close();
        return;
      }
      this.showing = true;
      configScreen.style.display = "flex"; // Change from "none" to "flex" for the overlay
      document.getElementById("config-screen").style.display = "block";
      document.getElementById("music-toggle").checked =
        this.locationController.musicOn;
    });
  }

  close() {
    this.showing = false;
    const configScreen = document.getElementById("config-screen");
    configScreen.style.display = "none";
    document.body.style.overflow = ""; // Restore scrolling
    document.getElementById("config-screen").style.display = "none";
  }
  saveGameState() {
    const gameState = {
      day: this.simulationController.day,
      energy: this.simulationController.energy,
      money: this.simulationController.money,
      dailyCost: this.simulationController.dailyCost,
      locationCost: this.simulationController.locationCost,
      jobCost: this.simulationController.jobCost,
      locations: this.locationController.locations,
      roomTypes: this.locationController.roomTypes,
      currentLocation: this.locationController.currentLocation,
      jobs: this.jobController.jobs,
      music: this.locationController.musicOn, // Add a new field for the music toggle
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
    alert("Game saved successfully!");
  }

  loadGameState() {
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (!gameState) {
      alert("No saved game found.");
      return;
    }
    this.simulationController.day = gameState.day;
    this.simulationController.energy = gameState.energy;
    this.simulationController.money = gameState.money;
    this.simulationController.dailyCost = gameState.dailyCost;
    this.simulationController.locationCost = gameState.locationCost;
    this.simulationController.jobCost = gameState.jobCost;
    this.locationController.locations = gameState.locations.map(
      Location.fromData
    );
    console.log("" + gameState.roomTypes);
    this.locationController.roomTypes = gameState.roomTypes.map(
      RoomType.fromData
    );
    this.locationController.currentLocation =
      this.locationController.locations.find(
        (loc) => loc.name === gameState.currentLocation
      );
    this.jobController.jobs = gameState.jobs;
    this.locationController.musicOn = gameState.music || false;
    this.simulationController.updateDisplay();
    this.locationController.loadLocation(
      this.locationController.currentLocation
    );
    console.log("Game loaded successfully!");
  }

  toggleMusic() {
    this.locationController.musicOn = !this.locationController.musicOn;
    if (!this.locationController.musicOn) this.locationController.audio.pause();
    // Logic to enable/disable music playback can go here.
  }
}
