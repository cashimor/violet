// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");

class GameController {
  constructor() {
    this.closeDialogCallback = null;
    this.helpController = new HelpController(this);
    this.jobController = new JobController();
    this.xivatoController = new XivatoController(locations);
    this.simulationController = new SimulationController(
      this.jobController,
      this.xivatoController,
      characters,
      this // Pass GameController itself
    );
    this.locationController = new LocationController(
      decocanvas,
      locations,
      roomTypes,
      characters,
      this.simulationController,
      this.jobController,
      this // Pass GameController itself
    );
    this.mapController = new MapController(
      mapcanvas,
      decocanvas,
      locations,
      this.simulationController,
      this.locationController
    );
    this.optionsController = new OptionsController(
      this.simulationController,
      this.jobController,
      this.locationController,
      this.xivatoController,
      this.mapController,
      this
    );
    this.goddessController = new GoddessController(characters);

    this.optionsController.applyMusicSetting();
    this.simulationController.randomizeNPCLocations();
    // Event
    this.mapButton = document.getElementById("map-button");
    this.mapButton.addEventListener("click", () => {
      if (this.simulationController.gameOver) {
        this.mapController.closeMap();
        updateSummaryText(
          "The game is over. Please restart or reload to continue."
        );
        return;
      }
      this.mapController.toggleMap();
    });
  }
}

// Instantiate the game controller
const gameController = new GameController();

function updateSummaryText(message) {
  const summaryElement = document.getElementById("summary-text");
  summaryElement.textContent = message;
}

document.getElementById("proceedButton").addEventListener("click", () => {
  document.getElementById("contentWarning").style.display = "none"; // Hide the warning
  document.getElementById("game-container").style.display = "flex"; // Show the game
  gameController.simulationController.triggerGameIntro();
});
