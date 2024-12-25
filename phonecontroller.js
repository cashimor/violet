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
    this.backgroundPicture = {
      backgroundUrl: "images/phonebackground.jpg",
      characterUrl: null,
      cropX: 0,
      cropY: 0,
      filter: "none", // Label for applied filter
    };
    this.defaultSong = {
      filename: "music/phone.mp3",
      deleted: false,
    };
    this.music = [this.defaultSong];

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
      albumIcon: "./images/assets/album.png",
      cameraIcon: "./images/assets/camera.png",
      deleteIcon: "./images/assets/delete.png",
      backgroundIcon: "./images/assets/makebackground.png",
      musicIcon: "./images/assets/music.png",
      playIcon: "./images/assets/play.png",
      forwardIcon: "./images/assets/forward.png",
      stopIcon: "./images/assets/stop.png",
    };

    // Contacts storage
    this.contacts = [];
    this.addContact("Police Officer", null);
    this.addBaseUI();
    this.pictures = [this.backgroundPicture];
  }

  toData() {
    return {
      contacts: this.contacts.map((contact) => ({
        name: contact.name,
        onCallCallback: null, // Callbacks cannot be serialized
      })),
      pictures: this.pictures.map((picture) => ({
        backgroundUrl: picture.backgroundUrl,
        characterUrl: picture.characterUrl,
        cropX: picture.cropX,
        cropY: picture.cropY,
        filter: picture.filter,
      })),
      backgroundPicture: this.backgroundPicture
        ? {
            backgroundUrl: this.backgroundPicture.backgroundUrl,
            characterUrl: this.backgroundPicture.characterUrl,
            cropX: this.backgroundPicture.cropX,
            cropY: this.backgroundPicture.cropY,
            filter: this.backgroundPicture.filter,
          }
        : null,
      music: this.music.map((song) => ({
        filename: song.filename,
        deleted: song.deleted || false, // Include deleted flag
      })),
    };
  }

  fromData(data) {
    if (!data) return;

    // Load contacts
    this.contacts = (data.contacts || []).map((contactData) => ({
      name: contactData.name,
      onCallCallback: () => {
        console.log(`Calling ${contactData.name}...`); // Default callback, replace if necessary
      },
    }));

    // Load pictures
    this.pictures = (data.pictures || []).map((pictureData) => ({
      backgroundUrl: pictureData.backgroundUrl,
      characterUrl: pictureData.characterUrl,
      cropX: pictureData.cropX,
      cropY: pictureData.cropY,
      filter: pictureData.filter,
    }));

    // Load background picture
    if (data.backgroundPicture) {
      console.log(data.backgroundPicture);
      this.backgroundPicture = {
        backgroundUrl: data.backgroundPicture.backgroundUrl,
        characterUrl: data.backgroundPicture.characterUrl,
        cropX: data.backgroundPicture.cropX,
        cropY: data.backgroundPicture.cropY,
        filter: data.backgroundPicture.filter,
      };
      this.addBaseUI();
    }
    this.music = (data.music || []).map((songData) => ({
      filename: songData.filename,
      deleted: songData.deleted || false, // Load deleted flag
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
    this.showPicture(this.backgroundPicture, false);

    // Add Address Book button using createButton method
    const addressBookButton = this.createButton(
      this.assets.contactsIcon, // Path to the Contacts icon
      20, // x-position
      20, // y-position
      100, // width
      100, // height
      () => {
        this.showContacts(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(addressBookButton);

    // Add Map button using createButton method
    const mapButton = this.createButton(
      this.assets.mapIcon, // Path to the Contacts icon
      140, // x-position
      20, // y-position
      100, // width
      100, // height
      () => {
        this.showMap(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(mapButton);

    // Add Map button using createButton method
    const pictureButton = this.createButton(
      this.assets.cameraIcon, // Path to the Contacts icon
      20, // x-position
      140, // y-position
      100, // width
      100, // height
      () => {
        this.showPictureApp(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(pictureButton);

    // Add Map button using createButton method
    const picturesButton = this.createButton(
      this.assets.albumIcon, // Path to the Contacts icon
      140, // x-position
      140, // y-position
      100, // width
      100, // height
      () => {
        this.showSavedPictures(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(picturesButton);

    // Add Map button using createButton method
    const musicButton = this.createButton(
      this.assets.musicIcon, // Path to the Contacts icon
      20, // x-position
      260, // y-position
      100, // width
      100, // height
      () => {
        this.showMP3Player(); // Callback for showing contacts
      }
    );

    this.app.stage.addChild(musicButton);
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

  maskGraphic() {
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
    return maskGraphics;
  }

  showMap() {
    // Clear the phone screen
    this.clearStage();
    this.currentScreen = "map";

    // Create a rounded rectangle mask
    const maskGraphics = this.maskGraphic();

    // Create a container for scrolling
    const mapContainer = new PIXI.Container();
    mapContainer.name = "mapContainer"; // Name the container
    this.app.stage.addChild(mapContainer);

    // Apply the mask to the container
    mapContainer.mask = maskGraphics;
    this.app.stage.addChild(maskGraphics);

    // Load the map
    const map = PIXI.Sprite.from("images/map.jpg");
    map.width = 1386; // Original map width
    map.height = 1019; // Original map height
    map.name = "map"; // Name the map
    mapContainer.addChild(map);

    // Add Violet's location
    const violetLocation =
      this.gameController.locationController.getVioletLocation();
    if (violetLocation && violetLocation.inKiyosawa) {
      // Scale Violet's coordinates from 0-550 to match the map dimensions
      const violetX = (violetLocation.x / 550) * map.width;
      const violetY = (violetLocation.y / 550) * map.height;

      // Add Violet's chibi
      const violetChibi = PIXI.Sprite.from("images/assets/violet.png");
      violetChibi.width = 40; // Adjust as needed for chibi size
      violetChibi.height = 60;
      violetChibi.anchor.set(0.5); // Center the chibi
      violetChibi.x = violetX;
      violetChibi.y = violetY;
      violetChibi.name = "violetChibi"; // Name the chibi for easy referencing
      mapContainer.addChild(violetChibi);

      // Center the map on Violet's location
      mapContainer.x = Math.min(
        0,
        Math.max(
          this.app.renderer.width / 2 - violetX,
          this.app.renderer.width - map.width
        )
      );
      mapContainer.y = Math.min(
        0,
        Math.max(
          this.app.renderer.height / 2 - violetY,
          this.app.renderer.height - map.height
        )
      );
    }

    // Enable scrolling
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    const deltaMultiplier = 1.5; // Scale the delta to move faster

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

    // Center Button
    const centerButton = this.createButton(
      "images/assets/center.png",
      this.app.renderer.width - 50, // x-position (top-right corner)
      10, // y-position
      40, // width
      40, // height
      () => {
        const violetChibi = mapContainer?.children.find(
          (child) => child.name === "violetChibi"
        );
        if (violetChibi) {
          const violetX = violetChibi.x;
          const violetY = violetChibi.y;

          mapContainer.x = Math.min(
            0,
            Math.max(
              this.app.renderer.width / 2 - violetX,
              this.app.renderer.width - map.width
            )
          );
          mapContainer.y = Math.min(
            0,
            Math.max(
              this.app.renderer.height / 2 - violetY,
              this.app.renderer.height - map.height
            )
          );
        }
      }
    );
    this.app.stage.addChild(centerButton);

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

  updateVioletLocation(newLocation) {
    // Only update if the map is showing
    if (this.currentScreen === "map") {
      const mapContainer = this.app.stage.children.find(
        (child) => child.name === "mapContainer"
      );
      const violetChibi = mapContainer?.children.find(
        (child) => child.name === "violetChibi"
      );
      const map = mapContainer?.children.find((child) => child.name === "map");

      if (mapContainer && violetChibi && map) {
        console.log("Updating location...");
        // Scale new coordinates to the map dimensions
        const violetX = (newLocation.x / 550) * map.width;
        const violetY = (newLocation.y / 550) * map.height;

        // Update Violet's position
        violetChibi.x = violetX;
        violetChibi.y = violetY;
      }
    }
  }

  createPictureBackground(backgroundUrl, cropX, cropY, scale = 1) {
    console.log(backgroundUrl + "/" + cropX + "/" + cropY + "/" + scale);
    const backgroundImage = PIXI.Sprite.from(backgroundUrl);
    // Configure the background
    backgroundImage.scale = scale;
    backgroundImage.width = 1024 * scale;
    backgroundImage.height = 1024 * scale;

    // Create a cropped background
    const croppedBackground = new PIXI.Container();
    const cropMask = new PIXI.Graphics();
    cropMask.beginFill(0x000000);
    cropMask.drawRect(0, 0, 280 * scale, 500 * scale);
    cropMask.endFill();
    croppedBackground.mask = cropMask;
    croppedBackground.addChild(cropMask);
    backgroundImage.x = -cropX * scale;
    backgroundImage.y = -cropY * scale;
    croppedBackground.addChild(backgroundImage);
    return croppedBackground;
  }

  showPictureApp() {
    // Clear the phone screen
    this.clearStage();
    this.currentScreen = "picture";

    // Fetch the background and character
    const violetLocation =
      this.gameController.locationController.currentLocation;

    // Generate random crop coordinates for the background
    const cropX = Math.floor(Math.random() * (1024 - 280));
    const cropY = Math.floor(Math.random() * (1024 - 500));

    // Create a cropped background
    const croppedBackground = this.createPictureBackground(
      violetLocation.getImageUrl(),
      cropX,
      cropY
    );
    const maskGraphics = this.maskGraphic();
    croppedBackground.mask = maskGraphics;
    this.app.stage.addChild(croppedBackground);
    this.app.stage.addChild(maskGraphics);

    let characterUrl = null;
    if (this.gameController.locationController.dialogue.state == "ACTIVE") {
      characterUrl =
        this.gameController.locationController.dialogue.characterController.character.getCurrentImageUrl();
    }
    if (characterUrl) {
      const characterImage = PIXI.Sprite.from(characterUrl);

      // Add the character image
      characterImage.anchor.set(0.5, 1);
      characterImage.x = 140; // Centered horizontally
      characterImage.y = 500; // Bottom of the screen
      characterImage.scale.x *= -1; // Flip horizontally
      croppedBackground.addChild(characterImage);
    }

    const filter = this.getRandomFilter();

    // Apply a filter for a cute effect
    const filters = this.getFilter(filter);
    croppedBackground.filters = filters;

    // Store picture metadata for recreation
    const pictureData = {
      backgroundUrl: violetLocation.getImageUrl(),
      characterUrl: characterUrl,
      cropX: cropX,
      cropY: cropY,
      filter: filter, // Label for applied filter
    };
    this.savePicture(pictureData);

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

  savePicture(pictureData) {
    if (!this.pictures) this.pictures = [];
    this.pictures.push(pictureData);
  }

  showSavedPictures() {
    // Clear the phone screen
    this.clearStage();
    this.currentScreen = "savedPictures";

    const thumbnailWidth = 70;
    const thumbnailHeight = 125;
    const gap = 1; // Gap between thumbnails
    const itemsPerPage = 12; // 4 thumbnails per row, 3 rows
    const totalPages = Math.ceil(this.pictures.length / itemsPerPage);

    // Ensure currentPage is within bounds
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, this.pictures.length);

    if (this.pictures && this.pictures.length > 0) {
      this.pictures.slice(startIndex, endIndex).forEach((picture, index) => {
        const thumbnail = this.createPictureThumbnail(picture);
        thumbnail.x = (index % 4) * (thumbnailWidth + gap); // Arrange in four columns
        thumbnail.y = Math.floor(index / 4) * (thumbnailHeight + gap); // Arrange rows
        this.app.stage.addChild(thumbnail);
      });
    }

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
          this.showSavedPictures();
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
          this.showSavedPictures();
        }
      );
      this.app.stage.addChild(nextButton);
    }

    // Back button
    const backButton = this.createButton(
      this.assets.backIcon,
      10,
      this.app.renderer.height - 50,
      40,
      40,
      () => {
        this.addBaseUI();
      }
    );
    this.app.stage.addChild(backButton);
  }

  createPictureThumbnail(pictureData) {
    const container = new PIXI.Container();

    // Define the size of the thumbnail
    const thumbnailWidth = 35; // Half the phone's width
    const thumbnailHeight = 63; // Half the phone's height

    const croppedBackground = this.createPictureBackground(
      pictureData.backgroundUrl,
      pictureData.cropX,
      pictureData.cropY,
      0.25
    );

    // Assemble the thumbnail
    container.addChild(croppedBackground);

    if (pictureData.characterUrl) {
      // Add the character image
      const character = PIXI.Sprite.from(pictureData.characterUrl);
      character.anchor.set(0.5, 1);
      character.x = 35;
      character.y = 125;
      character.scale.x *= -0.25;
      character.scale.y *= 0.25;

      container.addChild(character);
    }

    // Apply a lighter version of the filter
    const filterName = pictureData.filter; // Assume this is already stored in the picture
    if (filterName === "sepia") {
      container.filters = [new PIXI.filters.ColorMatrixFilter()];
      container.filters[0].sepia(0.3); // Less intense sepia
    } else if (filterName === "grayscale") {
      container.filters = [new PIXI.filters.ColorMatrixFilter()];
      container.filters[0].greyscale(0.5); // Half grayscale
    } else if (filterName === "blur") {
      container.filters = [new PIXI.filters.BlurFilter(2)]; // Subtle blur
    } else if (filterName === "saturate-blur-noise") {
      container.filters = [new PIXI.filters.ColorMatrixFilter()];
      container.filters[0].saturate(1.2); // Slight saturation
    }

    // Make the thumbnail interactive
    container.interactive = true;
    container.cursor = "pointer";
    container.on("pointerdown", () => {
      this.showPicture(pictureData);
    });

    return container;
  }

  showPicture(pictureData, addui = true) {
    // Clear the screen
    this.clearStage();
    this.currentScreen = "viewPicture";

    // Display the background
    const background = this.createPictureBackground(
      pictureData.backgroundUrl,
      pictureData.cropX,
      pictureData.cropY
    );
    const maskGraphics = this.maskGraphic();
    background.mask = maskGraphics;
    this.app.stage.addChild(background);
    this.app.stage.addChild(maskGraphics);

    if (pictureData.characterUrl) {
      // Display the character
      const character = PIXI.Sprite.from(pictureData.characterUrl);
      character.anchor.set(0.5, 1);
      character.x = 140; // Center of the phone screen
      character.y = 500; // Bottom of the phone screen
      character.scale.x *= -1; // Flip character for the "selfie" effect
      background.addChild(character);
    }

    // Apply filter
    if (pictureData.filter) {
      const filter = this.getFilter(pictureData.filter);
      background.filters = filter;
    }

    if (addui) {
      // Add a back button to return to the saved pictures screen
      const backButton = this.createButton(
        this.assets.backIcon,
        10,
        this.app.renderer.height - 50,
        40,
        40,
        () => {
          this.showSavedPictures();
        }
      );
      this.app.stage.addChild(backButton);

      // Add a delete button
      const deleteButton = this.createButton(
        this.assets.deleteIcon,
        this.app.renderer.width - 50,
        this.app.renderer.height - 50,
        40,
        40,
        () => {
          // Remove the picture from the saved pictures
          this.pictures = this.pictures.filter((pic) => pic !== pictureData);

          // Return to saved pictures screen
          this.showSavedPictures();
        }
      );
      this.app.stage.addChild(deleteButton);

      // Add a "make background" button
      const backgroundButton = this.createButton(
        this.assets.backgroundIcon,
        this.app.renderer.width - 100,
        this.app.renderer.height - 50,
        40,
        40,
        () => {
          // Set this picture as the background
          this.backgroundPicture = pictureData;

          // Provide feedback to the player (optional)
          console.log("Background set!");
        }
      );
      this.app.stage.addChild(backgroundButton);
    }
  }

  getFilter(filterType) {
    const filters = [
      new PIXI.filters.ColorMatrixFilter(),
      new PIXI.filters.BlurFilter(2),
      new PIXI.filters.NoiseFilter(0.1),
    ];

    switch (filterType) {
      case "sepia":
        filters[1].blur = 0;
        filters[0].sepia(true);
        filters[2].noise = 0;
        return filters;
      case "grayscale":
        filters[1].blur = 0;
        filters[0].blackAndWhite();
        filters[2].noise = 0;
        return filters;
      case "blur":
        filters[1].blur = 5;
        filters[2].noise = 0;
        return filters;
      case "saturate-blur-noise":
        filters[0].saturate(1.2, false);
        return filters;
      default:
        filters[1].blur = 0;
        filters[2].noise = 0;
        return filters;
    }
  }

  getRandomFilter() {
    const filters = ["sepia", "grayscale", "blur", "saturate-blur-noise"];
    return filters[Math.floor(Math.random() * filters.length)];
  }

  showMP3Player() {
    // Clear the phone screen
    this.clearStage();
    this.currentScreen = "mp3Player";

    const itemHeight = 40;
    const gap = 5; // Gap between items
    const startY = 50; // Starting y-coordinate for the list
    const itemWidth = this.app.renderer.width - 20; // Width of each item
    const songsPerPage = 8; // Songs displayed per page
    let playingIndex = -1; // Track the currently playing song

    if (this.music) {
      const visibleSongs = this.music.filter((song) => !song.deleted);
      const totalPages = Math.ceil(visibleSongs.length / songsPerPage);

      if (visibleSongs.length > 0) {
        const startIndex = this.currentPage * songsPerPage;
        const endIndex = startIndex + songsPerPage;

        visibleSongs.slice(startIndex, endIndex).forEach((song, index) => {
          const container = new PIXI.Container();
          container.x = 10;
          container.y = startY + index * (itemHeight + gap);

          // Display filename without "music/" prefix
          const text = new PIXI.Text(song.filename.replace(/^music\//, ""), {
            fontFamily: "Arial",
            fontSize: 14,
            fill: 0xffffff,
          });
          text.anchor.set(0, 0.5);
          text.y = itemHeight / 2;
          container.addChild(text);

          // Play button
          const playButton = this.createButton(
            this.assets.playIcon,
            itemWidth - 90, // x-position
            5, // y-position
            30, // width
            30, // height
            () => {
              if (playingIndex === index) {
                // Stop playback if already playing
                this.gameController.audioController.stopLocationMusic();
                playingIndex = -1;
              } else {
                // Play new song
                this.gameController.audioController.playLocationMusic(
                  song.filename
                );
                playingIndex = index;
              }
              this.showMP3Player(); // Refresh UI
            }
          );
          container.addChild(playButton);

          // Delete button
          const deleteButton = this.createButton(
            this.assets.deleteIcon,
            itemWidth - 50, // x-position
            5, // y-position
            30, // width
            30, // height
            () => {
              song.deleted = true; // Mark as deleted
              this.showMP3Player(); // Refresh the UI
            }
          );
          container.addChild(deleteButton);

          this.app.stage.addChild(container);
        });

        // Pagination Buttons
        if (this.currentPage > 0) {
            console.log("DRAWING PREV");
          const prevButton = this.createButton(
            this.assets.nextIcon,
            100, // x-position
            this.app.renderer.height - 50, // y-position
            40, // width
            40, // height
            () => {
              this.currentPage--;
              this.showMP3Player();
            }
          );
          prevButton.scale.x = -1; // Flip horizontally
          prevButton.width = 40;
          this.app.stage.addChild(prevButton);
        }

        if (this.currentPage < totalPages - 1) {
          const nextButton = this.createButton(
            this.assets.nextIcon,
            this.app.renderer.width - 50, // x-position
            this.app.renderer.height - 50, // y-position
            40, // width
            40, // height
            () => {
              this.currentPage++;
              this.showMP3Player();
            }
          );
          this.app.stage.addChild(nextButton);
        }
      } else {
        // Show "No songs available" message
        const noSongsText = new PIXI.Text("No songs available", {
          fontFamily: "Arial",
          fontSize: 16,
          fill: 0xffffff,
        });
        noSongsText.anchor.set(0.5);
        noSongsText.x = this.app.renderer.width / 2;
        noSongsText.y = this.app.renderer.height / 2;
        this.app.stage.addChild(noSongsText);
      }
    }

    // Stop button at the bottom
    const stopButton = this.createButton(
      this.assets.stopIcon,
      this.app.renderer.width / 2 - 20,
      this.app.renderer.height - 50,
      40,
      40,
      () => {
        this.gameController.audioController.stopLocationMusic();
        playingIndex = -1;
        this.showMP3Player(); // Refresh the UI
      }
    );
    this.app.stage.addChild(stopButton);

    // Back button
    const backButton = this.createButton(
      this.assets.backIcon,
      10,
      this.app.renderer.height - 50,
      40,
      40,
      () => {
        this.addBaseUI();
      }
    );
    this.app.stage.addChild(backButton);
  }

  addMusic(songFilename) {
    // Check if the song already exists in the music list
    const existingSong = this.music.find(
      (song) => song.filename === songFilename
    );

    if (existingSong) {
      // If the song exists, make sure it is not marked as deleted
      if (existingSong.deleted) {
        existingSong.deleted = false; // Restore the song if it was deleted
      }
      return; // Do nothing else if it exists
    }

    // Add the song to the music list if it doesn't exist
    this.music.push({
      filename: songFilename,
      deleted: false,
    });
  }
}
