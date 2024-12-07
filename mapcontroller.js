class MapController {
  constructor(
    canvas,
    decocanvas,
    locations,
    simulationController,
    locationController
  ) {
    this.canvas = canvas;
    this.decocanvas = decocanvas;
    this.context = canvas.getContext("2d");
    this.decocontext = decocanvas.getContext("2d");
    this.setLocations(locations);
    this.simulationController = simulationController;
    this.locationController = locationController;
    this.mapContainer = document.getElementById("map-container");
    this.decorationContainer = document.getElementById("decoration-container");

    // Updated event listeners
    this.canvas.addEventListener(
      "click",
      debounceClick((event) => this.handleCanvasClick(event))
    );

    this.decocanvas.addEventListener(
      "click",
      debounceClick((event) => this.handleDecoCanvasClick(event))
    );

    // Add event listeners for hovering and clicking
    this.decocanvas.addEventListener("mousemove", (event) =>
      this.handleHover(event)
    );

    // Draw location markers initially
    this.drawMarkers();
  }

  setLocations(locations) {
    this.locations = locations;
    this.mapLocations = this.locations.filter(
      (location) => location.ref === "Map"
    );
  }

  openMap() {
    this.drawMarkers();
    // this.locationController.hidePopups();
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

  // Calculate control proportions
  calculateControlProportions() {
    const control = {};

    control["total"] = { Violet: 0, Xivato: 0, Community: 0, total: 0 };

    // Initialize counters for each ref
    this.locations.forEach((loc) => {
      if (!control[loc.ref]) {
        control[loc.ref] = { Violet: 0, Xivato: 0, Community: 0, total: 0 };
      }

      if (loc.owner === "Violet") {
        control[loc.ref].Violet++;
        control["total"].Violet++;
      } else if (loc.owner === "Xivato") {
        control[loc.ref].Xivato++;
        control["total"].Xivato++;
      } else if (loc.owner === "Community") {
        control[loc.ref].Community++;
        control["total"].Community++;
      }

      control[loc.ref].total++;
      control["total"].total++;
    });

    return control;
  }

  drawMarkers() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate proportions
    const controlProportions = this.calculateControlProportions();

    // First pass: Draw circles and markers
    this.mapLocations.forEach((location) =>
      this.drawMarker(
        location,
        controlProportions[location.name],
        controlProportions["total"]
      )
    );

    // Second pass: Draw location labels
    this.mapLocations.forEach((location) => this.drawBaseMarker(location));
  }

  // Draw a single marker
  drawMarker(location, control, totalarea) {
    const radius = 25; // Base size of control circle
    const { Violet, Xivato, Community, total } = control || {
      Violet: 0,
      Xivato: 0,
      Community: 0,
      total: 1,
    };

    const violetRadius = radius * totalarea.Violet;
    const xivatoRadius = radius * totalarea.Xivato;
    const communityRadius = radius * totalarea.Community;

    // Violet and Xivato
    if (Violet > 0 && Xivato > 0) {
      this.drawControlCircle(
        location,
        violetRadius,
        Math.PI,
        2 * Math.PI,
        "rgba(238, 130, 238, 0.4)" // Violet bottom
      );
      this.drawControlCircle(
        location,
        xivatoRadius,
        0,
        Math.PI,
        "rgba(220, 20, 60, 0.4)" // Xivato top
      );
    }
    // Violet and Community
    else if (Violet > 0 && Community > 0) {
      this.drawControlCircle(
        location,
        violetRadius,
        Math.PI,
        2 * Math.PI,
        "rgba(238, 130, 238, 0.4)" // Violet bottom
      );
      this.drawControlCircle(
        location,
        communityRadius,
        0,
        Math.PI,
        "rgba(50, 205, 50, 0.4)" // Community top
      );
    }
    // Xivato and Community
    else if (Xivato > 0 && Community > 0) {
      this.drawControlCircle(
        location,
        xivatoRadius,
        Math.PI,
        2 * Math.PI,
        "rgba(220, 20, 60, 0.4)" // Xivato bottom
      );
      this.drawControlCircle(
        location,
        communityRadius,
        0,
        Math.PI,
        "rgba(50, 205, 50, 0.4)" // Community top
      );
    }
    // Single control
    else if (Violet > 0) {
      this.drawControlCircle(
        location,
        violetRadius,
        0,
        2 * Math.PI,
        "rgba(238, 130, 238, 0.4)" // Full Violet
      );
    } else if (Xivato > 0) {
      this.drawControlCircle(
        location,
        xivatoRadius,
        0,
        2 * Math.PI,
        "rgba(220, 20, 60, 0.4)" // Full Xivato
      );
    } else if (Community > 0) {
      this.drawControlCircle(
        location,
        communityRadius,
        0,
        2 * Math.PI,
        "rgba(50, 205, 50, 0.4)" // Full Community
      );
    }

    // Base marker
    this.drawBaseMarker(location);
  }

  drawControlCircle(location, radius, startAngle, endAngle, color) {
    this.context.beginPath();
    this.context.arc(
      location.x,
      location.y,
      radius,
      startAngle,
      endAngle,
      false
    );
    this.context.fillStyle = color;
    this.context.fill();
  }

  drawBaseMarker(location) {
    this.context.beginPath();
    this.context.arc(location.x, location.y, 10, 0, 2 * Math.PI);

    // Use specific colors for special locations
    if (location.name === "Police Station") {
      this.context.fillStyle = "blue"; // Police station marker color
    } else if (location.name === "Itsuki's Apartment") {
      this.context.fillStyle = "orange"; // Itsuki's Apartment marker color
    } else {
      this.context.fillStyle = "red"; // Default marker color
    }

    this.context.fill();
    // Draw the location name
    this.context.font = "16px Arial"; // Font size and type
    this.context.fillStyle = "black"; // Text color
    this.context.textAlign = "center"; // Center-align text

    // Draw a semi-transparent background
    this.context.fillStyle = "rgba(0, 0, 0, 0.4)"; // Black with 50% transparency
    const textWidth = this.context.measureText(location.name).width;
    this.context.fillRect(
      location.x - textWidth / 2 - 5,
      location.y + 15,
      textWidth + 10,
      20
    );

    // Then, draw the fill (foreground text)
    this.context.fillStyle = "white";
    this.context.fillText(location.name, location.x, location.y + 30);
  }

  handleCanvasClick(event) {
    if (this.simulationController.scenarioManager.gameOver) {
      updateSummaryText(
        "The game is over. Please restart or reload to continue."
      );
      return;
    }
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
    if (this.simulationController.scenarioManager.gameOver) {
      updateSummaryText(
        "The game is over. Please restart or reload to continue."
      );
      return;
    }
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
