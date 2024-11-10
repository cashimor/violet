  // Initialize the map controller
  const mapcanvas = document.getElementById('location-display');
  const decocanvas = document.getElementById('decoration-display');
  const simulationController = new SimulationController();
  const mapController = new MapController(mapcanvas, decocanvas, locations, simulationController);
  
  // Event listeners
  document.getElementById('map-button').addEventListener('click', () => {
    mapController.toggleMap();
  });
  