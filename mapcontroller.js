class MapController {
  constructor(canvas, decocanvas, locations, simulationController, locationController) {
    this.canvas = canvas;
    this.decocanvas = decocanvas;
    this.context = canvas.getContext("2d");
    this.decocontext = decocanvas.getContext("2d");
    this.locations = locations; // Array of Location objects
    this.simulationController = simulationController;
    this.locationController = locationController;
    this.mapContainer = document.getElementById("map-container");
    this.decorationContainer = document.getElementById("decoration-container");
    this.mapLocations = this.locations.filter(
      (location) => location.ref === "Map"
    );

    // Set up the canvas click event to detect location selection
    this.canvas.addEventListener("click", (event) =>
      this.handleCanvasClick(event)
    );
    this.decocanvas.addEventListener("click", (event) =>
      this.handleDecoCanvasClick(event)
    );

    // Add event listeners for hovering and clicking
    this.decocanvas.addEventListener("mousemove", (event) =>
      this.handleHover(event)
    );

    // Draw location markers initially
    this.drawMarkers();
  }

  openMap() {
    this.locationController.hidePopups();
    this.decorationContainer.style.display = "none";
    this.mapContainer.style.display = "block";
    document.getElementById("map-button").textContent = "Close Map";
  }

  closeMap() {
    this.mapContainer.style.display = "none";
    this.decorationContainer.style.display = "block";
    document.getElementById("map-button").textContent = "Map";
  }

  // Toggles the map display
  toggleMap() {
    if (
      this.mapContainer.style.display === "none" ||
      !this.mapContainer.style.display
    ) {
      this.openMap();
    } else {
      this.closeMap();
    }
  }

  // Draws markers for each location on the map
  drawMarkers() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.mapLocations.forEach((location) => this.drawMarker(location));
  }

  // Draws a single location marker
  drawMarker(location) {
    this.context.beginPath();
    this.context.arc(location.x, location.y, 10, 0, 2 * Math.PI);
    this.context.fillStyle = "red";
    this.context.fill();
  }

  handleCanvasClick(event) {
    const rect = this.canvas.getBoundingClientRect();

    // Calculate scaling factor if displayed size differs from canvas size
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    // Adjust click coordinates based on the scaling factors
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Check each location to see if the click is close
    this.mapLocations.forEach((location) => {
      const distance = Math.sqrt((x - location.x) ** 2 + (y - location.y) ** 2);
      if (distance < 10) {
        if (this.locationController.currentLocation !== location) {
          const energyCost = 10; // Example cost, adjust as needed

          // Deduct energy and proceed only if successful
          if (this.simulationController.deductEnergy(energyCost)) {
            this.loadLocation(location);
          }
        }
      }
    });
  }

  handleDecoCanvasClick(event) {
    if (this.locationController.handleDecoCanvasClick(event)) {
        this.closeMap();
    }
  }

  handleHover(event) {
    this.locationController.handleHover(event);
  }

  loadLocation(location) {
    this.closeMap();
    this.locationController.loadLocation(location);
  }
}
