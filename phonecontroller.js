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

    document
      .getElementById("toggle-phone-btn")
      .addEventListener("click", () => {
        this.togglePhone();
      });

    this.assets = {
      contactsIcon: "./images/assets/contacts.png", // Path to Contacts icon
      backIcon: "./images/assets/back.png", // Path to Back icon
      endCallIcon: "./images/assets/endcall.png",
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
    return true;
  }

  showContacts() {
    // Clear previous content
    this.clearStage();

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

    // Display each contact with a chibi and name
    const barHeight = 60;
    this.contacts.forEach((contact, index) => {
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
        this.call(contact.name);
      });

      this.app.stage.addChild(bar);

      // Chibi image
      const chibiPath = `images/assets/${contact.name.toLowerCase()}.png`;
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

    // Add a back button using the createButton function
    const backButton = this.createButton(
      this.assets.backIcon,
      10, // x-position
      this.app.renderer.height - 50, // y-position (10px padding from the bottom)
      40, // width
      40, // height
      () => {
        this.addBaseUI();
      }
    );
    this.app.stage.addChild(backButton);
  }

  // Show the list of contacts
  showContacts2() {
    // Clear previous content
    this.clearStage();

    // Add title
    const title = new PIXI.Text("Contacts", {
      fontSize: 24,
      fill: "#ffffff",
    });
    title.x = 10;
    title.y = 10;
    this.app.stage.addChild(title);

    // Add each contact as a clickable item
    const barHeight = 30;
    this.contacts.forEach((contact, index) => {
      const yPosition = 50 + index * (barHeight + 5);

      // Background bar
      const contactBar = new PIXI.Graphics();
      contactBar.beginFill(0x333333); // Dark gray color for the bar
      contactBar.drawRect(10, yPosition, 260, barHeight); // Adjust dimensions as needed
      contactBar.endFill();

      // Add hover effects and click behavior
      contactBar.interactive = true;
      contactBar.buttonMode = true;
      contactBar.on("pointerover", () => {
        contactBar.tint = 0x555555; // Slightly lighter gray
      });
      contactBar.on("pointerout", () => {
        contactBar.tint = 0xffffff; // Reset tint
      });
      contactBar.on("pointerdown", () => {
        this.call(contact.name);
      });

      this.app.stage.addChild(contactBar);

      // Contact text
      const contactText = new PIXI.Text(contact.name, {
        fontSize: 20,
        fill: "#ffffff",
      });
      contactText.x = 20; // Slight padding from the left of the bar
      contactText.y = yPosition + 5; // Centered vertically in the bar
      this.app.stage.addChild(contactText);
    });

    // Add a back button using the createButton function
    const backButton = this.createButton(
      this.assets.backIcon,
      10, // x-position
      this.app.renderer.height - 50, // y-position (10px padding from the bottom)
      40, // width
      40, // height
      () => {
        this.addBaseUI();
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

  showCallScreen() {
    const character = this.currentCallCharacter;
    const characterName = character.name;
    // Clear the stage
    this.clearStage();

    // Background
    const background = new PIXI.Graphics();
    background.beginFill(0x222222); // Dark background for call screen
    background.drawRect(
      0,
      0,
      this.app.renderer.width,
      this.app.renderer.height
    );
    background.endFill();
    this.app.stage.addChild(background);

    // Chibi image
    const chibiPath = `images/assets/${characterName.toLowerCase()}.png`;
    const chibiSprite = PIXI.Sprite.from(chibiPath);
    chibiSprite.anchor.set(0.5);
    chibiSprite.x = this.app.renderer.width / 2;
    chibiSprite.y = 200; // Position the chibi near the top
    chibiSprite.width = 120; // Adjust size to fit nicely
    chibiSprite.height = 180;
    this.app.stage.addChild(chibiSprite);
    // Display character name
    const nameText = new PIXI.Text(character.name, {
      fontSize: 24,
      fill: "#ffffff",
    });
    nameText.x = 10;
    nameText.y = 20;
    this.app.stage.addChild(nameText);

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

  // Show the call screen during an ongoing call
  showCallScreen2() {
    this.clearStage();
    const character = this.currentCallCharacter;

    // Display character image
    const characterImage = PIXI.Sprite.from(character.getCurrentImageUrl());
    characterImage.x = 70;
    characterImage.y = 100;
    characterImage.width = 140;
    characterImage.height = 200;
    this.app.stage.addChild(characterImage);

    // Display character name
    const nameText = new PIXI.Text(character.name, {
      fontSize: 24,
      fill: "#ffffff",
    });
    nameText.x = 10;
    nameText.y = 20;
    this.app.stage.addChild(nameText);

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
  call(characterName) {
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

    // Temporarily store the character's current location
    this.originalCharacterLocation = character.location;
    character.location = "Phone";
    const location = this.gameController.findLocationByName("Phone");
    location.ref = this.gameController.locationController.currentLocation.name;
    this.gameController.closeDialogCallback = this.endCall;

    // Load the phone location into the location controller
    if (this.gameController.locationController.loadLocation(location)) {
      this.showCallScreen();
      this.hidePhone();
    } else {
      this.endCall();
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
    // Reset call state
    this.currentCallCharacter = null;
    this.originalCharacterLocation = null;
  };
}
