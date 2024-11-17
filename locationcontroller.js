class LocationController {
  constructor(
    decocanvas,
    locations,
    roomTypes,
    characters,
    simulationController,
    jobController
  ) {
    this.roomTypes = roomTypes;
    this.characters = characters;
    this.decocanvas = decocanvas;
    this.locations = locations;
    this.simulationController = simulationController;
    this.jobController = jobController;
    this.decocontext = decocanvas.getContext("2d");
    this.currentLocation = null; // The location currently being managed (e.g., the rented apartment)
    this.rentPopup = document.getElementById("rent-popup");
    this.dialogue = null;
    this.audio = new Audio(); // Audio element to manage playback
    this.currentMusic = null;
    this.musicOn = true;
    this.decoratePopup = document.getElementById("decoratePopup");
    document.querySelectorAll(".decorate-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const roomKey = event.target.id.replace("btn", "").toLowerCase();
        const roomData = roomTypes[roomKey];

        if (roomData) {
          this.decorateRoom(roomData);
        }
      });

      // Dynamically update the data-hint with cost and upkeep
      const roomKey = button.id.replace("btn", "").toLowerCase();
      const roomData = roomTypes[roomKey];

      if (roomData) {
        const formattedCost = roomData.cost
          .toLocaleString("en")
          .replace(/,/g, ".");
        const upkeepPercentage = (roomData.upkeep * 100).toFixed(2); // Convert to percentage
        const hintWithDetails = `${roomData.hint} (Cost: ¥${formattedCost}, Upkeep: ${upkeepPercentage}% daily)`;
        button.setAttribute("data-hint", hintWithDetails);
      }
    });
    const closeButton = document.getElementById("closeDecoratePopup");
    closeButton.addEventListener("click", () => {
      this.hidePopups();
    });
  }

  getCharacterByName(name) {
    return this.characters.find((char) => char.name === name) || null;
  }

  hidePopups() {
    this.rentPopup.classList.add("hidden");
    this.decoratePopup.classList.add("hidden");
    if (this.dialogue) this.dialogue.closeDialog();
  }

  loadLocation(location) {
    this.hidePopups();

    // Check for background music and play if available
    if (
      this.musicOn &&
      location.getMusicUrl() &&
      location.getMusicUrl() !== this.currentMusic
    ) {
      this.audio.src = location.getMusicUrl();
      this.audio.loop = false; // Loop the music for continuous playback
      this.audio.play();
      this.currentMusic = location.getMusicUrl();
    } else if (!location.getMusicUrl()) {
      this.audio.pause(); // Pause audio if no music for this location
    }

    const leftPanel = document.getElementById("left-panel");
    leftPanel.style.backgroundImage = `url(${location.getImageUrl()})`;
    this.currentLocation = location;

    // Clear the canvas to remove any previously drawn characters
    this.decocontext.clearRect(
      0,
      0,
      this.decocanvas.width,
      this.decocanvas.height
    );

    // Draw characters in the current location with their names
    characters.forEach((character) => {
      if (character.location === location.name) {
        this.renderCharacter(character);
      }
    });

    // Draw the back arrow if this location has a ref
    if (location.ref && location.ref !== "Map") {
      this.drawBackArrow();
    }

    // Check if the location is rented by Violet and apply the border
    if (location.owner === "Violet") {
      this.decocanvas.style.border = "5px solid violet";
      this.drawRoomNavigationIcons();
      if (this.currentLocation.getUse() === "default") {
        this.decoratePopup.classList.remove("hidden");
      }
      this.renderCharacter(this.jobController.getCharacter(location));
    } else {
      this.decocanvas.style.border = "none"; // Remove border if not rented by Violet
    }

    // Check if location is available
    if (
      location.available &&
      location.dailyCost <= this.simulationController.money
    ) {
      document.getElementById("location-name").textContent = location.name;
      document.getElementById(
        "location-details"
      ).textContent = `Daily Cost: ¥${location.dailyCost}, Size: ${location.size} people`;
      this.rentPopup.classList.remove("hidden");

      // Handle Rent button click
      document.getElementById("rent-button").onclick = () => {
        // Deduct money and mark location as rented by Violet
        location.rentTo("Violet");
        this.simulationController.recalculateDailyCostLocations(locations);
        this.decocanvas.style.border = "5px solid violet";
        // Hide popup
        this.rentPopup.classList.add("hidden");
        this.loadLocation(location);
      };

      // Handle Close button click
      document.getElementById("close-popup").onclick = () => {
        this.rentPopup.classList.add("hidden");
      };
    }
  }

  // Function to initialize and render a character in a specific room
  renderCharacter(character) {
    if (!character) return;

    if (character.dayTalk == this.simulationController.day) return;
    if (!this.simulationController.deductEnergy(3)) return;

    // Initialize the CharacterController for this character
    const characterController = new CharacterController(
      character,
      this.decocontext
    );

    // Fetch dialog file and initialize DialogController
    fetch(character.dialogue)
      .then((response) => response.text())
      .then((data) => {
        const dialogFileData = data.split("\n");
        this.dialogue = new DialogController(
          dialogFileData,
          this.decocanvas,
          characterController,
          this.jobController,
          this.simulationController
        );
        this.dialogue.start(); // Begin the dialog flow for the character
      });
  }

  drawRoomNavigationIcons() {
    const context = this.decocontext;
    const iconSize = 40; // Size of the navigation icons
    const margin = 10; // Margin from the canvas edge

    // Draw left arrow (<)
    context.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
    context.beginPath();
    context.moveTo(margin, this.decocanvas.height / 2);
    context.lineTo(
      iconSize + margin,
      this.decocanvas.height / 2 - iconSize / 2
    );
    context.lineTo(
      iconSize + margin,
      this.decocanvas.height / 2 + iconSize / 2
    );
    context.closePath();
    context.fill();

    // Draw right arrow (>)
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.beginPath();
    context.moveTo(this.decocanvas.width - margin, this.decocanvas.height / 2);
    context.lineTo(
      this.decocanvas.width - iconSize - margin,
      this.decocanvas.height / 2 - iconSize / 2
    );
    context.lineTo(
      this.decocanvas.width - iconSize - margin,
      this.decocanvas.height / 2 + iconSize / 2
    );
    context.closePath();
    context.fill();
  }

  // Event listener for arrow click detection
  handleRoomNavigationClick(x, y) {
    const iconSize = 40;
    const margin = 10;

    // Left arrow bounds
    const leftArrowBounds = {
      x: margin,
      y: this.decocanvas.height / 2 - iconSize / 2,
      width: iconSize,
      height: iconSize,
    };

    // Right arrow bounds
    const rightArrowBounds = {
      x: this.decocanvas.width - iconSize - margin,
      y: this.decocanvas.height / 2 - iconSize / 2,
      width: iconSize,
      height: iconSize,
    };

    // Check if left arrow clicked
    if (
      x >= leftArrowBounds.x &&
      x <= leftArrowBounds.x + leftArrowBounds.width &&
      y >= leftArrowBounds.y &&
      y <= leftArrowBounds.y + leftArrowBounds.height
    ) {
      this.currentLocation.navigateRooms("prev");
      this.loadLocation(this.currentLocation);
      return;
    }

    // Check if right arrow clicked
    if (
      x >= rightArrowBounds.x &&
      x <= rightArrowBounds.x + rightArrowBounds.width &&
      y >= rightArrowBounds.y &&
      y <= rightArrowBounds.y + rightArrowBounds.height
    ) {
      this.currentLocation.navigateRooms("next");
      this.loadLocation(this.currentLocation);
      return;
    }
  }

  drawBackArrow() {
    const arrowX = 20; // X position
    const arrowY = 20; // Y position
    const arrowSize = 30; // Size of the arrow

    this.decocontext.beginPath();
    this.decocontext.moveTo(arrowX + arrowSize, arrowY); // Right point
    this.decocontext.lineTo(arrowX, arrowY + arrowSize / 2); // Left middle point
    this.decocontext.lineTo(arrowX + arrowSize, arrowY + arrowSize); // Bottom point
    this.decocontext.closePath();
    this.decocontext.fillStyle = "yellow";
    this.decocontext.fill();
  }

  handleHover(event) {
    if (this.currentLocation == null) return;

    const rect = this.decocanvas.getBoundingClientRect();
    const mouseX =
      (event.clientX - rect.left) * (this.decocanvas.width / rect.width);
    const mouseY =
      (event.clientY - rect.top) * (this.decocanvas.height / rect.height);

    // Redraw only the specific area of previous hover outlines, so we don't clear the entire canvas
    this.clearHoverIndicators();

    // Loop through nearby locations and check if mouse is within 50x50 rectangle centered on each
    this.locations.forEach((location) => {
      if (location.ref === this.currentLocation.name) {
        const centerX = location.x;
        const centerY = location.y;
        const halfSize = 25;
        if (this.isInside(location.x - 26, location.y - 26, 52, 52)) return;
        if (
          mouseX >= centerX - halfSize &&
          mouseX <= centerX + halfSize &&
          mouseY >= centerY - halfSize &&
          mouseY <= centerY + halfSize
        ) {
          // Draw rectangle outline to indicate interactive area
          this.decocontext.strokeStyle = "blue";
          this.decocontext.lineWidth = 2;
          this.decocontext.strokeRect(
            centerX - halfSize,
            centerY - halfSize,
            50,
            50
          );
        }
      }
    });
  }

  isInside(x, y, width, height) {
    if (!this.dialogue) return false;
    if (this.dialogue.state == "INACTIVE") return false;
    // These values are from the character controller.js.
    const charLeft = 50;
    const charRight = 50 + 255;
    const charTop = 315;
    const charBottom = 315 + 285;

    const rectLeft = x;
    const rectRight = x + width;
    const rectTop = y;
    const rectBottom = y + height;

    // Check for overlap
    const overlap = !(
      rectRight <= charLeft || // Rectangle is to the left of the character
      rectLeft >= charRight || // Rectangle is to the right of the character
      rectBottom <= charTop || // Rectangle is above the character
      rectTop >= charBottom
    ); // Rectangle is below the character

    return overlap;
  }

  clearHoverIndicators() {
    // Clear just the area where hover indicators would appear, without affecting the rest of the canvas
    this.locations.forEach((location) => {
      if (location.ref === this.currentLocation.name) {
        const centerX = location.x;
        const centerY = location.y;
        if (this.isInside(location.x - 26, location.y - 26, 52, 52)) {
          return;
        }
        this.decocontext.clearRect(centerX - 26, centerY - 26, 52, 52); // Adjust size as needed
      }
    });
  }

  // Checks if a click is within a certain distance of a location
  isClickNearLocation(clickX, clickY, location) {
    const distance = Math.sqrt(
      (clickX - location.x) ** 2 + (clickY - location.y) ** 2
    );
    return distance < 10; // Threshold for clicking
  }

  handleDecoCanvasClick(event) {
    const rect = this.decocanvas.getBoundingClientRect();

    // Calculate scaling factor if displayed size differs from canvas size
    const scaleX = this.decocanvas.width / rect.width;
    const scaleY = this.decocanvas.height / rect.height;

    // Adjust click coordinates based on the scaling factors
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.dialogue && this.dialogue.state == "ACTIVE") {
      if (this.dialogue.handleCanvasClick(event, x, y)) {
        return;
      }
    }
    this.locations.forEach((location) => {
      if (location.ref === this.currentLocation.name) {
        // Nearby location check
        const distance = Math.sqrt(
          (x - location.x) ** 2 + (y - location.y) ** 2
        );
        if (distance < 30) {
          // Threshold for click
          if (this.simulationController.deductEnergy(1)) {
            // Deduct smaller energy
            this.loadLocation(location); // Move to the clicked location
            return true;
          }
        }
      }
    });

    const previousLocation = this.locations.find(
      (loc) => loc.name === this.currentLocation.ref
    );
    if (previousLocation) {
      // Check if the click is within the back arrow bounds
      const arrowBounds = { x: 20, y: 20, width: 30, height: 30 };
      if (
        x >= arrowBounds.x &&
        x <= arrowBounds.x + arrowBounds.width &&
        y >= arrowBounds.y &&
        y <= arrowBounds.y + arrowBounds.height
      ) {
        // Go back to the referenced location

        this.simulationController.deductEnergy(1);
        this.loadLocation(previousLocation);
        return true; // Exit early to avoid handling as another click event
      }
    }

    this.handleRoomNavigationClick(x, y);
  }

  decorateRoom(roomData) {
    // Deduct cost, set room image, and apply any upgrades as needed
    if (this.simulationController.deductMoney(roomData.cost)) {
      this.currentLocation.decorateLocation(
        roomData.imageUrl,
        roomData.name,
        roomData.music
      );
      this.jobController.addRoom(this.currentLocation);
      this.loadLocation(this.currentLocation);
      this.simulationController.recalculateDailyCostJobs(jobController);
      // If there's an upgrade path, we can manage it here later
      console.log(`Room decorated as ${roomData.name}`);
    }
  }
}
