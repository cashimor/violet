// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");

class GameController {
  constructor() {
    this.closeDialogCallback = null;
    this.helpController = new HelpController(this);
    this.jobController = new JobController();
    this.enemyController = new EnemyController(locations, this);
    this.simulationController = new SimulationController(
      this.jobController,
      this.enemyController,
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
      this.enemyController,
      this.mapController,
      this
    );
    this.goddessController = new GoddessController(characters, this);

    this.optionsController.applyMusicSetting();
    this.optionsController.updateSlotSummaries();
    this.simulationController.randomizeNPCLocations();
    // Event
    this.mapButton = document.getElementById("map-button");
    this.mapButton.addEventListener(
      "click",
      debounceClick(() => {
        if (this.simulationController.scenarioManager.gameOver) {
          this.mapController.closeMap();
          updateSummaryText(
            "The game is over. Please restart or reload to continue."
          );
          return;
        }
        this.mapController.toggleMap();
      })
    );
  }

  getCharacterByName(name) {
    return this.locationController.characters.find((char) => char.name === name) || null;
  }
}

// Instantiate the game controller
const gameController = new GameController();

function updateSummaryText(message) {
  const summaryElement = document.getElementById("summary-text");
  summaryElement.textContent = message;
}

function debounceClick(callback, delay = 300) {
  let isClicked = false;

  return function (...args) {
    if (isClicked) return; // Ignore additional clicks
    isClicked = true;
    callback.apply(this, args);
    setTimeout(() => {
      isClicked = false; // Reset after the delay
    }, delay);
  };
}

document.getElementById("proceedButton").addEventListener(
  "click",
  debounceClick(() => {
    document.getElementById("contentWarning").style.display = "none"; // Hide the warning
    document.getElementById("game-container").style.display = "flex"; // Show the game
    gameController.simulationController.scenarioManager.triggerGameIntro();
  })
);
