class OptionsController {
  constructor(simulationController, jobController, locationController, xivatoController) {
    this.simulationController = simulationController;
    this.jobController = jobController;
    this.locationController = locationController;
    this.xivatoController = xivatoController;
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
      friendBoundary: this.simulationController.friendBoundary,
      bribes: this.simulationController.bribes,
      locations: this.locationController.locations,
      currentLocation: this.locationController.currentLocation,
      jobs: this.jobController.toData(),
      characters: this.locationController.characters,
      daysSinceLastOccupation: this.xivatoController.daysSinceLastOccupation,
    };

    const roomTypesData = {};
    for (const [key, roomType] of Object.entries(
      this.locationController.roomTypes
    )) {
      roomTypesData[key] = roomType.toData(); // Assume `RoomType` has a `toData` method.
    }
    gameState.roomTypes = roomTypesData;

    localStorage.setItem("gameState", JSON.stringify(gameState));
    updateSummaryText("Game saved successfully!");
    this.close();
  }

  loadGameState() {
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    if (!gameState) {
      updateSummaryText("No saved game found.");
      return;
    }
    this.simulationController.day = gameState.day;
    this.simulationController.energy = gameState.energy;
    this.simulationController.money = gameState.money;
    this.simulationController.dailyCost = gameState.dailyCost;
    this.simulationController.locationCost = gameState.locationCost;
    this.simulationController.jobCost = gameState.jobCost;
    this.simulationController.friendBoundary = gameState.friendBoundary;
    this.simulationController.bribes = gameState.bribes;
    this.xivatoController.daysSinceLastOccupation = gameState.daysSinceLastOccupation;
    this.locationController.locations = gameState.locations.map(
      Location.fromData
    );
    this.locationController.characters = gameState.characters.map(
      Character.fromData
    );
    Object.keys(gameState.roomTypes).forEach((key) => {
      if (this.locationController.roomTypes[key]) {
        this.locationController.roomTypes[key] = RoomType.fromData(
          gameState.roomTypes[key]
        );
      } else {
        console.warn(`Room type '${key}' not found in current roomTypes.`);
      }
    });
    this.locationController.currentLocation =
      this.locationController.locations.find(
        (loc) => loc.name === gameState.currentLocation.name
      );
    this.jobController.fromData(gameState.jobs, locationController);
    this.simulationController.updateDisplay();
    this.locationController.loadLocation(
      this.locationController.currentLocation
    );
    this.locationController.updateDecorateOptions();
    updateSummaryText("Game loaded successfully!");
    this.close();
  }

  toggleMusic() {
    this.locationController.musicOn = !this.locationController.musicOn;
    if (!this.locationController.musicOn) this.locationController.audio.pause();
    localStorage.setItem("musicSetting", JSON.stringify(this.locationController.musicOn));
    // Logic to enable/disable music playback can go here.
  }

  applyMusicSetting() {
    const musicSetting = localStorage.getItem("musicSetting");
    if (musicSetting !== null) {
      const isMusicOn = JSON.parse(musicSetting);
      this.locationController.musicOn = isMusicOn;
    }
  }
}
