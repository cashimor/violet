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
        this.context.arc(location.x, location.y, 5, 0, 2 * Math.PI);
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
                if (distance < 10) {  // Threshold for click
                    if (this.simulationController.deductEnergy(1)) { // Deduct smaller energy
                        this.loadLocation(location);  // Move to the clicked location
                    } else {
                        console.log("Not enough energy to move.");
                    }
                }
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

        // Draw markers for nearby locations
        this.locations.forEach(loc => {
          if (loc.ref === location.name) { // Location is nearby
            const markerX = loc.x;  // Replace with actual coordinates if available
            const markerY = loc.y;
            this.decocontext.beginPath();
            this.decocontext.arc(markerX, markerY, 5, 0, 2 * Math.PI);
            this.decocontext.fillStyle = "blue";
            this.decocontext.fill();
          }
        });
    }
}