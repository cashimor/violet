// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");
const simulationController = new SimulationController();
const jobController = new JobController();
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
