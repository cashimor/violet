// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");

class GameController {
  constructor() {
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
      this.xivatoController
    );
    this.optionsController.applyMusicSetting();
    this.simulationController.randomizeNPCLocations();
    // Event listeners
    document.getElementById("map-button").addEventListener("click", () => {
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
