class PhoneController {
  constructor(containerId, canvasId, buttonId, gameController) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(canvasId);
    this.button = document.getElementById(buttonId);
    this.gameController = gameController;

    // Initialize PixiJS app
    this.app = new PIXI.Application({
      view: this.canvas,
      width: 280,
      height: 500,
      backgroundColor: 0x000000, // Default phone background
    });

    // Track phone state
    this.isVisible = false;
    this.currentCallCharacter = null;
    this.originalCharacterLocation = null;
    this.currentPage = 1;

    document
      .getElementById("toggle-phone-btn")
      .addEventListener("click", () => {
        this.togglePhone();
      });

    this.assets = {
      contactsIcon: "./images/assets/contacts.png", // Path to Contacts icon
      backIcon: "./images/assets/back.png", // Path to Back icon
      endCallIcon: "./images/assets/endcall.png",
      nextIcon: "./images/assets/next.png",
      mapIcon: "./images/assets/map.png",
    };

    // Contacts storage
    this.contacts = [];
    this.addContact("Police Officer", null);
    this.addBaseUI();
  }

  // Convert contacts to a serializable format
  toData() {
    return this.contacts.map((contact) => ({
      name: contact.name,
      onCallCallback: null, // Callbacks cannot be serialized
    }));
  }

  // Load contacts from serialized data
  fromData(data) {
    if (!data) return;
    this.contacts = data.map((contactData) => ({
      name: contactData.name,
      onCallCallback: () => {
        console.log(`Calling ${contactData.name}...`); // Default callback, replace if necessary
      },
    }));
  }

  createButton(imagePath, x, y, width, height, onClickCallback) {
    const button = PIXI.Sprite.from(imagePath);
    button.x = x;
    button.y = y;
    button.width = width;
    button.height = height;
    button.interactive = true;
    button.buttonMode = true;

    // Hover effect
    button.on("pointerover", () => {
      button.tint = 0xaaaaaa; // Slightly darkens on hover
    });
    button.on("pointerout", () => {
      button.tint = 0xffffff; // Resets to normal color
    });

    // Click event
    button.on("pointerdown", () => {
      onClickCallback();
    });

    return button;
  }

  // Add base UI, including the address book icon
  addBaseUI() {
    // Clear previous content
    this.clearStage();
    this.currentScreen = "base";

    // Add Address Book button using createButton method
    const addressBookButton = this.createButton(
      this.assets.contactsIcon, // Path to the Contacts icon
      20, // x-position
      20, // y-position
      40, // width
      40, // height
      () => {
        this.showContacts(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(addressBookButton);

    // Add Map button using createButton method
    const mapButton = this.createButton(
      this.assets.mapIcon, // Path to the Contacts icon
      80, // x-position
      20, // y-position
      40, // width
      40, // height
      () => {
        this.showMap(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(mapButton);
  }

  // Add a new contact to the address book
  addContact(name, onCallCallback) {
    // Check if the contact already exists
    const contactExists = this.contacts.some(
      (contact) => contact.name === name
    );

    if (contactExists) {
      console.warn(`Contact "${name}" already exists in the address book.`);
      return false; // Skip adding duplicate
    }

    // Add the new contact
    this.contacts.push({ name, onCallCallback });

    // If the address book is currently displayed, refresh it
    if (this.currentScreen === "contacts") {
      this.showContacts(); // Re-render the address book
    }

    return true;
  }

  showContacts() {
    const contactsPerPage = 5; // Number of contacts per page
    const totalPages = Math.ceil(this.contacts.length / contactsPerPage);

    // Combine and sort contacts with job-assigned NPCs
    const allContacts = [...this.contacts];
    const assignedNPCs = this.gameController.jobController.getAssignedNPCs();

    assignedNPCs.forEach((npc) => {
      allContacts.push({ name: npc });
    });

    // Sort contacts by name
    const sortedContacts = [...allContacts].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Ensure currentPage is within valid range
    if (!this.currentPage || this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    // Clear previous content
    this.clearStage();
    this.currentScreen = "contacts";

    // Background
    const background = new PIXI.Graphics();
    background.beginFill(0x111111); // Slightly darker background
    background.drawRect(
      0,
      0,
      this.app.renderer.width,
      this.app.renderer.height
    );
    background.endFill();
    this.app.stage.addChild(background);

    // Title
    const title = new PIXI.Text("Contacts", {
      fontSize: 24,
      fill: "#ffffff",
      fontWeight: "bold",
    });
    title.x = 10;
    title.y = 10;
    this.app.stage.addChild(title);

    // Calculate contacts to display for the current page
    const startIndex = (this.currentPage - 1) * contactsPerPage;
    const endIndex = Math.min(
      startIndex + contactsPerPage,
      sortedContacts.length
    );
    const visibleContacts = sortedContacts.slice(startIndex, endIndex);

    // Display each visible contact
    const barHeight = 60;
    visibleContacts.forEach((contact, index) => {
      const yOffset = 50 + index * (barHeight + 10);

      // Bar background
      const bar = new PIXI.Graphics();
      bar.beginFill(0x333333); // Dark gray
      bar.drawRect(10, yOffset, 260, barHeight);
      bar.endFill();
      bar.interactive = true;
      bar.buttonMode = true;

      bar.on("pointerover", () => {
        bar.tint = 0x555555; // Highlight on hover
      });
      bar.on("pointerout", () => {
        bar.tint = 0xffffff; // Reset color
      });

      bar.on("pointerdown", () => {
        // Strip location for call tracking
        const strippedName = contact.name.split(" (")[0];
        this.call(strippedName, contact.name);
      });

      this.app.stage.addChild(bar);

      // Chibi image
      const strippedName = contact.name.split(" (")[0].toLowerCase();
      const chibiPath = `images/assets/${strippedName}.png`;
      const chibiSprite = PIXI.Sprite.from(chibiPath);
      chibiSprite.x = 20;
      chibiSprite.y = yOffset;
      chibiSprite.width = 40;
      chibiSprite.height = 60;
      this.app.stage.addChild(chibiSprite);

      // Contact name
      const contactText = new PIXI.Text(contact.name, {
        fontSize: 20,
        fill: "#ffffff",
      });
      contactText.x = 70; // Position next to the chibi
      contactText.y = yOffset + 20;
      this.app.stage.addChild(contactText);
    });

    // Add "Previous" button if not on the first page
    if (this.currentPage > 1) {
      const prevButton = this.createButton(
        this.assets.nextIcon,
        100, // x-position
        this.app.renderer.height - 50, // y-position
        40, // width
        40, // height
        () => {
          this.currentPage--;
          this.showContacts();
        }
      );
      prevButton.scale.x = -1; // Flip horizontally
      prevButton.width = 40; // Adjust x-position after flipping
      this.app.stage.addChild(prevButton);
    }

    // Add "Next" button if not on the last page
    if (this.currentPage < totalPages) {
      const nextButton = this.createButton(
        this.assets.nextIcon,
        this.app.renderer.width - 50, // x-position
        this.app.renderer.height - 50, // y-position
        40, // width
        40, // height
        () => {
          this.currentPage++;
          this.showContacts();
        }
      );
      this.app.stage.addChild(nextButton);
    }

    // Add a back button
    const backButton = this.createButton(
      this.assets.backIcon,
      10, // x-position
      this.app.renderer.height - 50, // y-position (10px padding from the bottom)
      40, // width
      40, // height
      () => {
        this.addBaseUI();
        this.currentPage = 1; // Reset to the first page
      }
    );
    this.app.stage.addChild(backButton);
  }

  // Clear all elements from the PixiJS stage
  clearStage() {
    this.app.stage.removeChildren();
  }

  // Show the phone interface
  showPhone() {
    this.container.style.display = "block";
    this.isVisible = true;
  }

  // Hide the phone interface
  hidePhone() {
    this.container.style.display = "none";
    this.isVisible = false;
  }

  // Toggle phone visibility
  togglePhone() {
    if (this.isVisible) {
      this.hidePhone();
    } else {
      this.showPhone();
    }
  }

  // Show the phone button
  showButton() {
    if (this.button) {
      this.button.classList.remove("hidden");
    }
  }

  // Hide the phone button
  hideButton() {
    if (this.button) {
      this.button.classList.add("hidden");
    }
  }

  // Show the call screen based on the current call state
  showCallScreen(state) {
    // Clear the stage
    this.clearStage();
    this.currentScreen = "call";

    const contact = this.currentCallCharacter;
    if (!contact) {
      console.log("Error state: call screen without character.");
      this.addBaseUI();
      return;
    }
    // Add chibi image
    const chibiPath = `./images/assets/${contact.name.toLowerCase()}.png`;
    const chibiSprite = PIXI.Sprite.from(chibiPath);
    chibiSprite.x = this.app.renderer.width / 2 - 60;
    chibiSprite.y = 80;
    chibiSprite.width = 120;
    chibiSprite.height = 180;
    this.app.stage.addChild(chibiSprite);

    // Add "Dialing..." or "Call Failed" overlay if needed
    if (state === "dialing") {
      const dialingText = new PIXI.Text("Dialing...", {
        fontSize: 20,
        fill: "#ffffff",
      });
      dialingText.anchor.set(0.5);
      dialingText.x = this.app.renderer.width / 2;
      dialingText.y = 280;
      this.app.stage.addChild(dialingText);
    } else if (state === "no answer") {
      const failureOverlay = new PIXI.Graphics();
      failureOverlay.lineStyle(5, 0xff0000, 1); // Red line
      failureOverlay.moveTo(chibiSprite.x, chibiSprite.y);
      failureOverlay.lineTo(
        chibiSprite.x + chibiSprite.width,
        chibiSprite.y + chibiSprite.height
      );
      failureOverlay.moveTo(chibiSprite.x + chibiSprite.width, chibiSprite.y);
      failureOverlay.lineTo(chibiSprite.x, chibiSprite.y + chibiSprite.height);
      this.app.stage.addChild(failureOverlay);

      const failedText = new PIXI.Text("Call Failed", {
        fontSize: 20,
        fill: "#ff0000",
      });
      failedText.anchor.set(0.5);
      failedText.x = this.app.renderer.width / 2;
      failedText.y = 280;
      this.app.stage.addChild(failedText);
    }

    // Add call text if active
    if (state === "active") {
      const callText = new PIXI.Text(`In call with ${contact.name}`, {
        fontSize: 20,
        fill: "#ffffff",
      });
      callText.anchor.set(0.5);
      callText.x = this.app.renderer.width / 2;
      callText.y = 40;
      this.app.stage.addChild(callText);
    }

    // Add "End Call" button
    const endCallButton = this.createButton(
      "./images/assets/endcall.png", // Path to the "End Call" image
      80, // x-position
      350, // y-position
      120, // width
      40, // height
      () => {
        this.endCall(); // Callback for ending the call
      }
    );

    this.app.stage.addChild(endCallButton);
  }
  // Call a character by name
  call(characterName, fullName) {
    if (fullName != characterName)
      console.log("Work location: <" + fullName + ">");
    if (this.currentCallCharacter) {
      console.warn("Already in a call!");
      return;
    }

    const character = this.gameController.getCharacterByName(characterName);
    if (!character) {
      console.error(`Character "${characterName}" not found.`);
      return;
    }

    this.currentCallCharacter = character;
    this.showCallScreen("dialing");
    this.gameController.audioController.playLocationMusic("music/phone.mp3");

    // Simulate dialing delay
    const dialingDuration = 4000; // 4-second delay for longer realism
    setTimeout(() => {
      // Check if the call was ended during the delay
      if (this.currentCallCharacter !== character) {
        console.warn("Call was ended before connecting.");
        return;
      }

      // Temporarily store the character's current location
      this.originalCharacterLocation = character.location;
      character.location = "Phone";
      const location = this.gameController.findLocationByName("Phone");
      location.ref =
        this.gameController.locationController.currentLocation.name;

      // Load the phone location into the location controller
      if (this.gameController.locationController.loadLocation(location)) {
        this.gameController.closeDialogCallback = this.endCall;
        this.showCallScreen("active");
        this.hidePhone();
      } else {
        this.gameController.closeDialogCallback = null;
        this.showCallScreen("no answer");
        this.restoreLocation();
      }
    }, dialingDuration);
  }

  restoreLocation() {
    // Restore the character's original location
    if (this.currentCallCharacter && this.originalCharacterLocation) {
      this.currentCallCharacter.location = this.originalCharacterLocation;
    }

    if (
      this.gameController.locationController.currentLocation.name == "Phone"
    ) {
      const previousLocation = this.gameController.findLocationByName(
        this.gameController.locationController.currentLocation.ref
      );
      this.gameController.locationController.loadLocation(previousLocation);
    }
  }

  // End the current call
  endCall = () => {
    this.showPhone();
    this.addBaseUI();
    if (!this.currentCallCharacter) {
      console.warn("Not in a call!");
      return;
    }
    this.restoreLocation();
    // Reset call state
    this.currentCallCharacter = null;
    this.originalCharacterLocation = null;
  };

  showMap() {
    // Clear the phone screen
    this.clearStage();
    this.currentScreen = "map";

    // Create a rounded rectangle mask
    const maskGraphics = new PIXI.Graphics();
    maskGraphics.beginFill(0x000000);
    maskGraphics.drawRoundedRect(
      0,
      0,
      this.app.renderer.width,
      this.app.renderer.height,
      20 // Radius for rounded edges
    );
    maskGraphics.endFill();

    // Create a container for scrolling
    const mapContainer = new PIXI.Container();
    this.app.stage.addChild(mapContainer);

    // Apply the mask to the container
    mapContainer.mask = maskGraphics;
    this.app.stage.addChild(maskGraphics);

    // Load the map
    const map = PIXI.Sprite.from("images/map.jpg");
    map.width = 1386; // Original map width
    map.height = 1019; // Original map height
    mapContainer.addChild(map);

    // Enable scrolling
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    const deltaMultiplier = 2; // Scale the delta to move faster

    mapContainer.interactive = true;
    mapContainer.buttonMode = true;

    // On drag start
    mapContainer.on("pointerdown", (event) => {
      dragging = true;
      dragStart = event.data.global.clone(); // Store the initial pointer position
    });

    // On drag move
    mapContainer.on("pointermove", (event) => {
      if (dragging) {
        const currentPosition = event.data.global;
        const deltaX = (currentPosition.x - dragStart.x) * deltaMultiplier;
        const deltaY = (currentPosition.y - dragStart.y) * deltaMultiplier;

        // Update map position with scaling, clamping within boundaries
        mapContainer.x = Math.min(
          0,
          Math.max(this.app.renderer.width - map.width, mapContainer.x + deltaX)
        );
        mapContainer.y = Math.min(
          0,
          Math.max(
            this.app.renderer.height - map.height,
            mapContainer.y + deltaY
          )
        );

        // Update drag start to current position
        dragStart = currentPosition.clone();
      }
    });

    // On drag end
    mapContainer.on("pointerup", () => (dragging = false));
    mapContainer.on("pointerupoutside", () => (dragging = false));

    // Back Button
    const backButton = this.createButton(
      this.assets.backIcon,
      10, // x-position
      this.app.renderer.height - 50, // y-position
      40, // width
      40, // height
      () => {
        this.addBaseUI();
      }
    );
    this.app.stage.addChild(backButton);
  }
}
