// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");
const jobController = new JobController();
const simulationController = new SimulationController(jobController, characters);
const locationController = new LocationController(
  decocanvas,
  locations,
  roomTypes,
  characters,
  simulationController,
  jobController,
);
const mapController = new MapController(
  mapcanvas,
  decocanvas,
  locations,
  simulationController,
  locationController
);

const optionsController = new OptionsController(
  simulationController,
  jobController,
  locationController
)

optionsController.applyMusicSetting();
simulationController.randomizeNPCLocations();

// Event listeners
document.getElementById("map-button").addEventListener("click", () => {
  mapController.toggleMap();
});

function updateSummaryText(message) {
  const summaryElement = document.getElementById("summary-text");
  summaryElement.textContent = message;
}
