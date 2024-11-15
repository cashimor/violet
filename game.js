// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");
const jobController = new JobController();
const simulationController = new SimulationController(jobController);
const locationController = new LocationController(
  decocanvas,
  locations,
  roomTypes,
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

// Event listeners
document.getElementById("map-button").addEventListener("click", () => {
  mapController.toggleMap();
});
