// Initialize the map controller
const mapcanvas = document.getElementById("location-display");
const decocanvas = document.getElementById("decoration-display");
const simulationController = new SimulationController();
const locationController = new LocationController(decocanvas, locations, simulationController);
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
