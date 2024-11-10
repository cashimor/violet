class MapController {
    constructor(canvas, decocanvas, locations, simulationController) {
        this.canvas = canvas;
        this.decocanvas = decocanvas;
        this.context = canvas.getContext('2d');
        this.decocontext = decocanvas.getContext('2d');
        this.locations = locations;  // Array of Location objects
        this.currentLocation = null;
        this.simulationController = simulationController;
        this.currentLocation = null;  // Keep track of the current location
        this.mapContainer = document.getElementById("map-container");
        this.decorationContainer = document.getElementById("decoration-container");
        this.mapLocations = this.locations.filter(location => location.ref === "Map");

        // Set up the canvas click event to detect location selection
        this.canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
        this.decocanvas.addEventListener("click", (event) => this.handleDecoCanvasClick(event));

        // Add event listeners for hovering and clicking
        this.decocanvas.addEventListener("mousemove", (event) => this.handleHover(event));

        // Draw location markers initially
        this.drawMarkers();
    }

    openMap() {
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
        if (this.mapContainer.style.display === "none" || !this.mapContainer.style.display) {
            this.openMap();
        } else {
            this.closeMap();
        }
    }

    // Draws markers for each location on the map
    drawMarkers() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mapLocations.forEach(location => this.drawMarker(location));
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
        this.mapLocations.forEach(location => {
            const distance = Math.sqrt((x - location.x) ** 2 + (y - location.y) ** 2);
            if (distance < 10) {
                if (this.currentLocation !== location) {
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
        const rect = this.decocanvas.getBoundingClientRect();
    
        // Calculate scaling factor if displayed size differs from canvas size
        const scaleX = this.decocanvas.width / rect.width;
        const scaleY = this.decocanvas.height / rect.height;
    
        // Adjust click coordinates based on the scaling factors
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
    
        this.locations.forEach(location => {
            if (location.ref === this.currentLocation.name) { // Nearby location check
                const distance = Math.sqrt((x - location.x) ** 2 + (y - location.y) ** 2);
                if (distance < 30) {  // Threshold for click
                    if (this.simulationController.deductEnergy(1)) { // Deduct smaller energy
                        this.loadLocation(location);  // Move to the clicked location
                        return;
                    }
                }
            }
        });

        const previousLocation = this.locations.find(loc => loc.name === this.currentLocation.ref);
        if (previousLocation) {
          // Check if the click is within the back arrow bounds
          const arrowBounds = { x: 20, y: 20, width: 30, height: 30 };
          if (x >= arrowBounds.x && x <= arrowBounds.x + arrowBounds.width &&
            y >= arrowBounds.y && y <= arrowBounds.y + arrowBounds.height) {
            // Go back to the referenced location

            this.simulationController.deductEnergy(1);
            this.loadLocation(previousLocation);
            return;  // Exit early to avoid handling as another click event
          }
        }
    }

    handleHover(event) {
        if (this.currentLocation == null) return;

        const rect = this.decocanvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) * (this.decocanvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (this.decocanvas.height / rect.height);
    
        // Redraw only the specific area of previous hover outlines, so we don't clear the entire canvas
        this.clearHoverIndicators();
    
        // Loop through nearby locations and check if mouse is within 50x50 rectangle centered on each
        this.locations.forEach(location => {
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
                    this.decocontext.strokeRect(centerX - halfSize, centerY - halfSize, 50, 50);
                }
            }
        });
    }
    
    clearHoverIndicators() {
        // Clear just the area where hover indicators would appear, without affecting the rest of the canvas
        this.locations.forEach(location => {
            if (location.ref === this.currentLocation.name) {
                const centerX = location.x;
                const centerY = location.y;
                this.decocontext.clearRect(centerX - 26, centerY - 26, 52, 52);  // Adjust size as needed
            }
        });
    }

    // Checks if a click is within a certain distance of a location
    isClickNearLocation(clickX, clickY, location) {
        const distance = Math.sqrt((clickX - location.x) ** 2 + (clickY - location.y) ** 2);
        return distance < 10; // Threshold for clicking
    }

    drawSpeechBubble(context, characterX, characterY, dialogue) {
        const bubbleImage = new Image();
        bubbleImage.src = "images/bubble.png";  // Path to your speech bubble image

        bubbleImage.onload = () => {
            // Position the speech bubble above the character’s image
            const bubbleX = characterX + 50;  // Adjust based on bubble position
            const bubbleY = characterY - 100; // Adjust to appear above the character

            // Draw the bubble background image
            context.drawImage(bubbleImage, bubbleX, bubbleY, 400, 100);

            // Draw the text within the bubble
            context.font = "14px Arial";
            context.fillStyle = "black";
            context.textAlign = "center";
            context.fillText(dialogue, bubbleX + 100, bubbleY + 50);  // Center text in the bubble
        };
    }

    loadLocation(location) {
        this.closeMap();
        const leftPanel = document.getElementById("left-panel");
        leftPanel.style.backgroundImage = `url(${location.imageUrl})`;
        this.currentLocation = location;
    
        // Clear the canvas to remove any previously drawn characters
        this.decocontext.clearRect(0, 0, this.decocanvas.width, this.decocanvas.height);
    
        // Draw markers again (if location markers need to remain visible)
        this.drawMarkers();
    
        // Draw characters in the current location with their names
        characters.forEach(character => {
            if (character.location === location.name) {
                const characterImage = new Image();
                characterImage.src = character.imageUrl;
                characterImage.onload = () => {
                    // Draw character image
                    const characterX = 50;  // Adjust X position as needed
                    const characterY = 315; // Adjust Y position as needed
                    this.decocontext.drawImage(characterImage, characterX, characterY, 255, 285);
    
                    // Draw character name below the image
                    this.decocontext.font = "16px Arial"; // Font style for the character name
                    this.decocontext.fillStyle = "white";  // Text color
                    this.decocontext.textAlign = "center";
                    this.decocontext.fillText(character.name, characterX + 127, characterY + 270);  // Position text below image
                    
                    // Example dialogue for the character
                    const dialogue = "Hello, traveler!";
                    this.drawSpeechBubble(this.decocontext, characterX, characterY, dialogue);
                };
            }
        });

        // Draw the back arrow if this location has a ref
        if (location.ref && location.ref !== "Map") {
          this.drawBackArrow();
        }

        // Check if the location is rented by Violet and apply the border
        if (location.owner === "Violet") {
          this.decocanvas.style.border = "5px solid violet";
        } else {
          this.decocanvas.style.border = "none"; // Remove border if not rented by Violet
        }

        // Check if location is available
        if (location.available && location.dailyCost <= this.simulationController.money) {
          const rentPopup = document.getElementById("rent-popup");
          document.getElementById("location-name").textContent = location.name;
          document.getElementById("location-details").textContent = 
              `Daily Cost: ¥${location.dailyCost}, Size: ${location.size} people`;
          rentPopup.classList.remove("hidden");

          // Handle Rent button click
          document.getElementById("rent-button").onclick = () => {
                // Deduct money and mark location as rented by Violet
                location.rentTo("Violet");
                this.simulationController.recalculateDailyCost(locations);
                this.decocanvas.style.border = "5px solid violet";
                // Hide popup
                rentPopup.classList.add("hidden");
          };

          // Handle Close button click
          document.getElementById("close-popup").onclick = () => {
            rentPopup.classList.add("hidden");
          };
        }
    }

    drawBackArrow() {
        const arrowX = 20;  // X position
        const arrowY = 20;  // Y position
        const arrowSize = 30;  // Size of the arrow
    
        this.decocontext.beginPath();
        this.decocontext.moveTo(arrowX + arrowSize, arrowY); // Right point
        this.decocontext.lineTo(arrowX, arrowY + arrowSize / 2); // Left middle point
        this.decocontext.lineTo(arrowX + arrowSize, arrowY + arrowSize); // Bottom point
        this.decocontext.closePath();
        this.decocontext.fillStyle = "yellow";
        this.decocontext.fill();
    }
}