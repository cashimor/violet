class LocationController {
  constructor(decocanvas, locations, simulationController) {
    this.decocanvas = decocanvas;
    this.locations = locations;
    this.simulationController = simulationController;
    this.decocontext = decocanvas.getContext("2d");
    this.currentLocation = null; // The location currently being managed (e.g., the rented apartment)
    this.currentRoomIndex = 0; // Tracks the currently displayed room in the rented apartment
    this.rentPopup = document.getElementById("rent-popup");
    this.dialogue = null;
    this.audio = new Audio(); // Audio element to manage playback
    this.currentMusic = null;
  }

  hidePopups() {
    this.rentPopup.classList.add("hidden");
    if (this.dialogue) this.dialogue.closeDialog();
  }

  loadLocation(location) {
    this.rentPopup.classList.add("hidden");
    if (this.dialogue) this.dialogue.closeDialog();

    // Check for background music and play if available
    if (location.musicUrl && location.musicUrl !== this.currentMusic) {
      this.audio.src = location.musicUrl;
      this.audio.loop = false; // Loop the music for continuous playback
      this.audio.play();
      this.currentMusic = location.musicUrl;
    } else if (!location.musicUrl) {
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
        let characterController;
        characterController = new CharacterController(
          character,
          this.decocontext
        );
        fetch("testdialog.txt")
          .then((response) => response.text())
          .then((data) => {
            const dialogFileData = data.split("\n"); // Convert file content into an array of lines
            this.dialogue = new DialogController(
              dialogFileData,
              this.decocanvas,
              characterController
            );
            // Now, dialogController can be used to manage the dialog flow
            this.dialogue.start();
          });
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
        this.simulationController.recalculateDailyCost(locations);
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

  clearHoverIndicators() {
    // Clear just the area where hover indicators would appear, without affecting the rest of the canvas
    this.locations.forEach((location) => {
      if (location.ref === this.currentLocation.name) {
        const centerX = location.x;
        const centerY = location.y;
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
}
